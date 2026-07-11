import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetLockersQuery,
  useGetLockerRentalsQuery,
  useCreateLockerMutation,
  useUpdateLockerStatusMutation,
  useRentLockerMutation,
  useReturnLockerMutation,
} from '../services/lockerApi';
import { Locker, LockerSize, LockerStatus } from '../types';
import { LockerCard } from '../components/LockerCard';
import { LockerTable } from '../components/LockerTable';
import { LockerRentalForm } from '../components/LockerRentalForm';
import { LockerHistoryTable } from '../components/LockerHistoryTable';
import { LockerDashboard } from '../components/LockerDashboard';

export const LockerListPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LockerStatus | ''>('');
  const [sizeFilter, setSizeFilter] = useState<LockerSize | ''>('');

  // Modals state
  const [rentingLocker, setRentingLocker] = useState<Locker | null>(null);
  const [returningLocker, setReturningLocker] = useState<Locker | null>(null);
  const [isNewLockerOpen, setIsNewLockerOpen] = useState(false);

  // Return calculation variables
  const [penaltyFee, setPenaltyFee] = useState(0);
  const [damageFee, setDamageFee] = useState(0);

  // Add locker form values
  const [newCode, setNewCode] = useState('');
  const [newSize, setNewSize] = useState<LockerSize>('SMALL');
  const [newLocation, setNewLocation] = useState('');

  // Queries
  const { data: lockerData, isLoading } = useGetLockersQuery({
    search,
    status: statusFilter || undefined,
    size: sizeFilter || undefined,
  });

  const { data: rentalData } = useGetLockerRentalsQuery({});

  const [createLocker] = useCreateLockerMutation();
  const [updateStatus] = useUpdateLockerStatusMutation();
  const [rentLocker] = useRentLockerMutation();
  const [returnLocker] = useReturnLockerMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateLocker = async () => {
    if (!newCode) return;
    try {
      await createLocker({ lockerCode: newCode, size: newSize, location: newLocation }).unwrap();
      toast.success('Thêm tủ đồ mới thành công!');
      setIsNewLockerOpen(false);
      setNewCode('');
      setNewLocation('');
    } catch (e) {
      toast.error('Không thể tạo tủ đồ mới.');
    }
  };

  const handleRentSubmit = async (values: { customerName: string; deposit: number }) => {
    if (!rentingLocker) return;
    try {
      await rentLocker({
        lockerId: rentingLocker.id,
        customerName: values.customerName,
        deposit: values.deposit,
      }).unwrap();
      toast.success(`Đã kích hoạt khóa số cho tủ ${rentingLocker.lockerCode}`);
      setRentingLocker(null);
    } catch (e) {
      toast.error('Lỗi khi đăng ký thuê tủ đồ.');
    }
  };

  const handleReturnSubmit = async () => {
    if (!returningLocker) return;
    // find active rental
    const activeRental = rentalData?.content.find((r) => r.lockerId === returningLocker.id && r.status === 'ACTIVE');
    if (!activeRental) {
      toast.error('Không tìm thấy giao dịch thuê đang hoạt động.');
      return;
    }

    try {
      await returnLocker({
        rentalId: activeRental.id,
        penalty: penaltyFee,
        damageFee,
      }).unwrap();
      toast.success(`Đã trả tủ đồ ${returningLocker.lockerCode} thành công!`);
      setReturningLocker(null);
      setPenaltyFee(0);
      setDamageFee(0);
    } catch (e) {
      toast.error('Lỗi khi làm thủ tục trả tủ đồ.');
    }
  };

  const handleStatusChange = async (locker: Locker, newStatus: LockerStatus) => {
    try {
      await updateStatus({ id: locker.id, status: newStatus }).unwrap();
      toast.success(`Đã cập nhật trạng thái tủ ${locker.lockerCode} thành: ${newStatus}`);
    } catch (e) {
      toast.error('Không thể cập nhật trạng thái.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản Lý Tủ Đồ Thông Minh (Smart Locker)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cho thuê, quản lý trạng thái ngăn tủ thông minh kỹ thuật số và kiểm tra doanh thu.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<MdAdd />}
          onClick={() => setIsNewLockerOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Thêm Tủ Mới
        </Button>
      </Box>

      {/* Locker statistics */}
      <LockerDashboard />

      {/* Navigation tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Ngăn tủ đồ (Grid View)" />
          <Tab label="Bảng điều khiển (List View)" />
          <Tab label="Lịch sử giao dịch thuê" />
        </Tabs>
      </Box>

      {tabValue < 2 && (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm ngăn tủ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Trạng Thái</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Trạng Thái"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="AVAILABLE">Sẵn sàng</MenuItem>
                    <MenuItem value="OCCUPIED">Đang thuê</MenuItem>
                    <MenuItem value="RESERVED">Đặt trước</MenuItem>
                    <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Kích Thước</InputLabel>
                  <Select
                    value={sizeFilter}
                    label="Kích Thước"
                    onChange={(e) => setSizeFilter(e.target.value as any)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="SMALL">S (Small)</MenuItem>
                    <MenuItem value="MEDIUM">M (Medium)</MenuItem>
                    <MenuItem value="LARGE">L (Large)</MenuItem>
                    <MenuItem value="FAMILY">Family</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tab Contents */}
      {tabValue === 0 && (
        isLoading ? (
          <Typography>Đang tải ngăn tủ...</Typography>
        ) : (
          <Grid container spacing={3}>
            {(lockerData?.content || []).map((locker) => (
              <Grid item xs={12} sm={6} md={4} key={locker.id}>
                <LockerCard
                  locker={locker}
                  onRent={setRentingLocker}
                  onReturn={setReturningLocker}
                  onStatusChange={handleStatusChange}
                />
              </Grid>
            ))}
          </Grid>
        )
      )}

      {tabValue === 1 && (
        isLoading ? (
          <Typography>Đang tải danh sách...</Typography>
        ) : (
          <LockerTable
            lockers={lockerData?.content || []}
            onRent={setRentingLocker}
            onReturn={setReturningLocker}
            onStatusChange={handleStatusChange}
          />
        )
      )}

      {tabValue === 2 && (
        <LockerHistoryTable rentals={rentalData?.content || []} />
      )}

      {/* Dialog for Renting */}
      <Dialog
        open={!!rentingLocker}
        onClose={() => setRentingLocker(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">Đăng ký Thuê Tủ Đồ</DialogTitle>
        <DialogContent>
          {rentingLocker && (
            <LockerRentalForm
              locker={rentingLocker}
              onSubmit={handleRentSubmit}
              onCancel={() => setRentingLocker(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Returning */}
      <Dialog
        open={!!returningLocker}
        onClose={() => setReturningLocker(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="bold">Trả Tủ & Thanh Toán Phụ Phí</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Thủ tục hoàn trả tủ đồ: <strong>{returningLocker?.lockerCode}</strong>
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Phí quá giờ phạt (VNĐ)"
                value={penaltyFee}
                onChange={(e) => setPenaltyFee(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Phí đền bù hư hỏng tủ (VNĐ)"
                value={damageFee}
                onChange={(e) => setDamageFee(Number(e.target.value))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReturningLocker(null)} variant="outlined">
            Hủy
          </Button>
          <Button onClick={handleReturnSubmit} variant="contained" color="error">
            Xác Nhận Trả Tủ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding new locker */}
      <Dialog
        open={isNewLockerOpen}
        onClose={() => setIsNewLockerOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="bold">Thêm Ngăn Tủ Mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã tủ đồ (Locker Code)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ví dụ: L-C304"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Kích thước</InputLabel>
                <Select
                  value={newSize}
                  label="Kích thước"
                  onChange={(e) => setNewSize(e.target.value as any)}
                >
                  <MenuItem value="SMALL">S (Small)</MenuItem>
                  <MenuItem value="MEDIUM">M (Medium)</MenuItem>
                  <MenuItem value="LARGE">L (Large)</MenuItem>
                  <MenuItem value="FAMILY">Family</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả vị trí"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Ví dụ: Tủ số 4 - Hàng C"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsNewLockerOpen(false)} variant="outlined">
            Hủy
          </Button>
          <Button onClick={handleCreateLocker} variant="contained" color="primary">
            Lưu Lại
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default LockerListPage;
