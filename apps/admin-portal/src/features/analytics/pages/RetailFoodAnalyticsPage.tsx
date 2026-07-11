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
    const categories = retailData.dailyTrend.map((d) => new Date(d.date).toLocaleDateString());
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Restaurant (F&B) Revenue', data: retailData.dailyTrend.map((d) => d.restaurantRevenue) },
        { name: 'Retail Shops Revenue', data: retailData.dailyTrend.map((d) => d.shopRevenue), color: '#3b82f6' },
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
            Retail & F&B Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Food Court yields, retail shop sales performance, inventory turn rates, and supplier KPIs
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
                Restaurant (F&B) Sales
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(retailData?.restaurantRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Food Court operations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Retail Shop Sales
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(retailData?.shopRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Souvenirs & Apparel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Average Order Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency(retailData?.averageOrderValue || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Per checkout receipt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total F&B / Retail Gross
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency((retailData?.restaurantRevenue || 0) + (retailData?.shopRevenue || 0))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Combined aux sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <DashboardCard title="F&B vs Retail Revenue Trend" subtitle="Daily revenue tracking comparison (₫)">
            <ChartContainer option={trendOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardCard title="Revenue Share by Category" subtitle="Top performing product category breakdowns">
            <ChartContainer option={categoriesOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        {/* Product performance Lists */}
        <Grid item xs={12} lg={6}>
          <DashboardCard title="Best Selling Products" subtitle="Top ranked products by sales volumes and revenue">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Units Sold</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sales Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Shop Location</TableCell>
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
          <DashboardCard title="Underperforming Products" subtitle="Products with lowest traction requiring attention">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Units Sold</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sales Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Shop Location</TableCell>
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
          <DashboardCard title="Inventory Turnover Rates" subtitle="Active stock levels and replenishment reorder alerts">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Turnover Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Stock Level</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Reorder Point</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
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
                          label={item.stockLevel <= item.reorderPoint ? 'Low Stock' : 'In Stock'}
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
          <DashboardCard title="Supplier Performance Scorecard" subtitle="On-time rates and product quality index by vendor">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Supplier Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>On-Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quality Score</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Orders</TableCell>
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
