const fs = require('fs');
require('dotenv').config();

const hexKey = process.env.WALLET_PRIVATE_KEY;

function log(msg) {
    console.log(msg);
    fs.appendFileSync('key_recovery_log.txt', msg + '\n');
}

log('--- Key Recovery Start ---');

if (!hexKey) {
    log('No key found in env');
    process.exit(1);
}

log(`Input Length: ${hexKey.length}`);

// Strategy 1: Hex -> UTF-8 String (Is it a JSON file content encoded as hex?)
try {
    const buffer = Buffer.from(hexKey, 'hex');
    const utf8 = buffer.toString('utf8');
    log('--- Hex to UTF-8 Result ---');
    // Sanitize printable chars for logging
    const safeUtf8 = utf8.replace(/[^\x20-\x7E]/g, '.');
    log(`Preview: ${safeUtf8.substring(0, 100)}...`);

    if (utf8.includes('cborHex')) {
        log('FOUND: "cborHex" pattern! This is a cardano-cli file.');
        try {
            // It might be a JSON like { "type": "PaymentSigningKeyShelley_ed25519", "description": "...", "cborHex": "..." }
            // But the UTF8 might be messy if it's not pure JSON.
            // Let's try to extract the cborHex value using regex
            const match = utf8.match(/"cborHex"\s*:\s*"([0-9a-fA-F]+)"/);
            if (match && match[1]) {
                log(`EXTRACTED cborHex: ${match[1]}`);
                // Now we need to convert this cborHex to Bech32
                // We'll leave that for the user or a second step, but verifying we found it is huge.
                fs.writeFileSync('recovered_cbor.txt', match[1]);
            }
        } catch (e) {
            log('Failed to parse JSON structure from text');
        }
    }
} catch (e) {
    log('Failed Hex->UTF8 conversion');
}

// Strategy 2: CBOR Parsing (if it's raw CBOR)
// Use simple cbor decoder or regex search for the key pattern
log('--- Analysis Complete ---');
