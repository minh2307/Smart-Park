import React from 'react';
import { Box, Typography, Stack, Grid, Card, CardActionArea, CardContent, CircularProgress, Alert, useTheme, alpha } from '@mui/material';
import { CreditCard, QrCodeScanner, AccountBalance } from '@mui/icons-material';
import { useGetPaymentMethodsQuery } from '../api/checkoutApi';
import type { PaymentMethod } from '../types/checkout.types';

interface PaymentMethodListProps {
  selectedCode: string;
  onSelect: (code: string) => void;
}

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  selectedCode,
  onSelect,
}) => {
  const theme = useTheme();
  const { data: methods, isLoading, error } = useGetPaymentMethodsQuery();

  const getMethodIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case 'VNPAY':
        return <CreditCard sx={{ fontSize: 32, color: theme.palette.primary.main }} />;
      case 'MOMO':
        return <QrCodeScanner sx={{ fontSize: 32, color: '#d82d8b' }} />;
      default:
        return <AccountBalance sx={{ fontSize: 32, color: 'text.secondary' }} />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error || !methods || methods.length === 0) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        Hiện tại không có phương thức thanh toán nào hoạt động. Vui lòng thử lại sau.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={800} fontFamily="Outfit, sans-serif">
        Chọn phương thức thanh toán
      </Typography>

      <Grid container spacing={2}>
        {methods.map((method) => {
          const isSelected = selectedCode === method.code;
          return (
            <Grid item xs={12} sm={6} key={method.id}>
              <Card
                sx={{
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderRadius: 4.5,
                  boxShadow: isSelected ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}` : 'none',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardActionArea onClick={() => onSelect(method.code)}>
                  <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3.5,
                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.action.disabledBackground, 0.1),
                      }}
                    >
                      {getMethodIcon(method.code)}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {method.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cung cấp bởi {method.provider}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};
