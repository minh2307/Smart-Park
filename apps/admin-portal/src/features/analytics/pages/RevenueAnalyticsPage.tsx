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
        { name: 'Revenue', data: revenueData.trend.map((p) => p.revenue), areaStyle: true },
        { name: 'Operating Cost', data: revenueData.trend.map((p) => p.cost), color: '#ef4444', areaStyle: true },
        { name: 'Net Profit', data: revenueData.trend.map((p) => p.profit), color: '#10b981', areaStyle: true },
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
      [{ name: 'Revenue', data: dataValues, color: '#f59e0b' }],
      true,
      'currency'
    );
  }, [revenueData, mode]);

  // 4. Heatmap: Hourly Revenue by Day of Week
  const heatmapOption = useMemo(() => {
    if (!revenueData?.heatmapData.length) return null;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
            if (value >= 1e6) return `₫${(value / 1e6).toFixed(0)}M`;
            if (value <= -1e6) return `-₫${(Math.abs(value) / 1e6).toFixed(0)}M`;
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
          name: 'Value',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              const val = Math.abs(params.value);
              return val >= 1e6 ? `₫${(val / 1e6).toFixed(1)}M` : `₫${val}`;
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
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In-depth analysis of sales, revenue channels, costs, and profit metrics
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
                Gross Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                +{revenueData?.growthRate || 0}% growth vs last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Operating Cost
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {formatCurrency(revenueData?.totalCost || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Fixed and variable expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Net Profit
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                {formatCurrency(revenueData?.totalProfit || 0)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                Margin: {((revenueData?.totalProfit || 0) / (revenueData?.totalRevenue || 1) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main charts */}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <DashboardCard title="Revenue Trend" subtitle="Revenue, costs, and profit comparison over time">
            <ChartContainer option={trendOption} height={350} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Revenue by Venue" subtitle="Share of sales across park pavilions">
            <ChartContainer option={venuePieOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard title="Ticket Type Sales" subtitle="Revenue distribution by ticket category">
            <ChartContainer option={ticketTypeOption} height={300} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <DashboardCard title="Revenue Heatmap" subtitle="Density of visitor purchases by day and hour">
            <ChartContainer option={heatmapOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardCard title="Profitability Waterfall" subtitle="Flow from gross sales to net profit">
            <ChartContainer option={waterfallOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
