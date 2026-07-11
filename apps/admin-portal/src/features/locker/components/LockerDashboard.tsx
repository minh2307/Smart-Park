import React, { useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import * as echarts from 'echarts';
import { useGetLockerDashboardStatsQuery } from '../services/lockerApi';
import { MdInbox, MdCheckCircle, MdBlock, MdTrendingUp } from 'react-icons/md';

export const LockerDashboard: React.FC = () => {
  const { data: stats, isLoading } = useGetLockerDashboardStatsQuery();
  const statusRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !stats) return;

    let statusChart: echarts.ECharts | null = null;
    let sizeChart: echarts.ECharts | null = null;

    if (statusRef.current) {
      statusChart = echarts.init(statusRef.current);
      statusChart.setOption({
        title: { text: 'Tỷ Lệ Trạng Thái Tủ', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center' },
        series: [
          {
            name: 'Trạng thái',
            type: 'pie',
            radius: '60%',
            data: [
              { value: stats.availableCount, name: `Sẵn sàng (${stats.availableCount})`, itemStyle: { color: '#4caf50' } },
              { value: stats.occupiedCount, name: `Đang sử dụng (${stats.occupiedCount})`, itemStyle: { color: '#f44336' } },
              { value: stats.reservedCount, name: `Đã đặt trước (${stats.reservedCount})`, itemStyle: { color: '#ff9800' } },
              { value: stats.outOfServiceCount, name: `Bảo trì/Lỗi (${stats.outOfServiceCount})`, itemStyle: { color: '#9e9e9e' } },
            ],
          },
        ],
      });
    }

    if (sizeRef.current) {
      sizeChart = echarts.init(sizeRef.current);
      sizeChart.setOption({
        title: { text: 'Phân Bổ Kích Thước Tủ', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['S', 'M', 'L', 'Family', 'VIP'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Tủ',
            type: 'bar',
            data: [12, 19, 8, 5, 2],
            itemStyle: { color: '#2196f3', borderRadius: [4, 4, 0, 0] },
          },
        ],
      });
    }

    const handleResize = () => {
      statusChart?.resize();
      sizeChart?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      statusChart?.dispose();
      sizeChart?.dispose();
    };
  }, [stats, isLoading]);

  if (isLoading || !stats) {
    return <Typography sx={{ p: 2 }}>Đang tải dữ liệu dashboard tủ đồ...</Typography>;
  }

  const kpis = [
    {
      title: 'Tổng Số Tủ Đồ',
      value: stats.totalLockers,
      icon: <MdInbox style={{ fontSize: '2rem', color: '#2196f3' }} />,
      desc: 'Tủ đồ thông minh (Smart Lockers)',
    },
    {
      title: 'Hiệu Suất Sử Dụng',
      value: `${stats.usageRate.toFixed(1)}%`,
      icon: <MdTrendingUp style={{ fontSize: '2rem', color: '#ff9800' }} />,
      desc: 'Tỷ lệ lấp đầy hiện tại',
    },
    {
      title: 'Đang Trống',
      value: stats.availableCount,
      icon: <MdCheckCircle style={{ fontSize: '2rem', color: '#4caf50' }} />,
      desc: 'Có thể cho thuê ngay',
    },
    {
      title: 'Bảo Trì / Hỏng',
      value: stats.outOfServiceCount,
      icon: <MdBlock style={{ fontSize: '2rem', color: '#f44336' }} />,
      desc: 'Đang khóa hoặc sửa chữa',
    },
  ];

  return (
    <Box mb={4}>
      <Grid container spacing={3} mb={3}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0px 4px 10px rgba(0,0,0,0.03)' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="bold">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                      {kpi.value}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {kpi.desc}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <div ref={statusRef} style={{ width: '100%', height: '300px' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <div ref={sizeRef} style={{ width: '100%', height: '300px' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default LockerDashboard;
