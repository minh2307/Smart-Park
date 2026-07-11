/**
 * Ride Analytics Page - MODULE 6
 * Evaluates park rides popularity, queue/wait times, mechanical utilization, and maintenance logs
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetRideAnalyticsQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { FilterPanel } from '../components/shared/FilterPanel';
import { StatusChip } from '../components/shared/StatusChip';
import {
  buildBarChartOption,
  buildPieChartOption,
} from '../utils/chartHelpers';
import { formatCurrency } from '../utils/numberFormatters';
import type { EChartsOption } from 'echarts';

export const RideAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange } = useSelector((state: RootState) => (state as any).analytics);

  const { data: rideData, isLoading, refetch } = useGetRideAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 1. Double Axis Chart: Hourly Wait Time vs Rider Count
  const hourlyWaitRidersOption = useMemo(() => {
    if (!rideData?.peakHours.length) return null;
    const categories = rideData.peakHours.map((h) => `${h.hour}:00`);

    const baseOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['Lượt khách', 'Thời gian chờ TB (phút)'],
        textStyle: { color: mode === 'dark' ? '#cbd5e1' : '#1e293b' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisPointer: { type: 'shadow' },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Khách đi',
          min: 0,
          axisLabel: { formatter: '{value}' },
        },
        {
          type: 'value',
          name: 'Thời gian chờ',
          min: 0,
          axisLabel: { formatter: '{value} phút' },
        },
      ],
      series: [
        {
          name: 'Lượt khách',
          type: 'bar',
          data: rideData.peakHours.map((h) => h.averageRiders),
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: 'Thời gian chờ TB (phút)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: rideData.peakHours.map((h) => h.averageWaitMinutes),
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 3 },
        },
      ],
    };
    return baseOption as EChartsOption;
  }, [rideData, mode]);

  // 2. Bar Chart: Ride Utilization Percentage
  const utilizationOption = useMemo(() => {
    if (!rideData?.rideUtilization.length) return null;
    const categories = rideData.rideUtilization.map((r) => r.name);
    const values = rideData.rideUtilization.map((r) => r.utilizationPercent);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Tỷ lệ khai thác (%)', data: values, color: '#10b981' }],
      true,
      'percentage'
    );
  }, [rideData, mode]);

  // 3. Pie/Donut Chart: Ride Availability Statuses
  const availabilityOption = useMemo(() => {
    if (!rideData?.rideAvailability.length) return null;
    const chartData = rideData.rideAvailability.map((r) => ({
      name: r.name,
      value: r.availabilityPercent,
    }));
    return buildPieChartOption(mode, chartData, true, 'percentage');
  }, [rideData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích trò chơi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lượt khách, thời gian chờ xếp hàng, tỷ lệ khả dụng, nguyên nhân sự cố và nhật ký an toàn
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue />

      {/* KPI Stats widgets */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Thời gian xếp hàng TB
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {rideData?.averageQueueTime || 0} phút
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thời gian chờ: {rideData?.averageWaitingTime || 0} phút
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Lịch bảo trì tồn đọng
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>
                {rideData?.maintenanceStats.pendingCount || 0} trò chơi
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thời gian xử lý TB: {rideData?.maintenanceStats.averageResolutionHours || 0}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Đội kỹ thuật hoạt động
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {rideData?.maintenanceStats.scheduledCount || 0} đã lên lịch
              </Typography>
              <Typography variant="caption" color="success.main">
                Tuân thủ an toàn: 100%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <DashboardCard title="Thời gian chờ hàng giờ so với mật độ du khách" subtitle="Mối liên hệ giữa thời gian chờ (màu Đỏ) so với số lượng khách đi (màu Xanh)">
            <ChartContainer option={hourlyWaitRidersOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Hiệu suất vận hành cơ khí" subtitle="Tỷ lệ phần trăm thời gian hoạt động so với thời gian nhàn rỗi">
            <ChartContainer option={utilizationOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Tỷ lệ sẵn sàng an toàn" subtitle="Tỷ lệ sẵn sàng sau khi tính thời gian dừng hoạt động">
            <ChartContainer option={availabilityOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Ride Popularity list */}
        <Grid item xs={12} lg={7}>
          <DashboardCard title="Xếp hạng lượt khách & doanh thu" subtitle="Xếp hạng trò chơi theo tổng lượng hành khách và doanh số bán vé">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên trò chơi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng lượt khách</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đánh giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Xu hướng tăng trưởng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu tạo ra</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rideData?.ridePopularity.map((ride) => {
                    const revItem = rideData.rideRevenue.find((r) => r.id === ride.id);
                    return (
                      <TableRow key={ride.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{ride.name}</TableCell>
                        <TableCell>{ride.totalRiders.toLocaleString()}</TableCell>
                        <TableCell>⭐ {ride.rating}</TableCell>
                        <TableCell>
                          <StatusChip
                            label={`${ride.trend > 0 ? '+' : ''}${ride.trend}%`}
                            status={ride.trend > 0 ? 'active' : 'error'}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(revItem?.revenue || 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Maintenance Log list */}
        <Grid item xs={12} lg={5}>
          <DashboardCard title="Lịch bảo trì sắp tới" subtitle="Các nhiệm vụ kỹ thuật đã lên kế hoạch thực hiện">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trò chơi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rideData?.maintenanceStats.upcomingMaintenance.map((m, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{m.rideName}</TableCell>
                      <TableCell>{new Date(m.scheduledDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{m.type}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={m.status === 'completed' ? 'Hoàn thành' : 'Đang chờ'}
                          status={m.status === 'completed' ? 'active' : 'pending'}
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
