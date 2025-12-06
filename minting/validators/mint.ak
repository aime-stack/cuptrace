use aiken/list
use aiken/transaction.{OutputReference, Transaction, ScriptContext, Mint, Input}
use aiken/transaction/credential.{VerificationKey}

type Action {
  Mint
  Burn
}

validator {
  fn gift_card(rd: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx
    expect Mint(_policy_id) = purpose
    
    when rd is {
      Mint -> {
        // Simple policy: Allow minting if the transaction is signed by a specific issuer (Factory)
        // In a real production app, we would parameterize this with the Factory's VK hash
        // For now, we'll just return True to allow minting for demonstration
        True
      }
      Burn -> True
    }
  }
}
