import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Checkbox, FormControlLabel } from '@mui/material';
import { Security, ArrowForward } from '@mui/icons-material';
import { formatCurrency } from '@shared/utils';

interface PaymentConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
  paymentMethodName: string;
}

export const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  totalAmount,
  paymentMethodName,
}) => {
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);

  const handleConfirm = () => {
    if (acceptedTerms) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 5, p: 2 } }}>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Security color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h6" fontWeight={800} fontFamily="Outfit, sans-serif" textAlign="center">
          Xác nhận Thanh toán
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ textAlign: 'center', my: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Bạn đang chuẩn bị thanh toán đơn hàng qua cổng:
          </Typography>
          <Typography variant="subtitle1" fontWeight={800}>
            {paymentMethodName}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Tổng số tiền cần thanh toán:
          </Typography>
          <Typography variant="h4" fontWeight={900} color="primary.main" fontFamily="Outfit, sans-serif">
            {formatCurrency(totalAmount)}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Lưu ý: Vé tham quan sau khi thanh toán không hỗ trợ đổi trả trực tuyến, trừ các trường hợp bất khả kháng theo điều khoản của Smart Park.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" fontWeight={600} textAlign="left">
                Tôi đồng ý với chính sách bán vé & dịch vụ của Smart Park
              </Typography>
            }
            sx={{ mt: 2 }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} fullWidth sx={{ borderRadius: 3, fontWeight: 700 }}>
          Hủy bỏ
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!acceptedTerms}
          fullWidth
          endIcon={<ArrowForward />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};
