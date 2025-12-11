const { create } = require('ipfs-http-client');
require('dotenv').config();

async function testIPFS() {
  try {
    const url = process.env.INFURA_IPFS_API_URL || 'https://ipfs.infura.io:5001';
    const auth = process.env.INFURA_IPFS_AUTH;

    console.log('=== IPFS Diagnostic ===');
    console.log('URL:', url);
    console.log('AUTH set:', !!auth);
    
    if (auth) {
      const decoded = Buffer.from(auth, 'base64').toString('utf-8');
      console.log('Decoded AUTH (first 30 chars):', decoded.substring(0, 30) + '...');
    }

    const options = { url };
    if (auth) {
      options.headers = { authorization: 'Basic ' + auth };
    }

    console.log('\nCreating client...');
    const client = create(options);
    console.log('✓ Client created');

    console.log('Adding test data...');
    const buffer = Buffer.from('{"test":"data"}');
    const result = await client.add(buffer);
    
    console.log('✓ Add succeeded');
    console.log('CID:', result.path);
    console.log('\n✅ IPFS working!');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  }
}

testIPFS();
