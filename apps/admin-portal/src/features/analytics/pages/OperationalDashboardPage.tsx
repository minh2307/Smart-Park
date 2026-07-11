/**
 * Operational Dashboard Page - MODULE 11
 * Real-time monitoring of gates, rides, lockers, scanners, incidents, maintenance, and weather impacts
 */
import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import { useGetOperationalDashboardQuery } from '../services/analyticsApi';
import { DashboardCard } from '../components/shared/DashboardCard';
import { StatusChip } from '../components/shared/StatusChip';
import { MdRefresh, MdWarning, MdCloud } from 'react-icons/md';

export const OperationalDashboardPage: React.FC = () => {
  const { data: opData, refetch } = useGetOperationalDashboardQuery(undefined, {
    // Enable auto-refetch every 10 seconds to simulate real-time operations
    pollingInterval: 10000,
  });

  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);

  const handleSimulateIncident = () => {
    setSimulationAlert('Simulation triggered: Auto-diagnostic sensor alert dispatched to Thunder Coaster engineering crew.');
    setTimeout(() => {
      setSimulationAlert(null);
    }, 5000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Operations Pulsar Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time status monitoring, gate validation flow, scanner heartbeats, active incidents, and weather impact
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSimulateIncident}
            color="warning"
            startIcon={<MdWarning />}
          >
            Simulate Device Ping
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => refetch()}
            startIcon={<MdRefresh />}
          >
            Refetch Status
          </Button>
        </Box>
      </Box>

      {simulationAlert && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} variant="filled">
          {simulationAlert}
        </Alert>
      )}

      {/* Main Operational Summary metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Active Incidents
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {opData?.incidents.filter((i) => i.status !== 'resolved').length || 0} Open
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resolved today: {opData?.incidents.filter((i) => i.status === 'resolved').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Smart Lockers Capacity
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {opData?.lockerStatus.inUse || 0} / {opData?.lockerStatus.totalLockers || 0}
              </Typography>
              <Typography variant="caption" color="success.main">
                Available: {opData?.lockerStatus.available || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Support Desk Tickets
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>
                {opData?.supportTickets.open || 0} Open
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resolution average: {opData?.supportTickets.averageResolutionHours || 0}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Weather Impact Index
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdCloud size={24} /> {opData?.weatherImpact.currentTemp}°C
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                Forecast: {opData?.weatherImpact.condition} ({opData?.weatherImpact.visitorImpact} effect)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Devices and Incidents */}
      <Grid container spacing={2.5}>
        {/* Ride Status List */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Rides Telemetry Heartbeat" subtitle="Real-time occupancy levels, queue wait times, and mechanical status">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ride Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity Load</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Wait Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.rideStatus.map((ride) => (
                    <TableRow key={ride.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{ride.name}</TableCell>
                      <TableCell>{ride.currentLoad} / {ride.maxCapacity} ({((ride.currentLoad / (ride.maxCapacity || 1)) * 100).toFixed(0)}%)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: ride.waitTimeMinutes > 20 ? 'error.main' : 'text.primary' }}>
                        {ride.waitTimeMinutes} min
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={ride.status}
                          status={ride.status === 'active' ? 'active' : ride.status === 'maintenance' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Access Gates Status */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Entrance Checkpoints Telemetry" subtitle="Live scanner state, daily checks completed, and last activity timestamps">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Gate ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Validation Count</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Checkin</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.gateStatus.map((gate) => (
                    <TableRow key={gate.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{gate.name}</TableCell>
                      <TableCell>{gate.scansToday.toLocaleString()} checkins</TableCell>
                      <TableCell>{new Date(gate.lastScan).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={gate.status}
                          status={gate.status === 'open' ? 'active' : gate.status === 'maintenance' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Operational Staff Shift status */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="On-duty Operators" subtitle="Security and crew shift tracking">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Operator</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Assigned Area</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Shift</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.operatorStatus.map((op) => (
                    <TableRow key={op.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{op.fullName}</TableCell>
                      <TableCell>{op.assignedArea}</TableCell>
                      <TableCell>{op.shiftStart} - {op.shiftEnd}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={op.status}
                          status={op.status === 'active' ? 'active' : op.status === 'break' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Active Incident Feed */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="Active Incident Feed" subtitle="Logged anomalies, hazards, and customer care alerts">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Incident Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.incidents.map((inc) => (
                    <TableRow key={inc.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{inc.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{inc.location} • {new Date(inc.reportedAt).toLocaleTimeString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: inc.severity === 'critical' || inc.severity === 'high' ? 'error.main' : 'warning.main',
                            textTransform: 'uppercase',
                          }}
                        >
                          {inc.severity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={inc.status}
                          status={inc.status === 'resolved' ? 'active' : inc.status === 'investigating' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Scheduled Maintenance list */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="Safety Maintenance queue" subtitle="Routine repairs and audits">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.maintenanceItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.targetName}</Typography>
                        <Typography variant="caption" color="text.secondary">Assigned: {item.assignedTo}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: item.priority === 'high' ? 'error.main' : 'text.secondary',
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.priority}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={item.status.replace('_', ' ')}
                          status={item.status === 'completed' ? 'active' : item.status === 'in_progress' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
