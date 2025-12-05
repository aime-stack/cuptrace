# CupTrace Smart Contracts

Aiken smart contracts for CupTrace batch traceability and NFT minting on Cardano blockchain.

## Overview

This directory contains the Aiken smart contracts that power CupTrace's blockchain integration:

- **NFT Minting Policy**: Mints unique NFTs for each product batch
- **Batch Traceability Validator**: Stores batch state and validates stage transitions
- **Stage Transition Validator**: Validates and records stage changes

## Project Structure

```
contracts/
├── aiken.toml              # Aiken project configuration
├── validators/             # Smart contract validators
│   ├── batch_traceability.aiken
│   └── stage_transition.aiken
├── policies/                # NFT minting policies
│   └── batch_nft.aiken
├── lib/                     # Shared utilities
│   ├── types.aiken
│   └── utils.aiken
├── tests/                   # Test files
│   ├── batch_traceability_test.aiken
│   ├── stage_transition_test.aiken
│   └── nft_policy_test.aiken
├── scripts/                 # Build and deployment scripts
│   └── compile-contracts.sh
└── README.md               # This file
```

## Prerequisites

- [Aiken](https://aiken-lang.org/) installed
- Cardano wallet with test ADA (for Preprod)
- Blockfrost API key for Preprod network

## Building Contracts

### Compile Contracts

```bash
cd contracts
aiken build
```

This will compile all contracts and generate `.plutus` files in the `build/` directory.

### Run Tests

```bash
aiken check
```

This runs all tests defined in the `tests/` directory.

## Contract Details

### NFT Minting Policy (`policies/batch_nft.aiken`)

- **Purpose**: Mints a unique NFT for each product batch
- **Standard**: CIP-25 (Cardano NFT Metadata Standard)
- **Behavior**: One-time minting only (no burning)
- **Metadata**: Includes batch ID, type, origin location, and other attributes

### Batch Traceability Validator (`validators/batch_traceability.aiken`)

- **Purpose**: Stores batch state on-chain and validates operations
- **Functions**:
  - `CreateBatch`: Initialize a new batch
  - `UpdateStage`: Validate and record stage transitions
  - `UpdateQuantity`: Update batch quantity (only decrease allowed)

### Stage Transition Validator (`validators/stage_transition.aiken`)

- **Purpose**: Validates and records stage transitions
- **Validations**:
  - Valid stage flow (farmer → washing_station → factory → exporter → importer → retailer)
  - Sequential timestamps
  - Quantity cannot increase
  - Batch ID matching

## Stage Validation Rules

Valid stage transitions:
- `farmer` → `washing_station`
- `washing_station` → `factory`
- `factory` → `exporter`
- `exporter` → `importer`
- `importer` → `retailer`

Invalid transitions (will be rejected):
- Skipping stages
- Moving backwards
- Invalid stage combinations

## Deployment

### Preprod Network

1. **Compile contracts**:
   ```bash
   ./scripts/compile-contracts.sh
   ```

2. **Deploy using backend script**:
   ```bash
   cd backend
   npm run deploy-contracts
   ```

3. **Update environment variables**:
   ```env
   BATCH_CONTRACT_ADDRESS=<deployed_address>
   STAGE_CONTRACT_ADDRESS=<deployed_address>
   NFT_POLICY_ID=<policy_id>
   ```

### Manual Deployment

For manual deployment, you'll need to:

1. Load the compiled `.plutus` file
2. Create a transaction that locks ADA at the contract address
3. Submit the transaction to the network
4. Extract the contract address from the transaction

See [Cardano Developer Portal](https://developers.cardano.org/docs/smart-contracts/) for detailed instructions.

## Integration

The contracts are integrated with the backend through:

- `backend/src/services/nft.service.ts`: NFT minting and verification
- `backend/src/services/blockchain.service.ts`: Contract interactions
- `backend/src/services/product.service.ts`: NFT minting on batch creation
- `backend/src/services/stage.service.ts`: Stage validation via contracts

## Testing

### Unit Tests

Tests are defined alongside contracts in the `tests/` directory. Run with:

```bash
aiken check
```

### Integration Tests

Full integration testing requires:

1. Deployed contracts on Preprod
2. Test wallet with ADA
3. Backend API running
4. Test scripts in `backend/scripts/test-contracts.ts`

## NFT Metadata Standard (CIP-25)

NFTs follow the CIP-25 standard with the following structure:

```json
{
  "721": {
    "<policy_id>": {
      "<asset_name>": {
        "name": "Batch-ABC123",
        "image": "ipfs://...",
        "description": "Coffee batch from Rwanda",
        "attributes": {
          "batchId": "...",
          "type": "coffee",
          "originLocation": "Rwanda, Northern Province",
          "harvestDate": "2024-01-15",
          "quantity": 1000
        }
      }
    }
  }
}
```

## Troubleshooting

### Contract compilation fails

- Check Aiken version: `aiken --version`
- Verify syntax: `aiken check`
- Check for missing dependencies

### Deployment fails

- Verify Blockfrost API key is set
- Check wallet has sufficient ADA
- Verify network is Preprod
- Check transaction fees

### NFT minting fails

- Verify contract is deployed
- Check policy ID is correct
- Verify metadata format (CIP-25)
- Check wallet has sufficient ADA for fees

## Resources

- [Aiken Documentation](https://aiken-lang.org/)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [CIP-25 NFT Metadata Standard](https://cips.cardano.org/cips/cip25/)
- [Lucid Documentation](https://lucid.spacebudz.io/)

## License

MIT

