# ⚠️ IMPORTANT: Faucet Form Instructions

## ❌ DO NOT USE YOUR PRIVATE KEY IN THE ADDRESS FIELD!

The faucet form's "Address" field should contain your **WALLET ADDRESS**, NOT your private key.

## ✅ Correct Information for the Faucet Form

### 1. Get Your Wallet Address

Run this command:
```bash
cd backend
npm run generate-wallet
```

This will show you:
- **Wallet Address** (use this in the faucet form)
- **Private Key** (keep this secret, never share it!)

### 2. Fill Out the Faucet Form

**Address (required) field:**
- ✅ Use: Your **wallet address** (starts with `addr_test1...`)
- ❌ DO NOT use: Your private key (starts with `ed25519_sk1...`)

**API Key (optional) field:**
- Leave empty (not needed)

**reCAPTCHA:**
- Check the "I'm not a robot" box

**Request funds button:**
- Click to submit

## 🔐 Security Warning

**NEVER share your private key:**
- Private keys start with `ed25519_sk1...`
- Keep them secret and secure
- Only use wallet addresses (starting with `addr_test1...`) in public forms

## 📋 Example

**Correct:**
```
Address: addr_test1vzrnae7x4axy929d85lghlx47f9rhn3e9csqnfncsr8vadgnn58qw
```

**Wrong (DO NOT USE):**
```
Address: ed25519_sk1q95dkvvxnck6zphegahypeukfcmsk2nwtszlh8lussds58uq9g0q3ltvrq
```

## 🎯 Quick Steps

1. Run: `npm run generate-wallet`
2. Copy the **Address** (not the private key)
3. Paste it into the faucet form's "Address" field
4. Leave API Key empty
5. Complete reCAPTCHA
6. Click "Request funds"

## 💡 Why This Matters

- **Wallet Address**: Public, safe to share, used to receive funds
- **Private Key**: Secret, controls your wallet, NEVER share publicly

If you accidentally shared a private key, generate a new wallet immediately!

