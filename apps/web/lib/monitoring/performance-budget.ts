// ---------------------------------------------------------------------------
// Performance budget checker — verifies that key metrics stay within the
// thresholds defined for StoryMagic.
// ---------------------------------------------------------------------------

export interface PerformanceBudget {
  /** Maximum page weight in bytes. Default 500 KB. */
  maxPageWeightBytes: number
  /** Largest Contentful Paint, in milliseconds. Default 2500. */
  maxLcpMs: number
  /** Cumulative Layout Shift. Default 0.1. */
  maxCls: number
  /** Interaction to Next Paint, in milliseconds. Default 200. */
  maxInpMs: number
}

export interface BudgetResult {
  metric: string
  value: number
  budget: number
  unit: string
  passed: boolean
}

export const DEFAULT_BUDGET: PerformanceBudget = {
  maxPageWeightBytes: 500 * 1024, // 500 KB
  maxLcpMs: 2500,
  maxCls: 0.1,
  maxInpMs: 200,
}

/**
 * Check a set of measurements against the budget and return a report
 * indicating which items pass and which violate.
 */
export function checkBudget(
  measurements: {
    pageWeightBytes?: number
    lcpMs?: number
    cls?: number
    inpMs?: number
  },
  budget: PerformanceBudget = DEFAULT_BUDGET,
): BudgetResult[] {
  const results: BudgetResult[] = []

  if (measurements.pageWeightBytes !== undefined) {
    results.push({
      metric: 'Page weight',
      value: measurements.pageWeightBytes,
      budget: budget.maxPageWeightBytes,
      unit: 'bytes',
      passed: measurements.pageWeightBytes <= budget.maxPageWeightBytes,
    })
  }

  if (measurements.lcpMs !== undefined) {
    results.push({
      metric: 'LCP',
      value: measurements.lcpMs,
      budget: budget.maxLcpMs,
      unit: 'ms',
      passed: measurements.lcpMs <= budget.maxLcpMs,
    })
  }

  if (measurements.cls !== undefined) {
    results.push({
      metric: 'CLS',
      value: measurements.cls,
      budget: budget.maxCls,
      unit: '',
      passed: measurements.cls <= budget.maxCls,
    })
  }

  if (measurements.inpMs !== undefined) {
    results.push({
      metric: 'INP',
      value: measurements.inpMs,
      budget: budget.maxInpMs,
      unit: 'ms',
      passed: measurements.inpMs <= budget.maxInpMs,
    })
  }

  return results
}

/** Quick boolean: do all measured values pass? */
export function isWithinBudget(
  measurements: Parameters<typeof checkBudget>[0],
  budget?: PerformanceBudget,
): boolean {
  return checkBudget(measurements, budget).every((r) => r.passed)
}
