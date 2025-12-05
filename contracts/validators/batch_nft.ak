/// NFT Minting Policy for CupTrace Batches
/// 
/// This policy mints a unique NFT for each product batch.
/// The NFT follows CIP-25 metadata standard and is minted once per batch.
/// No burning is allowed - NFTs are permanent.

use cardano/transaction.{Transaction}
use cardano/assets
use aiken/collection/dict

/// Redeemer for NFT minting
pub type Redeemer {
  Mint { batch_id: ByteArray }
}

validator batch_nft {
  mint(redeemer: Redeemer, policy_id: assets.PolicyId, tx: Transaction) {
    let Mint { batch_id } = redeemer
    
    // Convert minted assets into dictionary form
    let minted = assets.to_dict(tx.mint)

        // Ensure only ONE policy is being used
        let policy_count = dict.size(minted)
        let is_single_policy = policy_count == 1

        // Verify this policy is the one being minted
        let is_own_policy = dict.has_key(minted, policy_id)

        // Lookup assets under this policy ID
        let policy_assets_opt = dict.get(minted, policy_id)

        when policy_assets_opt is {
          Some(policy_assets) -> {
            // Ensure the policy contains EXACTLY 1 asset
            let asset_count = dict.size(policy_assets)
            let is_single_asset = asset_count == 1

            // Validate:
            // - asset name == batch_id
            // - quantity == 1
            let valid_asset =
              dict.foldl(policy_assets, True,
                fn(asset_name, quantity, acc) {
                  acc && (quantity == 1) && (asset_name == batch_id)
                }
              )

            is_single_policy && is_own_policy && is_single_asset && valid_asset
          }

          // If policy not found → minting invalid
          None -> False
        }
  }
}
