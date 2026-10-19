// Client-side guard for duplicate PayPal callbacks and uncertain captures.
// Not a payment authorization mechanism or a substitute for server idempotency.
// A page reload resets this in-memory gate; backend capture/reconciliation must
// remain authoritative and the operator E2E plan covers reload/retry behavior.
export function createCaptureAttemptGate() {
  let state = 'idle';
  let activeOrderId = null;

  return {
    begin(orderId) {
      if (state !== 'idle' || typeof orderId !== 'string' || !orderId.trim()) {
        return false;
      }
      activeOrderId = orderId;
      state = 'processing';
      return true;
    },
    confirmUncaptured(orderId) {
      if (state !== 'processing' || activeOrderId !== orderId) return false;
      activeOrderId = null;
      state = 'idle';
      return true;
    },
    requireReview() {
      if (state !== 'processing') return false;
      state = 'review';
      return true;
    },
    complete(orderId) {
      if (state !== 'processing' || activeOrderId !== orderId) return false;
      state = 'completed';
      return true;
    },
    status: () => state,
    isLocked: () => state !== 'idle',
  };
}
