import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  APP_URL: z.string().default('http://localhost:3000'),
  CARDANO_NETWORK: z.enum(['mainnet', 'preprod', 'preview', 'testnet']).default('preprod'),
  BLOCKFROST_API_KEY: z.string().optional(),
  CARDANO_NODE_URL: z.string().optional(),
  BATCH_CONTRACT_ADDRESS: z.string().optional(),
  STAGE_CONTRACT_ADDRESS: z.string().optional(),
  NFT_POLICY_ID: z.string().optional(),
  WALLET_PRIVATE_KEY: z.string().optional(),
  // IPFS Configuration (Pinata)
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_KEY: z.string().optional(),
  // Legacy IPFS configs (kept for backwards compatibility)
  IPFS_API_URL: z.string().optional(),
  IPFS_AUTH: z.string().optional(),
  INFURA_PROJECT_ID: z.string().optional(),
  INFURA_PROJECT_SECRET: z.string().optional(),
  INFURA_IPFS_API_URL: z.string().optional(),
  INFURA_IPFS_AUTH: z.string().optional(),
  WEB3_STORAGE_TOKEN: z.string().optional(),
  // Supabase Configuration
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_QR_BUCKET: z.string().default('qr-codes'),
  // Hash Salts for Privacy
  FARMER_HASH_SALT: z.string().optional(),
  PHONE_HASH_SALT: z.string().optional(),
  // Frontend Host for QR URLs
  FRONTEND_HOST: z.string().default('http://localhost:3000'),
  // USSD Provider Configuration
  USSD_PROVIDER: z.enum(['at', 'twilio']).default('at'),
  AT_USERNAME: z.string().optional(),
  AT_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export default env;

