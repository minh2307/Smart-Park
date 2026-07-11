import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import { logger } from '../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('Uncaught React error', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          sx={{
            minHeight: '100dvh',
            bgcolor: '#0b1221',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <WarningAmberIcon
                sx={{ fontSize: 56, color: '#f59e0b', mb: 3 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  color: '#ffffff',
                  mb: 1.5,
                  letterSpacing: '-0.02em',
                }}
              >
                Co gi do bi hong
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, lineHeight: 1.6 }}
              >
                Da xay ra loi khong mong doi. Vui long thu tai trang hoac quay lai trang chu.
              </Typography>
              {import.meta.env.DEV && this.state.error && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 2,
                    mb: 3,
                    textAlign: 'left',
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      fontSize: '0.75rem',
                      color: '#f87171',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      m: 0,
                    }}
                  >
                    {this.state.error.message}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                  sx={{
                    bgcolor: '#2dd4bf',
                    color: '#0f172a',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    '&:hover': { bgcolor: '#14b8a6' },
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  Thu lai
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => (window.location.href = '/')}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    '&:hover': { borderColor: 'rgba(255,255,255,0.35)', bgcolor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  Trang chu
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
