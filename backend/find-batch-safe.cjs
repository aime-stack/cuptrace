const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hash = 'eb4a7fd40dc9871269a0c7d667c52876af67b6b7ce80039c4f3b269b14ca031a';
    let output = `Searching for batch with txHash: ${hash}\n`;

    const batch = await prisma.productBatch.findFirst({
        where: { blockchainTxHash: hash }
    });

    if (batch) {
        output += 'Batch Found: ' + JSON.stringify(batch, null, 2);
    } else {
        output += 'Batch NOT found by that hash.';
    }

    fs.writeFileSync('find_batch_utf8.txt', output);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
