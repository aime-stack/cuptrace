/**
 * NFT Service for CupTrace
 * 
 * Handles NFT minting, verification, and metadata retrieval for product batches.
 * Integrates with Cardano blockchain using Lucid and Aiken-compiled contracts.
 */

import prisma from '../config/database';
import { ValidationError, NotFoundError } from '../utils/errors';
import { initializeLucid } from './blockchain.service';
import { getNFTMintingPolicy, loadContractFromFile } from '../utils/contract-loader';
import env from '../config/env';

interface NFTMetadata {
  name: string;
  image?: string;
  description?: string;
  attributes: {
    batchId: string;
    type: 'coffee' | 'tea';
    originLocation: string;
    harvestDate?: string;
    quantity?: number;
    [key: string]: unknown;
  };
}

interface BatchNFTInfo {
  policyId: string;
  assetName: string;
  mintedAt: Date;
  metadata: NFTMetadata;
}

/**
 * Generate CIP-25 compliant NFT metadata
 */
export const generateNFTMetadata = (batch: {
  id: string;
  lotId?: string | null;
  type: 'coffee' | 'tea';
  originLocation: string;
  harvestDate?: Date | null;
  quantity?: number | null;
  description?: string | null;
  region?: string | null;
}): NFTMetadata => {
  const name = batch.lotId || `Batch-${batch.id.substring(0, 8)}`;
  
  return {
    name,
    description: batch.description || `${batch.type.toUpperCase()} batch from ${batch.originLocation}`,
    attributes: {
      batchId: batch.id,
      type: batch.type,
      originLocation: batch.originLocation,
      ...(batch.harvestDate && { harvestDate: batch.harvestDate.toISOString() }),
      ...(batch.quantity && { quantity: batch.quantity }),
      ...(batch.region && { region: batch.region }),
    },
  };
};

/**
 * Mint NFT for a batch
 * 
 * @param batchId - Batch identifier
 * @param privateKey - Private key for signing transaction
 * @returns NFT information (policy ID and asset name)
 */
