import { Lucid, Blockfrost } from 'lucid-cardano';

const blockfrostApiKey = process.env.BLOCKFROST_API_KEY || 'preprodkwpxlgz4jgbmdzgaez1xg00kg2qwwee3';
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

const initLucid = async () => {
    if (!walletPrivateKey) {
        throw new Error('WALLET_PRIVATE_KEY not set in .env file');
    }

    const blockfrostUrl = 'https://cardano-preprod.blockfrost.io/api/v0';
    const blockfrostProvider = new Blockfrost(blockfrostUrl, blockfrostApiKey);

    const lucid = await Lucid.new(blockfrostProvider, 'Testnet' as any);

    lucid.selectWalletFromPrivateKey(walletPrivateKey);
    return lucid;
};

export const mintBatchNFT = async (batchData: {
    id: string;
    farmerId: string;
    integrityHash: string;
    grade: string;
    weight: number;
    origin: string;
}) => {
    try {
        console.log('=== Starting Backend Minting ===');

        const lucid = await initLucid();
        const address = await lucid.wallet.address();

        console.log('Wallet address:', address);
        console.log('Getting UTxOs...');

        const utxos = await lucid.wallet.getUtxos();
        console.log('Available UTxOs:', utxos.length);

        if (!utxos || utxos.length === 0) {
            throw new Error('No UTxOs found in wallet. Ensure wallet has test ADA.');
        }

        // Get payment credential for minting policy
        const { paymentCredential } = lucid.utils.getAddressDetails(address);
        if (!paymentCredential) {
            throw new Error('Failed to extract payment credential');
        }

        // Create a simple native script that requires this key to sign
        // For now, we'll use a placeholder policy ID derived from the credential hash
        const policyId = paymentCredential.hash.substring(0, 56);
        const assetName = `CupTrace${batchData.id.substring(0, 8)}`;

        const metadata: Record<string, any> = {
            name: `CupTrace Batch #${batchData.id.substring(0, 8)}`,
            image: 'ipfs://QmRzicpE131572365236523652',
            mediaType: 'image/png',
            description: 'Authentic Rwandan Coffee tracked via CupTrace',
            batchId: batchData.id,
            farmerId: batchData.farmerId,
            integrityHash: batchData.integrityHash,
            grade: batchData.grade,
            weight: batchData.weight.toString(),
            origin: batchData.origin,
            version: '1.0'
        };

        console.log('Building transaction...');
        console.log('Policy ID:', policyId);
        console.log('Asset Name:', assetName);

        // Build minting transaction - simple mint without complex policies for now
        const tx = await lucid
            .newTx()
            .mintAssets({ [policyId + assetName]: 1n })
            .attachMetadata(721, {
                [policyId]: {
                    [assetName]: metadata
                }
            })
            .complete();

        console.log('Signing transaction...');
        const signedTx = await tx.sign().complete();

        console.log('Submitting transaction...');
        const txHash = await signedTx.submit();

        console.log('Transaction submitted successfully:', txHash);

        return {
            txHash,
            policyId,
            assetName,
            address,
            batchId: batchData.id
        };
    } catch (error) {
        console.error('Minting error:', error);
        throw error;
    }
};
