import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '../../../store/hooks';
import { loginSuccess } from '@shared/api';
import { useLoginMutation } from '../api/authApi';
import { useGetMeQuery } from '../api/authApi';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@shared/utils';

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type FormData = z.infer<typeof schema>;

const getDeviceId = (): string => {
  const key = 'sp_device_id';
  let id = storage.get<string>(key);
  if (!id) {
    id = crypto.randomUUID();
    storage.set(key, id);
  }
  return id;
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';
  const [login, { isLoading }] = useLoginMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMsg(null);
    try {
      const result = await login({
        username: data.username,
        password: data.password,
        deviceId: getDeviceId(),
      }).unwrap();

      dispatch(
        loginSuccess({
          user: {
            id: result.userId,
            username: result.username,
            email: result.email,
            fullName: result.username,
            role: 'CUSTOMER',
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );

      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setErrorMsg(msg);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Lock sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
        <Typography variant="h4" fontWeight={800} fontFamily="Outfit, sans-serif">
          Đăng nhập
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Chào mừng trở lại Smart Park 👋
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tên đăng nhập"
                fullWidth
                autoFocus
                error={!!errors.username}
                helperText={errors.username?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              py: 1.5,
              mt: 1,
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              '&:hover': { background: 'linear-gradient(135deg, #0f766e, #115e59)' },
            }}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Đăng nhập'}
          </Button>
        </Box>
      </form>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          hoặc
        </Typography>
      </Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có tài khoản?{' '}
          <MuiLink component={Link} to="/register" fontWeight={700} color="primary.main" underline="hover">
            Đăng ký ngay
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};
