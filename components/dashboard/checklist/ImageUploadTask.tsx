'use client';

import { useState, useEffect } from 'react';
import { PatientImageUpload } from '@/components/ui/patient-image-upload';
import { PatientImageService, type PatientImageWithSignedUrl } from '@/lib/supabase/patient-images';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadTaskProps {
  taskId: string;
  imageType: 'quotation' | 'progress' | 'medical' | 'identification';
  title: string;
  description: string;
  onUploadComplete?: () => void;
}

export function ImageUploadTask({
  taskId,
  imageType,
  title,
  description,
  onUploadComplete
}: ImageUploadTaskProps) {
  const { user } = useAuth();
  const [existingImages, setExistingImages] = useState<PatientImageWithSignedUrl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadExistingImages();
    }
  }, [user?.id, imageType]);

  const loadExistingImages = async () => {
    try {
      setLoading(true);
      const images = await PatientImageService.getImagesByType(user!.id, imageType);
      setExistingImages(images);
    } catch (error) {
      console.error('Error loading existing images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (imageUrl: string, fileName: string) => {
    // Reload images to show the new upload
    loadExistingImages();
    onUploadComplete?.();
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You could show a toast notification here
  };

  if (!user?.id) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <PatientImageUpload
          patientId={user.id}
          imageType={imageType}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          existingImages={existingImages}
          maxSizeInMB={10}
          acceptedFormats={['jpg', 'jpeg', 'png', 'gif']}
          allowMultiple={true}
        />
      )}
    </div>
  );
}