export const mintBatchNFT = async (
  batchId: string,
  privateKey?: string
): Promise<{ policyId: string; assetName: string; txHash: string }> => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  // Get batch information
  const batch = await prisma.productBatch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      lotId: true,
      type: true,
      originLocation: true,
      harvestDate: true,
      quantity: true,
      description: true,
      region: true,
      nftPolicyId: true,
      nftAssetName: true,
      blockchainTxHash: true,
    } as any, // Type assertion needed due to Prisma client type generation timing
  });

  if (!batch) {
    throw new NotFoundError('Batch not found');
  }

  // Check if NFT already minted
  const batchAny = batch as any;
  if (batchAny.nftPolicyId && batchAny.nftAssetName) {
    // Retrieve txHash from batch's blockchainTxHash or from batch history
    let txHash = '';
    
    if (batchAny.blockchainTxHash) {
      txHash = batchAny.blockchainTxHash;
    } else {
      // Try to get from batch history (most recent NFT minting transaction)
      const history = await prisma.batchHistory.findFirst({
        where: {
          batchId: batchId,
          blockchainTxHash: { not: null },
        },
        orderBy: {
          timestamp: 'desc',
        },
        select: {
          blockchainTxHash: true,
        },
      });
      
      if (history?.blockchainTxHash) {
        txHash = history.blockchainTxHash;
      }
    }
    
    return {
      policyId: batchAny.nftPolicyId,
      assetName: batchAny.nftAssetName,
      txHash,
    };
  }

  // Generate NFT metadata
  const metadata = generateNFTMetadata(batch as any);

  // Generate asset name from batch ID (first 32 bytes, hex encoded)
  const assetName = Buffer.from((batch as any).id.substring(0, 32)).toString('hex').padEnd(64, '0');

  // Try to mint on blockchain if configured
  const lucidInstance = await initializeLucid();

  if (lucidInstance && privateKey) {
    try {
      // Load NFT minting policy from compiled contract
      const nftPolicy = getNFTMintingPolicy();
      let policyId: string;
      let compiledCode: string | null = null;

      if (nftPolicy && nftPolicy.policyId) {
        policyId = nftPolicy.policyId;
        compiledCode = nftPolicy.compiledCode;
      } else if (env.NFT_POLICY_ID) {
        policyId = env.NFT_POLICY_ID;
        compiledCode = await loadContractFromFile('batch_nft.plutus');
      } else {
        throw new Error('NFT minting policy not found. Please deploy contracts first.');
      }

      if (!compiledCode) {
        throw new Error('Failed to load NFT minting policy compiled code');
      }

      const lucid = lucidInstance as {
        selectWalletFromPrivateKey: (key: string) => unknown;
        newTx: () => {
          mintAssets: (assets: Record<string, bigint>) => {
            attachMetadata: (label: number, data: unknown) => {
              attachMintingPolicy: (policy: unknown, redeemer: unknown) => {
                complete: () => Promise<{
                  sign: () => {
                    complete: () => Promise<{
                      submit: () => Promise<string>;
                    }>;
                  };
                }>;
              };
            };
          };
        };
        newMintingPolicy: () => {
          fromPlutusScript: (script: { type: string; script: string }) => unknown;
        };
      };

      lucid.selectWalletFromPrivateKey(privateKey);

      // Create minting policy from compiled Plutus script
      // Note: Lucid 0.3.0 doesn't support PlutusV3 yet, try V2 format
      let mintingPolicy: any;
      try {
        mintingPolicy = lucid.newMintingPolicy().fromPlutusScript({
          type: 'PlutusV2',
          script: compiledCode,
        });
      } catch (error) {
        // If V2 fails, try V1 as fallback
        try {
          mintingPolicy = lucid.newMintingPolicy().fromPlutusScript({
            type: 'PlutusV1',
            script: compiledCode,
          });
        } catch (error2) {
          throw new Error(`Failed to create minting policy: ${error2 instanceof Error ? error2.message : 'Unknown error'}`);
        }
      }

      // Create redeemer for minting (batch_id from batch ID)
      const batchIdBytes = Buffer.from(batchId.substring(0, 32));
      const redeemer = {
        Mint: {
          batch_id: batchIdBytes.toString('hex'),
        },
      };

      // Create minting transaction
      const fullAssetName = `${policyId}${assetName}`;
      const tx = await lucid
        .newTx()
        .mintAssets({ [fullAssetName]: 1n })
        .attachMetadata(721, {
          [policyId]: {
            [assetName]: metadata,
          },
        })
        .attachMintingPolicy(mintingPolicy, redeemer)
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      // Update batch with NFT information
      await prisma.productBatch.update({
        where: { id: batchId },
        data: {
          nftPolicyId: policyId,
          nftAssetName: assetName,
          nftMintedAt: new Date(),
          blockchainTxHash: txHash,
        } as any, // Type assertion needed due to Prisma client type generation timing
      });

      return {
        policyId,
        assetName,
        txHash,
      };
    } catch (error) {
      // If blockchain minting fails, still store the asset name for future minting
      console.error(`Failed to mint NFT on blockchain for batch ${batchId}:`, error);
      
      // Generate a deterministic policy ID for tracking
      const policyId = `pending_${Buffer.from(batchId).toString('hex').substring(0, 56)}`;
      
      await prisma.productBatch.update({
        where: { id: batchId },
        data: {
          nftPolicyId: policyId,
          nftAssetName: assetName,
          nftMintedAt: new Date(),
        } as any, // Type assertion needed due to Prisma client type generation timing
      });

      return {
        policyId,
        assetName,
        txHash: '',
      };
    }
  }

  // If blockchain not configured, generate deterministic asset name
  const policyId = `offline_${Buffer.from(batchId).toString('hex').substring(0, 56)}`;
  
  await prisma.productBatch.update({
    where: { id: batchId },
    data: {
      nftPolicyId: policyId,
      nftAssetName: assetName,
      nftMintedAt: new Date(),
    } as any, // Type assertion needed due to Prisma client type generation timing
  });

  return {
    policyId,
    assetName,
    txHash: '',
  };
};

/**
 * Get NFT information for a batch
 * 
 * @param batchId - Batch identifier
 * @returns NFT information
 */
