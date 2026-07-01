const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuex1g0XqvFfM1lf79CqmZ_oBzRGTGBTt27pjduIw7ZeIROJmU6AA2oRfVXGW3JD-P/exec';

export const api = {
  // fetch products
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

  //form Inquiry
  submitInquiry: async (data) => {
    const payload = { type: 'inquiry', ...data };
    return fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  },

  //Feedback
  submitFeedback: async (data) => {
    const payload = { type: 'feedback', ...data };
    return fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  }
};