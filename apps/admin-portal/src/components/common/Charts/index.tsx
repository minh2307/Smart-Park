import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as echarts from 'echarts';

interface ChartProps {
  option: echarts.EChartsOption;
  height?: string | number;
  width?: string | number;
  loading?: boolean;
}

export const Chart: React.FC<ChartProps> = ({
  option,
  height = '350px',
  width = '100%',
  loading = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(option);
    }

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [option]);

  useEffect(() => {
    if (loading) {
      chartInstance.current?.showLoading();
    } else {
      chartInstance.current?.hideLoading();
    }
  }, [loading]);

  return <Box ref={chartRef} sx={{ height, width }} />;
};