export const getBatchNFT = async (batchId: string): Promise<BatchNFTInfo | null> => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  const batch = await prisma.productBatch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      lotId: true,
      type: true,
      originLocation: true,
      harvestDate: true,
      quantity: true,
      description: true,
      region: true,
      nftPolicyId: true,
      nftAssetName: true,
      nftMintedAt: true,
    } as any, // Type assertion needed due to Prisma client type generation timing
  });

  const batchAny = batch as any;
  
  if (!batchAny || !batchAny.nftPolicyId || !batchAny.nftAssetName) {
    return null;
  }

  const metadata = generateNFTMetadata(batchAny);

  return {
    policyId: batchAny.nftPolicyId,
    assetName: batchAny.nftAssetName,
    mintedAt: batchAny.nftMintedAt || new Date(),
    metadata,
  };
};

/**
 * Verify NFT authenticity on-chain
 * 
 * @param batchId - Batch identifier
 * @param policyId - NFT Policy ID
 * @param assetName - NFT Asset Name
 * @returns Verification result
 */
export const verifyNFT = async (
  batchId: string,
  policyId: string,
  assetName: string
): Promise<{
  verified: boolean;
  error?: string;
  onChain: boolean;
}> => {
  if (!batchId || !policyId || !assetName) {
    return {
      verified: false,
      error: 'Batch ID, Policy ID, and Asset Name are required',
      onChain: false,
    };
  }

  // First verify against database
  const batch = await prisma.productBatch.findUnique({
    where: { id: batchId },
    select: {
      nftPolicyId: true,
      nftAssetName: true,
    } as any, // Type assertion needed due to Prisma client type generation timing
  });

  if (!batch) {
    return {
      verified: false,
      error: 'Batch not found',
      onChain: false,
    };
  }

  const batchAny = batch as any;
  if (batchAny.nftPolicyId !== policyId || batchAny.nftAssetName !== assetName) {
    return {
      verified: false,
      error: 'NFT information mismatch',
      onChain: false,
    };
  }

  // Try to verify on-chain if blockchain is configured
  const lucidInstance = await initializeLucid();

  if (lucidInstance) {
    try {
      const lucid = lucidInstance as {
        getUtxosByOutRef: (outRefs: Array<{ txHash: string; outputIndex: number }>) => Promise<Array<{
          address: string;
          assets: Record<string, bigint>;
        }>>;
        getUtxos: (address: string) => Promise<Array<{
          address: string;
          assets: Record<string, bigint>;
        }>>;
      };

      // Query Blockfrost API directly for NFT asset
      const fullAssetName = `${policyId}${assetName}`;
      
      const lucidWithProvider = lucidInstance as {
        provider: {
          assetsById: (assetId: string) => Promise<{
            asset: string;
            quantity: string;
          }[]>;
        };
        wallet: {
          address: () => Promise<string>;
        };
      };
      
      let nftFound = false;
      
      try {
        // Query Blockfrost for the specific asset
        const assetInfo = await lucidWithProvider.provider.assetsById(fullAssetName);
        
        // Check if asset exists and has quantity of 1
        if (assetInfo && assetInfo.length > 0) {
          const asset = assetInfo.find((a) => a.asset === fullAssetName);
          if (asset && asset.quantity === '1') {
            nftFound = true;
          }
        }
      } catch (error) {
        // If asset not found or error, try alternative method using UTXOs
        try {
          const walletAddress = await lucidWithProvider.wallet.address();
          const utxos = await (lucid as any).getUtxos(walletAddress);
          
          nftFound = utxos.some((utxo: { assets: Record<string, bigint> }) => {
            return fullAssetName in utxo.assets && utxo.assets[fullAssetName] === 1n;
          });
        } catch (utxoError) {
          // If both methods fail, nftFound remains false
          console.error(`Failed to verify NFT on-chain for batch ${batchId}:`, utxoError);
        }
      }

      return {
        verified: true,
        onChain: nftFound,
      };
    } catch (error) {
      // If on-chain verification fails, return database verification
      console.error(`On-chain NFT verification failed for batch ${batchId}:`, error);
      return {
        verified: true,
        onChain: false,
      };
    }
  }

  // Database verification successful
  return {
    verified: true,
    onChain: false,
  };
};

/**
 * Get NFT metadata
 * 
 * @param batchId - Batch identifier
 * @returns NFT metadata
 */
export const getNFTMetadata = async (batchId: string): Promise<NFTMetadata | null> => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  const batch = await prisma.productBatch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      lotId: true,
      type: true,
      originLocation: true,
      harvestDate: true,
      quantity: true,
      description: true,
      region: true,
    },
  });

  if (!batch) {
    return null;
  }

  return generateNFTMetadata(batch);
};

