'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUploadComplete?: (url: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  bucketName?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  publicUrl: string | null;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  className,
  maxSizeInMB = 5,
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.gif'],
  bucketName = 'images',
  disabled = false,
  placeholder = 'Upload an image'
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false,
    publicUrl: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = useCallback(() => {
    setState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false,
      publicUrl: null
    });
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Format non supporté. Formats acceptés: ${acceptedFormats.join(', ')}`;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return `Fichier trop volumineux. Taille maximum: ${maxSizeInMB}MB`;
    }

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      return 'Le fichier sélectionné n\'est pas une image valide';
    }

    return null;
  }, [acceptedFormats, maxSizeInMB]);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setState(prev => ({ ...prev, error, file: null, preview: null }));
      onUploadError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setState(prev => ({
        ...prev,
        file,
        preview: e.target?.result as string,
        error: null,
        success: false,
        publicUrl: null
      }));
    };
    reader.readAsDataURL(file);
  }, [validateFile, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || state.uploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, state.uploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const uploadFile = useCallback(async () => {
    if (!state.file) return;

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    setState(prev => ({ 
      ...prev, 
      uploading: true, 
      progress: 0, 
      error: null,
      success: false 
    }));

    try {
      // Generate unique filename
      const fileExt = state.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 15, 90)
        }));
      }, 200);

console.log("first idea");
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, state.file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        success: true,
        publicUrl: urlData.publicUrl
      }));

      onUploadComplete?.(urlData.publicUrl, fileName);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: 'Téléchargement annulé'
        }));
      } else {
        const errorMessage = error.message || 'Erreur lors du téléchargement';
        setState(prev => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: errorMessage
        }));
        onUploadError?.(errorMessage);
      }
    }
  }, [state.file, bucketName, onUploadComplete, onUploadError]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const removeFile = useCallback(() => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetState]);

  const openFileDialog = useCallback(() => {
    if (!disabled && !state.uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, state.uploading]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div
            className={cn(
              "flex flex-col items-center justify-center space-y-4 cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled || state.uploading}
            />

            {state.preview ? (
              <div className="relative">
                <img
                  src={state.preview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg shadow-md"
                />
                {!state.uploading && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">{placeholder}</p>
                  <p className="text-sm text-gray-500">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formats: {acceptedFormats.join(', ')} • Max: {maxSizeInMB}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {state.uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Téléchargement en cours...
            </span>
            <span className="text-sm text-gray-500">{Math.round(state.progress)}%</span>
          </div>
          <Progress value={state.progress} className="w-full" />
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{state.error}</span>
        </div>
      )}

      {/* Success Message */}
      {state.success && state.publicUrl && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">Image téléchargée avec succès!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {state.file && !state.uploading && !state.success && (
          <Button onClick={uploadFile} className="bg-primary hover:bg-primary/90">
            <Upload className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        )}

        {state.uploading && (
          <Button variant="outline" onClick={cancelUpload}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        )}

        {(state.file || state.success) && !state.uploading && (
          <Button variant="outline" onClick={removeFile}>
            <X className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}