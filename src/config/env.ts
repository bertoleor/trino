import { z } from 'zod';

const envSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
    SUPABASE_SERVICE_ROLE: z.string().min(1),
    TURNSTILE_SECRET_KEY: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    ALLOW_MEMORY_RATE_LIMIT: z.enum(['true', 'false']).default('false'),
    AUDIT_INGEST_SECRET: z.string().min(16).optional(),
  })
  .superRefine((val, ctx) => {
    const hasUpstash = Boolean(val.UPSTASH_REDIS_REST_URL && val.UPSTASH_REDIS_REST_TOKEN);
    if (!hasUpstash && val.ALLOW_MEMORY_RATE_LIMIT !== 'true') {
      ctx.addIssue({
        code: 'custom',
        message:
          'UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN or ALLOW_MEMORY_RATE_LIMIT=true is required',
        path: ['UPSTASH_REDIS_REST_URL'],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Missing or invalid env vars: ${missing}`);
  }
  return result.data;
}

let _env: Env | undefined;
export const env: Env = new Proxy({} as Env, {
  get(_t, prop) {
    if (!_env) _env = validateEnv(process.env as Record<string, string | undefined>);
    return _env[prop as keyof Env];
  },
});
