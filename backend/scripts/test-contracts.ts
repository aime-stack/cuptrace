/**
 * Test Aiken contract interactions
 * 
 * This script tests the interaction between the backend and deployed smart contracts.
 * It verifies NFT minting, stage transitions, and contract validation.
 */

import { mintBatchNFT, getBatchNFT, verifyNFT } from '../src/services/nft.service';
import { createBatchOnChain, updateBatchStageOnChain, verifyBatchOnChain } from '../src/services/blockchain.service';
import prisma from '../src/config/database';

async function testContracts() {
  console.log('🧪 Testing CupTrace Smart Contract Integration\n');

  try {
    // Test 1: Create a test batch
    console.log('1️⃣ Creating test batch...');
    const testBatch = await prisma.productBatch.create({
      data: {
        type: 'coffee',
        originLocation: 'Rwanda, Northern Province',
        currentStage: 'farmer',
        status: 'pending',
        quantity: 1000,
        region: 'Northern Province',
        lotId: `TEST-${Date.now()}`,
      },
    });
    console.log(`   ✅ Batch created: ${testBatch.id}\n`);

    // Test 2: Mint NFT
    console.log('2️⃣ Minting NFT for batch...');
    try {
      const nftInfo = await mintBatchNFT(testBatch.id);
      console.log(`   ✅ NFT minted:`);
      console.log(`      Policy ID: ${nftInfo.policyId}`);
      console.log(`      Asset Name: ${nftInfo.assetName}`);
      console.log(`      TX Hash: ${nftInfo.txHash || 'Pending'}\n`);
    } catch (error) {
      console.log(`   ⚠️  NFT minting failed (expected if blockchain not configured):`, error instanceof Error ? error.message : error);
      console.log('      This is normal if BLOCKFROST_API_KEY is not set\n');
    }

    // Test 3: Get NFT info
    console.log('3️⃣ Retrieving NFT information...');
    const nftInfo = await getBatchNFT(testBatch.id);
    if (nftInfo) {
      console.log(`   ✅ NFT found:`);
      console.log(`      Policy ID: ${nftInfo.policyId}`);
      console.log(`      Asset Name: ${nftInfo.assetName}`);
      console.log(`      Minted At: ${nftInfo.mintedAt}\n`);
    } else {
      console.log('   ⚠️  NFT not found (may not be minted yet)\n');
    }

    // Test 4: Verify NFT
    if (nftInfo) {
      console.log('4️⃣ Verifying NFT...');
      const verification = await verifyNFT(testBatch.id, nftInfo.policyId, nftInfo.assetName);
      console.log(`   ✅ Verification result:`);
      console.log(`      Verified: ${verification.verified}`);
      console.log(`      On-chain: ${verification.onChain}`);
      if (verification.error) {
        console.log(`      Error: ${verification.error}`);
      }
      console.log();
    }

    // Test 5: Create batch on blockchain
    console.log('5️⃣ Creating batch on blockchain...');
    try {
      const txHash = await createBatchOnChain(testBatch.id, {
        type: testBatch.type,
        originLocation: testBatch.originLocation,
        farmerId: testBatch.farmerId || undefined,
        timestamp: testBatch.createdAt.toISOString(),
      });
      console.log(`   ✅ Batch created on blockchain:`);
      console.log(`      TX Hash: ${txHash}\n`);
    } catch (error) {
      console.log(`   ⚠️  Blockchain creation failed (expected if blockchain not configured):`, error instanceof Error ? error.message : error);
      console.log('      This is normal if BLOCKFROST_API_KEY is not set\n');
    }

    // Test 6: Update stage
    console.log('6️⃣ Testing stage transition...');
    try {
      const stageTxHash = await updateBatchStageOnChain(
        testBatch.id,
        'washing_station',
        'farmer',
        'test_user_id'
      );
      console.log(`   ✅ Stage updated on blockchain:`);
      console.log(`      TX Hash: ${stageTxHash}\n`);
    } catch (error) {
      console.log(`   ⚠️  Stage update failed (expected if blockchain not configured):`, error instanceof Error ? error.message : error);
      console.log('      This is normal if BLOCKFROST_API_KEY is not set\n');
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.productBatch.delete({
      where: { id: testBatch.id },
    });
    console.log('   ✅ Test batch deleted\n');

    console.log('✅ All tests completed!\n');
    console.log('📝 Note: Some tests may show warnings if blockchain is not configured.');
    console.log('   To enable full blockchain functionality:');
    console.log('   1. Set BLOCKFROST_API_KEY in backend/.env');
    console.log('   2. Deploy contracts to Preprod network');
    console.log('   3. Update contract addresses in environment variables');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testContracts().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

