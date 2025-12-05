# How to Get Test ADA for Cardano Preprod

## Your Wallet Address

To get your wallet address, run:
```bash
cd backend
npm run generate-wallet
```

This will display your wallet address. Copy it - you'll need it for the faucet.

## Getting Test ADA

### Option 1: Cardano Testnet Faucet (Recommended)

1. **Go to the Cardano Testnet Faucet:**
   - URL: https://docs.cardano.org/cardano-testnet/tools/faucet
   - Or search for "Cardano Preprod Faucet"

2. **Fill out the form:**
   - **Environment**: Select "Preprod Testnet"
   - **Action**: Select "Receive test ADA"
   - **Address**: Paste your wallet address (from `npm run generate-wallet`)
   - **API Key**: Leave empty (optional, only needed to bypass rate limiting)

3. **Submit the form** and wait for the test ADA to arrive (usually within a few minutes)

### Option 2: Alternative Faucets

If the main faucet is unavailable, try:
- **Cardano Testnets Discord**: Join the Cardano testnets Discord and request test ADA
- **Community Faucets**: Search for "Cardano Preprod faucet" for community-run options

## How Much Test ADA Do You Need?

For contract deployment, you need:
- **Minimum**: ~5-10 ADA
- **Recommended**: 20-50 ADA (for multiple deployments and testing)

Each validator deployment requires:
- ~2 ADA locked at the contract address
- ~0.2-0.5 ADA for transaction fees
- Additional ADA for future transactions

## Your Current Configuration

Your `.env` file already has:
- ✅ `WALLET_PRIVATE_KEY` - Your wallet private key
- ✅ `BLOCKFROST_API_KEY` - Your Blockfrost API key (already set)
- ✅ `NFT_POLICY_ID` - Generated policy ID
- ✅ `BATCH_CONTRACT_ADDRESS` - Validator address (ready for deployment)
- ✅ `STAGE_CONTRACT_ADDRESS` - Validator address (ready for deployment)

## After Getting Test ADA

Once you receive test ADA:

1. **Verify your balance:**
   ```bash
   # The deployment script will check your balance automatically
   npm run deploy:contracts
   ```

2. **Deploy contracts:**
   ```bash
   npm run deploy:contracts
   ```

3. **The script will:**
   - Deploy both validators to the blockchain
   - Lock 2 ADA at each validator address
   - Output transaction hashes for verification

## Troubleshooting

### "Insufficient input in transaction"
- Your wallet doesn't have enough test ADA
- Get more test ADA from the faucet

### "Rate limit exceeded"
- Wait a few minutes and try again
- Or use an API key (optional field in faucet form)

### "Address not found"
- Make sure you're using the Preprod testnet
- Verify your wallet address is correct

## Need Help?

- Check the Cardano Testnets documentation
- Join the Cardano Developer Discord
- Review the deployment script output for specific error messages

