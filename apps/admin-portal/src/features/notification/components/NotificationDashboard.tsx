import React from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { Chart } from '../../../components/common/Charts';
import { NotificationStats } from '../types';

interface NotificationDashboardProps {
  stats: NotificationStats;
  loading?: boolean;
}

export const NotificationDashboard: React.FC<NotificationDashboardProps> = ({ stats, loading }) => {
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      textStyle: { color: '#f8fafc' },
    },
    legend: {
      data: ['Gửi Thành Công', 'Lỗi Gửi'],
      textStyle: { color: '#64748b' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: stats.deliveryTrend.map((item) => item.date),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: 'Gửi Thành Công',
        type: 'line',
        data: stats.deliveryTrend.map((item) => item.sent),
        smooth: true,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' },
          ]),
        },
      },
      {
        name: 'Lỗi Gửi',
        type: 'line',
        data: stats.deliveryTrend.map((item) => item.failed),
        smooth: true,
        itemStyle: { color: '#ef4444' },
      },
    ],
  };

  const statCards = [
    { title: 'Tổng Thông Báo', value: stats.totalNotifications, desc: 'Tất cả các kênh', color: '#3b82f6' },
    { title: 'Chờ Gửi / Lập Lịch', value: stats.scheduledNotifications, desc: 'Lập lịch tự động', color: '#f59e0b' },
    { title: 'Chưa Đọc (In-App)', value: stats.unreadNotifications, desc: 'Đang đợi khách hàng', color: '#8b5cf6' },
    { title: 'Giao Dịch Lỗi', value: stats.failedNotifications, desc: 'Cần kiểm tra log', color: '#ef4444' },
  ];

  const channelRates = [
    { name: 'Tỷ lệ Push thành công', value: stats.pushSuccessRate, color: '#10b981' },
    { name: 'Tỷ lệ Email thành công', value: stats.emailSuccessRate, color: '#06b6d4' },
    { name: 'Tỷ lệ SMS thành công', value: stats.smsSuccessRate, color: '#f59e0b' },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ borderLeft: `4px solid ${card.color}` }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Xu Hướng Gửi Tin Nhắn (7 Ngày Gần Nhất)
              </Typography>
              <Chart option={trendOption as any} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Hiệu Suất Phân Phối Theo Kênh
              </Typography>

              {channelRates.map((rate, idx) => (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {rate.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: rate.color }}>
                      {rate.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={rate.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: rate.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}

              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  * Số liệu hiệu suất phân phối được đồng bộ thời gian thực thông qua Firebase Cloud Messaging và các nhà cung cấp cổng dịch vụ SMS / Email SMTP.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
