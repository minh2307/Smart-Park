import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Avatar, Stack, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  onUpload,
  onRemove,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError('Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.');
      return false;
    }

    if (file.size > maxSize) {
      setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        try {
          setIsUploading(true);
          await onUpload(file);
        } catch (err) {
          setError('Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        try {
          setIsUploading(true);
          await onUpload(file);
        } catch (err) {
          setError('Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 2 }}>
        Ảnh Đại Diện
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
        {/* Preview Avatar */}
        <Avatar
          src={currentAvatarUrl || undefined}
          sx={{
            width: 100,
            height: 100,
            bgcolor: '#2dd4bf',
            color: '#0f172a',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          {!currentAvatarUrl && 'U'}
        </Avatar>

        {/* Drag and Drop Zone */}
        <Box
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            flexGrow: 1,
            border: '2px dashed',
            borderColor: dragActive ? '#2dd4bf' : 'rgba(255, 255, 255, 0.12)',
            borderRadius: 3,
            bgcolor: dragActive ? 'rgba(45, 212, 191, 0.05)' : 'rgba(255,255,255,0.01)',
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            width: '100%',
            '&:hover': {
              borderColor: '#2dd4bf',
              bgcolor: 'rgba(45, 212, 191, 0.02)',
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".jpg,.jpeg,.png,.webp"
          />

          {isUploading ? (
            <Stack spacing={1} alignItems="center">
              <CircularProgress size={24} sx={{ color: '#2dd4bf' }} />
              <Typography variant="body2" color="rgba(255,255,255,0.6)">
                Đang xử lý ảnh...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1} alignItems="center">
              <CloudUploadIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.4)' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Kéo thả hoặc Click để tải ảnh lên
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">
                JPG, PNG, WEBP tối đa 2MB
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      {currentAvatarUrl && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onRemove}
          sx={{ mt: 2, borderColor: 'rgba(211, 47, 47, 0.4)' }}
        >
          Xóa ảnh hiện tại
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
export default AvatarUploader;
