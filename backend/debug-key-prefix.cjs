const fs = require('fs');

function log(msg) {
    fs.appendFileSync('key_debug_details.txt', msg + '\n');
}

log('Starting detailed analysis...');

try {
    require('dotenv').config();
    const key = process.env.WALLET_PRIVATE_KEY;

    if (!key) {
        log('Key Missing');
    } else {
        log(`Prefix (first 10 chars): ${key.substring(0, 10)}`);
    }

} catch (e) {
    log('Error: ' + e.message);
}
