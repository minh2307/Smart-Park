import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const NavbarLogo: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => navigate(ROUTES.HOME)}
      aria-label="Smart Park - Trang chủ"
      role="link"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') navigate(ROUTES.HOME); }}
      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1, userSelect: 'none', outline: 'none', '&:focus-visible': { outline: '2px solid #2dd4bf', borderRadius: '6px' } }}
    >
      {/* Geometric mark */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(13,148,136,0.4)',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: '0.85rem',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          SP
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          fontSize: '1.1rem',
          letterSpacing: '-0.02em',
          background: isDark
            ? 'linear-gradient(135deg, #ffffff 40%, #2dd4bf 100%)'
            : 'linear-gradient(135deg, #0f172a 40%, #0d9488 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          whiteSpace: 'nowrap',
        }}
      >
        Smart Park
      </Typography>
    </Box>
  );
});

NavbarLogo.displayName = 'NavbarLogo';
