import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  Tooltip,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import {
  PhotoCamera,
  CloudUpload,
  Delete,
  Edit,
  LocationOn,
  Schedule,
  CameraAlt,
  Compress,
  Info,
  Close,
  Save,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  caption: string;
  metadata: {
    size: number;
    type: string;
    lastModified: number;
    location?: { lat: number; lng: number };
    dateTime?: string;
    camera?: string;
    compression?: string;
  };
  compressed?: File;
  uploadProgress?: number;
  uploaded?: boolean;
  uploadUrl?: string;
}

export interface EnhancedPhotoUploadProps {
  onPhotosChange: (photos: PhotoFile[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
  compressImages?: boolean;
  compressionQuality?: number;
  allowedTypes?: string[];
  showMetadata?: boolean;
  enableGeolocation?: boolean;
  initialPhotos?: PhotoFile[];
}

const EnhancedPhotoUpload: React.FC<EnhancedPhotoUploadProps> = ({
  onPhotosChange,
  maxFiles = 10,
  maxFileSizeMB = 10,
  compressImages = true,
  compressionQuality = 0.8,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showMetadata = true,
  enableGeolocation = true,
  initialPhotos = []
}) => {
  // State
  const [photos, setPhotos] = useState<PhotoFile[]>(initialPhotos);
  const [isDragging, setIsDragging] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoFile | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Get current location if enabled
  useEffect(() => {
    if (enableGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get location:', error);
        }
      );
    }
  }, [enableGeolocation]);

  // Update parent when photos change
  useEffect(() => {
    onPhotosChange(photos);
  }, [photos, onPhotosChange]);

  // Image compression function
  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          compressionQuality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, [compressionQuality]);

  // Extract EXIF data (basic implementation)
  const extractMetadata = useCallback(async (file: File): Promise<any> => {
    const metadata = {
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      location: currentLocation,
      dateTime: new Date().toISOString(),
      camera: 'Unknown',
      compression: 'None'
    };

    // Try to extract basic EXIF data (simplified)
    try {
      if (file.type.startsWith('image/') && file.lastModified) {
        metadata.dateTime = new Date(file.lastModified).toISOString();
      }
    } catch (error) {
      console.warn('Could not extract metadata:', error);
    }

    return metadata;
  }, [currentLocation]);

  // Process uploaded files
  const processFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} not allowed`);
        return false;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setError(`File ${file.name} is too large (max ${maxFileSizeMB}MB)`);
        return false;
      }
      return true;
    });

    if (photos.length + validFiles.length > maxFiles) {
      setError(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    setError(null);
    setIsCompressing(true);

    try {
      const newPhotos: PhotoFile[] = [];

      for (const file of validFiles) {
        // Extract metadata
        const metadata = await extractMetadata(file);
        
        // Compress if enabled
        let processedFile = file;
        if (compressImages && file.type.startsWith('image/')) {
          processedFile = await compressImage(file);
          metadata.compression = `JPEG ${(compressionQuality * 100).toFixed(0)}%`;
        }

        const photoFile: PhotoFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: processedFile,
          preview: URL.createObjectURL(processedFile),
          caption: '',
          metadata,
          compressed: compressImages ? processedFile : undefined
        };

        newPhotos.push(photoFile);
      }

      setPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      setError('Failed to process images');
      console.error('Image processing error:', error);
    } finally {
      setIsCompressing(false);
    }
  }, [photos.length, maxFiles, maxFileSizeMB, allowedTypes, compressImages, compressImage, extractMetadata]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // Remove photo
  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const updated = prev.filter(photo => {
        if (photo.id === id) {
          URL.revokeObjectURL(photo.preview);
          return false;
        }
        return true;
      });
      return updated;
    });
  }, []);

  // Update photo caption
  const updateCaption = useCallback((id: string, caption: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, caption } : photo
    ));
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper
        sx={{
          border: isDragging ? '2px dashed #1de9b6' : '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: isDragging ? 'rgba(29, 233, 182, 0.1)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#1de9b6',
            bgcolor: 'rgba(29, 233, 182, 0.05)'
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <CloudUpload sx={{ fontSize: 48, color: isDragging ? '#1de9b6' : '#666', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Max {maxFiles} files, {maxFileSizeMB}MB each. Supported: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          sx={{ pointerEvents: 'none' }}
        >
          Choose Photos
        </Button>
      </Paper>

      {/* Processing Indicator */}
      {isCompressing && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>Processing images...</Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraAlt />
            Photos ({photos.length}/{maxFiles})
          </Typography>

          <Grid container spacing={2}>
            <AnimatePresence>
              {photos.map((photo, index) => (
                <Grid item xs={12} sm={6} md={4} key={photo.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={photo.preview}
                        alt={photo.caption || 'Travel photo'}
                        sx={{ objectFit: 'cover' }}
                      />
                      
                      {/* Overlay with actions */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 1
                        }}
                      >
                        {showMetadata && (
                          <Tooltip title="View metadata">
                            <IconButton
                              size="small"
                              onClick={() => setEditingPhoto(photo)}
                              sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Remove photo">
                          <IconButton
                            size="small"
                            onClick={() => removePhoto(photo.id)}
                            sx={{ bgcolor: 'rgba(244,67,54,0.8)', color: 'white' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <CardContent sx={{ pb: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add a caption..."
                          value={photo.caption}
                          onChange={(e) => updateCaption(photo.id, e.target.value)}
                          variant="outlined"
                        />
                        
                        {compressImages && photo.compressed && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <Compress fontSize="small" />
                            Compressed: {formatFileSize(photo.file.size)} → {formatFileSize(photo.compressed.size)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        </Box>
      )}

      {/* Metadata Dialog */}
      <Dialog open={!!editingPhoto} onClose={() => setEditingPhoto(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Photo Metadata
          <IconButton onClick={() => setEditingPhoto(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editingPhoto && (
            <Stack spacing={2}>
              <img
                src={editingPhoto.preview}
                alt="Preview"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>File Size</Typography>
                  <Chip label={formatFileSize(editingPhoto.metadata.size)} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>Type</Typography>
                  <Chip label={editingPhoto.metadata.type} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Date & Time</Typography>
                  <Chip label={new Date(editingPhoto.metadata.dateTime || editingPhoto.metadata.lastModified).toLocaleString()} size="small" />
                </Grid>
                {editingPhoto.metadata.location && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" />
                      Location
                    </Typography>
                    <Chip 
                      label={`${editingPhoto.metadata.location.lat.toFixed(6)}, ${editingPhoto.metadata.location.lng.toFixed(6)}`} 
                      size="small" 
                    />
                  </Grid>
                )}
                {editingPhoto.metadata.compression && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Compression</Typography>
                    <Chip label={editingPhoto.metadata.compression} size="small" color="success" />
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EnhancedPhotoUpload;