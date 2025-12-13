const fs = require('fs');
require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function log(msg) {
    fs.appendFileSync('debug_output.txt', typeof msg === 'string' ? msg + '\n' : JSON.stringify(msg, null, 2) + '\n');
}

async function main() {
    log('Connecting...');
    try {
        const batch = await prisma.productBatch.findFirst({
            where: {
                OR: [
                    { lotId: 'CMJ4GSNR' },
                    { qrCode: 'CMJ4GSNR' }
                ]
            }
        });
        log('FOUND BATCH:');
        log(batch);

        const all = await prisma.productBatch.findMany({ select: { id: true, lotId: true } });
        log('ALL BATCHES:');
        log(all);
    } catch (e) {
        log('ERROR:');
        log(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
