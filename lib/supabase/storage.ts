import { supabase } from './client';

export class StorageService {
  // Upload file to Supabase Storage
  static async uploadFile(
    bucketName: string,
    fileName: string,
    file: File,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
      contentType?: string;
    }
  ) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
        contentType: options?.contentType || file.type
      });

    if (error) throw error;
    return data;
  }

  // Get public URL for a file
  static getPublicUrl(bucketName: string, fileName: string) {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Delete file from storage
  static async deleteFile(bucketName: string, fileName: string) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) throw error;
    return data;
  }

  // List files in bucket root directory only (no subdirectories)
  static async listRootFiles(bucketName: string) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;
    
    // Filter out directories and only return files from root
    const rootFiles = data.filter(item => {
      // Exclude directories (they don't have a size or are marked as folders)
      // Exclude placeholder files
      // Only include items that are actual files in the root directory
      return item.name !== '.emptyFolderPlaceholder' && 
             item.metadata && 
             typeof item.metadata.size === 'number' &&
             !item.name.includes('/'); // Ensure it's not in a subdirectory
    });

    return rootFiles;
  }

  // List files in bucket with detailed information (legacy method for compatibility)
  static async listFiles(bucketName: string, folder?: string) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;
    return data;
  }

  // Get all patient images from root directory only
  static async getAllPatientImages() {
    try {
      const files = await this.listRootFiles('patient-images');

      // Transform storage files to match document format
      const patientImageDocuments = files.map(file => ({
        id: `storage-${file.name}`,
        name: file.name,
        type: this.getFileExtension(file.name).toUpperCase(),
        category: 'patient-images' as const,
        size: this.formatFileSize(file.metadata?.size || 0),
        sizeBytes: file.metadata?.size || 0,
        uploadDate: file.created_at || new Date().toISOString(),
        uploadedBy: 'Patient', // Default since we can't get this from storage
        shared: false,
        urgent: false,
        isStorageFile: true,
        storagePath: file.name,
        bucketName: 'patient-images',
        lastModified: file.updated_at || file.created_at || new Date().toISOString(),
        fullPath: `patient-images/${file.name}`,
        metadata: file.metadata || {}
      }));

      return patientImageDocuments;
    } catch (error) {
      console.error('Error fetching patient images from storage:', error);
      return [];
    }
  }

  // Get all files from root directory with detailed metadata
  static async getRootDirectoryFiles(bucketName: string) {
    try {
      const files = await this.listRootFiles(bucketName);

      const rootDirectoryFiles = files.map(file => ({
        id: `storage-${bucketName}-${file.name}`,
        name: file.name,
        type: this.getFileExtension(file.name).toUpperCase(),
        category: 'storage-files' as const,
        size: this.formatFileSize(file.metadata?.size || 0),
        sizeBytes: file.metadata?.size || 0,
        uploadDate: file.created_at || new Date().toISOString(),
        uploadedBy: 'System',
        shared: false,
        urgent: false,
        isStorageFile: true,
        storagePath: file.name,
        bucketName: bucketName,
        lastModified: file.updated_at || file.created_at || new Date().toISOString(),
        fullPath: `${bucketName}/${file.name}`,
        metadata: file.metadata || {},
        isRootFile: true // Flag to indicate this is from root directory
      }));

      return rootDirectoryFiles;
    } catch (error) {
      console.error(`Error fetching files from ${bucketName} root directory:`, error);
      return [];
    }
  }

  // Get file extension from filename
  private static getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'unknown';
  }

  // Format file size in human readable format
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Create signed URL for private files
  static async createSignedUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number = 3600
  ) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, expiresIn);

    if (error) throw error;
    return data;
  }

  // Generate unique filename
  static generateUniqueFileName(originalName: string): string {
    const fileExt = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    return `${timestamp}-${randomString}.${fileExt}`;
  }

  // Validate image file
  static validateImageFile(
    file: File,
    maxSizeInMB: number = 5,
    allowedFormats: string[] = ['jpg', 'jpeg', 'png', 'gif']
  ): { isValid: boolean; error?: string } {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Le fichier doit être une image' };
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return { 
        isValid: false, 
        error: `La taille du fichier ne doit pas dépasser ${maxSizeInMB}MB` 
      };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Format non supporté. Formats acceptés: ${allowedFormats.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  // Validate document file (new function for general documents)
  static validateDocumentFile(
    file: File,
    maxSizeInMB: number = 10,
    allowedFormats: string[] = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']
  ): { isValid: boolean; error?: string } {
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return { 
        isValid: false, 
        error: `File size must not exceed ${maxSizeInMB}MB` 
      };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Unsupported format. Accepted formats: ${allowedFormats.join(', ')}` 
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return { isValid: false, error: 'File cannot be empty' };
    }

    return { isValid: true };
  }

  // Download file from storage
  static async downloadFile(bucketName: string, fileName: string) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) throw error;
    return data;
  }

  // Get storage usage statistics for root directory only
  static async getRootDirectoryStats(bucketName: string) {
    try {
      const files = await this.listRootFiles(bucketName);
      
      const stats = files.reduce((acc, file) => {
        const size = file.metadata?.size || 0;
        acc.totalFiles += 1;
        acc.totalSize += size;
        
        const ext = this.getFileExtension(file.name).toLowerCase();
        acc.fileTypes[ext] = (acc.fileTypes[ext] || 0) + 1;
        
        return acc;
      }, {
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {} as Record<string, number>
      });

      return {
        ...stats,
        totalSizeFormatted: this.formatFileSize(stats.totalSize),
        location: 'Root Directory Only'
      };
    } catch (error) {
      console.error(`Error getting root directory stats for ${bucketName}:`, error);
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeFormatted: '0 B',
        fileTypes: {},
        location: 'Root Directory Only'
      };
    }
  }

  // Get storage usage statistics (legacy method for compatibility)
  static async getStorageStats(bucketName: string) {
    try {
      const files = await this.listFiles(bucketName);
      
      const stats = files.reduce((acc, file) => {
        const size = file.metadata?.size || 0;
        acc.totalFiles += 1;
        acc.totalSize += size;
        
        const ext = this.getFileExtension(file.name).toLowerCase();
        acc.fileTypes[ext] = (acc.fileTypes[ext] || 0) + 1;
        
        return acc;
      }, {
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {} as Record<string, number>
      });

      return {
        ...stats,
        totalSizeFormatted: this.formatFileSize(stats.totalSize)
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeFormatted: '0 B',
        fileTypes: {}
      };
    }
  }
}