/**
 * Membership Analytics Page - MODULE 9
 * Evaluates membership acquisitions growth, loyalty tier allocations, benefits redemption, and revenue contributions
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetMembershipAnalyticsQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { FilterPanel } from '../components/shared/FilterPanel';
import {
  buildLineChartOption,
  buildBarChartOption,
  buildPieChartOption,
} from '../utils/chartHelpers';
import { formatCurrency } from '../utils/numberFormatters';

export const MembershipAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange } = useSelector((state: RootState) => (state as any).analytics);

  const { data: membershipData, isLoading, refetch } = useGetMembershipAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 1. Line/Area Chart: Membership Growth Trend
  const growthOption = useMemo(() => {
    if (!membershipData?.membershipGrowth.length) return null;
    const categories = membershipData.membershipGrowth.map((g) => new Date(g.date).toLocaleDateString(undefined, { month: 'short' }));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'New Signups', data: membershipData.membershipGrowth.map((g) => g.newMembers), areaStyle: true },
        { name: 'Total Active Members', data: membershipData.membershipGrowth.map((g) => g.totalMembers), color: '#3b82f6', areaStyle: true },
      ],
      'number'
    );
  }, [membershipData, mode]);

  // 2. Pie Chart: Tier Distribution
  const tierOption = useMemo(() => {
    if (!membershipData?.tierDistribution.length) return null;
    const chartData = membershipData.tierDistribution.map((t) => ({
      name: t.tier,
      value: t.count,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [membershipData, mode]);

  // 3. Bar Chart: Benefits Usage rates
  const benefitsOption = useMemo(() => {
    if (!membershipData?.benefitsUsage.length) return null;
    const categories = membershipData.benefitsUsage.map((b) => b.benefitName);
    const values = membershipData.benefitsUsage.map((b) => b.usageRate);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Usage Rate (%)', data: values, color: '#f59e0b' }],
      true,
      'percentage'
    );
  }, [membershipData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Membership Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loyalty program acquisitions growth, tier allocation splits, benefit redemption activities, and spending contributions
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
                Total Active Members
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {membershipData?.totalActiveMembers.toLocaleString() || 0}
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
                Upgrades / Downgrades
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                +{membershipData?.membershipUpgrade || 0} / -{membershipData?.membershipDowngrade || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Net upgrade growth
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Points Earned / Redeemed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {membershipData?.pointsEarned.toLocaleString() || 0} / {membershipData?.pointsRedeemed.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Redeem: {(((membershipData?.pointsRedeemed || 0) / (membershipData?.pointsEarned || 1)) * 100).toFixed(0)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Average Points Balance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {membershipData?.averagePointsBalance.toLocaleString() || 0} pts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Per user average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Acquisitions & growth Trend" subtitle="Monthly onboarding of new members vs total loyalty base size">
            <ChartContainer option={growthOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Tier Allocation Breakdown" subtitle="Distribution share of members by loyalty tier">
            <ChartContainer option={tierOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <DashboardCard title="Loyalty Perks Usage Rates" subtitle="Percentage of allocated loyalty benefits claimed by members">
            <ChartContainer option={benefitsOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Revenue Contribution list */}
        <Grid item xs={12} md={7}>
          <DashboardCard title="Revenue Share by Loyalty Tier" subtitle="Sales volumes and spending averages contributed by membership tier">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Loyalty Tier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Members Count</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Spending Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Average Spending / User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sales Share</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membershipData?.revenueContribution.map((item) => {
                    const tierMeta = membershipData.tierDistribution.find((t) => t.tier === item.tier);
                    return (
                      <TableRow key={item.tier} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{item.tier}</TableCell>
                        <TableCell>{item.membersCount.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(item.revenue)}</TableCell>
                        <TableCell>{formatCurrency(tierMeta?.avgSpending || 0)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{item.percentage}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
