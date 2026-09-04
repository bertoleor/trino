export const PERF_BUDGET = {
  LCP: 2500,
  CLS: 0.1,
  INP: 200,
  TTFB: 800,
  FCP: 1800,
} as const;

export type BudgetKey = keyof typeof PERF_BUDGET;

export function assertBudget(metric: BudgetKey, value: number): boolean {
  return value <= PERF_BUDGET[metric];
}

export function checkBudgets(metrics: Partial<Record<BudgetKey, number>>) {
  const failures: string[] = [];
  for (const [k, v] of Object.entries(metrics)) {
    if (v !== undefined && !assertBudget(k as BudgetKey, v)) failures.push(`${k} ${v} > ${PERF_BUDGET[k as BudgetKey]}`);
  }
  return { ok: failures.length === 0, failures };
}
