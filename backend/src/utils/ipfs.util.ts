import env from '../config/env.js';

/**
 * IPFS Utility for CupTrace
 * 
 * Uses Pinata for IPFS pinning. Pinata offers a generous free tier
 * and is much more accessible than Infura IPFS (which is limited to pre-qualified customers).
 * 
 * Required env variables:
 * - PINATA_API_KEY: Your Pinata API key
 * - PINATA_SECRET_KEY: Your Pinata secret key
 */

const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload JSON data to IPFS via Pinata
 */
export const uploadJSONToIPFS = async (obj: unknown): Promise<string> => {
  const apiKey = env.PINATA_API_KEY;
  const secretKey = env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn('[IPFS] Pinata credentials not configured. Skipping IPFS upload.');
    console.warn('[IPFS] Set PINATA_API_KEY and PINATA_SECRET_KEY in .env');
    throw new Error('Pinata credentials not configured');
  }

  const payload = JSON.stringify({
    pinataContent: obj,
    pinataMetadata: {
      name: `cuptrace-metadata-${Date.now()}`,
    },
  });

  console.log('[IPFS] Uploading JSON to Pinata, size:', payload.length, 'bytes');

  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
    },
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IPFS] Pinata upload failed:', response.status, errorText);
    throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json() as { IpfsHash?: string };
  const cid = result.IpfsHash;

  if (!cid) {
    throw new Error('No CID returned from Pinata');
  }

  console.log('[IPFS] Upload successful, CID:', cid);
  console.log('[IPFS] Gateway URL: https://gateway.pinata.cloud/ipfs/' + cid);
  return cid;
};

/**
 * Upload file buffer to IPFS via Pinata
 */
export const uploadFileToIPFS = async (fileBuffer: Buffer, fileName: string = 'file'): Promise<string> => {
  const apiKey = env.PINATA_API_KEY;
  const secretKey = env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn('[IPFS] Pinata credentials not configured. Skipping IPFS upload.');
    throw new Error('Pinata credentials not configured');
  }

  // Create form data for file upload
  const formData = new FormData();
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob, fileName);
  formData.append('pinataMetadata', JSON.stringify({
    name: `cuptrace-file-${Date.now()}`,
  }));

  console.log('[IPFS] Uploading file to Pinata, size:', fileBuffer.length, 'bytes');

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IPFS] Pinata file upload failed:', response.status, errorText);
    throw new Error(`Pinata file upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json() as { IpfsHash?: string };
  const cid = result.IpfsHash;

  if (!cid) {
    throw new Error('No CID returned from Pinata');
  }

  console.log('[IPFS] File upload successful, CID:', cid);
  return cid;
};

