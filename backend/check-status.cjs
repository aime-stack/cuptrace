const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function log(msg) {
    const line = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
    console.log(line);
    fs.appendFileSync('status_output.txt', line + '\n');
}

// Clear previous log
fs.writeFileSync('status_output.txt', '');

async function main() {
    log('--- CHECK STATUS START ---');
    try {
        const batches = await prisma.productBatch.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                lotId: true,
                status: true,
                type: true,
                currentStage: true
            }
        });
        log('Recent Batches:');
        log(batches);

        const approvedInfo = await prisma.productBatch.count({
            where: { status: 'approved' }
        });
        log('Total Approved Batches: ' + approvedInfo);

        const coffeeApproved = await prisma.productBatch.count({
            where: { status: 'approved', type: 'coffee' }
        });
        log('Total Approved Coffee Batches: ' + coffeeApproved);

    } catch (e) {
        log('Error:');
        log(e);
    } finally {
        await prisma.$disconnect();
    }
    log('--- CHECK STATUS END ---');
}

main();
