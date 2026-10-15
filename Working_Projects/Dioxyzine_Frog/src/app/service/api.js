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

  // The trusted Edge Function verifies reCAPTCHA and persists the inquiry
  // in one server-side flow. Never write to public.inquiries from the browser.
  submitInquiry: async (data, token) => {
    if (typeof token !== 'string' || !token) {
      throw new Error('Security verification is missing.');
    }

    const { data: result, error } = await supabase.functions.invoke('submit-inquiry', {
      body: { token, inquiry: data }
    });
    if (error || result?.success !== true) {
      throw new Error('Could not submit your inquiry. Please try again later.');
    }

    // Legacy Sheets mirroring is best-effort and not a verified backup.
    // Future work: replace with a durable server-side outbox.
    const payload = { type: 'inquiry', ...data };
    fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).catch(() => console.error('Inquiry mirror request failed.'));

    return true;
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