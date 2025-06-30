'use client';

import { useState } from 'react';
import { ImageUpload } from './image-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

export function ImageUploadDemo() {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    fileName: string;
    uploadedAt: Date;
  }>>([]);

  const handleUploadComplete = (url: string, fileName: string) => {
    setUploadedImages(prev => [...prev, {
      url,
      fileName,
      uploadedAt: new Date()
    }]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Téléchargement d'Images</CardTitle>
          <CardDescription>
            Téléchargez vos images vers Supabase Storage avec prévisualisation et gestion d'erreurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            maxSizeInMB={5}
            acceptedFormats={['.jpg', '.jpeg', '.png', '.gif']}
            bucketName="images"
            placeholder="Télécharger une image"
          />
        </CardContent>
      </Card>

      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images Téléchargées</CardTitle>
            <CardDescription>
              Liste des images téléchargées avec succès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{image.fileName}</p>
                    <p className="text-xs text-gray-500">
                      Téléchargé le {image.uploadedAt.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        <a 
                          href={image.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Voir l'image
                        </a>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}