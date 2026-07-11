import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  variantColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  variantColor = 'primary',
  sx,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      color={variantColor === 'primary' || variantColor === 'secondary' ? variantColor : undefined}
      sx={{
        ...(variantColor !== 'primary' && variantColor !== 'secondary' && {
          bgcolor: `${variantColor}.main`,
          color: `${variantColor}.contrastText`,
          '&:hover': {
            bgcolor: `${variantColor}.dark`,
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiButton>
  );
};
