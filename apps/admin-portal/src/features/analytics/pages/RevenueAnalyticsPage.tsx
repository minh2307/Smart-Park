/**
 * Revenue Analytics Page - MODULE 2
 * Detailed financial analysis including revenue, costs, net profit, and breakdowns
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Card, CardContent } from '@mui/material';
import { useGetRevenueAnalyticsQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { FilterPanel } from '../components/shared/FilterPanel';
import {
  buildLineChartOption,
  buildBarChartOption,
  buildPieChartOption,
  buildHeatmapOption,
} from '../utils/chartHelpers';
import { formatChartDate } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/numberFormatters';
import type { EChartsOption } from 'echarts';

export const RevenueAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange, groupBy } = useSelector((state: RootState) => (state as any).analytics);

  const { data: revenueData, isLoading, refetch } = useGetRevenueAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    groupBy,
  });

  // 1. Line/Area Chart: Revenue, Cost & Profit Trend
  const trendOption = useMemo(() => {
    if (!revenueData?.trend.length) return null;
    const categories = revenueData.trend.map((p) => formatChartDate(p.date, groupBy));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Doanh thu', data: revenueData.trend.map((p) => p.revenue), areaStyle: true },
        { name: 'Chi phí vận hành', data: revenueData.trend.map((p) => p.cost), color: '#ef4444', areaStyle: true },
        { name: 'Lợi nhuận ròng', data: revenueData.trend.map((p) => p.profit), color: '#10b981', areaStyle: true },
      ],
      'currency'
    );
  }, [revenueData, mode, groupBy]);

  // 2. Pie Chart: Revenue by Venue
  const venuePieOption = useMemo(() => {
    if (!revenueData?.breakdown.byVenue.length) return null;
    const chartData = revenueData.breakdown.byVenue.map((v) => ({
      name: v.name,
      value: v.value,
    }));
    return buildPieChartOption(mode, chartData, true, 'currency');
  }, [revenueData, mode]);

  // 3. Bar Chart: Ticket Type Revenue
  const ticketTypeOption = useMemo(() => {
    if (!revenueData?.breakdown.byTicketType.length) return null;
    const categories = revenueData.breakdown.byTicketType.map((t) => t.name);
    const dataValues = revenueData.breakdown.byTicketType.map((t) => t.value);
    return buildBarChartOption(
      mode,
      categories,
      [{ name: 'Doanh thu', data: dataValues, color: '#f59e0b' }],
      true,
      'currency'
    );
  }, [revenueData, mode]);

  // 4. Heatmap: Hourly Revenue by Day of Week
  const heatmapOption = useMemo(() => {
    if (!revenueData?.heatmapData.length) return null;
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return buildHeatmapOption(
      mode,
      hours,
      days,
      revenueData.heatmapData.map((p) => [p.dayOfWeek, p.hour, p.value] as [number, number, number])
    );
  }, [revenueData, mode]);

  // 5. Waterfall Chart: Cash Flow Bridge
  const waterfallOption = useMemo(() => {
    if (!revenueData?.waterfallData.length) return null;
    const categories = revenueData.waterfallData.map((d) => d.name);
    const dataValues = revenueData.waterfallData.map((d) => d.value);

    // ECharts option structure for Waterfall (using transparent placeholder bars)
    const baseOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const tar = params[1] || params[0];
          return `${tar.name}<br/>${tar.seriesName}: ${formatCurrency(Math.abs(tar.value))}`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { interval: 0, rotate: 15 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1e6) return `₫${(value / 1e6).toFixed(0)}Tr`;
            if (value <= -1e6) return `-₫${(Math.abs(value) / 1e6).toFixed(0)}Tr`;
            return `₫${value}`;
          },
        },
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent',
            },
          },
          data: dataValues.map((val, idx) => {
            if (idx === 0) return 0;
            if (idx === dataValues.length - 1) return 0;
            // Cumulative logic
            let sum = 0;
            for (let i = 0; i < idx; i++) {
              sum += dataValues[i];
            }
            return val < 0 ? sum + val : sum;
          }),
        },
        {
          name: 'Giá trị',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              const val = Math.abs(params.value);
              return val >= 1e6 ? `₫${(val / 1e6).toFixed(1)}Tr` : `₫${val}`;
            },
          },
          data: revenueData.waterfallData.map((item) => {
            const color =
              item.type === 'total'
                ? '#3b82f6'
                : item.type === 'income'
                ? '#10b981'
                : '#ef4444';
            return {
              value: item.value,
              itemStyle: { color },
            };
          }),
        },
      ],
    };

    return baseOption as EChartsOption;
  }, [revenueData]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Phân tích doanh thu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phân tích chi tiết doanh số, các kênh doanh thu, chi phí vận hành và lợi nhuận ròng
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue showGroupBy showCompare />

      {/* Summary KPI Widgets */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Doanh thu gộp
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                +{revenueData?.growthRate || 0}% so với kỳ trước
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Chi phí vận hành
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {formatCurrency(revenueData?.totalCost || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Tổng các khoản chi cố định và biến đổi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Lợi nhuận ròng
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {formatCurrency(revenueData?.totalProfit || 0)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                Biên lợi nhuận: {((revenueData?.totalProfit || 0) / (revenueData?.totalRevenue || 1) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main charts */}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <DashboardCard title="Xu hướng doanh thu" subtitle="So sánh doanh thu, chi phí và lợi nhuận thực tế theo thời gian">
            <ChartContainer option={trendOption} height={350} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Doanh thu theo địa điểm" subtitle="Tỷ trọng doanh số giữa các phân khu trong công viên">
            <ChartContainer option={venuePieOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Doanh số theo loại vé" subtitle="Cơ cấu doanh thu phân bổ theo hạng vé bán ra">
            <ChartContainer option={ticketTypeOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <DashboardCard title="Biểu đồ nhiệt doanh thu" subtitle="Mật độ giao dịch thanh toán của du khách theo thứ và giờ">
            <ChartContainer option={heatmapOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardCard title="Thác nước lợi nhuận" subtitle="Dòng biến chuyển từ doanh thu gộp sang lợi nhuận ròng thực tế">
            <ChartContainer option={waterfallOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
