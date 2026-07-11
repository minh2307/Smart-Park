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
    const categories = promoData.dailyTrend.map((d) => new Date(d.date).toLocaleDateString('vi-VN'));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Doanh thu được tạo ra (₫)', data: promoData.dailyTrend.map((d) => d.revenue) },
        { name: 'Mức giảm giá đã cấp (₫)', data: promoData.dailyTrend.map((d) => d.discounts), color: '#ef4444' },
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
            Phân tích Khuyến mãi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi ROI chiến dịch marketing, tỷ lệ quy đổi mã giảm giá, tỷ lệ chuyển đổi và số tiền giảm giá đã áp dụng
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
                Doanh thu tạo ra
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(promoData?.promotionRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Doanh thu phân bổ theo chiến dịch
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Mức giảm giá đã cấp
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {formatCurrency(promoData?.totalDiscountAmount || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng giá trị giảm giá
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ROI chiến dịch trung bình
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {promoData?.roi || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Chỉ số hoàn vốn đầu tư quảng cáo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tỷ lệ quy đổi giảm giá
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {promoData?.conversionRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tỷ lệ chuyển đổi từ lượt xem sang lượt mua
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Doanh số phân bổ theo chiến dịch hàng ngày so với số tiền giảm giá" subtitle="Mối tương quan giữa doanh thu bán hàng được phân bổ so với giá trị giảm giá khuyến mãi (₫)">
            <ChartContainer option={dailyTrendOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Mã giảm giá đã quy đổi" subtitle="Tỷ lệ phân bổ các mã giảm giá đang hoạt động">
            <ChartContainer option={couponTypeOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Campaign rankings list */}
        <Grid item xs={12}>
          <DashboardCard title="Ma trận hiệu suất chiến dịch" subtitle="Báo cáo chi tiết về lượt hiển thị, chi phí, doanh thu và các chỉ số ROI theo từng chiến dịch">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên chiến dịch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lượt hiển thị</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lượt chuyển đổi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chi phí quảng cáo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu phân bổ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ROI chiến dịch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
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
                          label={c.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
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
