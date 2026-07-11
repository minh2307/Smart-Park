import React, { useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import * as echarts from 'echarts';
import { MdTrendingUp, MdAttachMoney, MdOutlineAnalytics, MdStar } from 'react-icons/md';

export const SalesAnalytics: React.FC = () => {
  const trendRef = useRef<HTMLDivElement | null>(null);
  const catDistributionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let trendChart: echarts.ECharts | null = null;
    let catChart: echarts.ECharts | null = null;

    if (trendRef.current) {
      trendChart = echarts.init(trendRef.current);
      trendChart.setOption({
        title: { text: 'Doanh Thu Bán Lẻ & Dịch Vụ Theo Ngày', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}đ' },
        xAxis: {
          type: 'category',
          data: ['03/07', '04/07', '05/07', '06/07', '07/07', '08/07', '09/07'],
        },
        yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(0)}tr` } },
        series: [
          {
            name: 'Doanh thu',
            data: [78000000, 92000000, 85000000, 64000000, 71000000, 105000000, 128000000],
            type: 'line',
            smooth: true,
            lineStyle: { width: 3, color: '#3f51b5' },
            itemStyle: { color: '#3f51b5' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(63, 81, 181, 0.4)' },
                { offset: 1, color: 'rgba(63, 81, 181, 0)' },
              ]),
            },
          },
        ],
      });
    }

    if (catDistributionRef.current) {
      catChart = echarts.init(catDistributionRef.current);
      catChart.setOption({
        title: { text: 'Cơ Cấu Doanh Thu Theo Danh Mục', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center' },
        series: [
          {
            name: 'Doanh thu',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
              { value: 45000000, name: 'Đồ Bơi Nam/Nữ', itemStyle: { color: '#4caf50' } },
              { value: 32000000, name: 'Kính & Mũ Bơi', itemStyle: { color: '#2196f3' } },
              { value: 28000000, name: 'Quà Lưu Niệm', itemStyle: { color: '#ff9800' } },
              { value: 23000000, name: 'Đồ Chơi & Phao Bơi', itemStyle: { color: '#9c27b0' } },
            ],
          },
        ],
      });
    }

    const handleResize = () => {
      trendChart?.resize();
      catChart?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      trendChart?.dispose();
      catChart?.dispose();
    };
  }, []);

  const kpis = [
    {
      title: 'Tổng Doanh Số Kỳ Này',
      value: '653,000,000đ',
      desc: 'Tăng 12.5% so với tuần trước',
      icon: <MdAttachMoney style={{ fontSize: '2rem', color: '#4caf50' }} />,
    },
    {
      title: 'Lợi Nhuận Gộp',
      value: '284,500,000đ',
      desc: 'Tỷ suất biên lợi nhuận: 43.5%',
      icon: <MdTrendingUp style={{ fontSize: '2rem', color: '#3f51b5' }} />,
    },
    {
      title: 'Giá Trị Đơn Trung Bình (AOV)',
      value: '245,000đ',
      desc: 'Ước lượng giỏ hàng bán lẻ',
      icon: <MdOutlineAnalytics style={{ fontSize: '2rem', color: '#ff9800' }} />,
    },
    {
      title: 'Tỷ Lệ Chuyển Đổi',
      value: '38.4%',
      desc: 'Lượt mua/lượt vào bến',
      icon: <MdStar style={{ fontSize: '2rem', color: '#e91e63' }} />,
    },
  ];

  const bestSellers = [
    { name: 'Kính Bơi Speedo Pro', category: 'Kính & Mũ Bơi', qty: 245, rev: 85750000 },
    { name: 'Móc Khóa Mascot GateOS', category: 'Quà Lưu Niệm', qty: 540, rev: 24300000 },
    { name: 'Mũ Bơi Silicon GateOS', category: 'Kính & Mũ Bơi', qty: 180, rev: 16200000 },
  ];

  return (
    <Box mb={4}>
      <Grid container spacing={3} mb={3}>
        {kpis.map((kpi, idx) => (
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
              <div ref={catDistributionRef} style={{ width: '100%', height: '320px' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Best Sellers Table */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Báo Cáo Mặt Hàng Bán Chạy (Retail Best Sellers)
          </Typography>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên Sản Phẩm</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Danh Mục</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số Lượng Đã Bán</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tổng Doanh Thu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bestSellers.map((item, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="right">{item.qty} món</TableCell>
                  <TableCell align="right">{item.rev.toLocaleString()}đ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};
export default SalesAnalytics;
