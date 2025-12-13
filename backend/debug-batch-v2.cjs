const fs = require('fs');
const net = require('net');
const url = require('url');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

function log(msg) {
    let line = msg;
    if (msg instanceof Error) {
        line = msg.stack || msg.message;
    } else if (typeof msg !== 'string') {
        line = JSON.stringify(msg, null, 2);
    }
    console.log(line);
    fs.appendFileSync('debug_output.txt', line + '\n');
}

// Clear previous log
fs.writeFileSync('debug_output.txt', '');

async function main() {
    log('--- DEBUG START ---');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        log('ERROR: DATABASE_URL is not defined');
        return;
    }

    // Parse and mask URL
    try {
        const parsed = new url.URL(dbUrl);
        const masked = dbUrl.replace(parsed.password, '****');
        log(`DATABASE_URL: ${masked}`);
        log(`Host: ${parsed.hostname}`);
        log(`Port: ${parsed.port}`);

        // Test TCP Connection
        log(`Testing TCP connection to ${parsed.hostname}:${parsed.port}...`);
        await new Promise((resolve, reject) => {
            const socket = new net.Socket();
            socket.setTimeout(5000);
            socket.on('connect', () => {
                log('TCP Connection SUCCESS');
                socket.destroy();
                resolve();
            });
            socket.on('timeout', () => {
                log('TCP Connection TIMEOUT');
                socket.destroy();
                resolve(); // Continue anyway
            });
            socket.on('error', (err) => {
                log(`TCP Connection ERROR: ${err.message}`);
                resolve(); // Continue anyway
            });
            socket.connect(parsed.port || 5432, parsed.hostname);
        });

    } catch (e) {
        log(`Error parsing URL: ${e.message}`);
    }

    // Prisma Check
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

    try {
        log('Attempting Prisma connection...');
        const lotId = 'CMJ4GSNR';
        const batch = await prisma.productBatch.findFirst({
            where: {
                OR: [
                    { lotId: { equals: lotId, mode: 'insensitive' } },
                    { qrCode: { equals: lotId, mode: 'insensitive' } }
                ]
            }
        });
        log(batch ? 'BATCH FOUND!' : 'BATCH NOT FOUND');
        if (batch) log(batch);

        const count = await prisma.productBatch.count();
        log(`Total batches in DB: ${count}`);

        // Test proposed fix queries
        log('Testing FULL OR Query Logic (Fix Verification):');
        const batchCheck = await prisma.productBatch.findFirst({
            where: {
                OR: [
                    { qrCode: { equals: lotId, mode: 'insensitive' } },
                    { publicTraceHash: { equals: lotId, mode: 'insensitive' } },
                    { lotId: { equals: lotId, mode: 'insensitive' } },
                    { id: lotId },
                    // Fallbacks
                    { qrCode: { contains: lotId, mode: 'insensitive' } },
                    { id: { startsWith: lotId, mode: 'insensitive' } }
                ]
            }
        });
        log(batchCheck ? 'BATCH FOUND with OR logic!' : 'BATCH NOT FOUND with OR logic');
        if (batchCheck) {
            const { id, lotId, qrCode, type } = batchCheck;
            log('Resolved Batch Details:');
            log({ id, lotId, qrCode, type });
        }

    } catch (e) {
        log('Prisma Error:');
        log(e.message);
        log(e);
    } finally {
        await prisma.$disconnect();
    }
    log('--- DEBUG END ---');
}

main();
