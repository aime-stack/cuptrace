import {
    MeshTxBuilder,
    AssetMetadata,
    Mint,
    Token,
    BrowserWallet,
    ForgeScript,
    NativeScript,
    resolveScriptHash
} from '@meshsdk/core';

export const mintBatchNFT = async (
    wallet: BrowserWallet,
    batchData: {
        id: string;
        farmerId: string;
        integrityHash: string;
        grade: string;
        weight: number;
        origin: string;
    }
) => {
    try {
        const usedAddress = await wallet.getChangeAddress();
        const forgingScript = ForgeScript.withOneSignature(usedAddress);

        const policyId = resolveScriptHash(forgingScript);

        const assetName = `CupTrace${batchData.id.substring(0, 8)}`;

        const metadata: AssetMetadata = {
            "name": `CupTrace Batch #${batchData.id.substring(0, 8)}`,
            "image": "ipfs://QmRzicpE131572365236523652", // Placeholder image
            "mediaType": "image/png",
            "description": "Authentic Rwandan Coffee tracked via CupTrace",
            "batchId": batchData.id,
            "farmerId": batchData.farmerId,
            "integrityHash": batchData.integrityHash,
            "grade": batchData.grade,
            "weight": batchData.weight.toString(),
            "origin": batchData.origin,
            "version": "1.0"
        };


        const tx = new MeshTxBuilder({})
            .mintPlutusScriptV2() // We might want native script for simple minting first
            .mint("1", policyId, assetName)
            .mintingScript(forgingScript)
            .metadataValue("721", {
                [policyId]: {
                    [assetName]: metadata
                }
            })
            .changeAddress(usedAddress)
            .selectUtxosFrom(await wallet.getUtxos());

        const unsignedTx = await tx.complete();
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);

        return {
            txHash,
            policyId,
            assetName
        };

    } catch (error) {
        console.error('Minting error:', error);
        throw error;
    }
};
