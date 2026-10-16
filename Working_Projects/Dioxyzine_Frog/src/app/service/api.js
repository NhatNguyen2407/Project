import { supabase } from './supabase';

let pendingInquiry = null;

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuex1g0XqvFfM1lf79CqmZ_oBzRGTGBTt27pjduIw7ZeIROJmU6AA2oRfVXGW3JD-P/exec';

export const api = {
  // Fetch products from google sheets
  fetchProducts: async () => {
    try {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error('API Error (fetchProducts):', error);
      throw error;
    }
  },

  // Inquiry key survives an uncertain network response while form data is
  // unchanged. No customer data is persisted to local storage or logged.
  submitInquiry: async (data, recaptchaToken) => {
    const fingerprint = JSON.stringify(data);
    if (pendingInquiry?.fingerprint !== fingerprint) {
      pendingInquiry = { fingerprint, key: crypto.randomUUID(), promise: null };
    }
    const pending = pendingInquiry;
    if (pending.promise) return pending.promise;
    const operation = (async () => {
      const { data: result, error } = await supabase.functions.invoke('submit-inquiry', {
        body: { inquiry: data, token: recaptchaToken, idempotencyKey: pending.key }
      });
      if (error || !result?.success) {
        throw error || new Error('Inquiry submission failed verification.');
      }
      // A replay must not create a duplicate best-effort mirror request.
      if (!result.replayed) {
        const payload = { type: 'inquiry', ...data };
        fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).catch(() => console.error('Inquiry mirror delivery failed.'));
      }
      if (pendingInquiry === pending) pendingInquiry = null;
      return result.inquiryId;
    })();
    pending.promise = operation;
    try {
      return await operation;
    } finally {
      pending.promise = null;
    }
  },

  // Feedback
  submitFeedback: async (data) => {
    const payload = { type: 'feedback', ...data };
    return fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  }
};