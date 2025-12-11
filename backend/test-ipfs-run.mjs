import dotenv from 'dotenv';
import { create } from 'ipfs-http-client';
import { Web3Storage, File as Web3File } from 'web3.storage';

dotenv.config();

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
    console.error('[IPFS] Upload failed (ipfs-http-client):', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    // Attempt web3.storage fallback
    const token = process.env.WEB3_STORAGE_TOKEN;
    if (!token) {
      console.error('[IPFS] No WEB3_STORAGE_TOKEN configured; cannot fallback');
      process.exitCode = 1;
      return;
    }
    try {
      console.log('[IPFS] Attempting web3.storage fallback');
      const w3 = new Web3Storage({ token });
      const data = Buffer.from(JSON.stringify({ test: 'cuptrace-ipfs-diagnostic', ts: Date.now() }));
      const file = new Web3File([data], 'metadata.json');
      const cid = await w3.put([file]);
      console.log('[IPFS] web3.storage upload successful, CID:', cid);
    } catch (w3err) {
      console.error('[IPFS] web3.storage fallback failed:', w3err && w3err.message ? w3err.message : w3err);
      if (w3err && w3err.stack) console.error(w3err.stack);
      process.exitCode = 1;
    }
  }
})();
