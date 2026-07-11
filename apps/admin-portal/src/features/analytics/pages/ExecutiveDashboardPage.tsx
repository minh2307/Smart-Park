/**
 * Executive Dashboard Page - MODULE 1
 * Top-level KPI overview with revenue trend, visitor flow, and operational pulse
 */
import React, { useMemo } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useGetDashboardSummaryQuery } from '../services/analyticsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { StatisticCard } from '../components/shared/StatisticCard';
import { DashboardCard } from '../components/shared/DashboardCard';
import { ChartContainer } from '../components/shared/ChartContainer';
import { FilterPanel } from '../components/shared/FilterPanel';
import { KPI_DEFINITIONS } from '../constants/kpiDefinitions';
import { buildLineChartOption } from '../utils/chartHelpers';
import { formatChartDate } from '../utils/dateHelpers';
import { mockRevenueTrend, mockVisitorFlow } from '../services/mockData';
import type { KpiMetric } from '../types/dashboard.types';

export const ExecutiveDashboardPage: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { dateRange, groupBy } = useSelector((state: RootState) => (state as any).analytics);

  const { data: summary, isLoading, refetch } = useGetDashboardSummaryQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    groupBy,
  });

  const revenueTrendOption = useMemo(() => {
    if (!mockRevenueTrend.length) return null;
    const categories = mockRevenueTrend.map((p: { date: string }) => formatChartDate(p.date, 'day'));
    return buildLineChartOption(
      mode,
      categories,
      [
        { name: 'Revenue', data: mockRevenueTrend.map((p: { revenue: number }) => p.revenue), areaStyle: true },
        { name: 'Profit', data: mockRevenueTrend.map((p: { profit: number }) => p.profit), color: '#22c55e', areaStyle: true },
      ],
      'currency'
    );
  }, [mode]);

  const visitorFlowOption = useMemo(() => {
    const categories = mockVisitorFlow.hourly.map((h: { hour: number }) => `${h.hour}:00`);
    return buildLineChartOption(
      mode,
      categories,
      [{ name: 'Visitors', data: mockVisitorFlow.hourly.map((h: { count: number }) => h.count), color: '#0ea5e9', areaStyle: true }],
      'number'
    );
  }, [mode]);

  const getKpiData = (key: string): KpiMetric | undefined => {
    if (!summary) return undefined;
    return (summary as unknown as Record<string, KpiMetric>)[key];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Executive Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time overview of park operations and performance
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue showGroupBy showCompare />

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPI_DEFINITIONS.map((kpiDef: any) => {
          const data = getKpiData(kpiDef.key);
          return (
            <Grid item key={kpiDef.key} xs={kpiDef.gridSize.xs} sm={kpiDef.gridSize.sm} md={kpiDef.gridSize.md} lg={kpiDef.gridSize.lg}>
              <StatisticCard
                title={kpiDef.label}
                value={data?.formattedValue || '-'}
                trend={data?.trend}
                icon={kpiDef.icon}
                color={kpiDef.color}
                sparklineData={data?.sparkline}
                compareLabel="vs last period"
                loading={isLoading}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <DashboardCard title="Revenue Trend" subtitle="Revenue and profit over time" onRefresh={refetch}>
            <ChartContainer option={revenueTrendOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardCard title="Visitor Flow" subtitle="Hourly visitor count today">
            <ChartContainer option={visitorFlowOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
