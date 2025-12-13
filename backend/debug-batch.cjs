require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Searching for batches...');
    try {
        const lotId = 'CMJ4GSNR';
        const batch = await prisma.productBatch.findFirst({
            where: {
                OR: [
                    { lotId: { equals: lotId, mode: 'insensitive' } },
                    { qrCode: { equals: lotId, mode: 'insensitive' } },
                    // Relaxed search
                    { lotId: { contains: lotId, mode: 'insensitive' } }
                ]
            }
        });
        console.log('Search result for ' + lotId + ':', batch);

        // List all batches to see what's there
        const all = await prisma.productBatch.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { id: true, lotId: true, qrCode: true, type: true, status: true, currentStage: true }
        });
        console.log('Recent 10 batches:', JSON.stringify(all, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
