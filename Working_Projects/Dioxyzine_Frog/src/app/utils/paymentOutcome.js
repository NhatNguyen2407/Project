// Treat a captured or uncertain checkout outcome as requiring manual review.
// Never offer the PayPal button again until the payment status is reconciled.
export function needsPaymentReview(result, invocationError = null) {
  return Boolean(invocationError || result?.paymentCaptured);
}
