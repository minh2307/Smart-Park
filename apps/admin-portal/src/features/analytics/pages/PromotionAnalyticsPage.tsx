/**
 * Promotion Analytics Page - MODULE 10
 * Visualizes marketing campaign ROI, discount yields, coupon/voucher usage, and conversions
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetPromotionAnalyticsQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { FilterPanel } from '../components/shared/FilterPanel';
import { StatusChip } from '../components/shared/StatusChip';
import {
  buildLineChartOption,
  buildPieChartOption,
} from '../utils/chartHelpers';
import { formatCurrency } from '../utils/numberFormatters';

export const PromotionAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange } = useSelector((state: RootState) => (state as any).analytics);

  const { data: promoData, isLoading, refetch } = useGetPromotionAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 1. Line Chart: Daily Promo Revenue vs Discounts
  const dailyTrendOption = useMemo(() => {
    if (!promoData?.dailyTrend.length) return null;
    const categories = promoData.dailyTrend.map((d) => new Date(d.date).toLocaleDateString());
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Generated Revenue (₫)', data: promoData.dailyTrend.map((d) => d.revenue) },
        { name: 'Discounts Granted (₫)', data: promoData.dailyTrend.map((d) => d.discounts), color: '#ef4444' },
      ],
      'currency'
    );
  }, [promoData, mode]);

  // 2. Pie Chart: Coupon usage by Type
  const couponTypeOption = useMemo(() => {
    if (!promoData?.couponUsage.byType.length) return null;
    const chartData = promoData.couponUsage.byType.map((c) => ({
      name: c.type,
      value: c.count,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [promoData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Promotion Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Marketing campaign ROI tracking, coupon redemption ratios, conversion rates, and discount disbursements
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
                Generated Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(promoData?.promotionRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Campaign-attributed yield
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Discounts Disbursed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {formatCurrency(promoData?.totalDiscountAmount || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total discount value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Average Campaign ROI
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {promoData?.roi || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Return on ad spend index
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Redemption Conversion
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {promoData?.conversionRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Impressions to sales conversion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Daily Campaign Attributed Sales vs Discounts" subtitle="Co-relation of attributed sales revenues vs promotional discount values (₫)">
            <ChartContainer option={dailyTrendOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Redeemed Coupon Codes" subtitle="Active coupon codes distribution shares">
            <ChartContainer option={couponTypeOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Campaign rankings list */}
        <Grid item xs={12}>
          <DashboardCard title="Campaign Performance Matrix" subtitle="Detailed breakdown of impressions, cost, revenue, and ROI metrics by campaign">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Campaign Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Impressions</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Conversions</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Advertising Cost</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Attributed Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Campaign ROI</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {promoData?.campaignPerformance.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{c.impressions.toLocaleString()}</TableCell>
                      <TableCell>{c.conversions.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(c.cost)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(c.revenue)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>{c.roi}%</TableCell>
                      <TableCell>
                        <StatusChip
                          label={c.status}
                          status={c.status === 'active' ? 'active' : 'pending'}
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
