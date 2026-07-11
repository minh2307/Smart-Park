/**
 * ChartContainer - ECharts wrapper with loading, empty, and error states
 * Handles resize and theme switching
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { MdRefresh, MdBarChart } from 'react-icons/md';

interface ChartContainerProps {
  option: EChartsOption | null;
  height?: number | string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  option,
  height = 300,
  loading = false,
  error,
  empty = false,
  emptyText = 'No data available for this period',
  onRetry,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const initChart = useCallback(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }
    chartInstance.current = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
  }, []);

  useEffect(() => {
    initChart();

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [initChart]);

  useEffect(() => {
    if (chartInstance.current && option && !loading && !error && !empty) {
      chartInstance.current.setOption(option, true);
    }
  }, [option, loading, error, empty]);

  useEffect(() => {
    chartInstance.current?.resize();
  }, [height]);

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <CircularProgress size={28} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="caption" color="text.secondary">
          Loading chart data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
          Failed to load chart data
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {error}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            startIcon={<MdRefresh size={14} />}
            onClick={onRetry}
            sx={{ mt: 0.5 }}
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (empty || !option) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <MdBarChart size={36} opacity={0.3} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {emptyText}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Try adjusting the date range or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={chartRef}
      sx={{
        height,
        width: '100%',
        minHeight: 200,
      }}
    />
  );
};
