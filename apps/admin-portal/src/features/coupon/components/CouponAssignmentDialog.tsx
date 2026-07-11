import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
} from '@mui/material';

interface CouponAssignmentDialogProps {
  open: boolean;
  couponCode: string;
  onClose: () => void;
  onAssign: (selectedCustomers: string[]) => void;
  loading?: boolean;
}

export const CouponAssignmentDialog: React.FC<CouponAssignmentDialogProps> = ({
  open,
  couponCode,
  onClose,
  onAssign,
  loading = false,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  // Mock list of customers
  const customerOptions = [
    'Emily Davis',
    'Liam Nguyen',
    'Sophia Martinez',
    'Marcus Aurelius',
    'Jane Doe',
    'John Smith',
    'Alex Johnson',
  ];

  const handleSubmit = () => {
    onAssign(selected);
    setSelected([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Gan ma Coupon: {couponCode}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Chon cac khach hang hoac hang thanh vien de gui ma coupon nay.
          </Typography>
          <Autocomplete
            multiple
            options={customerOptions}
            value={selected}
            onChange={(_e, val) => setSelected(val)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} size="small" />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Danh sach khach hang *"
                placeholder="Chon khach hang"
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Huy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || selected.length === 0}
        >
          Xac nhan gui
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CouponAssignmentDialog;
