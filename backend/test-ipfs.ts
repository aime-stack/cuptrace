import { create } from 'ipfs-http-client';
import * as dotenv from 'dotenv';

dotenv.config();

async function testIPFS() {
  try {
    const url = process.env.INFURA_IPFS_API_URL || 'https://ipfs.infura.io:5001';
    const projectId = process.env.INFURA_PROJECT_ID;
    const projectSecret = process.env.INFURA_PROJECT_SECRET;

    console.log('Environment variables:');
    console.log('  INFURA_IPFS_API_URL:', url);
    console.log('  INFURA_PROJECT_ID:', projectId ? projectId.substring(0, 8) + '...' : 'NOT SET');
    console.log('  INFURA_PROJECT_SECRET:', projectSecret ? projectSecret.substring(0, 8) + '...' : 'NOT SET');
    console.log('  INFURA_IPFS_AUTH:', process.env.INFURA_IPFS_AUTH ? process.env.INFURA_IPFS_AUTH.substring(0, 8) + '...' : 'NOT SET');

    // Test 1: Decode the base64 auth if it exists
    if (process.env.INFURA_IPFS_AUTH) {
      const decoded = Buffer.from(process.env.INFURA_IPFS_AUTH, 'base64').toString('utf-8');
      console.log('\nDecoded INFURA_IPFS_AUTH:', decoded);
    }

    // Test 2: Try to create a client with Infura auth
    const options: any = { url };
    
    if (process.env.INFURA_IPFS_AUTH) {
      options.headers = {
        authorization: 'Basic ' + process.env.INFURA_IPFS_AUTH,
      };
      console.log('\nClient options.headers.authorization set');
    }

    console.log('\nCreating IPFS client...');
    const client = create(options);
    console.log('Client created successfully');

    // Test 3: Try a simple add operation
    console.log('\nTesting add operation...');
    const testData = Buffer.from('{"test": "data"}');
    console.log('Buffer size:', testData.length);

    const result = await client.add(testData);
    console.log('Add result:', result);
    console.log('CID:', result.path);

    console.log('\n✅ IPFS test successful!');
  } catch (error) {
    console.error('\n❌ IPFS test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
    }
  }
}

testIPFS();
