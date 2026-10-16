import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

// T-F01 (drift RPC↔migración 0019, ticket t_d340fda1): la app llamaba
// add_to_cart_serializable(p_variant_id, p_qty, p_user_id, p_session_id) pero
// el SQL 0019 declaraba (p_product_id, p_qty, p_session_id) — contra la DB
// desplegada (que matchea 0019) ambos RPC reventaban con PGRST202/42883.
// Este guard compara CADA call site .rpc(...) del src contra las firmas
// declaradas en supabase/migrations/ y falla si hay drift de nombres o de
// set de args. Sirve para todos los RPC del repo, no solo cart.
//
// RPCs con drift conocido trackeados en tickets propios (al cerrar cada
// ticket, sacar de esta allowlist para que el guard los vuelva a exigir).
// Histórico (todos resueltos, allowlist vacía):
//   - increment_helpful      → t_74844aea (F-02, resuelto por 0025)
//   - keepalive_ping         → t_e160af44 (F-03, resuelto por 0026)
//   - heartbeat_select_one   → t_e160af44 (F-03, resuelto por 0026)

const ALLOWLIST: Record<string, string> = {};

interface RpcCall {
  file: string;
  fn: string;
  args: string[];
}

/** Extrae `supabase.rpc('name', { ... })` (y variantes db.rpc) del src. */
function extractRpcCalls(): RpcCall[] {
  const calls: RpcCall[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.'))
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      const src = fs.readFileSync(full, 'utf8');
      // patrón: .rpc('name'[, { args }])  — multilinea, args object literal
      // (la rama de args NO consume el `)` que cierra .rpc( — bug v1)
      const re = /\.rpc\(\s*['"]([\w$]+)['"]\s*(?:,\s*\{([\s\S]*?)\}\s*)?\)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const fn = m[1]!;
        const argsBlock = m[2] ?? '';
        // keys del object literal: `p_x: valor` / `p_x:valor` / `"p_x": v`
        const args = [...argsBlock.matchAll(/[\w$]+\s*(?=\s*:)/g)].map((a) => a[0]);
        calls.push({
          file: path.relative(ROOT, full).replace(/\\/g, '/'),
          fn,
          args,
        });
      }
    }
  };
  walk(path.join(ROOT, 'src'));
  return calls;
}

/**
 * Firma declarada de cada RPC en las migraciones: última declaración gana
 * (migraciones posteriores hacen create or replace).
 */
function declaredSignatures(): Map<string, Set<string>> {
  const dir = path.join(ROOT, 'supabase/migrations');
  const sigs = new Map<string, Set<string>>();
  const re = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([\w$]+)\s*\(([^)]*)\)/gi;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.sql'))) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      const fn = m[1]!.toLowerCase();
      const params = m[2]!
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.split(/\s+/)[0]!.replace(/^p_/, ''));
      sigs.set(fn, new Set(params));
    }
  }
  return sigs;
}

describe('T-F01 RPC↔migration signature guard (drift 0019)', () => {
  // Walk de src/ + parse de 24 migraciones tarda >5s en Windows/pnpm — se
  // extrae UNA vez a module scope y cada `it` reusa los resultados. Sin
  // esto, el testTimeout default (5s) mata el primer it de este archivo.
  const sigs = declaredSignatures();
  const calls = extractRpcCalls();

  it('cart call sites pass exactly the args that the migration declares', () => {
    const add = calls.find((c) => c.fn === 'add_to_cart_serializable');
    expect(add, 'addToCart debe seguir llamando al RPC').toBeTruthy();
    expect(add?.args.sort()).toEqual(['p_qty', 'p_session_id', 'p_user_id', 'p_variant_id']);
    expect(sigs.get('add_to_cart_serializable')).toEqual(
      new Set(['variant_id', 'qty', 'user_id', 'session_id'])
    );

    const merge = calls.find((c) => c.fn === 'merge_cart_serializable');
    expect(merge, 'mergeCart debe seguir llamando al RPC').toBeTruthy();
    expect(merge?.args.sort()).toEqual(['p_session_id', 'p_user_id']);
    expect(sigs.get('merge_cart_serializable')).toEqual(new Set(['session_id', 'user_id']));
  });

  it('every .rpc() call site has a matching declaration in supabase/migrations', () => {
    expect(calls.length).toBeGreaterThan(10); // sanity: el extractor no se quedó en cero
    const missing = calls.filter((c) => !sigs.has(c.fn) && !(c.fn in ALLOWLIST));
    expect(
      missing.map((c) => `${c.fn} (${c.file})`),
      'RPC llamado por la app sin declaración en migraciones — agregar migración o allowlist con ticket'
    ).toEqual([]);
  });

  it('every .rpc() call site passes exactly the declared args (no extras, no missing)', () => {
    const drift: string[] = [];
    for (const c of calls) {
      if (c.fn in ALLOWLIST) continue;
      const declared = sigs.get(c.fn);
      if (!declared) continue; // cubierto por el test de arriba
      const called = new Set(c.args.map((a) => a.replace(/^p_/, '')));
      const missing = [...declared].filter((d) => !called.has(d));
      const extra = [...called].filter((d) => !declared.has(d));
      if (missing.length || extra.length)
        drift.push(`${c.fn} (${c.file}): declarado=[${[...declared]}] llamado=[${[...called]}]`);
    }
    expect(drift, 'Drift de args entre call site y migración').toEqual([]);
  });
});
