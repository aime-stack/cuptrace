
require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function check() {
    const code = 'CMJ4G5E3';
    let output = `Checking for batch code: ${code}\n`;

    try {
        const byLot = await prisma.productBatch.findMany({
            where: { lotId: { equals: code, mode: 'insensitive' } }
        });
        output += `By Lot ID: ${JSON.stringify(byLot, null, 2)}\n`;

        const byQR = await prisma.productBatch.findMany({
            where: { qrCode: code }
        });
        output += `By QR Code: ${JSON.stringify(byQR, null, 2)}\n`;

        const recent = await prisma.productBatch.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, lotId: true, qrCode: true, type: true, createdAt: true }
        });
        output += `5 Most Recent Batches: ${JSON.stringify(recent, null, 2)}\n`;

        fs.writeFileSync('db_check_results.txt', output);
        console.log('Results written to db_check_results.txt');

    } catch (err) {
        fs.writeFileSync('db_check_results.txt', `Error: ${err.message}`);
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
