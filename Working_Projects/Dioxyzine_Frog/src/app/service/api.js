import { supabase } from './supabase';
import { getInquiryQuantities } from '../utils/inquiryQuantities';

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

  // Form Inquiry
  submitInquiry: async (data) => {
    try {
      const quantities = getInquiryQuantities(data);
      if (!data.token || !data.submissionId || data.termsAccepted !== true) throw new Error('Please complete security verification and accept the terms.');
      const { data: saved, error } = await supabase.functions.invoke('submit-inquiry', { body: { ...data, ...quantities }, timeout: 35000 });
      if (error) {
        let details;
        try { details = await error.context?.clone().json(); } catch { /* A transport failure has no JSON response. */ }
        throw new Error(details?.message || 'Inquiry could not be saved. Please try again.');
      }
      if (!saved?.success || saved.id !== data.submissionId.toLowerCase()) throw new Error('Save could not be confirmed. Please retry.');

      // shortcut: Sheets remains best-effort until the backend outbox step.
      const { token, submissionId, termsAccepted, ...backup } = data;
      const payload = { type: 'inquiry', ...backup, ...quantities };
      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(e => console.error("Lỗi backup ra Google Sheet:", e));
      

      return true;
    } catch (error) {
      console.error('Lỗi khi lưu Inqury vào Supabase:', error);
      throw error;
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
