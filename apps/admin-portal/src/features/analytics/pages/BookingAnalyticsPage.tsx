/**
 * Booking Analytics Page - MODULE 4
 * Visualizes booking trends, conversion funnel, acquisition sources, and cancellations
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent } from '@mui/material';
import { useGetBookingAnalyticsQuery } from '../services/analyticsApi';
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
import { formatChartDate } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/numberFormatters';
import type { EChartsOption } from 'echarts';

export const BookingAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange, groupBy } = useSelector((state: RootState) => (state as any).analytics);

  const { data: bookingData, isLoading, refetch } = useGetBookingAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    groupBy,
  });

  // 1. Line/Area Chart: Booking Volume and Revenue Trend
  const trendOption = useMemo(() => {
    if (!bookingData?.bookingsPerDay.length) return null;
    const categories = bookingData.bookingsPerDay.map((b) => formatChartDate(b.date, 'day'));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Số lượng đặt vé', data: bookingData.bookingsPerDay.map((b) => b.count) },
        { name: 'Doanh thu tạo ra (Triệu ₫)', data: bookingData.bookingsPerDay.map((b) => b.revenue / 1000000), color: '#10b981' },
      ],
      'number'
    );
  }, [bookingData, mode]);

  // 2. Funnel Chart: Booking Conversion Funnel
  const funnelOption = useMemo(() => {
    if (!bookingData?.bookingConversion.stages.length) return null;
    const stages = bookingData.bookingConversion.stages;

    const baseOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        data: stages.map((s) => s.name),
        textStyle: { color: mode === 'dark' ? '#cbd5e1' : '#1e293b' },
      },
      series: [
        {
          name: 'Phễu chuyển đổi',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 20,
          width: '80%',
          min: 0,
          max: stages[0].count,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => `${params.name}: ${params.value} (${params.percent}%)`,
          },
          labelLine: { show: false },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
          data: stages.map((s, idx) => {
            const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981'];
            return {
              name: s.name,
              value: s.count,
              itemStyle: { color: colors[idx % colors.length] },
            };
          }),
        },
      ],
    };
    return baseOption as EChartsOption;
  }, [bookingData, mode]);

  // 3. Pie/Donut Chart: Booking Sources
  const sourcesOption = useMemo(() => {
    if (!bookingData?.bookingSources.length) return null;
    const chartData = bookingData.bookingSources.map((s) => ({
      name: s.label,
      value: s.value,
    }));
    return buildPieChartOption(mode, chartData, true, 'number');
  }, [bookingData, mode]);

  // 4. Bar Chart: Bookings per Hour
  const hourlyOption = useMemo(() => {
    if (!bookingData?.bookingsPerHour.length) return null;
    const categories = bookingData.bookingsPerHour.map((b) => `${b.hour}:00`);
    const countValues = bookingData.bookingsPerHour.map((b) => b.count);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Số lượng đặt vé', data: countValues, color: '#6366f1' }],
      false,
      'number'
    );
  }, [bookingData, mode]);

  // 5. Pie Chart: Status Distribution
  const statusOption = useMemo(() => {
    if (!bookingData?.statusDistribution.length) return null;
    const chartData = bookingData.statusDistribution.map((s) => ({
      name: s.label,
      value: s.value,
    }));
    return buildPieChartOption(mode, chartData, false, 'number');
  }, [bookingData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích đặt vé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phân tích lượt đặt chỗ, kênh đặt vé, thời gian đặt, tỷ lệ chuyển đổi và hoàn tiền
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue showCompare />

      {/* KPI Stats widgets */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tổng đặt vé hôm nay
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {bookingData?.totalBookings || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Số vé TB/Lượt đặt: {bookingData?.averageTicketsPerBooking || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Giá trị đặt vé trung bình
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency(bookingData?.averageBookingValue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                Chuyển đổi phễu: {bookingData?.bookingConversion.overallConversion || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tỷ lệ hủy & hoàn tiền
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {bookingData?.cancellationRate || 0}% / {bookingData?.refundRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Ngưỡng hoàn tiền an toàn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Dashboards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <DashboardCard title="Xu hướng đặt vé & doanh thu" subtitle="Số lượt đặt vé hàng ngày so với doanh thu tạo ra (tính bằng Triệu ₫)">
            <ChartContainer option={trendOption} height={350} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <DashboardCard title="Phễu chuyển đổi đặt vé" subtitle="Tỷ lệ hao hụt từ khi tìm kiếm đến khi thanh toán thành công">
            <ChartContainer option={funnelOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <DashboardCard title="Kênh bán hàng" subtitle="Kênh nguồn tạo các đơn hàng đặt vé">
            <ChartContainer option={sourcesOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Hoạt động giờ cao điểm" subtitle="Mật độ tạo đặt chỗ theo giờ">
            <ChartContainer option={hourlyOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Phân bổ trạng thái đơn hàng" subtitle="Chi tiết các trạng thái: Hoạt động, chờ xử lý và đã hủy">
            <ChartContainer option={statusOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
