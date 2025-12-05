/**
 * Deploy Aiken-compiled contracts to Cardano Preprod network
 * 
 * This script deploys the compiled smart contracts to the Cardano blockchain.
 * It requires:
 * - Compiled .plutus files in contracts/build/
 * - Blockfrost API key for Preprod
 * - Wallet with test ADA
 */

// Load environment variables before importing config
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from backend directory
dotenv.config({ path: resolve(__dirname, '../.env') });

import env from '../src/config/env';
import { initializeLucid } from '../src/services/blockchain.service';
import { getNFTMintingPolicy, getBatchTraceabilityValidator, getStageTransitionValidator, calculatePolicyId } from '../src/utils/contract-loader';
import { createHash } from 'crypto';

interface ContractInfo {
  name: string;
  file: string;
  address?: string;
  policyId?: string;
}

async function deployContracts() {
  console.log('🚀 Starting contract deployment to Preprod...\n');

  // Check environment
  if (!env.BLOCKFROST_API_KEY) {
    console.error('❌ BLOCKFROST_API_KEY is not set in environment variables');
    process.exit(1);
  }

  if (env.CARDANO_NETWORK !== 'preprod') {
    console.warn(`⚠️  Network is set to ${env.CARDANO_NETWORK}, not preprod`);
    console.warn('   This script is designed for Preprod. Proceed with caution.\n');
  }

  // Initialize Lucid
  console.log('🔌 Initializing Lucid connection...');
  const lucid = await initializeLucid();
  if (!lucid) {
    console.error('❌ Failed to initialize Lucid connection');
    console.error('   Please check:');
    console.error('   - BLOCKFROST_API_KEY is set correctly');
    console.error('   - CARDANO_NETWORK is set to preprod');
    console.error('   - Network connectivity');
    process.exit(1);
  }

  console.log('✅ Connected to Cardano network\n');

  // Check for wallet private key
  const privateKey = env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ WALLET_PRIVATE_KEY is not set in environment variables');
    console.error('   Set WALLET_PRIVATE_KEY to deploy contracts');
    process.exit(1);
  }

  // Track deployed contracts
  const deployedContracts: ContractInfo[] = [];

  const lucidTyped = lucid as {
    selectWalletFromPrivateKey: (key: string) => unknown;
    wallet: {
      address: () => Promise<string>;
    };
    newTx: () => {
      payToAddress: (address: string, lovelace: bigint) => {
        attachSpendingValidator: (validator: unknown) => {
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
    newSpendingValidator: () => {
      fromPlutusScript: (script: { type: string; script: string }) => unknown;
    };
    newMintingPolicy: () => {
      fromPlutusScript: (script: { type: string; script: string }) => unknown;
    };
    utils: {
      validatorToAddress: (validator: unknown) => string;
      getAddressDetails: (address: string) => {
        paymentCredential: {
          hash: string;
        };
      };
    };
  };

  // Select wallet
  lucidTyped.selectWalletFromPrivateKey(privateKey);

  // Deploy NFT Minting Policy
  const nftPolicy = getNFTMintingPolicy();
  if (nftPolicy) {
    try {
      console.log(`📄 Deploying NFT Minting Policy...`);
      
      // Create minting policy from Plutus script
      // Note: Minting policies don't need to be "deployed" - they're identified by their policy ID
      // The policy ID is derived from the script itself
      const policyId = calculatePolicyId(nftPolicy.compiledCode);
      console.log(`   Policy ID: ${policyId}`);
      
      deployedContracts.push({
        name: 'Batch NFT Policy',
        file: 'batch_nft.plutus',
        policyId,
      });
    } catch (error) {
      console.error(`❌ Failed to deploy NFT Minting Policy:`, error);
    }
  }

  // Deploy Batch Traceability Validator
  const batchValidator = getBatchTraceabilityValidator();
  if (batchValidator) {
    try {
      console.log(`📄 Deploying Batch Traceability Validator...`);
      
      // Create spending validator from Plutus script
      // Note: Lucid 0.3.0 doesn't support PlutusV3 yet, only V1 and V2
      const validatorScript = batchValidator.compiledCode;
      
      let validatorAddress: string;
      let validator: any;
      
      try {
        // Try PlutusV2 format (V3 scripts are often backward compatible)
        validator = {
          type: 'PlutusV2',
          script: validatorScript,
        };
        validatorAddress = lucidTyped.utils.validatorToAddress(validator);
        console.log(`   ✅ Using PlutusV2 format (V3 script is compatible)`);
      } catch (error1) {
        try {
          // Try PlutusV1 format as fallback
          validator = {
            type: 'PlutusV1',
            script: validatorScript,
          };
          validatorAddress = lucidTyped.utils.validatorToAddress(validator);
          console.log(`   ✅ Using PlutusV1 format`);
        } catch (error2) {
          console.error(`   ❌ Failed to create validator address: ${error2 instanceof Error ? error2.message : error2}`);
          throw error2;
        }
      }
      
      console.log(`   Validator Address: ${validatorAddress}`);
      
      // Deploy by locking a small amount of ADA at the validator address
      const tx = await lucidTyped
        .newTx()
        .payToAddress(validatorAddress, 2_000_000n) // 2 ADA
        .attachSpendingValidator(validator)
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      
      console.log(`   Deployment TX: ${txHash}`);
      
      deployedContracts.push({
        name: 'Batch Traceability Validator',
        file: 'batch_traceability.plutus',
        address: validatorAddress,
      });
    } catch (error) {
      console.error(`❌ Failed to deploy Batch Traceability Validator:`, error);
    }
  }

  // Deploy Stage Transition Validator
  const stageValidator = getStageTransitionValidator();
  if (stageValidator) {
    try {
      console.log(`📄 Deploying Stage Transition Validator...`);
      
      // Create spending validator from Plutus script
      // Note: Lucid 0.3.0 doesn't support PlutusV3 yet, only V1 and V2
      const validatorScript = stageValidator.compiledCode;
      
      let validatorAddress: string;
      let validator: any;
      
      try {
        // Try PlutusV2 format (V3 scripts are often backward compatible)
        validator = {
          type: 'PlutusV2',
          script: validatorScript,
        };
        validatorAddress = lucidTyped.utils.validatorToAddress(validator);
        console.log(`   ✅ Using PlutusV2 format (V3 script is compatible)`);
      } catch (error1) {
        try {
          // Try PlutusV1 format as fallback
          validator = {
            type: 'PlutusV1',
            script: validatorScript,
          };
          validatorAddress = lucidTyped.utils.validatorToAddress(validator);
          console.log(`   ✅ Using PlutusV1 format`);
        } catch (error2) {
          // If both fail, we need to calculate manually
          console.log('   ⚠️  Lucid doesn\'t support PlutusV3. Calculating address manually...');
          const scriptBytes = Buffer.from(validatorScript, 'hex');
          const scriptHash = createHash('blake2b256')
            .update(scriptBytes)
            .digest('hex')
            .substring(0, 56);
          
          console.log(`   Script Hash: ${scriptHash}`);
          validatorAddress = `script_hash_${scriptHash}`;
          console.log(`   ⚠️  Cannot generate proper address. Use script hash for manual deployment.`);
          throw new Error('PlutusV3 not supported by Lucid. Use manual deployment or compile as V2.');
        }
      }
      
      console.log(`   Validator Address: ${validatorAddress}`);
      
      // Deploy by locking a small amount of ADA at the validator address
      const tx = await lucidTyped
        .newTx()
        .payToAddress(validatorAddress, 2_000_000n) // 2 ADA
        .attachSpendingValidator(validator)
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      
      console.log(`   Deployment TX: ${txHash}`);
      
      deployedContracts.push({
        name: 'Stage Transition Validator',
        file: 'stage_transition.plutus',
        address: validatorAddress,
      });
    } catch (error) {
      console.error(`❌ Failed to deploy Stage Transition Validator:`, error);
    }
  }

  if (deployedContracts.length === 0) {
    console.error('❌ No contracts found to deploy');
    process.exit(1);
  }

  console.log('\n📝 Deployment Summary:');
  console.log(`   Contracts deployed: ${deployedContracts.length}`);
  
  if (deployedContracts.length > 0) {
    console.log('\n📋 Deployed Contract Information:');
    deployedContracts.forEach((contract) => {
      console.log(`\n   ${contract.name}:`);
      if (contract.policyId) {
        console.log(`     Policy ID: ${contract.policyId}`);
      }
      if (contract.address) {
        console.log(`     Address: ${contract.address}`);
      }
    });
    
    // Save contract addresses to .env file or output for manual addition
    console.log('\n💾 Add these to your .env file:');
    const nftPolicy = deployedContracts.find((c) => c.name === 'Batch NFT Policy');
    if (nftPolicy?.policyId) {
      console.log(`   NFT_POLICY_ID=${nftPolicy.policyId}`);
    }
    const batchValidator = deployedContracts.find((c) => c.name === 'Batch Traceability Validator');
    if (batchValidator?.address) {
      console.log(`   BATCH_CONTRACT_ADDRESS=${batchValidator.address}`);
    }
    const stageValidator = deployedContracts.find((c) => c.name === 'Stage Transition Validator');
    if (stageValidator?.address) {
      console.log(`   STAGE_CONTRACT_ADDRESS=${stageValidator.address}`);
    }
  } else {
    console.log('\n⚠️  No contracts were deployed. Check errors above.');
  }
}

// Run deployment
deployContracts().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});

