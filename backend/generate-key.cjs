const fs = require('fs');
require('dotenv').config();

async function generate() {
    try {
        const lucidModule = await import('lucid-cardano');
        const { Lucid } = lucidModule;
        const lucid = await Lucid.new(undefined, 'Preprod');

        const privateKey = lucid.utils.generatePrivateKey();
        const address = await lucid.selectWalletFromPrivateKey(privateKey).wallet.address();

        const output = `PRIVATE_KEY=${privateKey}\nADDRESS=${address}\n`;
        fs.writeFileSync('new_wallet_key.txt', output);
        console.log('Generated new key to new_wallet_key.txt');
    } catch (e) {
        console.error('Error:', e);
    }
}

generate();
