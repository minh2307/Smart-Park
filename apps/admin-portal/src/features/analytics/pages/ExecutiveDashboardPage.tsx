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
  const { user } = useSelector((state: RootState) => state.auth);

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
        { name: 'Doanh thu', data: mockRevenueTrend.map((p: { revenue: number }) => p.revenue), areaStyle: true },
        { name: 'Lợi nhuận', data: mockRevenueTrend.map((p: { profit: number }) => p.profit), color: '#22c55e', areaStyle: true },
      ],
      'currency'
    );
  }, [mode]);

  const visitorFlowOption = useMemo(() => {
    const categories = mockVisitorFlow.hourly.map((h: { hour: number }) => `${h.hour}:00`);
    return buildLineChartOption(
      mode,
      categories,
      [{ name: 'Lượt khách', data: mockVisitorFlow.hourly.map((h: { count: number }) => h.count), color: '#0ea5e9', areaStyle: true }],
      'number'
    );
  }, [mode]);

  const getKpiData = (key: string): KpiMetric | undefined => {
    if (!summary) return undefined;
    return (summary as unknown as Record<string, KpiMetric>)[key];
  };

  const visibleKpis = useMemo(() => {
    return KPI_DEFINITIONS.filter(kpi => {
      if (!kpi.allowedRoles) return true;
      return kpi.allowedRoles.includes(user?.role || '');
    });
  }, [user?.role]);

  const canSeeRevenue = user?.role === 'SYSTEM_ADMIN' || user?.role === 'PARK_MANAGER';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Tổng quan điều hành
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan thời gian thực về hoạt động và hiệu suất của công viên
          </Typography>
        </Box>
      </Box>

      <FilterPanel onRefresh={refetch} showVenue showGroupBy showCompare />

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {visibleKpis.map((kpiDef: any) => {
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
                compareLabel="so với kỳ trước"
                loading={isLoading}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5}>
        {canSeeRevenue && (
          <Grid item xs={12} lg={7}>
            <DashboardCard title="Xu hướng doanh thu" subtitle="Doanh thu và lợi nhuận theo thời gian" onRefresh={refetch}>
              <ChartContainer option={revenueTrendOption} height={320} loading={isLoading} />
            </DashboardCard>
          </Grid>
        )}

        <Grid item xs={12} lg={canSeeRevenue ? 5 : 12}>
          <DashboardCard title="Lưu lượng khách tham quan" subtitle="Số lượng khách tham quan theo giờ hôm nay">
            <ChartContainer option={visitorFlowOption} height={320} loading={isLoading} />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
