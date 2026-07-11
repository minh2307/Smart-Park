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
import { MdAdd, MdWarning } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetGatesQuery,
  useCreateGateMutation,
  useUpdateGateMutation,
  useDeleteGateMutation,
} from '../services/gateApi';
import { Gate, GateStatus, GateType } from '../types';
import { GateTable } from '../components/GateTable';
import { GateForm } from '../components/GateForm';
import { GateDetails } from '../components/GateDetails';
import { DeleteDialog } from '../../../shared/components/DeleteDialog';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const GateListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<GateType | ''>('');
  const [statusFilter, setStatusFilter] = useState<GateStatus | ''>('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Detail / Form State
  const [viewingGate, setViewingGate] = useState<Gate | null>(null);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Delete Dialog State
  const [deletingGate, setDeletingGate] = useState<Gate | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Queries & Mutations
  const { data, isLoading } = useGetGatesQuery({
    page,
    size,
    search,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const [createGate] = useCreateGateMutation();
  const [updateGate] = useUpdateGateMutation();
  const [deleteGate] = useDeleteGateMutation();

  const handleOpenCreate = () => {
    setEditingGate(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (gate: Gate) => {
    setEditingGate(gate);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (gate: Gate) => {
    setDeletingGate(gate);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingGate) return;
    try {
      await deleteGate(deletingGate.id).unwrap();
      toast.success('Xóa cổng kiểm soát thành công!');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xóa cổng.');
    } finally {
      setIsDeleteOpen(false);
      setDeletingGate(null);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingGate) {
        await updateGate({ id: editingGate.id, body: values }).unwrap();
        toast.success('Cập nhật cổng kiểm soát thành công!');
      } else {
        await createGate(values).unwrap();
        toast.success('Thêm cổng kiểm soát mới thành công!');
      }
      setIsFormOpen(false);
      setEditingGate(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu thông tin cổng.');
    }
  };

  const handleEmergencyOverride = async (gate: Gate) => {
    try {
      await updateGate({
        id: gate.id,
        body: { status: 'EMERGENCY', deviceStatus: 'ONLINE' },
      }).unwrap();
      toast.warn(`Đã kích hoạt chế độ KHẨN CẤP cho cổng ${gate.code}!`);
    } catch (err) {
      toast.error('Không thể kích hoạt chế độ khẩn cấp.');
    }
  };

  const handleRestoreNormal = async (gate: Gate) => {
    try {
      await updateGate({
        id: gate.id,
        body: { status: 'OPEN' },
      }).unwrap();
      toast.success(`Cổng ${gate.code} đã trở lại trạng thái bình thường.`);
      if (viewingGate?.id === gate.id) {
        setViewingGate({ ...viewingGate, status: 'OPEN' });
      }
    } catch (err) {
      toast.error('Không thể khôi phục trạng thái cổng.');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  if (viewingGate) {
    return (
      <Box sx={{ p: 3 }}>
        <GateDetails
          gate={viewingGate}
          onBack={() => setViewingGate(null)}
          onEdit={() => {
            setEditingGate(viewingGate);
            setViewingGate(null);
            setIsFormOpen(true);
          }}
        />
        {viewingGate.status === 'EMERGENCY' && (
          <Card variant="outlined" sx={{ mt: 3, borderColor: 'warning.main', bgcolor: 'warning.light', p: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MdWarning style={{ fontSize: '2.5rem', color: 'orange' }} />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="h6" fontWeight="bold">Cổng Đang Trong Trạng Thái Khẩn Cấp!</Typography>
                  <Typography variant="body2" mb={1}>
                    Tất cả các rào cản đang được mở khóa tự động để đảm bảo an toàn thoát hiểm.
                  </Typography>
                  <Button variant="contained" color="warning" onClick={() => handleRestoreNormal(viewingGate)}>
                    Khôi phục hoạt động bình thường
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản Lý Cổng Ra Vào (Gates)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình cổng kiểm soát vé, giám sát trạng thái thiết bị ngoại vi và chỉ định khu vực quét vé.
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
            Thêm Cổng Mới
          </Button>
        </PermissionWrapper>
      </Box>

      {/* Filters */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tìm kiếm theo mã, tên hoặc operator..."
                value={search}
                onChange={handleSearchChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="type-filter-label">Loại Cổng</InputLabel>
                <Select
                  labelId="type-filter-label"
                  label="Loại Cổng"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as any);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả loại cổng</MenuItem>
                  <MenuItem value="ENTRY">ENTRY (Lối vào)</MenuItem>
                  <MenuItem value="EXIT">EXIT (Lối ra)</MenuItem>
                  <MenuItem value="RIDE">RIDE (Cổng trò chơi)</MenuItem>
                  <MenuItem value="VIP">VIP (Cổng ưu tiên)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Trạng Thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  label="Trạng Thái"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="OPEN">OPEN (Mở)</MenuItem>
                  <MenuItem value="CLOSED">CLOSED (Đóng)</MenuItem>
                  <MenuItem value="BUSY">BUSY (Bận)</MenuItem>
                  <MenuItem value="MAINTENANCE">MAINTENANCE (Bảo trì)</MenuItem>
                  <MenuItem value="OFFLINE">OFFLINE (Ngoại tuyến)</MenuItem>
                  <MenuItem value="EMERGENCY">EMERGENCY (Khẩn cấp)</MenuItem>
                  <MenuItem value="DISABLED">DISABLED (Vô hiệu hóa)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      {isLoading ? (
        <Typography>Đang tải dữ liệu cổng...</Typography>
      ) : (
        <GateTable
          gates={data?.content || []}
          onView={(g) => setViewingGate(g)}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteClick}
          onEmergencyOverride={handleEmergencyOverride}
        />
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">
          {editingGate ? `Chỉnh sửa Cổng: ${editingGate.code}` : 'Thêm Cổng Kiểm Soát Mới'}
        </DialogTitle>
        <DialogContent>
          <GateForm
            initialValues={editingGate || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteDialog
        open={isDeleteOpen}
        title="Xóa Cổng Kiểm Soát"
        description={`Bạn có chắc chắn muốn xóa cổng kiểm soát ${deletingGate?.name} (${deletingGate?.code})? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </Box>
  );
};
export default GateListPage;
