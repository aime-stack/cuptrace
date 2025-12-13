const fs = require('fs');

function log(msg) {
    fs.appendFileSync('key_debug_classification.txt', msg + '\n');
}

log('Starting classification...');

try {
    require('dotenv').config();
    const key = process.env.WALLET_PRIVATE_KEY;

    if (!key) {
        log('Key Missing');
    } else {
        log(`Length: ${key.length}`);
        log(`Contains spaces: ${key.includes(' ')}`);
        log(`Space count: ${key.split(' ').length - 1}`);
        log(`Starts with '{': ${key.trim().startsWith('{')}`);
        log(`Starts with '[': ${key.trim().startsWith('[')}`);
        log(`Is Hex only: ${/^[0-9a-fA-F]+$/.test(key)}`);
    }

} catch (e) {
    log('Error: ' + e.message);
}
