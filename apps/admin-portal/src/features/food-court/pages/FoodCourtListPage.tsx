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
} from '@mui/material';
import { MdAdd } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
} from '../services/foodCourtApi';
import { Restaurant, MenuItem as FoodMenuItem, RestaurantStatus, MenuItemStatus } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { RestaurantTable } from '../components/RestaurantTable';
import { RestaurantForm } from '../components/RestaurantForm';
import { MenuTable } from '../components/MenuTable';
import { MenuForm } from '../components/MenuForm';
import { FoodCourtDashboard } from '../components/FoodCourtDashboard';

export const FoodCourtListPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RestaurantStatus | ''>('');
  
  // Menu tab state
  const [selectedResId, setSelectedResId] = useState<number | ''>('');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuStatusFilter, setMenuStatusFilter] = useState<MenuItemStatus | ''>('');

  // Dialog Modals
  const [editingRes, setEditingRes] = useState<Restaurant | null>(null);
  const [isNewResOpen, setIsNewResOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<FoodMenuItem | null>(null);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  // Queries
  const { data: restaurantsData, isLoading: isLoadingRes } = useGetRestaurantsQuery({
    search: tabValue < 2 ? search : undefined,
    status: tabValue < 2 ? (statusFilter || undefined) : undefined,
  });

  const { data: menuData, isLoading: isLoadingMenu } = useGetMenuItemsQuery({
    restaurantId: selectedResId || undefined,
    search: menuSearch || undefined,
    status: menuStatusFilter || undefined,
  });

  // Mutations
  const [createRestaurant] = useCreateRestaurantMutation();
  const [updateRestaurant] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();
  const [createMenuItem] = useCreateMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateRestaurant = async (values: any) => {
    try {
      await createRestaurant(values).unwrap();
      toast.success('Thêm gian hàng mới thành công!');
      setIsNewResOpen(false);
    } catch (e) {
      toast.error('Lỗi khi thêm gian hàng.');
    }
  };

  const handleUpdateRestaurant = async (values: any) => {
    if (!editingRes) return;
    try {
      await updateRestaurant({ id: editingRes.id, data: values }).unwrap();
      toast.success('Cập nhật gian hàng thành công!');
      setEditingRes(null);
    } catch (e) {
      toast.error('Lỗi khi cập nhật gian hàng.');
    }
  };

  const handleDeleteRestaurant = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gian hàng ẩm thực này?')) return;
    try {
      await deleteRestaurant(id).unwrap();
      toast.success('Xóa gian hàng thành công!');
    } catch (e) {
      toast.error('Lỗi khi xóa gian hàng.');
    }
  };

  const handleCreateMenuItem = async (values: any) => {
    if (!selectedResId) {
      toast.warning('Vui lòng chọn một nhà hàng trước khi thêm món ăn!');
      return;
    }
    try {
      await createMenuItem({ ...values, restaurantId: Number(selectedResId) }).unwrap();
      toast.success('Thêm món ăn mới vào thực đơn thành công!');
      setIsNewMenuOpen(false);
    } catch (e) {
      toast.error('Lỗi khi thêm món ăn.');
    }
  };

  const handleUpdateMenuItem = async (values: any) => {
    if (!editingMenuItem) return;
    try {
      await updateMenuItem({ id: editingMenuItem.id, data: values }).unwrap();
      toast.success('Cập nhật thông tin món ăn thành công!');
      setEditingMenuItem(null);
    } catch (e) {
      toast.error('Lỗi khi cập nhật món ăn.');
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món này khỏi thực đơn?')) return;
    try {
      await deleteMenuItem(id).unwrap();
      toast.success('Đã xóa món ăn thành công!');
    } catch (e) {
      toast.error('Lỗi khi xóa món ăn.');
    }
  };

  const handleViewMenuOfRestaurant = (res: Restaurant) => {
    setSelectedResId(res.id);
    setTabValue(2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản Lý Khu Ẩm Thực (Food Court)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi hiệu suất nhà hàng, quản lý danh sách thực đơn & cấu hình gian hàng ẩm thực.
          </Typography>
        </Box>

        {tabValue < 2 ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={() => setIsNewResOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Thêm Gian Hàng
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={() => setIsNewMenuOpen(true)}
            disabled={!selectedResId}
            sx={{ borderRadius: 2 }}
          >
            Thêm Món Ăn
          </Button>
        )}
      </Box>

      {/* Dashboard statistics */}
      <FoodCourtDashboard />

      {/* Navigation tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Gian hàng (Grid View)" />
          <Tab label="Danh sách nhà hàng" />
          <Tab label="Quản lý thực đơn (Menu)" />
        </Tabs>
      </Box>

      {/* Filtering for Restaurants */}
      {tabValue < 2 && (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tìm kiếm nhà hàng hoặc người quản lý..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng Thái</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Trạng Thái"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                    <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
                    <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Filtering for Menu items */}
      {tabValue === 2 && (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Chọn Nhà Hàng</InputLabel>
                  <Select
                    value={selectedResId}
                    label="Chọn Nhà Hàng"
                    onChange={(e) => setSelectedResId(e.target.value as any)}
                  >
                    <MenuItem value="">Tất cả nhà hàng</MenuItem>
                    {(restaurantsData?.content || []).map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.restaurantName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm món ăn, danh mục..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Trạng Thái Phục Vụ</InputLabel>
                  <Select
                    value={menuStatusFilter}
                    label="Trạng Thái Phục Vụ"
                    onChange={(e) => setMenuStatusFilter(e.target.value as any)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="AVAILABLE">Đang phục vụ (Có sẵn)</MenuItem>
                    <MenuItem value="UNAVAILABLE">Không phục vụ</MenuItem>
                    <MenuItem value="OUT_OF_STOCK">Tạm thời hết món</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tab Contents */}
      {tabValue === 0 && (
        isLoadingRes ? (
          <Typography>Đang tải danh sách gian hàng...</Typography>
        ) : (
          <Grid container spacing={3}>
            {(restaurantsData?.content || []).map((res) => (
              <Grid item xs={12} sm={6} md={4} key={res.id}>
                <RestaurantCard
                  restaurant={res}
                  onEdit={setEditingRes}
                  onViewMenu={handleViewMenuOfRestaurant}
                />
              </Grid>
            ))}
          </Grid>
        )
      )}

      {tabValue === 1 && (
        isLoadingRes ? (
          <Typography>Đang tải danh sách...</Typography>
        ) : (
          <RestaurantTable
            restaurants={restaurantsData?.content || []}
            onEdit={setEditingRes}
            onDelete={handleDeleteRestaurant}
            onViewMenu={handleViewMenuOfRestaurant}
          />
        )
      )}

      {tabValue === 2 && (
        isLoadingMenu ? (
          <Typography>Đang tải thực đơn...</Typography>
        ) : (
          <Box>
            {!selectedResId && (
              <Box bgcolor="info.light" p={2} borderRadius={2} mb={2} color="info.contrastText">
                Mẹo: Hãy chọn một nhà hàng cụ thể từ bộ lọc phía trên để hiển thị thực đơn và thêm món mới.
              </Box>
            )}
            <MenuTable
              menuItems={menuData?.content || []}
              onEdit={setEditingMenuItem}
              onDelete={handleDeleteMenuItem}
            />
          </Box>
        )
      )}

      {/* Dialog for Adding Restaurant */}
      <Dialog
        open={isNewResOpen}
        onClose={() => setIsNewResOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">Thêm Gian Hàng Mới</DialogTitle>
        <DialogContent>
          <RestaurantForm
            onSubmit={handleCreateRestaurant}
            onCancel={() => setIsNewResOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Restaurant */}
      <Dialog
        open={!!editingRes}
        onClose={() => setEditingRes(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">Chỉnh Sửa Gian Hàng</DialogTitle>
        <DialogContent>
          {editingRes && (
            <RestaurantForm
              initialValues={editingRes}
              onSubmit={handleUpdateRestaurant}
              onCancel={() => setEditingRes(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding Menu Item */}
      <Dialog
        open={isNewMenuOpen}
        onClose={() => setIsNewMenuOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">Thêm Món Ăn Mới</DialogTitle>
        <DialogContent>
          <MenuForm
            onSubmit={handleCreateMenuItem}
            onCancel={() => setIsNewMenuOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Menu Item */}
      <Dialog
        open={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">Chỉnh Sửa Món Ăn</DialogTitle>
        <DialogContent>
          {editingMenuItem && (
            <MenuForm
              initialValues={editingMenuItem}
              onSubmit={handleUpdateMenuItem}
              onCancel={() => setEditingMenuItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default FoodCourtListPage;
