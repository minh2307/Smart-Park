import React, { useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import * as echarts from 'echarts';
import { useGetFoodCourtStatsQuery } from '../services/foodCourtApi';
import { MdStorefront, MdAttachMoney, MdRestaurantMenu, MdPeople } from 'react-icons/md';

export const FoodCourtDashboard: React.FC = () => {
  const { data: stats, isLoading } = useGetFoodCourtStatsQuery();
  const trendRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !stats) return;

    let trendChart: echarts.ECharts | null = null;
    let detailsChart: echarts.ECharts | null = null;

    if (trendRef.current) {
      trendChart = echarts.init(trendRef.current);
      trendChart.setOption({
        title: { text: 'Xu Hướng Doanh Thu (7 Ngày Gần Nhất)', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}đ' },
        xAxis: {
          type: 'category',
          data: stats.revenueTrend.map((t) => t.date),
        },
        yAxis: { type: 'value', axisLabel: { formatter: (value: number) => `${(value / 1000000).toFixed(0)}tr` } },
        series: [
          {
            data: stats.revenueTrend.map((t) => t.amount),
            type: 'line',
            smooth: true,
            lineStyle: { width: 3, color: '#4caf50' },
            itemStyle: { color: '#4caf50' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(76, 175, 80, 0.4)' },
                { offset: 1, color: 'rgba(76, 175, 80, 0)' },
              ]),
            },
          },
        ],
      });
    }

    if (detailsRef.current) {
      detailsChart = echarts.init(detailsRef.current);
      detailsChart.setOption({
        title: { text: 'Tỷ Lệ Lấp Đầy & Hàng Chờ', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center' },
        series: [
          {
            name: 'Chỉ số',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
              { value: stats.occupancyRate, name: `Lấp đầy (${stats.occupancyRate}%)`, itemStyle: { color: '#3f51b5' } },
              { value: 100 - stats.occupancyRate, name: `Bàn Trống (${(100 - stats.occupancyRate).toFixed(1)}%)`, itemStyle: { color: '#e0e0e0' } },
            ],
          },
        ],
      });
    }

    const handleResize = () => {
      trendChart?.resize();
      detailsChart?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      trendChart?.dispose();
      detailsChart?.dispose();
    };
  }, [stats, isLoading]);

  if (isLoading || !stats) {
    return <Typography sx={{ p: 2 }}>Đang tải dữ liệu dashboard ẩm thực...</Typography>;
  }

  const kpiCards = [
    {
      title: 'Tổng Gian Hàng',
      value: stats.totalRestaurants,
      desc: `Đang hoạt động: ${stats.activeRestaurants}`,
      icon: <MdStorefront style={{ fontSize: '2rem', color: '#3f51b5' }} />,
    },
    {
      title: 'Tổng Doanh Thu Ngày',
      value: `${stats.dailyRevenue.toLocaleString()}đ`,
      desc: 'Hợp nhất các nhà hàng',
      icon: <MdAttachMoney style={{ fontSize: '2rem', color: '#4caf50' }} />,
    },
    {
      title: 'Tổng Đơn Hàng Hôm Nay',
      value: stats.ordersToday,
      desc: `Hàng chờ trung bình: ${stats.averageQueueLength} lượt`,
      icon: <MdRestaurantMenu style={{ fontSize: '2rem', color: '#ff9800' }} />,
    },
    {
      title: 'Hiệu Suất Ghế Lấp Đầy',
      value: `${stats.occupancyRate}%`,
      desc: 'Công suất sử dụng bàn ghế',
      icon: <MdPeople style={{ fontSize: '2rem', color: '#00bcd4' }} />,
    },
  ];

  return (
    <Box mb={4}>
      <Grid container spacing={3} mb={3}>
        {kpiCards.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0px 4px 10px rgba(0,0,0,0.02)' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="bold">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
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

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <div ref={trendRef} style={{ width: '100%', height: '320px' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <div ref={detailsRef} style={{ width: '100%', height: '320px' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Best Sellers */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Sản Phẩm Bán Chạy Nhất (Hôm Nay)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên Món Ăn</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Lượng Bán</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Doanh Thu Ngày</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.bestSellingItems.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{item.name}</TableCell>
                  <TableCell align="right">{item.salesCount} phần</TableCell>
                  <TableCell align="right">{item.revenue.toLocaleString()}đ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};
export default FoodCourtDashboard;
