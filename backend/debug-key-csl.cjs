const fs = require('fs');

function log(msg) {
    fs.appendFileSync('key_debug_csl.txt', msg + '\n');
}

log('Starting CSL analysis...');

try {
    require('dotenv').config();
    const key = process.env.WALLET_PRIVATE_KEY;

    if (!key) {
        log('Key Missing');
        return;
    }

    import('lucid-cardano').then(lucidModule => {
        const { C } = lucidModule; // Lucid exports C (CSL)
        log('CSL loaded');

        // Test 1: Try from_normal_bytes (raw 32/64 bytes)
        try {
            const bytes = Buffer.from(key, 'hex');
            log(`Converted to buffer, length: ${bytes.length}`);
            C.PrivateKey.from_normal_bytes(bytes);
            log('SUCCESS: Parsed as normal bytes');
        } catch (e) {
            log('FAIL: Not normal bytes: ' + e.message);
        }

        // Test 2: Try from_hex (unlikely if lengths mismatch but worth trying)
        try {
            // C.PrivateKey doesn't always have from_hex in all versions, usually from_bytes
            // But let's look for CBOR parsing?
        } catch (e) { }

        // Test 3: Is it an Extended Private key?
        try {
            const bytes = Buffer.from(key, 'hex');
            C.Bip32PrivateKey.from_bytes(bytes);
            log('SUCCESS: Parsed as Bip32PrivateKey');
        } catch (e) {
            log('FAIL: Not Bip32PrivateKey: ' + e.message);
        }

        log('Done.');

    }).catch(e => {
        log('Import error: ' + e.message);
    });

} catch (e) {
    log('Error: ' + e.message);
}
