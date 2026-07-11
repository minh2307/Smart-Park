import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';

export const ServerErrorPage: React.FC = () => {
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
              `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          500
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={400} lineHeight={1.7}>
          An unexpected error occurred on our server. Please try again later or contact support if the issue persists.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.reload()}
          sx={{ mt: 2, px: 4 }}
        >
          Reload page
        </Button>
      </Box>
    </Container>
  );
};
