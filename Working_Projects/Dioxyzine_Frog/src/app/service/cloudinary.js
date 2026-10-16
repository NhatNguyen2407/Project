import { supabase } from './supabase';
import { selectInquiryImageProvider } from '../utils/inquiryImageProvider.js';
import { uploadGuestInquiryImage } from '../utils/inquiryGuestUpload.js';

export const uploadImageToCloudinary = async (file, getUploadCaptcha) => {
  const config = selectInquiryImageProvider({
    deploymentEnvironment: import.meta.env.VITE_VERCEL_ENV,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    productionCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    productionPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    stagingStorageOptIn: import.meta.env.VITE_ENABLE_STAGING_STORAGE_UPLOAD,
  });
  if (!config) throw new Error('Image uploads are disabled outside an approved environment.');
  if (!file || !String(file.type || '').startsWith('image/')) throw new Error('Please select an image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('The image must be 5 MB or smaller.');

  // Staging never calls the Production Cloudinary endpoint/preset.
  // Guest Inquiry upload remains blocked pending a trusted issuance service.
  if (config.kind === 'supabase-storage') {
    return uploadGuestInquiryImage(file, {client:supabase, getUploadCaptcha});
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.preset);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: 'POST', body: formData },
    );
    if (!response.ok) throw new Error('Cloudinary upload failed.');
    const data = await response.json();
    if (typeof data.secure_url !== 'string' || !data.secure_url.startsWith('https://')) {
      throw new Error('Cloudinary response missing a secure URL.');
    }
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};
