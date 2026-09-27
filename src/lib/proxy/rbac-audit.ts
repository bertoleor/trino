import { logger } from '@/lib/logger';
import { toTypedSupabase } from '@/lib/supabase/typed';

/**
 * RBAC deny audit trail: security_logs event + audit_logs entitlement entry.
 * Extracted from proxy.ts to respect the 150-line budget (CQ-03) — behavior unchanged.
 */
export async function logRbacDeny(
  client: unknown,
  userId: string,
  pathname: string,
  ip: string,
): Promise<void> {
  try {
    await toTypedSupabase(client)
      .from('security_logs')
      .insert({ event: 'rbac_403', user_id: userId, ip, metadata: { path: pathname } });
  } catch (err) {
    logger.error('proxy_audit_security_logs_failed', { route: 'proxy/rbac-deny', error: String(err) });
  }
  try {
    await toTypedSupabase(client).from('audit_logs').insert({
      table_name: 'entitlements',
      record_id: null,
      action: 'update',
      old_data: null,
      new_data: { denied: true, path: pathname },
      user_id: userId,
    });
  } catch (err) {
    logger.error('proxy_audit_audit_logs_failed', { route: 'proxy/rbac-deny', error: String(err) });
  }
}
