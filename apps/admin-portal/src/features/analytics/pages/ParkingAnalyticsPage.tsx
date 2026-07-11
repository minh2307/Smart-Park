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
    return buildGaugeOption(mode, parkingData.parkingOccupancy.occupancyPercent, 'Đã đỗ', '#3b82f6');
  }, [parkingData, mode]);

  // 2. Line Chart: Daily Vehicle Count & Revenue Trend
  const dailyTrendOption = useMemo(() => {
    if (!parkingData?.dailyTrend.length) return null;
    const categories = parkingData.dailyTrend.map((d) => new Date(d.date).toLocaleDateString('vi-VN'));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Số lượng xe', data: parkingData.dailyTrend.map((d) => d.vehicles) },
        { name: 'Doanh thu (₫)', data: parkingData.dailyTrend.map((d) => d.revenue / 100000), color: '#10b981' },
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
      [{ name: 'Tỷ lệ lấp đầy (%)', data: values, color: '#f59e0b' }],
      false,
      'percentage'
    );
  }, [parkingData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích bãi đỗ xe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trạng thái lấp đầy bãi xe, doanh thu biểu phí theo giờ, phân loại xe và hiệu suất các khu vực
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
                Tổng sức chứa
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {parkingData?.parkingOccupancy.totalSpots || 0} chỗ
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Số chỗ đỗ xe được phân bổ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Số chỗ trống hiện tại
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {parkingData?.parkingOccupancy.availableSpots || 0} trống
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đã đỗ: {parkingData?.parkingOccupancy.occupiedSpots || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Doanh thu bãi xe (Hôm nay)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(parkingData?.parkingRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thời gian đỗ TB: {parkingData?.averageParkingDuration || 0} giờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Hiệu suất bãi xe chung
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {parkingData?.parkingUtilization || 0}%
              </Typography>
              <Typography variant="caption" color="success.main">
                Tỷ lệ luân chuyển tối ưu
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
                Tỷ lệ lấp đầy thời gian thực
              </Typography>
              <ChartContainer option={occupancyGaugeOption} height={240} loading={isLoading} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Hiện đang sử dụng {parkingData?.parkingOccupancy.occupiedSpots} trên tổng số {parkingData?.parkingOccupancy.totalSpots} chỗ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <DashboardCard title="Xu hướng lưu lượng & doanh thu hàng ngày" subtitle="Số lượng xe đỗ hàng ngày so với doanh thu tạo ra (₫ * 100k)">
            <ChartContainer option={dailyTrendOption} height={280} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Phân bổ loại phương tiện" subtitle="Các loại phương tiện đỗ trong bãi">
            <ChartContainer option={vehicleTypeOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Đỉnh lấp đầy hàng giờ" subtitle="Tỷ lệ lấp đầy trung bình theo các khung giờ trong ngày">
            <ChartContainer option={peakHoursOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Zone Utilization list */}
        <Grid item xs={12}>
          <DashboardCard title="Hiệu suất các khu vực đỗ xe" subtitle="Số liệu sức chứa và lấp đầy thời gian thực theo từng phân khu">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã phân khu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên phân khu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng sức chứa</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chỗ đã đỗ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tỷ lệ lấp đầy</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
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
                          label={zone.utilization >= 80 ? 'Sắp đầy' : 'Còn chỗ'}
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
