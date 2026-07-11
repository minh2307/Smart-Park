import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface DeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle fontWeight="bold">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="secondary" variant="outlined" disabled={loading}>
          Hủy
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus disabled={loading}>
          Xác nhận xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
};
