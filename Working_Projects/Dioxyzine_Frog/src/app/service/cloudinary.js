import { selectCloudinaryUploadConfig, isStagingUploadResponseValid } from '../utils/stagingCloudinaryPolicy';

export const uploadImageToCloudinary = async (file) => {
  const config = selectCloudinaryUploadConfig({
    deploymentEnvironment: import.meta.env.VITE_VERCEL_ENV,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    productionCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    productionPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    stagingCloudName: import.meta.env.VITE_STAGING_CLOUDINARY_CLOUD_NAME,
    stagingPreset: import.meta.env.VITE_STAGING_CLOUDINARY_UPLOAD_PRESET,
    previewOptIn: import.meta.env.VITE_ENABLE_STAGING_CLOUDINARY_UPLOAD,
  });
  if (!config) throw new Error('Cloudinary uploads are disabled outside an approved environment.');
  if (!file || !String(file.type || '').startsWith('image/')) throw new Error('Please select an image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('The image must be 5 MB or smaller.');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.preset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Cloudinary upload failed.');
    const data = await response.json();
    if (config.staging && !isStagingUploadResponseValid(data, config.cloudName)) {
      throw new Error('Staging upload did not land in the approved test prefix.');
    }
    if (!data.secure_url) throw new Error('Upload response missing URL.');
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};
