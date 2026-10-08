import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const MIG = path.join(ROOT, 'supabase/migrations/0025_customer360_rls_fix.sql');

/**
 * T-P1 — customer_360 RLS bypass fix (ticket t_45ae26d1, hallazgos P1 del kickoff t_63f54e2e).
 *
 * PRE-fix (evidencia viva contra prod, 2026-10-04, Management API):
 *   - view customer_360: reloptions=NULL (sin security_invoker) -> corre como owner
 *     postgres y saltea RLS de profiles/orders/carts; ACL da ALL a anon+authenticated
 *     y es auto-updatable -> anon lee/UPDATE perfiles ajenos con la anon key.
 *   - RPC get_customer_360(target_user): SECURITY DEFINER sin guard -> fuga email/LTV/cart
 *     de cualquier uuid.
 *
 * La migracion 0025 debe cerrar ambos vectores SIN cambiar el diseno de la view/RPC
 * (mas alla del guard + security_invoker, alcance fijado en el ticket).
 */
describe('T-P1 customer_360 RLS fix — migracion 0025', () => {
  it('la migracion 0025 existe', () => {
    expect(fs.existsSync(MIG)).toBe(true);
  });

  it('setea security_invoker=true en la view customer_360 (RLS de tablas base aplica)', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    // security_invoker es reloption: alter view ... set (security_invoker = true)
    expect(c).toMatch(
      /alter\s+view\s+public\.customer_360\s+set\s*\(\s*security_invoker\s*=\s*true\s*\)/i
    );
  });

  it('revoca ALL a anon y authenticated, re-grantea solo SELECT a authenticated', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(
      /revoke\s+all\s+on\s+public\.customer_360\s+from\s+anon,\s*authenticated/i
    );
    expect(c).toMatch(/grant\s+select\s+on\s+public\.customer_360\s+to\s+authenticated/i);
    // anon queda sin NINGUNA ruta a la view
    expect(c).not.toMatch(/grant\s+[^;]*on\s+public\.customer_360\s+to\s+anon/i);
  });

  it('RPC get_customer_360: guard de ownership antes del select, plpgsql', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    // conversion a plpgsql (language sql no soporta raise)
    expect(c).toMatch(
      /create\s+or\s+replace\s+function\s+public\.get_customer_360\(target_user\s+uuid\)[\s\S]*?language\s+plpgsql/i
    );
    // guard: solo self o admin
    expect(c).toMatch(
      /if\s+auth\.uid\(\)\s+is\s+distinct\s+from\s+target_user\s+and\s+not\s+public\.is_admin\(\)\s+then/i
    );
    expect(c).toMatch(/raise\s+exception\s+'forbidden[^']*'\s+using\s+errcode\s*=\s*'42501'/i);
    expect(c).toMatch(/return\s+query/i);
  });

  it('RPC mantiene Security Definer + stable + search_path=public', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/security\s+definer/i);
    expect(c).toMatch(/\bstable\b/i);
    expect(c).toMatch(/set\s+search_path\s*=\s*public/i);
  });

  it('el select de la RPC queda identico al de 0022 (lineas 75-85) — solo se agrega el guard', () => {
    const mig0022 = fs.readFileSync(
      path.join(ROOT, 'supabase/migrations/0022_client_warnings_fix.sql'),
      'utf8'
    );
    const c = fs.readFileSync(MIG, 'utf8').replace(/\r\n/g, '\n');
    // extraer el select de 0022 (normalizar CRLF: el repo vive en Windows)
    // ojo: el PRIMER 'as $$' de 0022 es el de has_role (linea 21); el de
    // get_customer_360 vive en la linea 79 — matchear por el create function.
    const m0022 = mig0022.replace(/\r\n/g, '\n').match(
      /create\s+or\s+replace\s+function\s+public\.get_customer_360[\s\S]*?as\s+\$\$\s*([\s\S]*?)\$\$;/i
    );
    expect(m0022).not.toBeNull();
    const select0022 = m0022?.[1]?.trim() ?? '';
    // el mismo cuerpo debe aparecer en 0025 (return query <select>)
    expect(c).toContain(select0022);
  });

  it('es idempotente: create or replace + alter, sin drop de la view ni de la funcion', () => {
    const c = fs.readFileSync(MIG, 'utf8');
    expect(c).toMatch(/create\s+or\s+replace\s+function/i);
    expect(c).not.toMatch(/drop\s+(view|function)\s+[^;]*customer_360/i);
  });
});
