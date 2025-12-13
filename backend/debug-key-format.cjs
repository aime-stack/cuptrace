const fs = require('fs');

function log(msg) {
    fs.appendFileSync('key_debug_progress.txt', msg + '\n');
}

log('Starting script...');

try {
    require('dotenv').config();
    log('Dotenv loaded.');
} catch (e) {
    log('Failed to load dotenv: ' + e.message);
}

const key = process.env.WALLET_PRIVATE_KEY;
log(`Key present: ${!!key}`);
if (key) {
    log(`Key length: ${key.length}`);
    log(`Starst with ed25519_sk: ${key.startsWith('ed25519_sk')}`);
}

async function runLucid() {
    log('Attempting to import Lucid...');
    try {
        const lucidModule = await import('lucid-cardano');
        const { Lucid } = lucidModule;
        log('Lucid imported successfully.');

        log('Initializing Lucid...');
        const lucid = await Lucid.new(undefined, 'Preprod');
        log('Lucid initialized.');

        log('Selecting wallet...');
        lucid.selectWalletFromPrivateKey(key);
        log('Wallet selected.');

        const address = await lucid.wallet.address();
        log(`Address derived: ${address}`);

    } catch (e) {
        log('Lucid error: ' + e.message);
        log('Stack: ' + e.stack);
    }
}

runLucid().catch(e => log('Fatal error: ' + e.message));
