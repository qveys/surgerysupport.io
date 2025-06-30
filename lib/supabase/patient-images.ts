import { supabase } from './client';
import { StorageService } from './storage';
import type { Database } from './types';

export type PatientImage = Database['public']['Tables']['patient_images']['Row'];
export type PatientImageInsert = Database['public']['Tables']['patient_images']['Insert'];
export type PatientImageUpdate = Database['public']['Tables']['patient_images']['Update'];

// Extended type with signed URL
export type PatientImageWithSignedUrl = PatientImage & {
  signed_url?: string;
};

export class PatientImageService {
  // Helper method to generate signed URLs for images
  private static async generateSignedUrls(images: PatientImage[]): Promise<PatientImageWithSignedUrl[]> {
    const imagesWithSignedUrls = await Promise.all(
      images.map(async (image) => {
        try {
          // For private buckets, use the storage_path to generate signed URLs
          const signedUrlData = await StorageService.createSignedUrl(
            'patient-images',
            image.storage_path,
            3600 // 1 hour expiry
          );
          
          return {
            ...image,
            signed_url: signedUrlData.signedUrl
          };
        } catch (error) {
          console.error(`Failed to generate signed URL for image ${image.id}:`, error);
          return {
            ...image,
            signed_url: undefined
          };
        }
      })
    );

    return imagesWithSignedUrls;
  }

  // Create a new patient image record
  static async createPatientImage(image: PatientImageInsert): Promise<PatientImageWithSignedUrl> {
    // Ensure file_url is set to storage_path for private bucket compatibility
    const imageData = {
      ...image,
      file_url: image.storage_path // Use storage_path as file_url for private buckets
    };

    const { data, error } = await supabase
      .from('patient_images')
      .insert(imageData)
      .select()
      .single();

    if (error) throw error;

    // Generate signed URL for the newly created image
    const [imageWithSignedUrl] = await this.generateSignedUrls([data]);
    return imageWithSignedUrl;
  }

  // Get all images for a patient with signed URLs
  static async getPatientImages(patientId: string, imageType?: string): Promise<PatientImageWithSignedUrl[]> {
    let query = supabase
      .from('patient_images')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (imageType) {
      query = query.eq('image_type', imageType);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Generate signed URLs for all images
    return await this.generateSignedUrls(data);
  }

  // Get a specific patient image with signed URL
  static async getPatientImage(imageId: string): Promise<PatientImageWithSignedUrl> {
    const { data, error } = await supabase
      .from('patient_images')
      .select('*')
      .eq('id', imageId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;

    // Generate signed URL for the image
    const [imageWithSignedUrl] = await this.generateSignedUrls([data]);
    return imageWithSignedUrl;
  }

  // Update patient image metadata
  static async updatePatientImage(imageId: string, updates: PatientImageUpdate): Promise<PatientImageWithSignedUrl> {
    const { data, error } = await supabase
      .from('patient_images')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;

    // Generate signed URL for the updated image
    const [imageWithSignedUrl] = await this.generateSignedUrls([data]);
    return imageWithSignedUrl;
  }

  // Soft delete patient image
  static async deletePatientImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from('patient_images')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId);

    if (error) throw error;
  }

  // Get images by type for a patient with signed URLs
  static async getImagesByType(patientId: string, imageType: string): Promise<PatientImageWithSignedUrl[]> {
    const { data, error } = await supabase
      .from('patient_images')
      .select('*')
      .eq('patient_id', patientId)
      .eq('image_type', imageType)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Generate signed URLs for all images
    return await this.generateSignedUrls(data);
  }

  // Get patient image statistics
  static async getPatientImageStats(patientId: string) {
    const { data, error } = await supabase
      .from('patient_images')
      .select('image_type, file_size')
      .eq('patient_id', patientId)
      .is('deleted_at', null);

    if (error) throw error;

    const stats = data.reduce((acc, image) => {
      const type = image.image_type;
      if (!acc[type]) {
        acc[type] = { count: 0, totalSize: 0 };
      }
      acc[type].count++;
      acc[type].totalSize += image.file_size || 0;
      return acc;
    }, {} as Record<string, { count: number; totalSize: number }>);

    return stats;
  }

  // Search patient images with signed URLs
  static async searchPatientImages(
    patientId: string,
    searchTerm: string,
    imageType?: string
  ): Promise<PatientImageWithSignedUrl[]> {
    let query = supabase
      .from('patient_images')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .ilike('file_name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (imageType) {
      query = query.eq('image_type', imageType);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Generate signed URLs for all images
    return await this.generateSignedUrls(data);
  }

  // Validate image access permissions
  static async validateImageAccess(imageId: string, userId: string) {
    const { data, error } = await supabase
      .from('patient_images')
      .select(`
        *,
        patient:user_profiles!patient_id(id, role_id)
      `)
      .eq('id', imageId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;

    // Check if user is the patient or has appropriate role
    const userProfile = await supabase
      .from('user_profiles')
      .select('id, role_id, roles(name)')
      .eq('id', userId)
      .single();

    if (userProfile.error) throw userProfile.error;

    const isPatient = data.patient_id === userId;
    const isStaff = ['Recovery Coordinator', 'Nurse', 'Clinic Administrator'].includes(
      (userProfile.data.roles as any)?.name
    );

    // Generate signed URL if access is granted
    let imageWithSignedUrl: PatientImageWithSignedUrl = data;
    if (isPatient || isStaff) {
      const [signedImage] = await this.generateSignedUrls([data]);
      imageWithSignedUrl = signedImage;
    }

    return { 
      hasAccess: isPatient || isStaff, 
      image: imageWithSignedUrl 
    };
  }

  // Batch generate signed URLs for multiple images (utility method)
  static async batchGenerateSignedUrls(
    images: PatientImage[],
    expiresIn: number = 3600
  ): Promise<PatientImageWithSignedUrl[]> {
    return await Promise.all(
      images.map(async (image) => {
        try {
          const signedUrlData = await StorageService.createSignedUrl(
            'patient-images',
            image.storage_path,
            expiresIn
          );
          
          return {
            ...image,
            signed_url: signedUrlData.signedUrl
          };
        } catch (error) {
          console.error(`Failed to generate signed URL for image ${image.id}:`, error);
          return {
            ...image,
            signed_url: undefined
          };
        }
      })
    );
  }

  // Refresh signed URL for a single image (utility method)
  static async refreshSignedUrl(
    image: PatientImage,
    expiresIn: number = 3600
  ): Promise<PatientImageWithSignedUrl> {
    try {
      const signedUrlData = await StorageService.createSignedUrl(
        'patient-images',
        image.storage_path,
        expiresIn
      );
      
      return {
        ...image,
        signed_url: signedUrlData.signedUrl
      };
    } catch (error) {
      console.error(`Failed to refresh signed URL for image ${image.id}:`, error);
      return {
        ...image,
        signed_url: undefined
      };
    }
  }
}