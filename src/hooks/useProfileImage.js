import { useState } from 'react';
import { UPLOAD_PRESET } from '../config/cloudinary';
import { useUpdateProfile } from '../store';

export function useProfileImage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const updateProfile = useUpdateProfile();

  const uploadImage = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update profile with new image URL
      await updateProfile({ avatar: data.secure_url });
      
      return data.secure_url;
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
    error,
  };
} 