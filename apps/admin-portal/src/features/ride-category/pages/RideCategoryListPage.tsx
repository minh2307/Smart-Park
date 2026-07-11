import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { Button } from '../../../components/common/Button';
import { Modal, StatusDialog } from '../../../components/common/Dialog';
import { RideCategoryTable } from '../components/RideCategoryTable';
import { RideCategoryDetails } from '../components/RideCategoryDetails';
import { RideCategoryForm } from '../components/RideCategoryForm';
import { RideCategoryFormInput } from '../schemas/rideCategorySchema';
import {
  useGetRideCategoriesQuery,
  useCreateRideCategoryMutation,
  useUpdateRideCategoryMutation,
  useDeleteRideCategoryMutation,
  mockRideCategories,
} from '../services/rideCategoryApi';
import { RideCategory } from '../types';
import { MdAdd, MdCategory, MdCheckCircle } from 'react-icons/md';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

export const RideCategoryListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  
  const { data, isLoading, isError, refetch } = useGetRideCategoriesQuery({
    search,
    status,
  });

  const [createCategory, { isLoading: isCreating }] = useCreateRideCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateRideCategoryMutation();
  const [deleteCategory] = useDeleteRideCategoryMutation();

  // Local offline fallbacks
  const [localCategories, setLocalCategories] = useState<RideCategory[]>(mockRideCategories);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RideCategory | null>(null);

  // Deletion modals
  const [deleteTarget, setDeleteTarget] = useState<RideCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
  };

  const handleFormSubmit = async (formData: RideCategoryFormInput) => {
    try {
      const categoryBody = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        status: formData.status,
      };

      if (editingCategory) {
        // Edit flow
        try {
          await updateCategory({ id: editingCategory.id, body: categoryBody }).unwrap();
        } catch {
          // Offline update
          const updated = localCategories.map((c) => {
            if (c.id === editingCategory.id) {
              return {
                ...c,
                ...categoryBody,
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          });
          setLocalCategories(updated);
        }
      } else {
        // Create flow
        try {
          await createCategory(categoryBody).unwrap();
        } catch {
          // Offline create
          const newMockId = Math.max(...localCategories.map((c) => c.id), 0) + 1;
          const newCat: RideCategory = {
            id: newMockId,
            name: formData.name,
            code: formData.code,
            description: formData.description || undefined,
            status: formData.status,
            rideCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setLocalCategories([newCat, ...localCategories]);
        }
      }
      setFormOpen(false);
      setEditingCategory(null);
      refetch();
    } catch (err) {
      console.error('Failed to save category', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await deleteCategory(deleteTarget.id).unwrap();
      } catch {
        // Offline delete
        setLocalCategories(localCategories.filter((c) => c.id !== deleteTarget.id));
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  const filteredLocalCategories = localCategories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || c.status === status;
    return matchesSearch && matchesStatus;
  });

  const displayData = data?.content || (isLoading ? [] : filteredLocalCategories);
  const displayTotal = data?.totalElements ?? filteredLocalCategories.length;

  const activeCount = displayData.filter((c) => c.status === 'ACTIVE').length;

  return (
    <PageContainer
      title="Quản lý danh mục trò chơi"
      toolbar={
        <PermissionWrapper requiredPermission="write:rides">
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            Thêm danh mục
          </Button>
        </PermissionWrapper>
      }
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="primary.light" sx={{ borderRadius: 2.5, color: 'primary.contrastText', display: 'flex' }}>
                  <MdCategory size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Tổng danh mục</Typography>
                  <Typography variant="h5" fontWeight="bold">{displayTotal}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="success.light" sx={{ borderRadius: 2.5, color: 'success.contrastText', display: 'flex' }}>
                  <MdCheckCircle size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Danh mục hoạt động</Typography>
                  <Typography variant="h5" fontWeight="bold">{activeCount}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter bar */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Tìm kiếm danh mục"
                placeholder="Tên danh mục hoặc Mã danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  label="Trạng thái"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value=""><em>Tất cả trạng thái</em></MenuItem>
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Ngưng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="outlined" onClick={handleResetFilters}>
                Thiết lập lại
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Không thể tải danh mục trò chơi từ hệ thống. Đã chuyển sang chế độ cục bộ ngoại tuyến.
          </Alert>
        )}

        <RideCategoryTable
          data={displayData}
          loading={isLoading}
          onViewDetails={(cat) => {
            setSelectedCategory(cat);
            setDetailsOpen(true);
          }}
          onEdit={(cat) => {
            setEditingCategory(cat);
            setFormOpen(true);
          }}
          onDelete={(cat) => {
            setDeleteTarget(cat);
            setDeleteConfirmOpen(true);
          }}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedCategory(null);
          }}
          title="Thông tin chi tiết danh mục"
          maxWidth="md"
        >
          {selectedCategory && <RideCategoryDetails category={selectedCategory} />}
        </Modal>

        {/* Form Dialog */}
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingCategory ? 'Cập nhật danh mục trò chơi' : 'Đăng ký danh mục trò chơi mới'}
          maxWidth="sm"
        >
          <RideCategoryForm
            initialData={editingCategory}
            onSubmit={handleFormSubmit}
            loading={isCreating || isUpdating}
          />
        </Modal>

        {/* Delete Confirm */}
        <StatusDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          type="error"
          title="Xóa danh mục trò chơi"
          message={`Bạn có chắc chắn muốn xóa danh mục trò chơi "${deleteTarget?.name}" không? Hãy đảm bảo rằng không có trò chơi đang hoạt động nào thuộc danh mục này.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Có, Xóa danh mục"
        />
      </Box>
    </PageContainer>
  );
};
