import { canUseLiveExternalServices } from '../utils/externalServicePolicy';

export const uploadImageToCloudinary = async (file) => {
  if (!canUseLiveExternalServices({ deploymentEnvironment: import.meta.env.VITE_VERCEL_ENV, supabaseUrl: import.meta.env.VITE_SUPABASE_URL })) {
    throw new Error('Cloudinary uploads are disabled outside verified Production.');
  }
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Kiểm tra file hợp lệ cơ bản
  if (!file) {
    throw new Error("Vui lòng chọn một file ảnh.");
  }

  // Tạo form data để đẩy lên API
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Lỗi khi tải ảnh lên Cloudinary");
    }

    const data = await response.json();
    // Trả về đường link ảnh bảo mật (https) xịn xò
    return data.secure_url; 
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};