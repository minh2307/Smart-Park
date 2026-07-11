import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Ride } from '../types';
import { StatusChip } from './StatusChip';
import { QueueIndicator } from './QueueIndicator';
import { RideRestrictionCard } from './RideRestrictionCard';
import { MaintenanceTimeline } from './MaintenanceTimeline';
import { RideImageGallery } from './RideImageGallery';
import { mockRideSchedules, mockRideMaintenances } from '../services/rideApi';
import {
  MdInfo,
  MdImage,
  MdShield,
  MdBuild,
  MdCalendarToday,
  MdAccessTime,
  MdStar,
} from 'react-icons/md';

interface RideDetailsProps {
  ride: Ride;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ride-tabpanel-${index}`}
      aria-labelledby={`ride-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const RideDetails: React.FC<RideDetailsProps> = ({ ride }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Find schedules and maintenances
  const schedules = mockRideSchedules[ride.id] || [];
  const maintenances = mockRideMaintenances[ride.id] || [];

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      {/* Hero header */}
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          backgroundImage: ride.coverImage
            ? `linear-gradient(to right, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.3)), url(${ride.coverImage})`
            : 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          boxShadow: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {ride.name}
            </Typography>
            <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                CODE: {ride.code}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography variant="caption">{ride.categoryName}</Typography>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography variant="caption">{ride.venueName} — {ride.zoneName}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
            <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} gap={1}>
              <StatusChip status={ride.status} />
              <QueueIndicator minutes={ride.queueTimeMinutes} status={ride.status} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="ride info tabs">
          <Tab icon={<MdInfo />} iconPosition="start" label="Attraction Specs" />
          <Tab icon={<MdShield />} iconPosition="start" label="Safety & Exclusions" />
          <Tab icon={<MdImage />} iconPosition="start" label="Media Gallery" />
          <Tab icon={<MdBuild />} iconPosition="start" label="Tech Logs & Staffing" />
        </Tabs>
      </Box>

      {/* Spec tab panel */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Attraction Overview & Description
                </Typography>
                <Divider />
                <Typography variant="body2" color="text.primary" sx={{ mt: 1, lineHeight: 1.6 }}>
                  {ride.description || 'No description written for this attraction.'}
                </Typography>

                <Box sx={{ mt: 3, display: 'flex', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">HOURLY CAPACITY</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ride.capacity.toLocaleString()} guests/hr
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">CYCLE DURATION</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {ride.durationSeconds ? `${Math.floor(ride.durationSeconds / 60)}m ${ride.durationSeconds % 60}s` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Operational Details
                </Typography>
                <Divider />
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Operating Hours"
                      secondary={`${ride.operatingHours.open} - ${ride.operatingHours.close}`}
                    />
                    <MdAccessTime size={20} color="action" />
                  </ListItem>
                  <Divider />
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Popularity Rating"
                      secondary={`${ride.popularityScore} / 100`}
                    />
                    <MdStar size={20} color="#ffb300" />
                  </ListItem>
                  <Divider />
                  {ride.revenueContribution && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText
                        primary="Monthly Revenue Contribution"
                        secondary={`$${ride.revenueContribution.toLocaleString()}`}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Restrictions panel */}
      <TabPanel value={tabValue} index={1}>
        <RideRestrictionCard restrictions={ride.restrictions} />
      </TabPanel>

      {/* Gallery panel */}
      <TabPanel value={tabValue} index={2}>
        <RideImageGallery images={ride.images} coverImage={ride.coverImage} />
      </TabPanel>

      {/* Tech logs panel */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <MdBuild color="primary" /> Maintenance logs & inspection history
                </Typography>
                <Divider />
                <Box sx={{ mt: 1 }}>
                  <MaintenanceTimeline logs={maintenances} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <MdCalendarToday color="primary" /> Operator Shifts & Schedules
                </Typography>
                <Divider />
                <List sx={{ p: 0 }}>
                  {schedules.map((sch) => (
                    <React.Fragment key={sch.id}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemText
                          primary={sch.operatorName}
                          secondary={`Date: ${sch.shiftDate} | Shift: ${sch.startTime} - ${sch.endTime}`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                        />
                        <Chip
                          label={sch.status}
                          size="small"
                          color={sch.status === 'ACTIVE' ? 'success' : 'default'}
                          sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  {schedules.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No staff shifts scheduled for today.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};
