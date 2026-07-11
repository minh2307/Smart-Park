import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { LoginInput } from '../schemas/loginSchema';
import { LoadingOverlay } from '../components/LoadingOverlay';

export const LoginPage: React.FC = () => {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (data: LoginInput) => {
    const result = await login(data);
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <LoadingOverlay open={loading} />
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography component="h1" variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
          Chào mừng trở lại
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng đăng nhập để tiếp tục vào Smart Park
        </Typography>
      </Box>
      
      <LoginForm onSubmit={handleLoginSubmit} error={error} loading={loading} />
    </Box>
  );
};
