require('dotenv').config();
const { create } = require('ipfs-http-client');

function buildAuthHeaderFromEnv() {
  const infuraAuth = process.env.INFURA_IPFS_AUTH || process.env.IPFS_AUTH;
  if (infuraAuth) {
    return infuraAuth.startsWith('Basic ') ? infuraAuth : 'Basic ' + infuraAuth;
  }
  if (process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET) {
    const combo = `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`;
    const b64 = Buffer.from(combo).toString('base64');
    console.log('[IPFS] Built Basic auth from INFURA_PROJECT_ID/SECRET');
    return 'Basic ' + b64;
  }
  return null;
}

(async function run() {
  try {
    const url = process.env.INFURA_IPFS_API_URL || process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001';
    console.log('[IPFS] Connecting to:', url);

    const options = { url };
    const authHeader = buildAuthHeaderFromEnv();
    if (authHeader) {
      options.headers = { authorization: authHeader };
      console.log('[IPFS] Using auth header (redacted):', authHeader.substring(0, 12) + '...');
    } else {
      console.log('[IPFS] No auth header available; trying anonymous connection');
    }

    const client = create(options);
    console.log('[IPFS] Client created, attempting add...');

    const data = Buffer.from(JSON.stringify({ test: 'cuptrace-ipfs-diagnostic', ts: Date.now() }));
    console.log('[IPFS] Uploading payload of size:', data.length, 'bytes');
    const result = await client.add(data);
    const cid = result.path || (result.cid && result.cid.toString()) || JSON.stringify(result);
    console.log('[IPFS] Upload successful, CID:', cid);
  } catch (err) {
    console.error('[IPFS] Upload failed:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exitCode = 1;
  }
})();
