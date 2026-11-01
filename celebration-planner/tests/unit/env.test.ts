import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the Zod environment schema logic independently
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
});

function evaluateConfig(raw: Record<string, string | undefined>) {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }
  const isGeminiConfigured = Boolean(
    parsed.data.GEMINI_API_KEY &&
    parsed.data.GEMINI_API_KEY.trim().length > 0 &&
    parsed.data.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );
  const isSupabaseConfigured = Boolean(
    parsed.data.SUPABASE_URL &&
    parsed.data.SUPABASE_ANON_KEY &&
    parsed.data.SUPABASE_URL !== 'https://your-project-id.supabase.co'
  );
  return {
    success: true,
    data: {
      ...parsed.data,
      isGeminiConfigured,
      isSupabaseConfigured,
    },
  };
}

describe('Environment Configuration Validation', () => {
  it('should parse valid minimal configuration with sensible defaults', () => {
    const result = evaluateConfig({});
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.PORT).toBe(5000);
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.GEMINI_MODEL).toBe('gemini-2.5-flash');
      expect(result.data.isGeminiConfigured).toBe(false);
      expect(result.data.isSupabaseConfigured).toBe(false);
    }
  });

  it('should flag placeholder Gemini API keys as unconfigured without throwing error', () => {
    const result = evaluateConfig({
      GEMINI_API_KEY: 'your_gemini_api_key_here',
    });
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.isGeminiConfigured).toBe(false);
    }
  });

  it('should detect when a real Gemini key is configured', () => {
    const result = evaluateConfig({
      GEMINI_API_KEY: 'AIzaSyA_test_actual_key_hash_123',
    });
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.isGeminiConfigured).toBe(true);
    }
  });

  it('should reject invalid SUPABASE_URL', () => {
    const result = evaluateConfig({
      SUPABASE_URL: 'not-a-valid-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.SUPABASE_URL).toBeDefined();
    }
  });

  it('should accept valid SUPABASE_URL and flag configured status', () => {
    const result = evaluateConfig({
      SUPABASE_URL: 'https://testproject.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    });
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.isSupabaseConfigured).toBe(true);
    }
  });
});
