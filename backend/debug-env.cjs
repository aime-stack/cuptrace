require('dotenv').config();
const env = process.env;

console.log('--- ENV DEBUG ---');
console.log('CARDANO_NETWORK:', env.CARDANO_NETWORK);
console.log('BLOCKFROST_API_KEY (first 10 chars):', (env.BLOCKFROST_API_KEY || '').substring(0, 10));
