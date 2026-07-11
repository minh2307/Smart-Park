import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { MdArrowBack } from 'react-icons/md';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { UserDetails } from '../components/UserDetails';
import { Spinner, ErrorMessage } from '../../../components/common/Feedback';
import { useGetUserByIdQuery } from '../services/userApi';
import { User } from '../types';

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const userId = id ? parseInt(id, 10) : NaN;
  const { data: user, isLoading, isError } = useGetUserByIdQuery(userId, {
    skip: isNaN(userId),
  });

  const mockUser: User = {
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
  };

  const handleBack = () => {
    navigate('/users');
  };

  const content = () => {
    if (isLoading) return <Spinner />;
    if (isError || !user) {
      return (
        <Box display="flex" flexDirection="column" gap={2}>
          <ErrorMessage message="Không thể tìm thấy người dùng được yêu cầu trên hệ thống. Đang hiển thị thông tin chi tiết mẫu thay thế." />
          <UserDetails user={mockUser} />
        </Box>
      );
    }
    return <UserDetails user={user} />;
  };

  return (
    <PageContainer
      title="Chi tiết người dùng"
      toolbar={
        <Button startIcon={<MdArrowBack />} onClick={handleBack} variant="outlined">
          Quay lại danh sách
        </Button>
      }
    >
      {content()}
    </PageContainer>
  );
};
