import React, { useState } from 'react';
import { Box, Paper, Alert } from '@mui/material';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Dialog';
import { UserTable } from '../components/UserTable';
import { UserFilterPanel } from '../components/UserFilterPanel';
import { UserForm } from '../components/UserForm';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { AssignRoleDialog } from '../components/AssignRoleDialog';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useAssignRolesMutation } from '../services/userApi';
import { User, UserRole, UserStatus } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { MdAdd } from 'react-icons/md';

export const UserListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    size,
    search,
    role,
    status,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [assignRole, { isLoading: isAssigning }] = useAssignRolesMutation();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setPage(0);
  };

  const handleCreateSubmit = async (formData: any) => {
    try {
      await createUser(formData).unwrap();
      setFormOpen(false);
    } catch (err) {
      console.error('Failed to create user', err);
    }
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!selectedUser) return;
    try {
      await updateUser({ id: selectedUser.id, body: formData }).unwrap();
      setFormOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const handleAssignRoleConfirm = async (newRole: UserRole) => {
    if (!selectedUser) return;
    try {
      await assignRole({ id: selectedUser.id, role: newRole }).unwrap();
      setRoleOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to assign role', err);
    }
  };

  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@smartpark.com',
      phone: '0123456789',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdDate: '2026-07-01T08:00:00Z',
      lastUpdated: '2026-07-01T08:00:00Z',
      permissions: ['read:users', 'write:users', 'delete:users'],
    },
    {
      id: 2,
      username: 'nv_son',
      fullName: 'Nguyen Son Minh',
      email: 'son.minh@smartpark.com',
      phone: '0987654321',
      role: 'NHAN_VIEN',
      status: 'ACTIVE',
      createdDate: '2026-07-05T09:30:00Z',
      lastUpdated: '2026-07-05T09:30:00Z',
      permissions: ['read:users'],
    }
  ];

  const displayData = data?.content || (isLoading ? [] : mockUsers);
  const displayTotal = data?.totalElements ?? mockUsers.length;

  return (
    <PageContainer title="User Management">
      <Box display="flex" flexDirection="column" gap={3}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <UserFilterPanel
              role={role}
              status={status}
              onRoleChange={setRole}
              onStatusChange={setStatus}
              onReset={handleResetFilters}
              onRefresh={refetch}
            />
            <PermissionWrapper requiredPermission="write:users">
              <Button
                variant="contained"
                startIcon={<MdAdd />}
                onClick={() => {
                  setSelectedUser(null);
                  setFormOpen(true);
                }}
              >
                Add User
              </Button>
            </PermissionWrapper>
          </Box>
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Failed to connect to backend user API. Displaying mock accounts for demo/fallback purposes.
          </Alert>
        )}

        <UserTable
          data={displayData}
          loading={isLoading}
          page={page}
          rowsPerPage={size}
          totalElements={displayTotal}
          onPageChange={setPage}
          onRowsPerPageChange={setSize}
          onSearchChange={setSearch}
          onEdit={(user) => {
            setSelectedUser(user);
            setFormOpen(true);
          }}
          onDelete={(user) => {
            setSelectedUser(user);
            setDeleteOpen(true);
          }}
          onAssignRole={(user) => {
            setSelectedUser(user);
            setRoleOpen(true);
          }}
        />

        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={selectedUser ? 'Edit User' : 'Create User'}
        >
          <UserForm
            initialData={selectedUser || undefined}
            onSubmit={selectedUser ? handleUpdateSubmit : handleCreateSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        <DeleteUserDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          username={selectedUser?.username || ''}
        />

        <AssignRoleDialog
          open={roleOpen}
          onClose={() => setRoleOpen(false)}
          onConfirm={handleAssignRoleConfirm}
          currentRole={selectedUser?.role || 'NHAN_VIEN'}
          username={selectedUser?.username || ''}
          loading={isAssigning}
        />
      </Box>
    </PageContainer>
  );
};
