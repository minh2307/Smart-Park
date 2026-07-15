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
      title="Phân quyền người dùng"
      actions={
        <Box display="flex" gap={1.5} justifyContent="flex-end" width="100%">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            loading={loading}
          >
            Lưu thay đổi
          </Button>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <Typography variant="body2" color="text.secondary">
          Cập nhật vai trò hệ thống cho tài khoản <strong>{username}</strong>.
        </Typography>
        <Select
          label="Chọn vai trò"
          value={role}
          onChange={(e: any) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'SYSTEM_ADMIN', label: 'Quản trị hệ thống' },
            { value: 'PARK_MANAGER', label: 'Quản lý công viên' },
            { value: 'SALES_STAFF', label: 'Nhân viên bán hàng' },
            { value: 'OPERATIONS_STAFF', label: 'Nhân viên vận hành' },
            { value: 'NHAN_VIEN', label: 'Nhân viên (NHÂN VIÊN)' },
          ]}
        />
      </Box>
    </Modal>
  );
};
