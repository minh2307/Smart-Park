import React from 'react';
import { Box, Typography } from '@mui/material';
import { FileUpload } from '../../../components/common/Form';

interface UploadVenueImageProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}

export const UploadVenueImage: React.FC<UploadVenueImageProps> = ({ label, value, onChange }) => {
  const handleUploadSuccess = (file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography variant="body2" fontWeight="bold" color="text.secondary">
        {label}
      </Typography>
      {value ? (
        <Box
          position="relative"
          width="100%"
          height={160}
          borderRadius={2}
          overflow="hidden"
          border="1px solid"
          borderColor="divider"
        >
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bgcolor="rgba(0, 0, 0, 0.4)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.2s', cursor: 'pointer' }}
            onClick={() => onChange('')}
          >
            <Typography color="white" variant="button" fontWeight="bold">
              Gỡ bỏ ảnh
            </Typography>
          </Box>
        </Box>
      ) : (
        <FileUpload
          label={`Tải lên ${label}`}
          accept="image/*"
          onChange={handleUploadSuccess}
        />
      )}
    </Box>
  );
};
