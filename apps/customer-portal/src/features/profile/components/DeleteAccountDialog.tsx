import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [checked, setChecked] = useState(false);

  const handleConfirm = async () => {
    if (checked) {
      await onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#1e293b',
          color: '#ffffff',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WarningAmberIcon sx={{ color: '#f44336', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
          Yêu Cầu Xóa Tài Khoản
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5}>
          <Alert severity="error" sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>
            Hành động này không thể hoàn tác. Mọi thông tin thẻ thành viên, điểm thưởng, voucher và lịch sử vé của bạn sẽ bị hủy bỏ vĩnh viễn.
          </Alert>

          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Bằng việc nhấn xác nhận bên dưới, bạn đồng ý với các điều khoản:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Tài khoản của bạn sẽ bị khóa và ngừng hoạt động ngay lập tức.</li>
              <li>Mọi điểm tích lũy chưa quy đổi sẽ bị thu hồi.</li>
              <li>Các vé và hóa đơn mua sắm trong quá khứ sẽ không được hỗ trợ bảo lưu.</li>
            </ul>
          </DialogContentText>

          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-checked': { color: '#f44336' } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Tôi đã đọc kỹ và đồng ý với các điều khoản xóa tài khoản nêu trên.
              </Typography>
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Hủy bỏ
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={!checked || isLoading}
          sx={{
            bgcolor: '#f44336',
            fontWeight: 'bold',
            borderRadius: 2,
            px: 3,
            '&:hover': { bgcolor: '#d32f2f' },
          }}
        >
          {isLoading ? 'Đang thực hiện...' : 'Xác nhận xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteAccountDialog;
