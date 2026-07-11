import React from 'react';
import { StatusDialog } from '../../../components/common/Dialog';

interface DeleteVenueDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  venueName: string;
}

export const DeleteVenueDialog: React.FC<DeleteVenueDialogProps> = ({
  open,
  onClose,
  onConfirm,
  venueName,
}) => {
  return (
    <StatusDialog
      open={open}
      onClose={onClose}
      type="error"
      title="Xóa địa điểm"
      message={`Bạn có chắc chắn muốn xóa địa điểm "${venueName}" không? Hành động này không thể hoàn tác.`}
      onConfirm={onConfirm}
      confirmText="Xóa"
    />
  );
};
