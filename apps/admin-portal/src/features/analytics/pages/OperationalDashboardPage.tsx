/**
 * Operational Dashboard Page - MODULE 11
 * Real-time monitoring of gates, rides, lockers, scanners, incidents, maintenance, and weather impacts
 */
import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import { useGetOperationalDashboardQuery } from '../services/analyticsApi';
import { DashboardCard } from '../components/shared/DashboardCard';
import { StatusChip } from '../components/shared/StatusChip';
import { MdRefresh, MdWarning, MdCloud } from 'react-icons/md';

export const OperationalDashboardPage: React.FC = () => {
  const { data: opData, refetch } = useGetOperationalDashboardQuery(undefined, {
    // Enable auto-refetch every 10 seconds to simulate real-time operations
    pollingInterval: 10000,
  });

  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);

  const handleSimulateIncident = () => {
    setSimulationAlert('Kích hoạt giả lập: Cảnh báo cảm biến tự động chẩn đoán đã được gửi tới đội ngũ kỹ thuật tàu lượn Thunder Coaster.');
    setTimeout(() => {
      setSimulationAlert(null);
    }, 5000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Bảng điều khiển vận hành thời gian thực
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi trạng thái thời gian thực, lưu lượng soát vé ở cổng, tín hiệu kết nối thiết bị quét, các sự cố hiện tại và ảnh hưởng của thời tiết
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSimulateIncident}
            color="warning"
            startIcon={<MdWarning />}
          >
            Giả lập Ping thiết bị
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => refetch()}
            startIcon={<MdRefresh />}
          >
            Tải lại trạng thái
          </Button>
        </Box>
      </Box>

      {simulationAlert && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} variant="filled">
          {simulationAlert}
        </Alert>
      )}

      {/* Main Operational Summary metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Sự cố đang hoạt động
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                {opData?.incidents.filter((i) => i.status !== 'resolved').length || 0} Đang xử lý
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đã giải quyết hôm nay: {opData?.incidents.filter((i) => i.status === 'resolved').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Sức chứa tủ khóa thông minh
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {opData?.lockerStatus.inUse || 0} / {opData?.lockerStatus.totalLockers || 0}
              </Typography>
              <Typography variant="caption" color="success.main">
                Còn trống: {opData?.lockerStatus.available || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Yêu cầu hỗ trợ (Tickets)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>
                {opData?.supportTickets.open || 0} Đang mở
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thời gian giải quyết TB: {opData?.supportTickets.averageResolutionHours || 0} giờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Chỉ số ảnh hưởng thời tiết
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdCloud size={24} /> {opData?.weatherImpact.currentTemp}°C
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                Dự báo: {opData?.weatherImpact.condition} (ảnh hưởng: {opData?.weatherImpact.visitorImpact})
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Devices and Incidents */}
      <Grid container spacing={2.5}>
        {/* Ride Status List */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Dữ liệu đo lường trò chơi" subtitle="Tỷ lệ lấp đầy, thời gian chờ xếp hàng và trạng thái cơ khí thời gian thực">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên trò chơi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mức lấp đầy</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Thời gian chờ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.rideStatus.map((ride) => (
                    <TableRow key={ride.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{ride.name}</TableCell>
                      <TableCell>{ride.currentLoad} / {ride.maxCapacity} ({((ride.currentLoad / (ride.maxCapacity || 1)) * 100).toFixed(0)}%)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: ride.waitTimeMinutes > 20 ? 'error.main' : 'text.primary' }}>
                        {ride.waitTimeMinutes} phút
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={ride.status === 'active' ? 'Hoạt động' : ride.status === 'maintenance' ? 'Bảo trì' : 'Ngoại tuyến'}
                          status={ride.status === 'active' ? 'active' : ride.status === 'maintenance' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Access Gates Status */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Dữ liệu đo lường cổng kiểm soát" subtitle="Trạng thái thiết bị quét trực tiếp, lượt quét thành công trong ngày và mốc thời gian hoạt động cuối">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã cổng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Số lượt soát vé</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lượt vào cuối</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.gateStatus.map((gate) => (
                    <TableRow key={gate.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{gate.name}</TableCell>
                      <TableCell>{gate.scansToday.toLocaleString()} lượt</TableCell>
                      <TableCell>{new Date(gate.lastScan).toLocaleTimeString('vi-VN')}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={gate.status === 'open' ? 'Mở' : gate.status === 'maintenance' ? 'Bảo trì' : 'Đóng'}
                          status={gate.status === 'open' ? 'active' : gate.status === 'maintenance' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Operational Staff Shift status */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="Nhân viên vận hành trực ca" subtitle="Theo dõi ca trực của nhân viên bảo vệ và kỹ thuật">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nhân viên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Khu vực phân công</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ca trực</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.operatorStatus.map((op) => (
                    <TableRow key={op.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{op.fullName}</TableCell>
                      <TableCell>{op.assignedArea}</TableCell>
                      <TableCell>{op.shiftStart} - {op.shiftEnd}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={op.status === 'active' ? 'Hoạt động' : op.status === 'break' ? 'Nghỉ ca' : 'Ngoại tuyến'}
                          status={op.status === 'active' ? 'active' : op.status === 'break' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Active Incident Feed */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="Nguồn cấp sự cố đang hoạt động" subtitle="Nhật ký các điểm bất thường, mối nguy hiểm và cảnh báo dịch vụ khách hàng">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chi tiết sự cố</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mức độ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.incidents.map((inc) => (
                    <TableRow key={inc.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{inc.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{inc.location} • {new Date(inc.reportedAt).toLocaleTimeString('vi-VN')}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: inc.severity === 'critical' || inc.severity === 'high' ? 'error.main' : 'warning.main',
                            textTransform: 'uppercase',
                          }}
                        >
                          {inc.severity === 'critical' ? 'Rất nghiêm trọng' : inc.severity === 'high' ? 'Nghiêm trọng' : inc.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={inc.status === 'resolved' ? 'Đã giải quyết' : inc.status === 'investigating' ? 'Đang điều tra' : 'Đang xử lý'}
                          status={inc.status === 'resolved' ? 'active' : inc.status === 'investigating' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>

        {/* Scheduled Maintenance list */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="Danh sách bảo trì an toàn" subtitle="Các hoạt động sửa chữa định kỳ và kiểm toán an toàn">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mục tiêu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Độ ưu tiên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opData?.maintenanceItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.targetName}</Typography>
                        <Typography variant="caption" color="text.secondary">Phân công: {item.assignedTo}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: item.priority === 'high' ? 'error.main' : 'text.secondary',
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang tiến hành' : 'Chờ xử lý'}
                          status={item.status === 'completed' ? 'active' : item.status === 'in_progress' ? 'pending' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};
