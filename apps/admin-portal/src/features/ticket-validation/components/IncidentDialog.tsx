import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

interface IncidentDialogProps {
  open: boolean;
  ticketCode?: string;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    severity: string;
    description: string;
    ticketCode?: string;
  }) => void;
}

export const IncidentDialog: React.FC<IncidentDialogProps> = ({
  open,
  ticketCode = '',
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = React.useState('TICKET_ISSUE');
  const [severity, setSeverity] = React.useState('LOW');
  const [description, setDescription] = React.useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      severity,
      description,
      ticketCode,
    });
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <form onSubmit={handleFormSubmit}>
        <DialogTitle fontWeight="bold">Báo Cáo Sự Cố Ra Vào</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {ticketCode && (
              <Grid item xs={12}>
                <TextField
                  label="Mã Vé Sự Cố"
                  value={ticketCode}
                  fullWidth
                  disabled
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="inc-cat-label">Phân Loại Sự Cố</InputLabel>
                <Select
                  labelId="inc-cat-label"
                  value={category}
                  label="Phân Loại Sự Cố"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="TICKET_ISSUE">Lỗi Đọc Vé / QR</MenuItem>
                  <MenuItem value="HARDWARE_FAILURE">Hỏng Hóc Phần Cứng / Rào chắn</MenuItem>
                  <MenuItem value="CUSTOMER_DISPUTE">Tranh chấp với khách hàng</MenuItem>
                  <MenuItem value="OVERCROWDED">Khu vực quá tải</MenuItem>
                  <MenuItem value="OTHER">Sự cố khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="inc-sev-label">Mức Độ Nghiêm Trọng</InputLabel>
                <Select
                  labelId="inc-sev-label"
                  value={severity}
                  label="Mức Độ Nghiêm Trọng"
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <MenuItem value="LOW">Thấp (LOW)</MenuItem>
                  <MenuItem value="MEDIUM">Trung bình (MEDIUM)</MenuItem>
                  <MenuItem value="HIGH">Cao (HIGH)</MenuItem>
                  <MenuItem value="CRITICAL">Khẩn cấp (CRITICAL)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả chi tiết sự việc"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                placeholder="Ghi chú rõ diễn biến sự cố, phản ứng của thiết bị hoặc yêu cầu của khách hàng..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained" color="error">
            Gửi Báo Cáo
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default IncidentDialog;
