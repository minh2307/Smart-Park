import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Stack, alpha, useTheme, InputAdornment } from '@mui/material';
import { LocalOffer, CheckCircle, Cancel } from '@mui/icons-material';
import { useLazyValidateCouponQuery } from '../api/bookingApi';
import { formatCurrency } from '@shared/utils';

interface PromotionSelectorProps {
  customerId: number;
  orderTotal: number;
  appliedCode: string | null;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
}

export const PromotionSelector: React.FC<PromotionSelectorProps> = ({
  customerId,
  orderTotal,
  appliedCode,
  onApply,
  onRemove,
}) => {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [validateCoupon, { data: discount, error, isFetching }] = useLazyValidateCouponQuery();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setValidationError(null);
    try {
      // Validate coupon via backend endpoint
      const result = await validateCoupon({
        code: code.trim(),
        customerId,
        orderTotal,
      }).unwrap();

      if (result > 0) {
        onApply(code.trim(), result);
      } else {
        setValidationError('Mã giảm giá không hợp lệ hoặc không đạt giá trị đơn hàng tối thiểu.');
      }
    } catch (err: any) {
      setValidationError('Mã giảm giá đã hết hạn, không tồn tại hoặc đã được sử dụng.');
    }
  };

  const handleClear = () => {
    setCode('');
    onRemove();
    setValidationError(null);
  };

  return (
    <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 4, mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalOffer sx={{ color: 'primary.main', fontSize: 18 }} />
        Mã khuyến mãi / Coupon
      </Typography>

      {appliedCode ? (
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" />
            <Typography variant="body2">
              Đã áp dụng mã: <strong>{appliedCode}</strong> (-{formatCurrency(discount ?? 0)})
            </Typography>
          </Box>
          <Button size="small" variant="text" color="error" onClick={handleClear} startIcon={<Cancel />}>
            Hủy áp dụng
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Nhập mã ưu đãi..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setValidationError(null);
            }}
            disabled={isFetching || orderTotal === 0}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOffer sx={{ color: 'text.disabled', fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleValidate}
            disabled={isFetching || !code.trim() || orderTotal === 0}
            sx={{ fontWeight: 700, px: 3, whiteSpace: 'nowrap' }}
          >
            {isFetching ? '...' : 'Áp dụng'}
          </Button>
        </Stack>
      )}

      {validationError && (
        <Alert severity="error" sx={{ mt: 1.5, py: 0.5, borderRadius: 2 }}>
          {validationError}
        </Alert>
      )}
    </Box>
  );
};
