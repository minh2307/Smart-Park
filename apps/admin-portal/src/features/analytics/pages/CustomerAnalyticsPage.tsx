/**
 * Customer Analytics Page - MODULE 3
 * Visualizes customer growth, demographics, lifetime value, and retention metrics
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetCustomerAnalyticsQuery } from '../services/analyticsApi';
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

export const CustomerAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange, groupBy } = useSelector((state: RootState) => (state as any).analytics);

  const { data: customerData, isLoading, refetch } = useGetCustomerAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    groupBy,
  });

  // 1. Line/Area Chart: Customer Growth (New vs Returning)
  const growthOption = useMemo(() => {
    if (!customerData?.customerGrowth.length) return null;
    const categories = customerData.customerGrowth.map((g) => formatChartDate(g.date, 'month'));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'New Customers', data: customerData.customerGrowth.map((g) => g.newCustomers), areaStyle: true },
        { name: 'Total Customers', data: customerData.customerGrowth.map((g) => g.totalCustomers), color: '#3b82f6', areaStyle: true },
      ],
      'number'
    );
  }, [customerData, mode]);

  // 2. Pie Chart: Age Distribution
  const ageOption = useMemo(() => {
    if (!customerData?.ageDistribution.length) return null;
    const chartData = customerData.ageDistribution.map((a) => ({
      name: a.label,
      value: a.value,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [customerData, mode]);

  // 3. Pie Chart: Membership Tier Distribution
  const membershipOption = useMemo(() => {
    if (!customerData?.membershipDistribution.length) return null;
    const chartData = customerData.membershipDistribution.map((m) => ({
      name: m.label,
      value: m.value,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [customerData, mode]);

  // 4. Bar Chart: LTV Segment Value
  const ltvSegmentOption = useMemo(() => {
    if (!customerData?.lifetimeValue.bySegment.length) return null;
    const categories = customerData.lifetimeValue.bySegment.map((s) => s.segment);
    const dataValues = customerData.lifetimeValue.bySegment.map((s) => s.ltv);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Average LTV', data: dataValues, color: '#10b981' }],
      true,
      'currency'
    );
  }, [customerData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Customer Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Insights on customer demographics, spending behaviors, retention, and loyalty
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue showCompare />

      {/* KPI Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Active Customers
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {customerData?.totalCustomers.toLocaleString() || '0'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered profiles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                New Signups (Today)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                +{customerData?.newCustomers || '0'}
              </Typography>
              <Typography variant="caption" color="success.main">
                Active expansion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Customer Retention Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {customerData?.retentionRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Churn rate: {customerData?.churnRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Average Spending
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency(customerData?.averageSpending || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Per transaction average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Customer Growth" subtitle="New vs returning customer trends">
            <ChartContainer option={growthOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Age Demographics" subtitle="Customer age bracket distribution">
            <ChartContainer option={ageOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Membership Tier Distribution" subtitle="Active loyalty membership breakdown">
            <ChartContainer option={membershipOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Lifetime Value by Segment" subtitle="Average monetary spending by segment">
            <ChartContainer option={ltvSegmentOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Top Customers Table */}
        <Grid item xs={12}>
          <DashboardCard title="Top Performing Customers" subtitle="Most active customers by revenue and visits">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Membership Tier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Visits</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Spent</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Visit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerData?.topCustomers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{customer.fullName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={customer.membershipTier}
                          status={customer.membershipTier === 'Gold' ? 'active' : 'pending'}
                        />
                      </TableCell>
                      <TableCell>{customer.visitCount}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell>{customer.lastVisit}</TableCell>
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
