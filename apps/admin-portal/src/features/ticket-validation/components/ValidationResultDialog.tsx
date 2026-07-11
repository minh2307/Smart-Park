import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { MdCheckCircle, MdCancel, MdWarning } from 'react-icons/md';
import { ValidationLog } from '../types';
import dayjs from 'dayjs';

interface ValidationResultDialogProps {
  open: boolean;
  log: ValidationLog | null;
  onClose: () => void;
  onManualOverride?: (log: ValidationLog) => void;
  onReportIncident?: (log: ValidationLog) => void;
}

export const ValidationResultDialog: React.FC<ValidationResultDialogProps> = ({
  open,
  log,
  onClose,
  onManualOverride,
  onReportIncident,
}) => {
  if (!log) return null;

  const isSuccess = log.status === 'SUCCESS';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: '2px solid',
          borderColor: isSuccess ? 'success.main' : 'error.main',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        {isSuccess ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <MdCheckCircle style={{ fontSize: '5rem', color: '#2e7d32' }} />
            <Typography variant="h4" color="success.main" fontWeight="bold">
              XÁC THỰC THÀNH CÔNG
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <MdCancel style={{ fontSize: '5rem', color: '#d32f2f' }} />
            <Typography variant="h4" color="error.main" fontWeight="bold">
              LỖI XÁC THỰC VÉ
            </Typography>
          </Box>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', mt: 2 }}>
        {!isSuccess && (
          <Typography variant="h6" color="error.main" fontWeight="bold" sx={{ mb: 2 }}>
            Lý do: {log.failureReason || 'Vé không hợp lệ'}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={1.5} sx={{ textAlign: 'left', px: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Mã Vé (Ticket Code):</Typography>
            <Typography fontWeight="bold" sx={{ fontFamily: 'monospace' }}>{log.ticketCode}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Khách Hàng (Customer):</Typography>
            <Typography fontWeight="bold">{log.customerName}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Cổng (Gate):</Typography>
            <Typography fontWeight="bold">{log.gateCode}</Typography>
          </Box>
          {log.attractionName && (
            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Trò Chơi (Attraction):</Typography>
              <Typography fontWeight="bold">{log.attractionName}</Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Giờ quét (Scan Time):</Typography>
            <Typography fontWeight="bold">{dayjs(log.checkInTime).format('HH:mm:ss - DD/MM/YYYY')}</Typography>
          </Box>
          {log.remainingUsage !== undefined && (
            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Lượt dùng còn lại:</Typography>
              <Typography fontWeight="bold" color="primary">{log.remainingUsage} lượt</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        {!isSuccess && onManualOverride && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<MdWarning />}
            onClick={() => onManualOverride(log)}
          >
            Bỏ qua lỗi (Manual Override)
          </Button>
        )}
        {!isSuccess && onReportIncident && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => onReportIncident(log)}
          >
            Báo cáo Sự cố (Incident)
          </Button>
        )}
        <Button variant="contained" color={isSuccess ? 'success' : 'primary'} onClick={onClose} autoFocus>
          Đóng (Close)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ValidationResultDialog;
