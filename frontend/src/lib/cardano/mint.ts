export const mintBatchNFT = async (
    wallet: null,
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
        console.log('=== Calling Mint API ===');
        
        const response = await fetch('/api/mint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batchData })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Minting failed');
        }

        const result = await response.json();
        console.log('Minting result:', result);

        return {
            txHash: result.txHash,
            policyId: result.policyId,
            assetName: result.assetName
        };

    } catch (error) {
        console.error('=== Minting Error ===', error);
        if (error instanceof Error) {
            throw new Error(`Minting failed: ${error.message}`);
        }
        throw error;
    }
};
