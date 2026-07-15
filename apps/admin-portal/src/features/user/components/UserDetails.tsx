import React from 'react';
import { Box, Grid, Typography, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';
import { UserAvatar } from './UserAvatar';
import { UserStatusChip } from './UserStatusChip';
import { User } from '../types';

interface UserDetailsProps {
  user: User;
}

export const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRadius: 2 }}>
          <UserAvatar username={user.username} fullName={user.fullName} avatarUrl={user.avatarUrl} size={100} />
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
            {user.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            @{user.username}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <UserStatusChip status={user.status} />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Thông tin tài khoản
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Email
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Số điện thoại
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Vai trò
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {({
  SYSTEM_ADMIN: 'Quản trị hệ thống',
  PARK_MANAGER: 'Quản lý công viên',
  SALES_STAFF: 'Nhân viên bán hàng',
  OPERATIONS_STAFF: 'Nhân viên vận hành',
})[user.role] || user.role}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Ngày tạo
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(user.createdDate).toLocaleString('vi-VN')}
              </Typography>
            </Grid>
          </Grid>
          
          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quyền hạn
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" gap={1} flexWrap="wrap">
              {user.permissions && user.permissions.length > 0 ? (
                user.permissions.map((perm) => (
                  <Paper key={perm} variant="outlined" sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight="bold">{perm}</Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa được gán quyền cụ thể nào. Thừa hưởng từ vai trò {({
  SYSTEM_ADMIN: 'Quản trị hệ thống',
  PARK_MANAGER: 'Quản lý công viên',
  SALES_STAFF: 'Nhân viên bán hàng',
  OPERATIONS_STAFF: 'Nhân viên vận hành',
})[user.role] || user.role}.
                </Typography>
              )}
            </Box>
          </Box>

          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Hoạt động gần đây & Lịch sử đăng nhập
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem disableGutters>
                <ListItemText
                  primary="Đăng nhập thành công"
                  secondary="Trình duyệt: Chrome (Linux) | IP: 192.168.1.15 | Thời gian: Vừa xong"
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Cập nhật hồ sơ"
                  secondary="Đã cập nhật ảnh đại diện | Thời gian: 2 giờ trước"
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
