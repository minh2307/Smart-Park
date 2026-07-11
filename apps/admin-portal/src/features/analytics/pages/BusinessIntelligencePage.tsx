/**
 * Business Intelligence Dashboard - MODULE 3 / BI
 * Features interactive multidimensional analysis, pivot table builders, and role-based report shields
 */
import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import { useGetRevenueAnalyticsQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { buildBarChartOption, buildPieChartOption, buildLineChartOption } from '../utils/chartHelpers';
import { formatCurrency } from '../utils/numberFormatters';
import { MdSettings, MdLock } from 'react-icons/md';

type Dimension = 'venue' | 'ticketType' | 'paymentMethod' | 'restaurant' | 'retailShop';
type Metric = 'value' | 'percentage';

export const BusinessIntelligencePage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const currentUser = useSelector((state: RootState) => (state as any).auth.user);

  // States for Pivot Analyzer
  const [rowDimension, setRowDimension] = useState<Dimension>('venue');
  const [valueMetric, setValueMetric] = useState<Metric>('value');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  // Fetch the data
  const { data: revenueData, isLoading } = useGetRevenueAnalyticsQuery({
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: 'month',
  });

  // Calculate Pivot Data dynamically based on selected dimension & metric
  const pivotData = useMemo(() => {
    if (!revenueData) return [];
    let sourceData: { name: string; value: number; percentage: number; trend: number }[] = [];

    switch (rowDimension) {
      case 'venue':
        sourceData = revenueData.breakdown.byVenue;
        break;
      case 'ticketType':
        sourceData = revenueData.breakdown.byTicketType;
        break;
      case 'paymentMethod':
        sourceData = revenueData.breakdown.byPaymentMethod;
        break;
      case 'restaurant':
        sourceData = revenueData.breakdown.byRestaurant;
        break;
      case 'retailShop':
        sourceData = revenueData.breakdown.byRetailShop;
        break;
      default:
        sourceData = revenueData.breakdown.byVenue;
    }

    return sourceData.map((item) => ({
      dimensionValue: item.name,
      sumValue: item.value,
      avgValue: item.value / 12, // Mock average split
      percentageSum: item.percentage,
      count: Math.floor(item.value / 120000), // Mock transaction counts
    }));
  }, [revenueData, rowDimension]);

  // Generate dynamic chart option based on Pivot Analyzer values
  const biChartOption = useMemo(() => {
    if (!pivotData.length) return null;
    const categories = pivotData.map((d) => d.dimensionValue);
    const dataValues = pivotData.map((d) => (valueMetric === 'value' ? d.sumValue : d.percentageSum));

    if (chartType === 'pie') {
      const pieData = pivotData.map((d) => ({
        name: d.dimensionValue,
        value: valueMetric === 'value' ? d.sumValue : d.percentageSum,
      }));
      return buildPieChartOption(mode, pieData, true, valueMetric === 'value' ? 'currency' : 'percentage');
    }

    if (chartType === 'line') {
      return buildLineChartOption(
        mode,
        categories,
        [{ name: valueMetric === 'value' ? 'Tổng giá trị (₫)' : 'Tỷ lệ (%)', data: dataValues }],
        valueMetric === 'value' ? 'currency' : 'percentage'
      );
    }

    return buildBarChartOption(
      mode,
      categories,
      [{ name: valueMetric === 'value' ? 'Tổng giá trị (₫)' : 'Tỷ lệ (%)', data: dataValues, color: '#6366f1' }],
      false,
      valueMetric === 'value' ? 'currency' : 'percentage'
    );
  }, [pivotData, chartType, valueMetric, mode]);

  // Role Check
  const hasAccessToBI = currentUser?.role === 'ADMIN';

  if (!hasAccessToBI) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <MdLock size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Báo cáo nhạy cảm bị hạn chế
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          Vai trò người dùng của bạn không có quyền kiểm toán phân tích Trí tuệ doanh nghiệp (BI) đa chiều. Vui lòng yêu cầu quyền truy cập từ quản trị viên bảo mật hệ thống.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích Trí tuệ doanh nghiệp (BI)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Không gian làm việc BI đa chiều nâng cao, bộ tạo bảng tổng hợp, tổng hợp và các chỉ số chuyên sâu
          </Typography>
        </Box>
      </Box>

      {/* Role and Data alert */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Người dùng được ủy quyền: <strong>{currentUser?.fullName} ({currentUser?.role})</strong>. Mức độ nhạy cảm: <strong>Hạn chế cấp độ 3</strong>. Nhật ký kiểm toán đang được chủ động theo dõi.
      </Alert>

      {/* Pivot builder controls */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MdSettings size={18} /> Bảng điều khiển phân tích đa chiều & tổng hợp
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="dimension-label">Chiều dòng</InputLabel>
                <Select
                  labelId="dimension-label"
                  value={rowDimension}
                  label="Chiều dòng"
                  onChange={(e) => setRowDimension(e.target.value as Dimension)}
                >
                  <MenuItem value="venue">Vị trí khu vui chơi</MenuItem>
                  <MenuItem value="ticketType">Loại sản phẩm vé</MenuItem>
                  <MenuItem value="paymentMethod">Phương thức thanh toán</MenuItem>
                  <MenuItem value="restaurant">Doanh số nhà hàng</MenuItem>
                  <MenuItem value="retailShop">Doanh số bán lẻ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="metric-label">Tổng hợp giá trị</InputLabel>
                <Select
                  labelId="metric-label"
                  value={valueMetric}
                  label="Tổng hợp giá trị"
                  onChange={(e) => setValueMetric(e.target.value as Metric)}
                >
                  <MenuItem value="value">Tổng doanh thu (₫)</MenuItem>
                  <MenuItem value="percentage">Tỷ lệ doanh thu (%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="chart-type-label">Loại biểu đồ</InputLabel>
                <Select
                  labelId="chart-type-label"
                  value={chartType}
                  label="Loại biểu đồ"
                  onChange={(e) => setChartType(e.target.value as 'bar' | 'pie' | 'line')}
                >
                  <MenuItem value="bar">Biểu đồ cột</MenuItem>
                  <MenuItem value="pie">Biểu đồ tròn (Donut)</MenuItem>
                  <MenuItem value="line">Biểu đồ đường</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setRowDimension('venue');
                  setValueMetric('value');
                  setChartType('bar');
                }}
              >
                Đặt lại thiết lập
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Visual Workspace */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <DashboardCard title="Trực quan hóa đa chiều BI" subtitle={`Biểu đồ được kết xuất động hiển thị các chỉ số tổng hợp theo chiều dòng đã chọn`}>
            <ChartContainer option={biChartOption} height={350} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardCard title="Bảng tổng hợp động" subtitle="Bố cục bảng tính tương tác thể hiện tổng số, số lượng và số trung bình được tính toán">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chiều</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Giao dịch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng số tiền</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trung bình / Phân chia</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tỷ lệ %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pivotData.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.dimensionValue}</TableCell>
                      <TableCell>{row.count.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(row.sumValue)}</TableCell>
                      <TableCell>{formatCurrency(row.avgValue)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.percentageSum}%</TableCell>
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
