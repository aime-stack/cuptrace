/**
 * Generate a Test Wallet for Cardano Preprod Network
 * 
 * This script generates a new wallet and outputs the private key
 * for use in contract deployment.
 * 
 * WARNING: This is for TESTING ONLY. Never use this for mainnet!
 */

import { initializeLucid } from '../src/services/blockchain.service';

async function generateTestWallet() {
  console.log('🔐 Generating test wallet for Preprod network...\n');

  // Initialize Lucid
  console.log('🔌 Initializing Lucid connection...');
  const lucid = await initializeLucid();
  if (!lucid) {
    console.error('❌ Failed to initialize Lucid connection');
    console.error('   Please ensure BLOCKFROST_API_KEY is set in .env');
    process.exit(1);
  }

  console.log('✅ Connected to Cardano network\n');

  try {
    // Generate a new wallet
    const lucidTyped = lucid as any;
    
    // Generate a new private key
    const privateKey = lucidTyped.utils.generatePrivateKey();
    
    // Select the wallet to get the address
    lucidTyped.selectWalletFromPrivateKey(privateKey);
    const address = await lucidTyped.wallet.address();
    
    console.log('✅ Wallet generated successfully!\n');
    console.log('📋 Wallet Information:');
    console.log(`   Address: ${address}\n`);
    console.log('🔑 Private Key (add this to your .env file):');
    console.log(`   WALLET_PRIVATE_KEY=${privateKey}\n`);
    console.log('⚠️  IMPORTANT:');
    console.log('   - This is a TEST wallet for Preprod network only');
    console.log('   - Keep your private key SECRET and NEVER commit it to git');
    console.log('   - You need test ADA to deploy contracts');
    console.log('   - Get test ADA from: https://docs.cardano.org/cardano-testnet/tools/faucet\n');
    console.log('💡 Next Steps:');
    console.log('   1. Copy the WALLET_PRIVATE_KEY above to your backend/.env file');
    console.log('   2. Get test ADA from the faucet using the address above');
    console.log('   3. Run: npm run deploy:contracts\n');
    
  } catch (error) {
    console.error('❌ Failed to generate wallet:', error);
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run wallet generation
generateTestWallet().catch((error) => {
  console.error('❌ Wallet generation failed:', error);
  process.exit(1);
});

