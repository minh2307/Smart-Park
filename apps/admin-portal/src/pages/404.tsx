import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
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
            color: 'text.secondary',
            opacity: 0.3,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={400} lineHeight={1.7}>
          The page you are looking for does not exist or has been moved to a different location.
        </Typography>
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
