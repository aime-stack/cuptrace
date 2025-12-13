const fs = require('fs');
require('dotenv').config();
const env = process.env;

const output = `CARDANO_NETWORK: ${env.CARDANO_NETWORK}
BLOCKFROST_API_KEY_PREFIX: ${(env.BLOCKFROST_API_KEY || '').substring(0, 10)}
WALLET_PRIVATE_KEY_SET: ${!!env.WALLET_PRIVATE_KEY}
`;

fs.writeFileSync('env_debug_utf8.txt', output);
console.log('Written to env_debug_utf8.txt');
