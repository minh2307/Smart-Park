import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        borderTop: '1px solid',
        borderTopColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        © {new Date().getFullYear()} Smart Park Platform. Bảo lưu mọi quyền.
      </Typography>
      <Box display="flex" gap={2}>
        <Link href="#" variant="caption" color="text.secondary" underline="hover">
          Chính sách bảo mật
        </Link>
        <Link href="#" variant="caption" color="text.secondary" underline="hover">
          Điều khoản dịch vụ
        </Link>
      </Box>
    </Box>
  );
};
