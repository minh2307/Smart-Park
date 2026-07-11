import React from 'react';
import { StatusDialog } from '../../../components/common/Dialog';

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  username,
}) => {
  return (
    <StatusDialog
      open={open}
      onClose={onClose}
      type="error"
      title="Delete User"
      message={`Are you sure you want to delete user "${username}"? This action cannot be undone.`}
      onConfirm={onConfirm}
      confirmText="Delete"
    />
  );
};
