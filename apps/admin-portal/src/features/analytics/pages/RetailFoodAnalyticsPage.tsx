/**
 * Retail & Food Court Analytics Page - MODULE 8
 * Visualizes restaurant vs retail revenues, category breakdowns, bestsellers, inventory, and supplier scorecards
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useGetRetailFoodAnalyticsQuery } from '../services/analyticsApi';
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

export const RetailFoodAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange } = useSelector((state: RootState) => (state as any).analytics);

  const { data: retailData, isLoading, refetch } = useGetRetailFoodAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 1. Line Chart: Daily Restaurant vs Shop Revenue
  const trendOption = useMemo(() => {
    if (!retailData?.dailyTrend.length) return null;
    const categories = retailData.dailyTrend.map((d) => new Date(d.date).toLocaleDateString('vi-VN'));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Doanh thu Nhà hàng (Ẩm thực)', data: retailData.dailyTrend.map((d) => d.restaurantRevenue) },
        { name: 'Doanh thu Cửa hàng Bán lẻ', data: retailData.dailyTrend.map((d) => d.shopRevenue), color: '#3b82f6' },
      ],
      'currency'
    );
  }, [retailData, mode]);

  // 2. Pie Chart: Top Product Categories
  const categoriesOption = useMemo(() => {
    if (!retailData?.topCategories.length) return null;
    const chartData = retailData.topCategories.map((c) => ({
      name: c.name,
      value: c.revenue,
    }));
    return buildPieChartOption(mode, chartData, true, 'currency');
  }, [retailData, mode]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích Bán lẻ & Ẩm thực
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Doanh thu khu ẩm thực, hiệu suất bán hàng của cửa hàng bán lẻ, tỷ lệ quay vòng hàng tồn kho và KPI nhà cung cấp
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
                Doanh số Nhà hàng (Ẩm thực)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(retailData?.restaurantRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Hoạt động khu ẩm thực
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Doanh số Cửa hàng Bán lẻ
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(retailData?.shopRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Quà lưu niệm & Trang phục
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Giá trị đơn hàng trung bình
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency(retailData?.averageOrderValue || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trên mỗi hóa đơn thanh toán
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tổng doanh thu Ẩm thực & Bán lẻ
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency((retailData?.restaurantRevenue || 0) + (retailData?.shopRevenue || 0))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Doanh thu phụ trợ kết hợp
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="Xu hướng doanh thu Ẩm thực so với Bán lẻ" subtitle="So sánh theo dõi doanh thu hàng ngày (₫)">
            <ChartContainer option={trendOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Tỷ lệ doanh thu theo ngành hàng" subtitle="Chi tiết các ngành hàng sản phẩm đạt hiệu suất cao nhất">
            <ChartContainer option={categoriesOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Product performance Lists */}
        <Grid item xs={12} lg={6}>
          <DashboardCard title="Sản phẩm bán chạy nhất" subtitle="Xếp hạng sản phẩm hàng đầu theo sản lượng bán ra và doanh thu">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Danh mục</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Số lượng bán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu bán hàng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vị trí cửa hàng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retailData?.bestSellingProducts.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.unitsSold}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(p.revenue)}</TableCell>
                      <TableCell>{p.shopName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <DashboardCard title="Sản phẩm doanh số thấp" subtitle="Các sản phẩm có lượng mua thấp nhất cần chú ý">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Danh mục</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Số lượng bán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu bán hàng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vị trí cửa hàng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retailData?.worstSellingProducts.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.unitsSold}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(p.revenue)}</TableCell>
                      <TableCell>{p.shopName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Inventory turnover table */}
        <Grid item xs={12} lg={7}>
          <DashboardCard title="Tốc độ quay vòng hàng tồn kho" subtitle="Mức tồn kho thực tế và cảnh báo đặt thêm hàng">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tỷ lệ quay vòng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mức tồn kho</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Điểm đặt hàng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retailData?.inventoryTurnover.map((item) => (
                    <TableRow key={item.productId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{item.productName}</TableCell>
                      <TableCell>{item.turnoverRate}x</TableCell>
                      <TableCell>{item.stockLevel}</TableCell>
                      <TableCell>{item.reorderPoint}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={item.stockLevel <= item.reorderPoint ? 'Sắp hết hàng' : 'Còn hàng'}
                          status={item.stockLevel <= item.reorderPoint ? 'error' : 'active'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Supplier Scorecard */}
        <Grid item xs={12} lg={5}>
          <DashboardCard title="Thẻ điểm hiệu suất nhà cung cấp" subtitle="Tỷ lệ đúng hạn và chỉ số chất lượng sản phẩm theo nhà cung cấp">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nhà cung cấp</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đúng hạn</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Điểm chất lượng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đơn hàng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retailData?.supplierPerformance.map((s) => (
                    <TableRow key={s.supplierId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{s.supplierName}</TableCell>
                      <TableCell>{s.onTimeDelivery}%</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{s.qualityScore}/100</TableCell>
                      <TableCell>{s.totalOrders}</TableCell>
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
