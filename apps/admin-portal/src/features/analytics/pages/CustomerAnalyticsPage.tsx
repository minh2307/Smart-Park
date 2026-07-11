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
        { name: 'Khách hàng mới', data: customerData.customerGrowth.map((g) => g.newCustomers), areaStyle: true },
        { name: 'Tổng số khách hàng', data: customerData.customerGrowth.map((g) => g.totalCustomers), color: '#3b82f6', areaStyle: true },
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
      [{ name: 'LTV Trung bình', data: dataValues, color: '#10b981' }],
      true,
      'currency'
    );
  }, [customerData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích khách hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thông tin chi tiết về nhân khẩu học khách hàng, hành vi chi tiêu, tỷ lệ giữ chân và lòng trung thành
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
                Tổng khách hàng hoạt động
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {customerData?.totalCustomers.toLocaleString() || '0'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hồ sơ đăng ký hệ thống
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Đăng ký mới (Hôm nay)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                +{customerData?.newCustomers || '0'}
              </Typography>
              <Typography variant="caption" color="success.main">
                Tăng trưởng tích cực
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tỷ lệ giữ chân khách hàng
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {customerData?.retentionRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tỷ lệ rời bỏ: {customerData?.churnRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Chi tiêu trung bình
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency(customerData?.averageSpending || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trung bình trên mỗi đơn hàng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Tăng trưởng khách hàng" subtitle="Xu hướng khách hàng mới so với khách hàng quay lại">
            <ChartContainer option={growthOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Nhân khẩu học theo độ tuổi" subtitle="Phân bổ độ tuổi của khách hàng tham quan">
            <ChartContainer option={ageOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Phân bổ hạng thành viên" subtitle="Chi tiết phân bổ hạng thành viên thân thiết">
            <ChartContainer option={membershipOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Giá trị vòng đời theo phân khúc" subtitle="Mức chi tiêu trung bình theo phân khúc (LTV)">
            <ChartContainer option={ltvSegmentOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Top Customers Table */}
        <Grid item xs={12}>
          <DashboardCard title="Khách hàng tiêu biểu" subtitle="Danh sách những khách hàng hoạt động tích cực nhất theo doanh thu và lượt đi">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hạng thành viên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng số lượt đi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng chi tiêu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lần cuối tham quan</TableCell>
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
