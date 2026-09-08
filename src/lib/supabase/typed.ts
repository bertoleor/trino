import type { Json } from '@/types/database.types';

export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface TypedSupabaseFilter {
  eq(column: string, value: unknown): TypedSupabaseFilter;
  lt(column: string, value: string): Promise<{ error: unknown }>;
  limit(count: number): Promise<{ data: UnknownRecord[] | null; error: unknown }>;
  maybeSingle(): Promise<{ data: UnknownRecord | null; error: unknown }>;
}

export interface TypedSupabaseTable {
  insert(row: UnknownRecord | UnknownRecord[]): Promise<{ error: unknown }>;
  select(columns?: string): TypedSupabaseFilter;
  update(values: UnknownRecord): TypedSupabaseFilter;
}

export interface TypedSupabase {
  from(table: string): TypedSupabaseTable;
  rpc(fn: string, params?: UnknownRecord): Promise<{ data: unknown; error: unknown }>;
}

export function toTypedSupabase(client: unknown): TypedSupabase {
  if (!isRecord(client)) throw new Error('toTypedSupabase expects a Supabase client object');
  return client as unknown as TypedSupabase;
}

// Narrow an arbitrary payload to a JSON-safe value for typed insert columns.
// JSON-safe inputs pass through deep-equal; anything else coerces without throwing.
export function toJson(value: unknown): Json {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value;
  if (Array.isArray(value)) return value.map(toJson);
  if (isRecord(value)) {
    const out: { [key: string]: Json | undefined } = {};
    for (const [k, v] of Object.entries(value)) out[k] = toJson(v);
    return out;
  }
  return String(value);
}
