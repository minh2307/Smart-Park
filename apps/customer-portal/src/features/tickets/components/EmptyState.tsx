import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ConfirmationNumber } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy vé',
  description = 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.',
  onReset,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Box
      sx={{
        textAlign: 'center',
        py: 10,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <ConfirmationNumber sx={{ fontSize: 36, color: 'text.disabled' }} />
      </Box>
      <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, lineHeight: 1.6 }}>
        {description}
      </Typography>
      {onReset && (
        <Button variant="outlined" onClick={onReset} sx={{ mt: 1 }}>
          Xóa bộ lọc
        </Button>
      )}
    </Box>
  </motion.div>
);
