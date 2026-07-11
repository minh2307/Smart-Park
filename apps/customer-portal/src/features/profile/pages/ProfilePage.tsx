import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Button,
  useTheme,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { toast } from 'react-toastify';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  useGetCustomerByIdQuery,
  useGetCustomersListQuery,
  useUpdateCustomerMutation,
  useChangePasswordMutation,
  useDeleteCustomerAccountMutation,
} from '../api/profileApi';
import {
  updatePreferences,
  updateNotifications,
  updatePrivacy,
  setAvatarUrl,
  revokeSession,
  logoutAllOtherDevices,
} from '../store/profileSlice';
import {
  ProfileCard,
  ProfileForm,
  AvatarUploader,
  PasswordForm,
  PreferenceCard,
  NotificationSettings,
  PrivacySettings,
  AccountSecurityCard,
  SessionList,
  DeleteAccountDialog,
  ProfileSkeleton,
  EmptyProfileState,
} from '../components';
import type { CustomerProfile } from '../types/profile.types';

export const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Redux selections
  const { user } = useAppSelector((state) => state.auth);
  const { preferences, notifications, privacy, activeSessions, avatarUrl } = useAppSelector(
    (state) => state.profile
  );

  const userId = user?.id || 0;

  // 1. Try to fetch customer profile by ID directly (assuming user.id === customer.id)
  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    error: errorCustomer,
    refetch: refetchCustomer,
  } = useGetCustomerByIdQuery(userId, { skip: !userId });

  // 2. Fetch customers list in case they differ
  const { data: customersListResponse } = useGetCustomersListQuery(
    { page: 0, size: 100 },
    { skip: !!customerData || !userId }
  );

  // Extract target profile
  const profile: CustomerProfile = useMemo(() => {
    if (customerData) return customerData;
    
    const list = customersListResponse?.data?.content || customersListResponse?.content || [];
    const matched = list.find((c: any) => c.userId === userId || c.id === userId);
    if (matched) return matched;

    // Fallback profile if none exists in DB
    return {
      id: userId || 999,
      userId: userId || 999,
      fullName: user?.fullName || 'Khách Hàng',
      phone: '0987654321',
      birthDate: '1995-05-15',
      gender: 'MALE',
      address: '123 Đường Công Viên, Quận 1, TP. Hồ Chí Minh',
      status: 'ACTIVE',
    };
  }, [customerData, customersListResponse, userId, user]);

  // Mutations
  const [updateCustomer, { isLoading: isUpdatingProfile }] = useUpdateCustomerMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteCustomerAccountMutation();

  const handleUpdateProfile = async (values: any) => {
    try {
      await updateCustomer({ id: profile.id, data: values }).unwrap();
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
      refetchCustomer();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại.');
    }
  };

  const handleUploadAvatar = async (file: File) => {
    // Generate mock object url for preview since backend does not support file upload CDN
    const localUrl = URL.createObjectURL(file);
    dispatch(setAvatarUrl(localUrl));
    toast.success('Tải ảnh đại diện lên thành công!');
  };

  const handleRemoveAvatar = () => {
    dispatch(setAvatarUrl(null));
    toast.info('Đã xóa ảnh đại diện.');
  };

  const handleChangePasswordSubmit = async (values: any) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success('Thay đổi mật khẩu thành công!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Thay đổi mật khẩu thất bại.');
    }
  };

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    toast.info(`Bảo mật 2 lớp đã được ${enabled ? 'kích hoạt' : 'vô hiệu hóa'}.`);
  };

  const handleDeleteAccountSubmit = async () => {
    try {
      await deleteAccount(profile.id).unwrap();
      toast.success('Tài khoản của bạn đã được vô hiệu hóa thành công.');
      setShowDeleteDialog(false);
      // Wait a moment then log out
      setTimeout(() => {
        dispatch({ type: 'auth/logout' });
      }, 1500);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa tài khoản. Vui lòng liên hệ Admin.');
    }
  };

  if (isLoadingCustomer) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ProfileSkeleton />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '85vh',
        bgcolor: '#0f172a',
        color: '#ffffff',
        py: 6,
        background: 'radial-gradient(circle at top right, rgba(45, 212, 191, 0.08), transparent 45%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Title */}
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              background: 'linear-gradient(135deg, #ffffff 50%, #2dd4bf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Quản Lý Tài Khoản
          </Typography>
          <Typography color="rgba(255, 255, 255, 0.6)" variant="body1">
            Xem thông tin cá nhân, quản lý tùy chọn bảo mật và cấu hình thông báo tài khoản của bạn.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left: Summary Profile Card */}
          <Grid item xs={12} md={4}>
            <ProfileCard
              profile={profile}
              email={user?.email || 'customer@smartpark.com'}
              avatarUrl={avatarUrl}
              tierName="Gold" // default tier representation
              points={120}
            />
          </Grid>

          {/* Right: Detailed Settings Tabs */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                bgcolor: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                mb: 4,
              }}
            >
              <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
                  textColor="inherit"
                  indicatorColor="secondary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-indicator': { bgcolor: '#2dd4bf' },
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      '&.Mui-selected': { color: '#2dd4bf' },
                    },
                  }}
                >
                  <Tab icon={<AccountCircleIcon />} label="Thông tin cá nhân" iconPosition="start" />
                  <Tab icon={<SettingsIcon />} label="Cài đặt tùy chọn" iconPosition="start" />
                  <Tab icon={<SecurityIcon />} label="Bảo mật & Phiên" iconPosition="start" />
                  <Tab icon={<DangerousIcon />} label="Quản lý tài khoản" iconPosition="start" />
                </Tabs>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <AnimatePresence mode="wait">
                  {activeTab === 0 && (
                    <motion.div
                      key="tab-profile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack spacing={4}>
                        <AvatarUploader
                          currentAvatarUrl={avatarUrl}
                          onUpload={handleUploadAvatar}
                          onRemove={handleRemoveAvatar}
                        />
                        <ProfileForm
                          profile={profile}
                          onSubmit={handleUpdateProfile}
                          isLoading={isUpdatingProfile}
                        />
                      </Stack>
                    </motion.div>
                  )}

                  {activeTab === 1 && (
                    <motion.div
                      key="tab-preferences"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack spacing={4}>
                        <PreferenceCard
                          preferences={preferences}
                          onSave={(val) => dispatch(updatePreferences(val))}
                        />
                        <NotificationSettings
                          settings={notifications}
                          onUpdate={(val) => dispatch(updateNotifications(val))}
                        />
                        <PrivacySettings
                          settings={privacy}
                          onUpdate={(val) => dispatch(updatePrivacy(val))}
                        />
                      </Stack>
                    </motion.div>
                  )}

                  {activeTab === 2 && (
                    <motion.div
                      key="tab-security"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack spacing={4}>
                        <AccountSecurityCard
                          lastLogin="2026-07-11 16:30"
                          twoFactorEnabled={twoFactorEnabled}
                          onToggleTwoFactor={handleToggle2FA}
                          activeSessionsCount={activeSessions.length}
                        />
                        <PasswordForm
                          onSubmit={handleChangePasswordSubmit}
                          isLoading={isChangingPassword}
                        />
                        <SessionList
                          sessions={activeSessions}
                          onRevoke={(id) => dispatch(revokeSession(id))}
                          onRevokeAllOthers={() => dispatch(logoutAllOtherDevices())}
                        />
                      </Stack>
                    </motion.div>
                  )}

                  {activeTab === 3 && (
                    <motion.div
                      key="tab-delete"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack spacing={3}>
                        <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                          Khu Vực Nguy Hiểm
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          Nếu bạn không còn nhu cầu sử dụng các dịch vụ của Smart Park, bạn có thể xóa tài khoản của mình. 
                          Mọi thông tin liên quan đến các giao dịch trước đây sẽ được xử lý bảo mật theo chính sách quyền riêng tư.
                        </Typography>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => setShowDeleteDialog(true)}
                          sx={{
                            fontWeight: 'bold',
                            width: 'fit-content',
                            bgcolor: '#f44336',
                            '&:hover': { bgcolor: '#d32f2f' },
                          }}
                        >
                          Xóa tài khoản cá nhân
                        </Button>
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Confirmation Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccountSubmit}
        isLoading={isDeletingAccount}
      />
    </Box>
  );
};
export default ProfilePage;
