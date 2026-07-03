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

  // Form Inquiry
  submitInquiry: async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            user_id: user ? user.id : null, //import id for display on profile
            subject: data.subject,
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            contact_info: data.contactInfo,
            product_name: data.productName,
            size: data.size || null,
            quantity: parseInt(data.quantity) || 1,
            accessory_qty: parseInt(data.accessoryQty) || 0,
            image_link: data.imageLink,
            note: data.note || null
          }
        ]);

      if (error) throw error;

      // backup in google sheets
      const payload = { type: 'inquiry', ...data };
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