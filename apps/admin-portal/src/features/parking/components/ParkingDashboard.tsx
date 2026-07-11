import React, { useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import * as echarts from 'echarts';
import { useGetParkingDashboardStatsQuery } from '../services/parkingApi';
import { MdDriveEta, MdLocalParking, MdAttachMoney, MdAccessTime } from 'react-icons/md';

export const ParkingDashboard: React.FC = () => {
  const { data: stats, isLoading } = useGetParkingDashboardStatsQuery();
  const occupancyRef = useRef<HTMLDivElement | null>(null);
  const peakRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !stats) return;

    let occupancyChart: echarts.ECharts | null = null;
    let peakChart: echarts.ECharts | null = null;

    if (occupancyRef.current) {
      occupancyChart = echarts.init(occupancyRef.current);
      occupancyChart.setOption({
        title: { text: 'Trạng Thái Chỗ Đỗ', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', left: 'center' },
        series: [
          {
            name: 'Số chỗ',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
              { value: stats.availableSpaces, name: `Trống (${stats.availableSpaces})`, itemStyle: { color: '#2e7d32' } },
              { value: stats.occupiedSpaces, name: `Đầy (${stats.occupiedSpaces})`, itemStyle: { color: '#d32f2f' } },
              { value: stats.reservedSpaces, name: `Đặt trước (${stats.reservedSpaces})`, itemStyle: { color: '#ed6c02' } },
              { value: stats.disabledSpaces, name: `Khuyết tật (${stats.disabledSpaces})`, itemStyle: { color: '#0288d1' } },
            ],
          },
        ],
      });
    }

    if (peakRef.current) {
      peakChart = echarts.init(peakRef.current);
      peakChart.setOption({
        title: { text: 'Lưu Lượng Xe Theo Giờ', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: stats.peakHours.map((h) => h.hour),
        },
        yAxis: { type: 'value' },
        series: [
          {
            data: stats.peakHours.map((h) => h.count),
            type: 'line',
            smooth: true,
            lineStyle: { width: 3, color: '#1976d2' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(25, 118, 210, 0.4)' },
                { offset: 1, color: 'rgba(25, 118, 210, 0)' },
              ]),
            },
          },
        ],
      });
    }

    const handleResize = () => {
      occupancyChart?.resize();
      peakChart?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      occupancyChart?.dispose();
      peakChart?.dispose();
    };
  }, [stats, isLoading]);

  if (isLoading || !stats) {
    return <Typography sx={{ p: 2 }}>Đang tải dữ liệu dashboard...</Typography>;
  }

  const kpis = [
    {
      title: 'Tổng Bãi Xe',
      value: stats.totalAreas,
      icon: <MdLocalParking style={{ fontSize: '2rem', color: '#1976d2' }} />,
      desc: 'Khu vực đỗ xe hiện hữu',
    },
    {
      title: 'Tổng Số Chỗ',
      value: stats.totalSpaces,
      icon: <MdDriveEta style={{ fontSize: '2rem', color: '#2e7d32' }} />,
      desc: `Trống: ${stats.availableSpaces} | Bận: ${stats.occupiedSpaces}`,
    },
    {
      title: 'Doanh Thu Đỗ Xe',
      value: `${stats.parkingRevenue.toLocaleString()}đ`,
      icon: <MdAttachMoney style={{ fontSize: '2rem', color: '#ed6c02' }} />,
      desc: 'Tổng thu nhập trong ngày',
    },
    {
      title: 'Thời Gian Đỗ Trung Bình',
      value: '4.2 Giờ',
      icon: <MdAccessTime style={{ fontSize: '2rem', color: '#9c27b0' }} />,
      desc: 'Ước tính lượt đỗ trong ngày',
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
              <div ref={occupancyRef} style={{ width: '100%', height: '320px' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <div ref={peakRef} style={{ width: '100%', height: '320px' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default ParkingDashboard;
