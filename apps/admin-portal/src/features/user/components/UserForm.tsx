import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Grid } from '@mui/material';
import { TextField, PasswordField, Select } from '../../../components/common/Form';
import { Button } from '../../../components/common/Button';
import { userCreateSchema, userUpdateSchema } from '../schemas/userSchema';
import { User } from '../types';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, loading = false }) => {
  const isEdit = !!initialData;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? userUpdateSchema : userCreateSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          username: initialData.username,
          email: initialData.email,
          phone: initialData.phone,
          role: initialData.role,
          status: initialData.status,
          password: '',
        }
      : {
          fullName: '',
          username: '',
          email: '',
          phone: '',
          role: 'NHAN_VIEN',
          status: 'ACTIVE',
          password: '',
        },
  });

  const selectedRole = watch('role');
  const selectedStatus = watch('status');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Họ và tên"
            error={!!errors.fullName}
            helperText={errors.fullName?.message as string}
            {...register('fullName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tên đăng nhập"
            error={!!errors.username}
            helperText={errors.username?.message as string}
            {...register('username')}
            disabled={isEdit}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Địa chỉ Email"
            error={!!errors.email}
            helperText={errors.email?.message as string}
            {...register('email')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Số điện thoại"
            error={!!errors.phone}
            helperText={errors.phone?.message as string}
            {...register('phone')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Select
            label="Vai trò"
            value={selectedRole}
            onChange={(e: any) => setValue('role', e.target.value)}
            error={!!errors.role}
            helperText={errors.role?.message as string}
            options={[
              { value: 'ADMIN', label: 'Quản trị viên (ADMIN)' },
              { value: 'NHAN_VIEN', label: 'Nhân viên (NHÂN VIÊN)' },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Select
            label="Trạng thái"
            value={selectedStatus}
            onChange={(e: any) => setValue('status', e.target.value)}
            error={!!errors.status}
            helperText={errors.status?.message as string}
            options={[
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'INACTIVE', label: 'Ngưng hoạt động' },
              { value: 'LOCKED', label: 'Bị khóa' },
              { value: 'SUSPENDED', label: 'Tạm đình chỉ' },
            ]}
          />
        </Grid>
        {!isEdit && (
          <Grid item xs={12}>
            <PasswordField
              label="Mật khẩu"
              error={!!errors.password}
              helperText={errors.password?.message as string}
              {...register('password')}
            />
          </Grid>
        )}
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button type="submit" variant="contained" loading={loading}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo người dùng'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
