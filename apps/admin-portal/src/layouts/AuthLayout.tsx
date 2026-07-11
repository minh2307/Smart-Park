import React, { Suspense } from 'react';
import { Grid, Box, Typography, LinearProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <Grid container component="main" sx={{ minHeight: '100dvh' }}>
      {/* Left branding panel — gradient instead of external image */}
      <Grid
        item
        xs={false}
        sm={4}
        md={6}
        lg={7}
        sx={{
          position: 'relative',
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          p: { sm: 4, md: 6 },
          overflow: 'hidden',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0c1222 0%, #0f766e 50%, #0c1222 100%)'
              : 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #14b8a6 100%)',
          // Noise overlay for texture
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 1,
          },
          // Subtle radial glow
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ zIndex: 2, textAlign: 'center', maxWidth: 480 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '0.04em',
            }}
          >
            SP
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ letterSpacing: '-0.02em', mb: 2 }}
          >
            Smart Park
          </Typography>
          <Typography
            variant="body1"
            sx={{ opacity: 0.85, lineHeight: 1.7, maxWidth: 360, mx: 'auto' }}
          >
            Management & Business Intelligence Platform for venue operations, ticketing, and analytics.
          </Typography>
        </Box>
      </Grid>

      {/* Right form panel */}
      <Grid
        item
        xs={12}
        sm={8}
        md={6}
        lg={5}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            px: { xs: 3, sm: 4 },
            py: { xs: 4, sm: 0 },
          }}
        >
          <Suspense fallback={<LinearProgress color="primary" />}>
            <Outlet />
          </Suspense>
        </Box>
      </Grid>
    </Grid>
  );
};
