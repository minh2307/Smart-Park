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
      title="Delete Venue"
      message={`Are you sure you want to delete venue "${venueName}"? This action cannot be undone.`}
      onConfirm={onConfirm}
      confirmText="Delete"
    />
  );
};
