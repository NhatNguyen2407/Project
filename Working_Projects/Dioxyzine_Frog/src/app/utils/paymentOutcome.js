// Treat a captured or uncertain checkout outcome as requiring manual review.
// Never offer the PayPal button again until the payment status is reconciled.
export function needsPaymentReview(result, invocationError = null) {
  // Only an explicit server assertion that capture did NOT occur permits retry.
  // A missing/partial response must be treated as an uncertain payment.
  if (invocationError || !result || typeof result !== 'object') return true;
  return result.paymentCaptured !== false;
}
