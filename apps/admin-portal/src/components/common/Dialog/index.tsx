import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import { MdInfo, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';

// 1. Generic Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, actions, maxWidth = 'sm' }) => {
  return (
    <MuiDialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      {title && <DialogTitle fontWeight="bold">{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </MuiDialog>
  );
};

// 2. Alert/Status Dialog (Confirm, Delete, Warning, Success, Error)
interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}
export const StatusDialog: React.FC<StatusDialogProps> = ({
  open,
  onClose,
  type,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
}) => {
  const iconMap = {
    success: <MdCheckCircle size={48} color="#2e7d32" />,
    warning: <MdWarning size={48} color="#ed6c02" />,
    error: <MdError size={48} color="#d32f2f" />,
    info: <MdInfo size={48} color="#0288d1" />,
  };

  return (
    <MuiDialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 4, pb: 2 }}>
        {iconMap[type]}
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {onConfirm ? (
          <>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              color={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              sx={{ ml: 1.5 }}
            >
              {confirmText}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={onClose}>{confirmText}</Button>
        )}
      </DialogActions>
    </MuiDialog>
  );
};
