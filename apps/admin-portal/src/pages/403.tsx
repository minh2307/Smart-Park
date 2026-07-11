import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
          py: 8,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '8rem' },
            fontWeight: 800,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          403
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
          Access denied
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={400} lineHeight={1.7}>
          You do not have permission to view this resource. Contact your administrator if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/admin/dashboard')}
          sx={{ mt: 2, px: 4 }}
        >
          Back to dashboard
        </Button>
      </Box>
    </Container>
  );
};
