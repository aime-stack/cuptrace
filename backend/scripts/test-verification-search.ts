
import { PrismaClient } from '@prisma/client';
import { verifyBatchByQRCode } from '../src/services/product.service';
import fs from 'fs';

const prisma = new PrismaClient();
const LOG_FILE = 'verification-test.log';

function log(message: string) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

async function main() {
    fs.writeFileSync(LOG_FILE, 'Starting verification search test...\n');
    log('Starting verification search test...');

    // 1. Create a dummy batch directly using Prisma
    const lotId = `TEST-LOT-${Date.now()}`;
    const qrCode = `CF-TEST-${Date.now()}`;
    const publicTraceHash = `B-TEST-${Date.now()}`;

    log(`Creating test batch with:`);
    log(`- Lot ID: ${lotId}`);
    log(`- QR Code: ${qrCode}`);
    log(`- Public Hash: ${publicTraceHash}`);

    const batch = await prisma.productBatch.create({
        data: {
            type: 'coffee',
            originLocation: 'Test Origin',
            status: 'pending',
            currentStage: 'farmer',
            lotId,
            qrCode,
            publicTraceHash,
            // Minimal required fields
        },
    });

    log(`Batch created with ID: ${batch.id}`);

    // 2. Test searching by different fields

    try {
        // Test 1: Search by QR Code (Exact)
        log('\nTest 1: Search by QR Code (Exact)');
        const res1 = await verifyBatchByQRCode(qrCode);
        log(`✅ Found: ${res1.batch.id}`);

        // Test 2: Search by QR Code (Case Insensitive)
        log('\nTest 2: Search by QR Code (Lowercase)');
        const res2 = await verifyBatchByQRCode(qrCode.toLowerCase());
        log(`✅ Found: ${res2.batch.id}`);

        // Test 3: Search by Public Hash
        log('\nTest 3: Search by Public Hash');
        const res3 = await verifyBatchByQRCode(publicTraceHash);
        log(`✅ Found: ${res3.batch.id}`);

        // Test 4: Search by Lot ID
        log('\nTest 4: Search by Lot ID');
        const res4 = await verifyBatchByQRCode(lotId);
        log(`✅ Found: ${res4.batch.id}`);

        // Test 5: Search by ID
        log('\nTest 5: Search by ID');
        const res5 = await verifyBatchByQRCode(batch.id);
        log(`✅ Found: ${res5.batch.id}`);

        log('\n----------------------------------------');
        log('🎉 ALL TESTS PASSED: Verification logic is robust!');
        log('----------------------------------------');

    } catch (error) {
        log('\n❌ Test Failed: ' + error);
    } finally {
        // Cleanup
        log('\nCleaning up...');
        await prisma.productBatch.delete({ where: { id: batch.id } });
        await prisma.$disconnect();
    }
}

main();
