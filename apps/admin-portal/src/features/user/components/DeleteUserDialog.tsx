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
      title="Xóa tài khoản người dùng"
      message={`Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Hành động này không thể hoàn tác.`}
      onConfirm={onConfirm}
      confirmText="Xóa"
    />
  );
};
