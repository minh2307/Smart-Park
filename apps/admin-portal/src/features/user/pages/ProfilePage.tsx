import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Alert,
  Snackbar,
} from '@mui/material';
import { MdPerson, MdLock, MdSave } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { setCredentials } from '../../auth/store/authSlice';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../auth/services/authApi';
import { PageContainer } from '../../../layouts/components/PageContainer';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [activeTab, setActiveTab] = useState(0);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Alert & Toast Notification State
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || '');
      setEmail(authUser.email || '');
      setPhone(authUser.phone || '');
      setAvatarUrl(authUser.avatarUrl || '');
    }
  }, [authUser]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFormErrors({});
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Họ và tên không được để trống';
    if (!email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email không đúng định dạng';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const updatedUser = await updateProfile({
        fullName,
        email,
        phone,
        avatarUrl,
      }).unwrap();

      dispatch(setCredentials({ user: updatedUser, accessToken: accessToken || '' }));
      setNotification({
        open: true,
        message: 'Cập nhật thông tin cá nhân thành công!',
        severity: 'success',
      });
      setFormErrors({});
    } catch (err: any) {
      setNotification({
        open: true,
        message: err?.data?.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.',
        severity: 'error',
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Mật khẩu hiện tại không được để trống';
    if (!newPassword) {
      errors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu mới không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      setNotification({
        open: true,
        message: 'Đổi mật khẩu thành công!',
        severity: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormErrors({});
    } catch (err: any) {
      setNotification({
        open: true,
        message: err?.data?.message || 'Đổi mật khẩu thất bại. Mật khẩu hiện tại không chính xác.',
        severity: 'error',
      });
    }
  };

  // Preset Avatars for custom selection
  const presets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
  ];

  return (
    <PageContainer title="Thiết Lập Tài Khoản">
      <Grid container spacing={3}>
        {/* Left Column - Card Overview & Avatar */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <Box position="relative" display="inline-block" mx="auto" mb={2}>
                <Avatar
                  src={avatarUrl || authUser?.avatarUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    fontWeight: 700,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                  }}
                >
                  {authUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Box>

              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                {authUser?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                @{authUser?.username}
              </Typography>

              <Box display="inline-block" px={1.5} py={0.5} borderRadius={2} bgcolor="primary.light" sx={{ opacity: 0.9, mb: 3 }}>
                <Typography variant="caption" color="primary.contrastText" fontWeight={600}>
                  {({
                    SYSTEM_ADMIN: 'Quản trị hệ thống',
                    PARK_MANAGER: 'Quản lý công viên',
                    SALES_STAFF: 'Nhân viên bán hàng',
                    OPERATIONS_STAFF: 'Nhân viên vận hành',
                  })[authUser?.role as string] || authUser?.role}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" fontWeight={600} align="left" gutterBottom>
                Chọn ảnh đại diện có sẵn:
              </Typography>
              <Box display="flex" justifyContent="center" gap={1.5} flexWrap="wrap">
                {presets.map((p, idx) => (
                  <Avatar
                    key={idx}
                    src={p}
                    onClick={() => setAvatarUrl(p)}
                    sx={{
                      width: 44,
                      height: 44,
                      cursor: 'pointer',
                      border: avatarUrl === p ? '3px solid #1976d2' : '1px solid #ccc',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Forms Tabs */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="Thông tin cá nhân" icon={<MdPerson size={20} />} iconPosition="start" />
                <Tab label="Bảo mật & Đổi mật khẩu" icon={<MdLock size={20} />} iconPosition="start" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box component="form" onSubmit={handleProfileSubmit} noValidate>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        error={!!formErrors.fullName}
                        helperText={formErrors.fullName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tên đăng nhập (Username)"
                        value={authUser?.username || ''}
                        disabled
                        helperText="Tên đăng nhập không thể thay đổi"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Địa chỉ Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<MdSave />}
                        loading={isUpdatingProfile}
                        sx={{ borderRadius: 2, px: 4, py: 1.2 }}
                      >
                        Lưu Thay Đổi
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeTab === 1 && (
                <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        error={!!formErrors.currentPassword}
                        helperText={formErrors.currentPassword}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={!!formErrors.newPassword}
                        helperText={formErrors.newPassword}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                      />
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        loading={isChangingPassword}
                        sx={{ borderRadius: 2, px: 4, py: 1.2 }}
                      >
                        Đổi Mật Khẩu
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
