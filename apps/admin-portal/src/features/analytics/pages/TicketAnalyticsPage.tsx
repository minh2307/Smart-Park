/**
 * Ticket Analytics Page - MODULE 5
 * Evaluates ticket sales performance, usage rate, expiration, and validation telemetry
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetTicketAnalyticsQuery } from '../services/analyticsApi';
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
} from '../utils/chartHelpers';
import { formatChartDate } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/numberFormatters';

export const TicketAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange, groupBy } = useSelector((state: RootState) => (state as any).analytics);

  const { data: ticketData, isLoading, refetch } = useGetTicketAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    groupBy,
  });

  // 1. Line Chart: Ticket Sales Volume Trend
  const salesOption = useMemo(() => {
    if (!ticketData?.ticketSales.length) return null;
    const categories = ticketData.ticketSales.map((s) => formatChartDate(s.date, 'day'));
    const dataValues = ticketData.ticketSales.map((s) => s.sold);
    return buildLineChartOption(
      mode,
      categories,
      [{ name: 'Tickets Sold', data: dataValues, color: '#f59e0b', areaStyle: true }],
      'number'
    );
  }, [ticketData, mode]);

  // 2. Pie Chart: Ride Scans / Usage
  const rideUsageOption = useMemo(() => {
    if (!ticketData?.rideUsage.length) return null;
    const chartData = ticketData.rideUsage.map((r) => ({
      name: r.rideName,
      value: r.usageCount,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [ticketData, mode]);

  // 3. Bar Chart: Venue Usage Breakdown
  const venueUsageOption = useMemo(() => {
    if (!ticketData?.venueUsage.length) return null;
    const categories = ticketData.venueUsage.map((v) => v.venueName);
    const dataValues = ticketData.venueUsage.map((v) => v.ticketsSold);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Scans Count', data: dataValues, color: '#10b981' }],
      false,
      'number'
    );
  }, [ticketData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Ticket Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sales, validation checkpoints performance, ride allocations, and ticket product comparison
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue showCompare />

      {/* KPI Stats widgets */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Tickets Sold
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {ticketData?.totalTicketsSold.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cumulative sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Ticket Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(ticketData?.ticketRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Top: {ticketData?.mostPopularTicket.name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Usage & Expiration Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {ticketData?.usageRate || 0}% / {ticketData?.expirationRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expired unused: {ticketData?.expirationRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Validation Success Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {ticketData?.validationSuccess || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Access control telemetry
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Dashboards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Daily Tickets Sales Trend" subtitle="Volume of tickets sold over time">
            <ChartContainer option={salesOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Ride Admission Shares" subtitle="Ticket scans allocated to specific rides">
            <ChartContainer option={rideUsageOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12}>
          <DashboardCard title="Admission Scans by Venue" subtitle="Checkpoints activity load across different park areas">
            <ChartContainer option={venueUsageOption} height={280} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Ticket Type Table */}
        <Grid item xs={12}>
          <DashboardCard title="Ticket Product Matrix" subtitle="Detailed performance comparison by ticket product type">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ticket Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Units Sold</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usage Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Return/Refund Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketData?.ticketTypeComparison.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{ticket.name}</TableCell>
                      <TableCell>{formatCurrency(ticket.price)}</TableCell>
                      <TableCell>{ticket.sold.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(ticket.revenue)}</TableCell>
                      <TableCell>{ticket.usageRate}%</TableCell>
                      <TableCell>
                        <StatusChip
                          label={`${ticket.returnRate}%`}
                          status={ticket.returnRate > 2.5 ? 'error' : 'active'}
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
