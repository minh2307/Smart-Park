import React from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { RideCategory } from '../types';
import { mockRides } from '../../ride/services/rideApi';
import { StatusChip } from '../../ride/components/StatusChip';
import { MdInfo, MdOutlineSettingsInputComponent, MdCalendarToday, MdCategory } from 'react-icons/md';

interface RideCategoryDetailsProps {
  category: RideCategory;
}

export const RideCategoryDetails: React.FC<RideCategoryDetailsProps> = ({ category }) => {
  // Find linked rides
  const assignedRides = mockRides.filter((r) => r.rideCategoryId === category.id);
  const operatingCount = assignedRides.filter((r) => r.status === 'OPERATING').length;
  const maintenanceCount = assignedRides.filter((r) => r.status === 'MAINTENANCE').length;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'action.hover' }}>
        <Box p={2} bgcolor="primary.main" sx={{ color: 'primary.contrastText', borderRadius: 3, display: 'flex' }}>
          <MdCategory size={28} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {category.name}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }} color="text.secondary">
            ID: {category.code}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <MdInfo color="primary" /> General Information
              </Typography>
              <Divider />
              <Box display="flex" flexDirection="column" gap={1.5} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2" color="text.primary">
                    {category.description || 'No description provided.'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={category.status}
                      size="small"
                      color={category.status === 'ACTIVE' ? 'success' : 'default'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <MdOutlineSettingsInputComponent color="primary" /> Statistics & Metrics
              </Typography>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Box textAlign="center" p={1.5} bgcolor="action.hover" sx={{ borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Rides</Typography>
                    <Typography variant="h6" fontWeight="bold">{assignedRides.length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center" p={1.5} bgcolor="success.light" sx={{ borderRadius: 2, color: 'success.contrastText' }}>
                    <Typography variant="caption" color="text.secondary">Operating</Typography>
                    <Typography variant="h6" fontWeight="bold">{operatingCount}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center" p={1.5} bgcolor="warning.light" sx={{ borderRadius: 2, color: 'warning.contrastText' }}>
                    <Typography variant="caption" color="text.secondary">Service</Typography>
                    <Typography variant="h6" fontWeight="bold">{maintenanceCount}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Assigned Rides ({assignedRides.length})
              </Typography>
              <Divider />
              <List sx={{ p: 0 }}>
                {assignedRides.map((ride) => (
                  <React.Fragment key={ride.id}>
                    <ListItem sx={{ px: 0, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ListItemText
                        primary={ride.name}
                        secondary={`${ride.venueName} | Code: ${ride.code}`}
                        primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          Queue: {ride.queueTimeMinutes} min
                        </Typography>
                        <StatusChip status={ride.status} />
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {assignedRides.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No rides currently associated with this category.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" p={2} bgcolor="action.selected" sx={{ borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <MdCalendarToday size={14} /> Created: {new Date(category.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <MdCalendarToday size={14} /> Last Updated: {new Date(category.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
