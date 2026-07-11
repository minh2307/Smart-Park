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
            Account Details
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
                Phone Number
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Role
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.role}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(user.createdDate).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          
          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Permissions
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
                  No explicit permissions assigned. Inherited from role {user.role}.
                </Typography>
              )}
            </Box>
          </Box>

          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity & Login History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem disableGutters>
                <ListItemText
                  primary="Successful Login"
                  secondary="Browser: Chrome (Linux) | IP: 192.168.1.15 | Time: Just now"
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Profile Updated"
                  secondary="Updated profile photo | Time: 2 hours ago"
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
