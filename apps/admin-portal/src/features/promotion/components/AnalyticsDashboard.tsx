import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import * as echarts from 'echarts';
import { useGetPromotionSummaryQuery } from '../services/promotionApi';
import { PiCoins, PiGift, PiTicket, PiPresentation } from 'react-icons/pi';

export const AnalyticsDashboard: React.FC = () => {
  const { data: summary } = useGetPromotionSummaryQuery();
  const trendRef = useRef<HTMLDivElement>(null);
  const campaignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let trendChart: echarts.ECharts | null = null;
    let campaignChart: echarts.ECharts | null = null;

    if (trendRef.current) {
      trendChart = echarts.init(trendRef.current);
      trendChart.setOption({
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['Doanh thu (USD)', 'Giam gia (USD)'],
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
          data: ['Thang 1', 'Thang 2', 'Thang 3', 'Thang 4', 'Thang 5', 'Thang 6', 'Thang 7'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'Doanh thu (USD)',
            type: 'line',
            data: [12000, 18000, 22000, 31000, 42000, 48000, 52000],
            itemStyle: { color: '#1976d2' },
          },
          {
            name: 'Giam gia (USD)',
            type: 'bar',
            data: [2500, 3100, 4500, 5600, 7100, 8500, 9200],
            itemStyle: { color: '#e53935', borderRadius: [4, 4, 0, 0] },
          },
        ],
      });
    }

    if (campaignRef.current) {
      campaignChart = echarts.init(campaignRef.current);
      campaignChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '5%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: ['Spring VIP', 'Summer Splash', 'Halloween Haunt', 'Weekend Rush'],
        },
        series: [
          {
            name: 'Doanh thu (USD)',
            type: 'bar',
            data: [68000, 145000, 24000, 34200],
            itemStyle: { color: '#2e7d32', borderRadius: [0, 4, 4, 0] },
          },
        ],
      });
    }

    const handleResize = () => {
      trendChart?.resize();
      campaignChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      trendChart?.dispose();
      campaignChart?.dispose();
    };
  }, []);

  const stats = [
    {
      title: 'Tong So Khuyen Mai',
      value: summary?.totalPromotions || 0,
      icon: <PiTicket size={24} />,
      color: 'primary.main',
    },
    {
      title: 'Doanh Thu Mang Lai',
      value: `$${(summary?.revenueGenerated || 0).toLocaleString()}`,
      icon: <PiCoins size={24} />,
      color: 'success.main',
    },
    {
      title: 'So Coupon Da Phat',
      value: (summary?.couponsIssued || 0).toLocaleString(),
      icon: <PiGift size={24} />,
      color: 'warning.main',
    },
    {
      title: 'So Luong Voucher Da Su Dung',
      value: (summary?.voucherUsage || 0).toLocaleString(),
      icon: <PiPresentation size={24} />,
      color: 'info.main',
    },
  ];

  return (
    <Box>
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      color: stat.color,
                      bgcolor: (theme: any) => {
                        const c = stat.color.split('.')[0] as 'primary' | 'success' | 'warning' | 'info';
                        return theme.palette[c]?.light || '#f5f5f5';
                      },
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Xu Huong Khuyen Mai Theo Thang
              </Typography>
              <Box ref={trendRef} sx={{ width: '100%', height: 320 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Hieu Qua Theo Chien Dich (USD)
              </Typography>
              <Box ref={campaignRef} sx={{ width: '100%', height: 320 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default AnalyticsDashboard;
