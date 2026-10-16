import { supabase } from './supabase';

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

  // Form Inquiry: the server validates reCAPTCHA and persists the request
  // in one trusted flow. This path must NOT use direct client table INSERT.
  submitInquiry: async (data, recaptchaToken) => {
    const { data: result, error } = await supabase.functions.invoke('submit-inquiry', {
      body: { inquiry: data, token: recaptchaToken }
    });
    if (error || !result?.success) {
      throw error || new Error('Inquiry submission failed verification.');
    }

    // Legacy Google Sheets mirror remains best-effort and non-authoritative.
    // Durable delivery/reconciliation is a separate tracked issue.
    const payload = { type: 'inquiry', ...data };
    fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).catch(() => console.error('Inquiry mirror delivery failed.'));

    return result.inquiryId;
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