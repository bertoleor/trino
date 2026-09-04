export const BANK_PENDING_HOURS = 72;

export function shouldCancelPendingVerification(status: string, createdAtIso: string): boolean {
  if (status !== 'pending_verification') return false;
  const created = new Date(createdAtIso).getTime();
  if (Number.isNaN(created)) return false;
  const elapsed = Date.now() - created;
  return elapsed >= BANK_PENDING_HOURS * 3600 * 1000;
}

export async function cancelExpiredPendingVerification(
  supabase: { from: (t: string) => { update: (d: unknown) => { eq: (k: string, v: string) => { lt: (k: string, v: string) => Promise<{ error: unknown }> } } } },
): Promise<{ canceled: number }> {
  const cutoff = new Date(Date.now() - BANK_PENDING_HOURS * 3600 * 1000).toISOString();
  const { error } = await supabase
    .from('orders')
    .update({ status: 'canceled' } as never)
    .eq('status', 'pending_verification')
    .lt('created_at', cutoff);
  if (error) throw error;
  return { canceled: 0 };
}
