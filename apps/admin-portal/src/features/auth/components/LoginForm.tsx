import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Alert, Link } from '@mui/material';
import { loginSchema, LoginInput } from '../schemas/loginSchema';
import { PasswordInput } from './PasswordInput';
import { RememberMeCheckbox } from './RememberMeCheckbox';

interface LoginFormProps {
  onSubmit: (data: LoginInput) => void;
  error: string | null;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, loading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {error && (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            autoComplete="username"
            autoFocus
            disabled={loading}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordInput
            {...field}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            id="password"
            autoComplete="current-password"
            disabled={loading}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={1}
        mb={2}
      >
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <RememberMeCheckbox
              checked={field.value ?? false}
              onChange={field.onChange}
              disabled={loading}
            />
          )}
        />
        <Link href="#" variant="body2" color="primary" sx={{ textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  );
};
