'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Eye,
  Share,
  Trash2,
  Plus,
  Calendar,
  User,
  Image,
  FolderOpen,
  HardDrive,
  Loader2,
  Database,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { StorageService } from '@/lib/supabase/storage';
import { DatabaseService } from '@/lib/supabase/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DocumentsProps {
  user: any;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: 'medical-records' | 'insurance' | 'pre-op' | 'post-op' | 'test-results' | 'patient-images' | 'storage-files' | 'uploaded-documents';
  size: string;
  sizeBytes?: number;
  uploadDate: string;
  uploadedBy: string;
  shared: boolean;
  urgent?: boolean;
  isStorageFile?: boolean;
  storagePath?: string;
  bucketName?: string;
  lastModified?: string;
  fullPath?: string;
  metadata?: any;
  isRootFile?: boolean;
}

export default function Documents({ user }: DocumentsProps) {
  const { user: authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadingStorageFiles, setLoadingStorageFiles] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [storageFiles, setStorageFiles] = useState<Document[]>([]);
  const [rootDirectoryFiles, setRootDirectoryFiles] = useState<Document[]>([]);
  const [databaseDocuments, setDatabaseDocuments] = useState<Document[]>([]);
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  // Load documents on component mount
  useEffect(() => {
    loadAllDocuments();
  }, [authUser?.id]);

  const loadAllDocuments = async () => {
    setLoadingDocuments(true);
    try {
      await Promise.all([
        loadStorageFiles(),
        loadDatabaseDocuments()
      ]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadStorageFiles = async () => {
    setLoadingStorageFiles(true);
    try {
      // Load patient images from root directory only
      const patientImages = await StorageService.getAllPatientImages();
      setStorageFiles(patientImages);

      // Load all files from root directory of patient-images bucket
      const rootFiles = await StorageService.getRootDirectoryFiles('patient-images');
      setRootDirectoryFiles(rootFiles);
    } catch (error) {
      console.error('Error loading storage files:', error);
      // Don't show error toast for storage files as they might not exist
    } finally {
      setLoadingStorageFiles(false);
    }
  };

  const loadDatabaseDocuments = async () => {
    if (!authUser?.id) return;
    
    try {
      const documents = await DatabaseService.getDocuments(authUser.id);
      
      // Transform database documents to match our Document interface
      const transformedDocuments: Document[] = documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        category: (doc.category as any) || 'uploaded-documents',
        size: formatFileSize(doc.size_bytes || 0),
        sizeBytes: doc.size_bytes || 0,
        uploadDate: doc.created_at,
        uploadedBy: doc.uploaded_by || 'You',
        shared: doc.shared,
        urgent: doc.urgent,
        isStorageFile: false,
        storagePath: doc.storage_path,
        bucketName: 'documents',
        lastModified: doc.updated_at,
        fullPath: `documents/${doc.storage_path}`
      }));
      
      setDatabaseDocuments(transformedDocuments);
    } catch (error) {
      console.error('Error loading database documents:', error);
      toast.error('Failed to load uploaded documents');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
      
      // Validate file immediately
      const validation = StorageService.validateDocumentFile(file, 10, ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']);
      if (!validation.isValid) {
        setUploadError(validation.error || 'Invalid file');
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !uploadCategory || !authUser?.id) {
      setUploadError('Please select a file and category');
      return;
    }

    // Validate file again before upload
    const validation = StorageService.validateDocumentFile(selectedFile, 10, ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      // Generate unique filename with user ID prefix for better organization
      const fileExtension = selectedFile.name.split('.').pop() || '';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const uniqueFileName = `${authUser.id}/${timestamp}-${randomString}.${fileExtension}`;
      
      // Start progress simulation
      setUploadProgress(10);

      // Upload file to storage
      console.log('Starting file upload to storage...');
      const uploadResult = await StorageService.uploadFile(
        'documents',
        uniqueFileName,
        selectedFile,
        {
          contentType: selectedFile.type,
          upsert: false
        }
      );

      console.log('File uploaded to storage:', uploadResult);
      setUploadProgress(60);

      // Get public URL for the uploaded file (for documents bucket)
      const publicUrl = StorageService.getPublicUrl('documents', uniqueFileName);
      console.log('Generated public URL:', publicUrl);
      
      setUploadProgress(80);

      // Create document record in database
      console.log('Creating document record in database...');
      const documentData = {
        user_id: authUser.id,
        name: selectedFile.name,
        type: fileExtension.toUpperCase() || 'UNKNOWN',
        category: uploadCategory as any,
        size_bytes: selectedFile.size,
        uploaded_by: authUser.profile?.full_name || authUser.email || 'User',
        shared: false,
        urgent: false,
        file_url: publicUrl,
        storage_path: uniqueFileName
      };

      const createdDocument = await DatabaseService.createDocument(documentData);
      console.log('Document record created:', createdDocument);

      setUploadProgress(100);

      toast.success('Document uploaded successfully!', {
        description: `${selectedFile.name} has been uploaded`
      });
      
      // Reset modal state
      setSelectedFile(null);
      setUploadCategory('');
      setIsUploadModalOpen(false);
      setUploadProgress(0);
      
      // Refresh documents
      await loadDatabaseDocuments();

    } catch (error) {
      console.error('Error uploading document:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload document. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = 'Storage error: Please check if the documents bucket exists and is properly configured.';
        } else if (error.message.includes('database') || error.message.includes('insert')) {
          errorMessage = 'Database error: Failed to save document information.';
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = 'Permission error: You may not have access to upload documents.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      setUploadError(errorMessage);
      toast.error('Upload failed', {
        description: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadModal = () => {
    setSelectedFile(null);
    setUploadCategory('');
    setUploadError('');
    setUploadProgress(0);
    setIsUploadModalOpen(false);
  };

  // Combine all documents
  const allDocuments = [...databaseDocuments, ...storageFiles, ...rootDirectoryFiles];

  const categories = [
    { id: 'all', label: 'All Documents', count: allDocuments.length },
    { id: 'uploaded-documents', label: 'Uploaded Documents', count: databaseDocuments.length },
    { id: 'medical-records', label: 'Medical Records', count: allDocuments.filter(d => d.category === 'medical-records').length },
    { id: 'insurance', label: 'Insurance', count: allDocuments.filter(d => d.category === 'insurance').length },
    { id: 'pre-op', label: 'Pre-Operative', count: allDocuments.filter(d => d.category === 'pre-op').length },
    { id: 'post-op', label: 'Post-Operative', count: allDocuments.filter(d => d.category === 'post-op').length },
    { id: 'test-results', label: 'Test Results', count: allDocuments.filter(d => d.category === 'test-results').length },
    { id: 'patient-images', label: 'Patient Images', count: storageFiles.length },
    { id: 'storage-files', label: 'Root Directory Files', count: rootDirectoryFiles.length }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'uploaded-documents': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'medical-records': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'insurance': return 'bg-green-100 text-green-800 border-green-200';
      case 'pre-op': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'post-op': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'test-results': return 'bg-red-100 text-red-800 border-red-200';
      case 'patient-images': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'storage-files': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileIcon = (type: string, isStorageFile?: boolean, isRootFile?: boolean) => {
    if (isRootFile) {
      return <Database className="w-5 h-5 text-cyan-600" />;
    }
    if (isStorageFile || ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(type.toUpperCase())) {
      return <Image className="w-5 h-5 text-pink-600" />;
    }
    return <FileText className="w-5 h-5 text-primary" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (fileDocument: Document) => {
    if (fileDocument.isStorageFile && fileDocument.bucketName && fileDocument.storagePath) {
      try {
        toast.info('Download starting...', {
          description: `Preparing ${fileDocument.name}`
        });

        const signedUrl = await StorageService.createSignedUrl(
          fileDocument.bucketName,
          fileDocument.storagePath,
          3600 // 1 hour
        );

        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = signedUrl.signedUrl;
        link.download = fileDocument.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Download started!', {
          description: `${fileDocument.name} is downloading`
        });
      } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('Download failed', {
          description: 'Unable to download the file'
        });
      }
    } else if (fileDocument.storagePath) {
      // For uploaded documents, use the public URL or create signed URL
      try {
        const publicUrl = StorageService.getPublicUrl('documents', fileDocument.storagePath);
        const link = document.createElement('a');
        link.href = publicUrl;
        link.download = fileDocument.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Download started!', {
          description: `${fileDocument.name} is downloading`
        });
      } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('Download failed');
      }
    } else {
      toast.info('Download simulated', {
        description: `Downloading ${fileDocument.name}`
      });
    }
  };

  const handleView = async (fileDocument: Document) => {
    if (fileDocument.isStorageFile && fileDocument.bucketName && fileDocument.storagePath) {
      try {
        const signedUrl = await StorageService.createSignedUrl(
          fileDocument.bucketName,
          fileDocument.storagePath,
          3600
        );
        window.open(signedUrl.signedUrl, '_blank');
      } catch (error) {
        console.error('Error viewing file:', error);
        toast.error('Failed to open file');
      }
    } else if (fileDocument.storagePath) {
      // For uploaded documents, use the public URL
      try {
        const publicUrl = StorageService.getPublicUrl('documents', fileDocument.storagePath);
        window.open(publicUrl, '_blank');
      } catch (error) {
        console.error('Error viewing file:', error);
        toast.error('Failed to open file');
      }
    } else {
      toast.info('Preview simulated', {
        description: `Opening ${fileDocument.name}`
      });
    }
  };

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const DocumentCard = ({ document: fileDocument }: { document: Document }) => (
    <Card className="surgery-card hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            {getFileIcon(fileDocument.type, fileDocument.isStorageFile, fileDocument.isRootFile)}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 break-words">{fileDocument.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{fileDocument.type}</span>
                <span>•</span>
                <span>{fileDocument.size}</span>
                {fileDocument.isStorageFile && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <HardDrive className="w-3 h-3" />
                      <span>Storage</span>
                    </div>
                  </>
                )}
                {fileDocument.isRootFile && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Database className="w-3 h-3" />
                      <span>Root Directory</span>
                    </div>
                  </>
                )}
              </div>
              {fileDocument.fullPath && (
                <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                  📁 {fileDocument.fullPath}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {fileDocument.urgent && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
            <Badge variant="outline" className={getCategoryColor(fileDocument.category)}>
              {fileDocument.category.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{fileDocument.uploadedBy}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(fileDocument.uploadDate)}</span>
            </div>
            {fileDocument.lastModified && fileDocument.lastModified !== fileDocument.uploadDate && (
              <div className="flex items-center space-x-1 text-xs">
                <span>Modified: {formatDate(fileDocument.lastModified)}</span>
              </div>
            )}
          </div>
          {fileDocument.shared && (
            <Badge variant="outline" className="text-xs">
              Shared
            </Badge>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleView(fileDocument)}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDownload(fileDocument)}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          {!fileDocument.isStorageFile && (
            <Button size="sm" variant="ghost">
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loadingDocuments) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-600">Manage your medical documents and files</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={loadAllDocuments}
            disabled={loadingStorageFiles}
          >
            {loadingStorageFiles ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FolderOpen className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="surgery-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="surgery-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {allDocuments.length}
            </div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {databaseDocuments.length}
            </div>
            <div className="text-sm text-gray-600">Uploaded</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {allDocuments.filter(d => d.shared).length}
            </div>
            <div className="text-sm text-gray-600">Shared</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {allDocuments.filter(d => d.urgent).length}
            </div>
            <div className="text-sm text-gray-600">Urgent</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {storageFiles.length}
            </div>
            <div className="text-sm text-gray-600">Patient Images</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {rootDirectoryFiles.length}
            </div>
            <div className="text-sm text-gray-600">Root Files</div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card className="surgery-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Your Documents</span>
            {loadingStorageFiles && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </CardTitle>
          <CardDescription>
            {filteredDocuments.length} documents found
            {storageFiles.length > 0 && (
              <span className="ml-2 text-pink-600">
                • {storageFiles.length} from patient-images storage
              </span>
            )}
            {rootDirectoryFiles.length > 0 && (
              <span className="ml-2 text-cyan-600">
                • {rootDirectoryFiles.length} from root directory
              </span>
            )}
            {databaseDocuments.length > 0 && (
              <span className="ml-2 text-indigo-600">
                • {databaseDocuments.length} uploaded documents
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDocuments.map((fileDocument) => (
                <DocumentCard key={fileDocument.id} document={fileDocument} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found matching your criteria</p>
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-primary" />
              <span>Upload Document</span>
            </DialogTitle>
            <DialogDescription>
              Upload a new document to your medical records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {uploadError && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-900">Upload Error</div>
                  <div className="text-sm text-red-700">{uploadError}</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                disabled={isUploading}
              />
              <div className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (max 10MB)
              </div>
            </div>

            {selectedFile && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-900">{selectedFile.name}</div>
                    <div className="text-xs text-blue-700">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </div>
                  </div>
                  {!uploadError && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory} disabled={isUploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical-records">Medical Records</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="pre-op">Pre-Operative</SelectItem>
                  <SelectItem value="post-op">Post-Operative</SelectItem>
                  <SelectItem value="test-results">Test Results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <div className="text-xs text-gray-500 text-center">
                  Please wait while your document is being uploaded...
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={resetUploadModal}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUploadDocument}
                disabled={!selectedFile || !uploadCategory || isUploading || !!uploadError}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}