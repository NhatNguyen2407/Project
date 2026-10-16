// Fail-closed adapter for the database-backed atomic fixed-window limiter.
// Neither a process-local counter nor client-supplied forwarding header is trusted.
export const INQUIRY_BUDGETS = Object.freeze({
  preverify: Object.freeze({ scope: 'inquiry-preverify', maxHits: 180, windowSeconds: 60 }),
  accepted: Object.freeze({ scope: 'inquiry-accepted', maxHits: 60, windowSeconds: 3600 }),
});

export async function consumeInquiryBudget(client, budget) {
  if (!client || typeof client.rpc !== 'function' ||
      !budget || !Object.values(INQUIRY_BUDGETS).includes(budget)) {
    throw new Error('Rate budget is not configured.');
  }

  const { data, error } = await client.rpc('consume_inquiry_rate_budget', {
    p_scope: budget.scope,
    p_max_hits: budget.maxHits,
    p_window_seconds: budget.windowSeconds,
  });

  if (error) throw new Error('Rate budget backend unavailable.');
  if (data === true) return true;
  if (data === false) return false;
  throw new Error('Rate budget backend returned an invalid response.');
}
