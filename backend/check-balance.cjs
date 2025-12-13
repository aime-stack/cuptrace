const fs = require('fs');
require('dotenv').config();

async function checkBalance() {
    let log = '';
    const append = (msg) => { console.log(msg); log += msg + '\n'; };

    try {
        const lucidModule = await import('lucid-cardano');
        const { Lucid } = lucidModule;

        const projectId = process.env.BLOCKFROST_API_KEY;
        if (!projectId) {
            append('Error: BLOCKFROST_API_KEY not set in .env');
            fs.writeFileSync('balance_check_output.txt', log);
            return;
        }

        const lucid = await Lucid.new(
            { url: "https://cardano-preprod.blockfrost.io/api/v0", projectId: projectId },
            "Preprod"
        );

        const key = process.env.WALLET_PRIVATE_KEY;
        if (!key) {
            append('Error: WALLET_PRIVATE_KEY not set in .env');
            fs.writeFileSync('balance_check_output.txt', log);
            return;
        }

        lucid.selectWalletFromPrivateKey(key);
        const address = await lucid.wallet.address();
        append(`Checking Address: ${address}`);

        const utxos = await lucid.wallet.getUtxos();
        append(`UTxO Count: ${utxos.length}`);

        if (utxos.length === 0) {
            append('Status: EMPTY (No Funds)');
            append('Action Required: Request funds from Preprod Faucet.');
        } else {
            const balance = utxos.reduce((acc, u) => acc + BigInt(u.assets.lovelace), 0n);
            append(`Balance: ${balance / 1000000n} ADA`);
        }

    } catch (e) {
        append('Error checking balance: ' + e.message);
    }
    fs.writeFileSync('balance_check_output.txt', log);
}

checkBalance();
