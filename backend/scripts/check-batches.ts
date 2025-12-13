const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const batches = await prisma.productBatch.findMany({
        select: {
            id: true,
            status: true,
            type: true
        }
    });
    const out = JSON.stringify(batches, null, 2);
    const p = path.join(process.cwd(), 'batch_status_log.txt');
    fs.writeFileSync(p, out);
    console.log('Done writing to ' + p);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
