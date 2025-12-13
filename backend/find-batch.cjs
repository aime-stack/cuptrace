require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hash = 'eb4a7fd40dc9871269a0c7d667c52876af67b6b7ce80039c4f3b269b14ca031a';
    console.log(`Searching for batch with txHash: ${hash}`);

    const batch = await prisma.productBatch.findFirst({
        where: { blockchainTxHash: hash }
    });

    if (batch) {
        console.log('Batch Found:', JSON.stringify(batch, null, 2));
    } else {
        console.log('Batch NOT found by that hash.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
