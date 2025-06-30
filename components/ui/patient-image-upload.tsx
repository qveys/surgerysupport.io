'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  FileImage, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  Download,
  Loader2,
  ImageIcon,
  Trash2
} from 'lucide-react';
import { StorageService } from '@/lib/supabase/storage';
import { PatientImageService, type PatientImageWithSignedUrl } from '@/lib/supabase/patient-images';
import { toast } from 'sonner';

interface PatientImageUploadProps {
  patientId: string;
  imageType: 'quotation' | 'progress' | 'medical' | 'identification';
  onUploadComplete?: (imageUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  existingImages?: PatientImageWithSignedUrl[];
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  allowMultiple?: boolean;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function PatientImageUpload({
  patientId,
  imageType,
  onUploadComplete,
  onUploadError,
  existingImages = [],
  maxSizeInMB = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif'],
  allowMultiple = true
}: PatientImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [previewImage, setPreviewImage] = useState<PatientImageWithSignedUrl | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
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
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Format non supporté. Formats acceptés: ${acceptedFormats.join(', ')}` 
      };
    }

    return { isValid: true };
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(`Erreur de validation: ${validation.error}`);
      onUploadError?.(validation.error!);
      return;
    }

    // Initialize progress tracking
    const progressItem: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };

    setUploadProgress(prev => [...prev, progressItem]);

    try {
      // Generate unique filename
      const uniqueFileName = StorageService.generateUniqueFileName(file.name);
      const storagePath = `${patientId}/${imageType}/${uniqueFileName}`;

      // Simulate upload progress (in real implementation, you'd get this from the upload service)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(item => 
            item.fileName === file.name && item.progress < 90
              ? { ...item, progress: item.progress + Math.random() * 20 }
              : item
          )
        );
      }, 200);

      // Upload to Supabase Storage
      const uploadResult = await StorageService.uploadFile(
        'patient-images',
        storagePath,
        file,
        {
          contentType: file.type,
          upsert: false
        }
      );

      clearInterval(progressInterval);

      // Update progress to 100%
      setUploadProgress(prev => 
        prev.map(item => 
          item.fileName === file.name
            ? { ...item, progress: 100 }
            : item
        )
      );

      // Create database record
      const imageRecord = await PatientImageService.createPatientImage({
        patient_id: patientId,
        file_name: file.name,
        file_url: storagePath, // Store the storage path
        storage_path: storagePath,
        image_type: imageType,
        file_size: file.size,
        mime_type: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        },
        uploaded_by: patientId
      });

      // Update progress to success
      setUploadProgress(prev => 
        prev.map(item => 
          item.fileName === file.name
            ? { ...item, status: 'success' }
            : item
        )
      );

      // Show success toast notification
      toast.success(`Image "${file.name}" téléchargée avec succès !`, {
        description: `Fichier de ${(file.size / 1024 / 1024).toFixed(2)} MB ajouté à votre dossier`,
        duration: 5000,
      });

      // Call success callback
      onUploadComplete?.(imageRecord.signed_url || '', file.name);

      // Remove from progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(item => item.fileName !== file.name));
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Update progress to error
      setUploadProgress(prev => 
        prev.map(item => 
          item.fileName === file.name
            ? { ...item, status: 'error', error: error.message }
            : item
        )
      );

      // Show error toast notification
      toast.error(`Erreur lors du téléchargement de "${file.name}"`, {
        description: error.message || 'Une erreur inattendue s\'est produite',
        duration: 8000,
      });

      onUploadError?.(error.message || 'Erreur de téléchargement');

      // Remove from progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(item => item.fileName !== file.name));
      }, 5000);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    if (!allowMultiple && fileArray.length > 1) {
      toast.warning('Un seul fichier autorisé', {
        description: 'Veuillez sélectionner un seul fichier à la fois'
      });
      return;
    }

    // Upload each file
    fileArray.forEach(uploadFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  const getImageTypeLabel = (type: string) => {
    switch (type) {
      case 'quotation': return 'Photos de devis';
      case 'progress': return 'Photos de progression';
      case 'medical': return 'Photos médicales';
      case 'identification': return 'Photos d\'identification';
      default: return 'Images';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getProgressColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          {getImageTypeLabel(imageType)}
        </Label>
        
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Glissez-déposez vos images ici
              </h3>
              <p className="text-gray-600 mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir des fichiers
              </Button>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={allowMultiple}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <div>Formats acceptés: {acceptedFormats.join(', ').toUpperCase()}</div>
              <div>Taille maximale: {maxSizeInMB} MB par fichier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Téléchargement en cours
          </Label>
          {uploadProgress.map((item) => (
            <div key={item.fileName} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getProgressIcon(item.status)}
                  <span className="font-medium truncate max-w-xs">
                    {item.fileName}
                  </span>
                </div>
                <span className="text-gray-500">
                  {item.status === 'uploading' ? `${Math.round(item.progress)}%` : 
                   item.status === 'success' ? 'Terminé' : 'Erreur'}
                </span>
              </div>
              
              <Progress 
                value={item.progress} 
                className="h-2"
                style={{
                  '--progress-background': getProgressColor(item.status)
                } as React.CSSProperties}
              />
              
              {item.status === 'error' && item.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {item.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Images existantes ({existingImages.length})
          </Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingImages.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FileImage className="w-5 h-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {image.file_size ? formatFileSize(image.file_size) : 'Taille inconnue'}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {image.image_type}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500">
                  Ajouté le {new Date(image.created_at).toLocaleDateString('fr-FR')}
                </div>
                
                <div className="flex space-x-2">
                  {image.signed_url && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setPreviewImage(image)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{image.file_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img 
                              src={image.signed_url} 
                              alt={image.file_name}
                              className="w-full h-auto max-h-96 object-contain rounded-lg"
                            />
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Type: {image.image_type}</div>
                              <div>Taille: {image.file_size ? formatFileSize(image.file_size) : 'Inconnue'}</div>
                              <div>Ajouté: {new Date(image.created_at).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = image.signed_url!;
                          link.download = image.file_name;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {existingImages.length === 0 && uploadProgress.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune image téléchargée pour le moment</p>
          <p className="text-sm">Commencez par ajouter vos premières images</p>
        </div>
      )}
    </div>
  );
}