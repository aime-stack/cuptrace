import { Router } from 'express';
import { mintBatchNFT } from '../services/mint.service';

const router = Router();

/**
 * POST /mint
 * Mint an NFT for a batch
 */
router.post('/', async (req, res) => {
    try {
        const { batchData } = req.body;

        if (!batchData) {
            return res.status(400).json({ message: 'Missing batchData' });
        }

        console.log('=== Minting NFT ===');
        console.log('Batch Data:', batchData);

        const result = await mintBatchNFT(batchData);

        return res.status(200).json({
            message: 'NFT minting transaction submitted',
            data: result
        });
    } catch (error) {
        console.error('Full Minting Error Object:', error);
        console.error('Error Type:', typeof error);
        if (typeof error === 'object') {
            console.error('Error JSON:', JSON.stringify(error, null, 2));
        }

        const message = error instanceof Error
            ? error.message
            : (typeof error === 'string' ? error : 'Unknown error (check server logs)');

        return res.status(500).json({ message: `Minting failed: ${message}` });
    }
});

export default router;
