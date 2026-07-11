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
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetParkingAreasQuery,
  useCreateParkingAreaMutation,
  useUpdateParkingAreaMutation,
  useDeleteParkingAreaMutation,
} from '../services/parkingApi';
import { ParkingArea, ParkingStatus } from '../types';
import { ParkingTable } from '../components/ParkingTable';
import { ParkingForm } from '../components/ParkingForm';
import { ParkingDashboard } from '../components/ParkingDashboard';
import { DeleteDialog } from '../../../shared/components/DeleteDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const ParkingListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ParkingStatus | ''>('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Dialog States
  const [editingArea, setEditingArea] = useState<ParkingArea | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingArea, setDeletingArea] = useState<ParkingArea | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // RTK Queries
  const { data, isLoading } = useGetParkingAreasQuery({
    page,
    size,
    search,
    status: statusFilter || undefined,
  });

  const [createArea] = useCreateParkingAreaMutation();
  const [updateArea] = useUpdateParkingAreaMutation();
  const [deleteArea] = useDeleteParkingAreaMutation();

  const handleOpenCreate = () => {
    setEditingArea(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (area: ParkingArea) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (area: ParkingArea) => {
    setDeletingArea(area);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingArea) return;
    try {
      await deleteArea(deletingArea.id).unwrap();
      toast.success('Xóa bãi đỗ xe thành công!');
    } catch (err) {
      toast.error('Không thể xóa bãi đỗ xe.');
    } finally {
      setIsDeleteOpen(false);
      setDeletingArea(null);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingArea) {
        await updateArea({ id: editingArea.id, body: values }).unwrap();
        toast.success('Cập nhật bãi đỗ xe thành công!');
      } else {
        await createArea(values).unwrap();
        toast.success('Thêm bãi đỗ xe mới thành công!');
      }
      setIsFormOpen(false);
      setEditingArea(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu thông tin.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản Lý Bãi Đỗ Xe (Parking)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi, cấu hình và vận hành các điểm đỗ xe thông minh trong khu vui chơi giải trí.
          </Typography>
        </Box>

        <PermissionWrapper requiredPermission="write:venues">
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2 }}
          >
            Thêm Bãi Xe Mới
          </Button>
        </PermissionWrapper>
      </Box>

      {/* Stats Dashboard */}
      <ParkingDashboard />

      {/* Filters Panel */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tìm kiếm bãi xe theo tên hoặc mã..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="parking-status-select-label">Trạng Thái Bãi Xe</InputLabel>
                <Select
                  labelId="parking-status-select-label"
                  label="Trạng Thái Bãi Xe"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="ACTIVE">Hoạt động (ACTIVE)</MenuItem>
                  <MenuItem value="INACTIVE">Tạm dừng (INACTIVE)</MenuItem>
                  <MenuItem value="MAINTENANCE">Bảo trì (MAINTENANCE)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      {isLoading ? (
        <Typography>Đang tải danh sách bãi xe...</Typography>
      ) : (
        <ParkingTable
          areas={data?.content || []}
          onView={(area) => toast.info(`Xem chi tiết bãi xe: ${area.name}`)}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Create / Edit Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">
          {editingArea ? `Chỉnh sửa bãi xe: ${editingArea.code}` : 'Thêm bãi đỗ xe mới'}
        </DialogTitle>
        <DialogContent>
          <ParkingForm
            initialValues={editingArea || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteOpen}
        title="Xóa Bãi Đỗ Xe"
        description={`Bạn có chắc chắn muốn xóa bãi đỗ xe ${deletingArea?.name} (${deletingArea?.code})?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </Box>
  );
};
export default ParkingListPage;
