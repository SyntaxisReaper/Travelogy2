import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera
} from '@mui/icons-material';
import EnhancedPhotoUpload, { PhotoFile } from './EnhancedPhotoUpload';

const PhotoUploadDemo: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const handlePhotosChange = (newPhotos: PhotoFile[]) => {
    setPhotos(newPhotos);
    console.log('Photos updated:', newPhotos);
  };

  const totalSize = photos.reduce((sum, photo) => sum + photo.metadata.size, 0);
  const compressedSize = photos.reduce((sum, photo) => sum + (photo.compressed?.size || photo.file.size), 0);
  const compressionSavings = totalSize - compressedSize;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1de9b6 0%, #00e676 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PhotoCamera fontSize="large" />
          Enhanced Photo Upload - Demo
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          📸 Test drag & drop, compression, metadata extraction, and more!
        </Typography>
      </Paper>

      {/* Features Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>Features to Test:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {[
            'Drag & drop photos',
            'Automatic compression',
            'EXIF metadata viewing',
            'GPS location capture',
            'File validation',
            'Captions',
            'Animated grid'
          ].map((feature) => (
            <Chip key={feature} label={feature} size="small" color="info" variant="outlined" />
          ))}
        </Box>
      </Alert>

      {/* Upload Stats */}
      {photos.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUploadIcon />
            Upload Statistics
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Chip 
              label={`Photos: ${photos.length}`} 
              sx={{ bgcolor: 'success.dark', color: 'white' }}
            />
            <Chip 
              label={`Original: ${formatFileSize(totalSize)}`} 
              sx={{ bgcolor: 'warning.dark', color: 'white' }}
            />
            <Chip 
              label={`Compressed: ${formatFileSize(compressedSize)}`} 
              sx={{ bgcolor: 'success.dark', color: 'white' }}
            />
            {compressionSavings > 0 && (
              <Chip 
                label={`Saved: ${formatFileSize(compressionSavings)} (${((compressionSavings / totalSize) * 100).toFixed(1)}%)`} 
                sx={{ bgcolor: 'info.dark', color: 'white' }}
              />
            )}
            <Chip 
              label={`With GPS: ${photos.filter(p => p.metadata.location).length}`} 
              sx={{ bgcolor: 'primary.dark', color: 'white' }}
            />
          </Stack>
        </Paper>
      )}

      {/* Main Upload Component */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          📱 Enhanced Photo Upload Component
        </Typography>
        
        <EnhancedPhotoUpload
          onPhotosChange={handlePhotosChange}
          maxFiles={15}
          maxFileSizeMB={20}
          compressImages={true}
          compressionQuality={0.8}
          showMetadata={true}
          enableGeolocation={true}
        />
      </Paper>

      {/* Development Info */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          🛠️ Development Notes
        </Typography>
        <Typography variant="body2" paragraph>
          This component is built in the <code>/src/upgrades/photo-system/</code> folder and is completely separate from the main app.
          It demonstrates advanced photo handling features that can be integrated anywhere.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Try these features:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2">Drag photos directly from your file explorer</Typography>
          <Typography component="li" variant="body2">Upload large images and see compression in action</Typography>
          <Typography component="li" variant="body2">Click the info icon on photos to view metadata</Typography>
          <Typography component="li" variant="body2">Allow location access to see GPS coordinates</Typography>
          <Typography component="li" variant="body2">Add captions to your photos</Typography>
          <Typography component="li" variant="body2">Try uploading unsupported file types to see validation</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PhotoUploadDemo;