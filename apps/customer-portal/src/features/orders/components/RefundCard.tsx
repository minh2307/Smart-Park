import { logger } from '../../../services/logger';
import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, useTheme } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { OrderStatusChip } from './OrderStatusChip';
import { formatCurrency, formatDate } from '@shared/utils';
import { useRequestRefundMutation } from '../services/orderApi';
import type { Refund, Payment } from '../types/order.types';

interface RefundCardProps {
  refunds?: Refund[];
  payments?: Payment[];
  onRefundSuccess?: () => void;
}

export const RefundCard: React.FC<RefundCardProps> = ({ refunds = [], payments = [], onRefundSuccess }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | ''>('');
  const [reason, setReason] = useState('Thay đổi lịch trình');
  const [customReason, setCustomReason] = useState('');
  const [requestRefund, { isLoading }] = useRequestRefundMutation();

  const successPayments = payments.filter(p => p.status === 'SUCCESS' || (p.status as string) === 'PAID');
  
  // Check if there are active refunds or eligible payments
  const hasRefunds = refunds.length > 0;
  const isEligible = successPayments.length > 0;

  const handleOpen = () => {
    if (successPayments.length > 0) {
      setSelectedPaymentId(successPayments[0].id);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCustomReason('');
  };

  const handleSubmit = async () => {
    if (!selectedPaymentId) return;

    const finalReason = reason === 'Khác' ? customReason : reason;
    if (!finalReason.trim()) return;

    try {
      await requestRefund({
        paymentId: Number(selectedPaymentId),
        reason: finalReason,
      }).unwrap();
      handleClose();
      if (onRefundSuccess) {
        onRefundSuccess();
      }
    } catch (err) {
      logger.error('Failed to request refund:', err);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        p: 3,
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>
            Thông tin hoàn tiền
          </Typography>
          {!hasRefunds && isEligible && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpen}
              endIcon={<KeyboardArrowRightIcon />}
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  borderColor: '#ef4444',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              Yêu cầu hoàn tiền
            </Button>
          )}
        </Stack>

        {hasRefunds ? (
          <Stack spacing={2}>
            {refunds.map((refund) => (
              <Box
                key={refund.id}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.4)">
                      Mã hoàn tiền: REF-{refund.id}
                    </Typography>
                    <OrderStatusChip status={refund.status} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Box>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                        Lý do:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, mt: 0.2 }}>
                        {refund.reason}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                        Số tiền:
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                        {formatCurrency(refund.amount)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.4)">
                    Yêu cầu lúc: {formatDate(refund.createdAt)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: 'rgba(255, 255, 255, 0.01)', p: 2, borderRadius: 2 }}>
            <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
            <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
              {isEligible
                ? 'Đơn hàng đã thanh toán. Bạn có thể yêu cầu hoàn tiền nếu thay đổi kế hoạch vui chơi.'
                : 'Chưa có yêu cầu hoàn tiền nào được khởi tạo.'}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Request Refund Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            width: '100%',
            maxWidth: 450,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff', pb: 1 }}>
          Yêu cầu hoàn tiền
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {successPayments.length > 1 && (
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Chọn giao dịch</InputLabel>
                <Select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(Number(e.target.value))}
                  label="Chọn giao dịch"
                  sx={{
                    color: '#ffffff',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  {successPayments.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.transactionReference} ({formatCurrency(p.amount)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Lý do hoàn tiền</InputLabel>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                label="Lý do hoàn tiền"
                sx={{
                  color: '#ffffff',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <MenuItem value="Thay đổi lịch trình">Thay đổi lịch trình</MenuItem>
                <MenuItem value="Lý do sức khỏe">Lý do sức khỏe</MenuItem>
                <MenuItem value="Thời tiết xấu">Thời tiết xấu</MenuItem>
                <MenuItem value="Khác">Lý do khác...</MenuItem>
              </Select>
            </FormControl>

            {reason === 'Khác' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả lý do"
                placeholder="Nhập lý do chi tiết..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                InputProps={{
                  sx: {
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  },
                }}
              />
            )}

            <Typography variant="caption" color="rgba(255,255,255,0.4)">
              * Yêu cầu hoàn tiền sẽ được gửi tới Ban quản lý công viên duyệt. Thời gian hoàn tất thông thường từ 1-3 ngày làm việc.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedPaymentId || (reason === 'Khác' && !customReason.trim())}
            variant="contained"
            sx={{
              bgcolor: '#ef4444',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              borderRadius: 2,
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
