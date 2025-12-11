try {
  require('dotenv').config();
  console.log('Dotenv loaded');
  
  const ipfs = require('ipfs-http-client');
  console.log('IPFS module loaded');
  
  const url = process.env.INFURA_IPFS_API_URL || 'https://ipfs.infura.io:5001';
  console.log('URL:', url);
  console.log('Creating client...');
  
  const client = ipfs.create({ url });
  console.log('Client created');
  
  (async () => {
    try {
      const result = await client.add(Buffer.from('test'));
      console.log('Success:', result.path);
    } catch (e) {
      console.log('Add failed:', e.message);
    }
  })();
} catch (e) {
  console.error('Fatal error:', e.message);
  console.error(e.stack);
}
