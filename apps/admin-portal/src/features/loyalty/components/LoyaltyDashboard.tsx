import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import * as echarts from 'echarts';

export const LoyaltyDashboard: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let barChart: echarts.ECharts | null = null;
    let pieChart: echarts.ECharts | null = null;

    if (chartRef.current) {
      barChart = echarts.init(chartRef.current);
      barChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          data: ['Points Issued', 'Points Redeemed'],
          textStyle: { color: '#64748b' },
          bottom: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          axisLabel: { color: '#64748b' },
          axisLine: { lineStyle: { color: '#cbd5e1' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b' },
          splitLine: { lineStyle: { color: '#f1f5f9' } },
        },
        series: [
          {
            name: 'Points Issued',
            type: 'bar',
            data: [4200, 5100, 6200, 7800, 8100, 9400, 11200],
            itemStyle: { color: '#2e7d32', borderRadius: [4, 4, 0, 0] },
          },
          {
            name: 'Points Redeemed',
            type: 'bar',
            data: [1200, 1900, 2400, 3100, 4200, 4800, 5200],
            itemStyle: { color: '#d32f2f', borderRadius: [4, 4, 0, 0] },
          },
        ],
      });
    }

    if (pieRef.current) {
      pieChart = echarts.init(pieRef.current);
      pieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          textStyle: { color: '#64748b' },
        },
        series: [
          {
            name: 'Members Tier Distribution',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 142, name: 'Bronze Base', itemStyle: { color: '#f97316' } },
              { value: 98, name: 'Silver Rewards', itemStyle: { color: '#94a3b8' } },
              { value: 54, name: 'Gold Elite', itemStyle: { color: '#eab308' } },
              { value: 21, name: 'Platinum Prestige', itemStyle: { color: '#6366f1' } },
            ],
          },
        ],
      });
    }

    const handleResize = () => {
      barChart?.resize();
      pieChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      barChart?.dispose();
      pieChart?.dispose();
    };
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              Monthly Earn vs Redeem Trends
            </Typography>
            <Box ref={chartRef} sx={{ width: '100%', height: 320 }} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              Tier Membership Distribution
            </Typography>
            <Box ref={pieRef} sx={{ width: '100%', height: 320 }} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
