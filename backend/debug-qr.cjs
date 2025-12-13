require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const code = 'B-11f6c0800d39';
    console.log(`Searching for code: ${code}`);

    const strictMatch = await prisma.productBatch.findFirst({
        where: {
            OR: [
                { publicTraceHash: code },
                { qrCode: code },
                { lotId: code },
                { id: code }
            ]
        }
    });

    console.log('Strict Match Result:', strictMatch ? 'FOUND' : 'NOT FOUND');

    const looseMatch = await prisma.productBatch.findFirst({
        where: {
            OR: [
                { publicTraceHash: { contains: code, mode: 'insensitive' } },
                { qrCode: { contains: code, mode: 'insensitive' } },
                { id: { contains: code, mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            lotId: true,
            qrCode: true,
            publicTraceHash: true
        }
    });

    console.log('Loose Match Result:', looseMatch);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
