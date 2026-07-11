import React from 'react';
import { Box, IconButton } from '@mui/material';
import { MdEdit, MdDelete, MdVpnKey } from 'react-icons/md';
import { DataTable } from '../../../components/common/DataTable';
import { UserAvatar } from './UserAvatar';
import { UserStatusChip } from './UserStatusChip';
import { User } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface UserTableProps {
  data: User[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAssignRole: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  data,
  loading = false,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  onEdit,
  onDelete,
  onAssignRole,
}) => {
  const columns = [
    {
      id: 'avatar' as any,
      label: 'Avatar',
      render: (row: User) => (
        <UserAvatar username={row.username} fullName={row.fullName} avatarUrl={row.avatarUrl} />
      ),
    },
    {
      id: 'fullName' as any,
      label: 'Full Name',
      sortable: true,
    },
    {
      id: 'username' as any,
      label: 'Username',
      sortable: true,
    },
    {
      id: 'email' as any,
      label: 'Email',
      sortable: true,
    },
    {
      id: 'phone' as any,
      label: 'Phone',
    },
    {
      id: 'role' as any,
      label: 'Role',
      sortable: true,
    },
    {
      id: 'status' as any,
      label: 'Status',
      sortable: true,
      render: (row: User) => <UserStatusChip status={row.status} />,
    },
    {
      id: 'createdDate' as any,
      label: 'Created Date',
      sortable: true,
      render: (row: User) => {
        try {
          return new Date(row.createdDate).toLocaleDateString('en-US');
        } catch {
          return row.createdDate;
        }
      },
    },
    {
      id: 'actions' as any,
      label: 'Actions',
      render: (row: User) => (
        <Box display="flex" gap={1}>
          <PermissionWrapper requiredPermission="write:users">
            <IconButton onClick={() => onEdit(row)} color="primary" size="small" title="Edit User">
              <MdEdit size={18} />
            </IconButton>
          </PermissionWrapper>
          <PermissionWrapper requiredPermission="write:users">
            <IconButton onClick={() => onAssignRole(row)} color="info" size="small" title="Assign Role">
              <MdVpnKey size={18} />
            </IconButton>
          </PermissionWrapper>
          <PermissionWrapper requiredPermission="delete:users">
            <IconButton onClick={() => onDelete(row)} color="error" size="small" title="Delete User">
              <MdDelete size={18} />
            </IconButton>
          </PermissionWrapper>
        </Box>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      totalElements={totalElements}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      onSearchChange={onSearchChange}
    />
  );
};
