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
          label="Role"
          value={role}
          onChange={(e: any) => onRoleChange(e.target.value as UserRole | '')}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'ADMIN', label: 'ADMIN' },
            { value: 'NHAN_VIEN', label: 'NHAN_VIEN' },
          ]}
        />
      </Box>
      <Box width={160}>
        <Select
          label="Status"
          value={status}
          onChange={(e: any) => onStatusChange(e.target.value as UserStatus | '')}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'ACTIVE' },
            { value: 'INACTIVE', label: 'INACTIVE' },
            { value: 'LOCKED', label: 'LOCKED' },
            { value: 'SUSPENDED', label: 'SUSPENDED' },
          ]}
        />
      </Box>
      <Button variant="outlined" onClick={onReset}>
        Reset
      </Button>
      <IconButton onClick={onRefresh} color="primary" title="Refresh List">
        <MdRefresh size={22} />
      </IconButton>
    </Box>
  );
};
