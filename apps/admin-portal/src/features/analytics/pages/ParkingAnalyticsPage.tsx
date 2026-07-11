/**
 * Parking Analytics Page - MODULE 7
 * Visualizes parking occupancy, revenues, vehicle profiles, zone utilization, and daily trends
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetParkingAnalyticsQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { FilterPanel } from '../components/shared/FilterPanel';
import { StatusChip } from '../components/shared/StatusChip';
import {
  buildLineChartOption,
  buildBarChartOption,
  buildPieChartOption,
  buildGaugeOption,
} from '../utils/chartHelpers';
import { formatCurrency } from '../utils/numberFormatters';

export const ParkingAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange } = useSelector((state: RootState) => (state as any).analytics);

  const { data: parkingData, isLoading, refetch } = useGetParkingAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 1. Gauge Chart: Current Occupancy percentage
  const occupancyGaugeOption = useMemo(() => {
    if (!parkingData?.parkingOccupancy) return null;
    return buildGaugeOption(mode, parkingData.parkingOccupancy.occupancyPercent, 'Occupied', '#3b82f6');
  }, [parkingData, mode]);

  // 2. Line Chart: Daily Vehicle Count & Revenue Trend
  const dailyTrendOption = useMemo(() => {
    if (!parkingData?.dailyTrend.length) return null;
    const categories = parkingData.dailyTrend.map((d) => new Date(d.date).toLocaleDateString());
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Vehicles Count', data: parkingData.dailyTrend.map((d) => d.vehicles) },
        { name: 'Revenue (₫)', data: parkingData.dailyTrend.map((d) => d.revenue / 100000), color: '#10b981' },
      ],
      'number'
    );
  }, [parkingData, mode]);

  // 3. Pie Chart: Vehicle Types
  const vehicleTypeOption = useMemo(() => {
    if (!parkingData?.vehicleTypes.length) return null;
    const chartData = parkingData.vehicleTypes.map((v) => ({
      name: v.type,
      value: v.count,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [parkingData, mode]);

  // 4. Bar Chart: Peak Hours Occupancy
  const peakHoursOption = useMemo(() => {
    if (!parkingData?.peakHours.length) return null;
    const categories = parkingData.peakHours.map((h) => `${h.hour}:00`);
    const values = parkingData.peakHours.map((h) => h.occupancy);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Occupancy Rate (%)', data: values, color: '#f59e0b' }],
      false,
      'percentage'
    );
  }, [parkingData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Parking Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lot occupancy telemetry, hourly pricing yields, vehicle class splits, and zone utilizations
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} />

      {/* KPI Stats widgets */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Capacity
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {parkingData?.parkingOccupancy.totalSpots || 0} slots
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Allocated parking slots
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Current Availability
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {parkingData?.parkingOccupancy.availableSpots || 0} free
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Occupied: {parkingData?.parkingOccupancy.occupiedSpots || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Parking Revenue (Today)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(parkingData?.parkingRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg park duration: {parkingData?.averageParkingDuration || 0}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Overall Lot Utilization
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {parkingData?.parkingUtilization || 0}%
              </Typography>
              <Typography variant="caption" color="success.main">
                Optimal turnover rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Real-time Occupancy
              </Typography>
              <ChartContainer option={occupancyGaugeOption} height={240} loading={isLoading} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Currently {parkingData?.parkingOccupancy.occupiedSpots} of {parkingData?.parkingOccupancy.totalSpots} slots occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <DashboardCard title="Daily Traffic & Revenue Trend" subtitle="Daily counts of parked vehicles vs yield revenues (₫ * 100k)">
            <ChartContainer option={dailyTrendOption} height={280} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Vehicle Class Distribution" subtitle="Class types of vehicles parked in lot">
            <ChartContainer option={vehicleTypeOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Hourly Occupancy Peaks" subtitle="Average occupancy rate percentages across hours of day">
            <ChartContainer option={peakHoursOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Zone Utilization list */}
        <Grid item xs={12}>
          <DashboardCard title="Parking Zone Performance" subtitle="Real-time capacity and occupancy metrics by zone block">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Zone ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Zone Block</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Capacity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupied Slots</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Utilization Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parkingData?.zoneUtilization.map((zone) => (
                    <TableRow key={zone.zoneId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{zone.zoneId}</TableCell>
                      <TableCell>{zone.zoneName}</TableCell>
                      <TableCell>{zone.totalSpots}</TableCell>
                      <TableCell>{zone.occupied}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{zone.utilization}%</TableCell>
                      <TableCell>
                        <StatusChip
                          label={zone.utilization >= 80 ? 'Near Capacity' : 'Available'}
                          status={zone.utilization >= 80 ? 'error' : 'active'}
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
