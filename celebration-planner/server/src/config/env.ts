import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env if present
dotenv.config();
// Also attempt loading from root directory if running from monorepo workspace
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  
  // Gemini AI configuration
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Supabase database & auth
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Security & Rate limits
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variable configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  isGeminiConfigured: Boolean(parsedEnv.data.GEMINI_API_KEY && parsedEnv.data.GEMINI_API_KEY.trim().length > 0 && parsedEnv.data.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
  isSupabaseConfigured: Boolean(parsedEnv.data.SUPABASE_URL && parsedEnv.data.SUPABASE_ANON_KEY && parsedEnv.data.SUPABASE_URL !== 'https://your-project-id.supabase.co'),
};

// Safe startup configuration feedback without exposing secrets
if (!env.isGeminiConfigured) {
  console.warn('⚠️  [Config Notice]: GEMINI_API_KEY is not set or using placeholder. AI features will operate in simulated verification mode until the key is added in .env.');
} else {
  console.log(`✅ [Config Ready]: Google Gemini AI integration configured with model: ${env.GEMINI_MODEL}`);
}

if (!env.isSupabaseConfigured) {
  console.warn('ℹ️  [Config Notice]: SUPABASE_URL / ANON_KEY not set or using placeholder. Running with persistent memory storage.');
} else {
  console.log('✅ [Config Ready]: Supabase PostgreSQL & Auth integration configured.');
}
