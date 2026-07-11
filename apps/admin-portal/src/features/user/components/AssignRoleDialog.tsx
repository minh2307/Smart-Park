import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Dialog';
import { Select } from '../../../components/common/Form';
import { Button } from '../../../components/common/Button';
import { Box, Typography } from '@mui/material';
import { UserRole } from '../types';

interface AssignRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => void;
  currentRole: UserRole;
  username: string;
  loading?: boolean;
}

export const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentRole,
  username,
  loading = false,
}) => {
  const [role, setRole] = useState<UserRole>(currentRole);

  useEffect(() => {
    setRole(currentRole);
  }, [currentRole, open]);

  const handleConfirm = () => {
    onConfirm(role);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Role"
      actions={
        <Box display="flex" gap={1.5} justifyContent="flex-end" width="100%">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            loading={loading}
          >
            Save Changes
          </Button>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <Typography variant="body2" color="text.secondary">
          Update system role for account <strong>{username}</strong>.
        </Typography>
        <Select
          label="Select Role"
          value={role}
          onChange={(e: any) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'ADMIN', label: 'Administrator (ADMIN)' },
            { value: 'NHAN_VIEN', label: 'Staff (NHAN_VIEN)' },
          ]}
        />
      </Box>
    </Modal>
  );
};
