import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Select } from '../../../components/common/Form';
import { Button } from '../../../components/common/Button';
import { MdRefresh } from 'react-icons/md';
import { UserRole, UserStatus } from '../types';

interface UserFilterPanelProps {
  role: UserRole | '';
  status: UserStatus | '';
  onRoleChange: (role: UserRole | '') => void;
  onStatusChange: (status: UserStatus | '') => void;
  onReset: () => void;
  onRefresh: () => void;
}

export const UserFilterPanel: React.FC<UserFilterPanelProps> = ({
  role,
  status,
  onRoleChange,
  onStatusChange,
  onReset,
  onRefresh,
}) => {
  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <Box width={160}>
        <Select
          label="Vai trò"
          value={role}
          onChange={(e: any) => onRoleChange(e.target.value as UserRole | '')}
          options={[
            { value: '', label: 'Tất cả vai trò' },
            { value: 'ADMIN', label: 'Quản trị viên' },
            { value: 'NHAN_VIEN', label: 'Nhân viên' },
          ]}
        />
      </Box>
      <Box width={160}>
        <Select
          label="Trạng thái"
          value={status}
          onChange={(e: any) => onStatusChange(e.target.value as UserStatus | '')}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'INACTIVE', label: 'Ngưng hoạt động' },
            { value: 'LOCKED', label: 'Bị khóa' },
            { value: 'SUSPENDED', label: 'Tạm đình chỉ' },
          ]}
        />
      </Box>
      <Button variant="outlined" onClick={onReset}>
        Đặt lại
      </Button>
      <IconButton onClick={onRefresh} color="primary" title="Làm mới">
        <MdRefresh size={22} />
      </IconButton>
    </Box>
  );
};
