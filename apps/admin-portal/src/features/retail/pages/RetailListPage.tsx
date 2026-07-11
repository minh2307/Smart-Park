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
  useGetShopsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useApprovePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
} from '../services/retailApi';
import { Shop, Product, Category, Supplier } from '../types';
import { ShopTable } from '../components/ShopTable';
import { ShopForm } from '../components/ShopForm';
import { ProductTable } from '../components/ProductTable';
import { ProductForm } from '../components/ProductForm';
import { CategoryTable } from '../components/CategoryTable';
import { CategoryForm } from '../components/CategoryForm';
import { SupplierTable } from '../components/SupplierTable';
import { SupplierForm } from '../components/SupplierForm';
import { PurchaseOrderTable } from '../components/PurchaseOrderTable';
import { PurchaseOrderForm } from '../components/PurchaseOrderForm';
import { InventoryDashboard } from '../components/InventoryDashboard';
import { SalesAnalytics } from '../components/SalesAnalytics';

export const RetailListPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Searches & Filter
  const [shopSearch, setShopSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState<number | ''>('');
  const [supSearch, setSupSearch] = useState('');
  const [poSearch, setPoSearch] = useState('');

  // Modals for CRUD
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isNewShopOpen, setIsNewShopOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);

  const [isNewPOOpen, setIsNewPOOpen] = useState(false);

  // Queries
  const { data: shopsData } = useGetShopsQuery({ search: shopSearch || undefined });
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: productsData } = useGetProductsQuery({
    search: prodSearch || undefined,
    categoryId: prodCatFilter || undefined,
  });
  const { data: suppliersData } = useGetSuppliersQuery({ search: supSearch || undefined });
  const { data: poData } = useGetPurchaseOrdersQuery({ search: poSearch || undefined });

  // Mutations
  const [createShop] = useCreateShopMutation();
  const [updateShop] = useUpdateShopMutation();
  const [deleteShop] = useDeleteShopMutation();

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const [createPO] = useCreatePurchaseOrderMutation();
  const [approvePO] = useApprovePurchaseOrderMutation();
  const [receivePO] = useReceivePurchaseOrderMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Actions handlers
  const handleCreateShop = async (values: any) => {
    try {
      await createShop(values).unwrap();
      toast.success('Thêm cửa hàng bán lẻ mới thành công!');
      setIsNewShopOpen(false);
    } catch (e) {
      toast.error('Lỗi khi thêm cửa hàng.');
    }
  };

  const handleUpdateShop = async (values: any) => {
    if (!editingShop) return;
    try {
      await updateShop({ id: editingShop.id, data: values }).unwrap();
      toast.success('Cập nhật cửa hàng thành công!');
      setEditingShop(null);
    } catch (e) {
      toast.error('Lỗi khi cập nhật cửa hàng.');
    }
  };

  const handleDeleteShop = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cửa hàng bán lẻ này?')) return;
    try {
      await deleteShop(id).unwrap();
      toast.success('Đã xóa cửa hàng thành công!');
    } catch (e) {
      toast.error('Lỗi khi xóa cửa hàng.');
    }
  };

  const handleCreateCategory = async (values: any) => {
    try {
      await createCategory(values).unwrap();
      toast.success('Thêm danh mục sản phẩm mới thành công!');
      setIsNewCategoryOpen(false);
    } catch (e) {
      toast.error('Lỗi khi thêm danh mục.');
    }
  };

  const handleUpdateCategory = async (values: any) => {
    if (!editingCategory) return;
    try {
      await updateCategory({ id: editingCategory.id, data: values }).unwrap();
      toast.success('Cập nhật danh mục thành công!');
      setEditingCategory(null);
    } catch (e) {
      toast.error('Lỗi khi cập nhật danh mục.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Đã xóa danh mục thành công!');
    } catch (e) {
      toast.error('Lỗi khi xóa danh mục.');
    }
  };

  const handleCreateProduct = async (values: any) => {
    try {
      await createProduct(values).unwrap();
      toast.success('Thêm sản phẩm mới vào danh mục thành công!');
      setIsNewProductOpen(false);
    } catch (e) {
      toast.error('Lỗi khi thêm sản phẩm.');
    }
  };

  const handleUpdateProduct = async (values: any) => {
    if (!editingProduct) return;
    try {
      await updateProduct({ id: editingProduct.id, data: values }).unwrap();
      toast.success('Cập nhật sản phẩm thành công!');
      setEditingProduct(null);
    } catch (e) {
      toast.error('Lỗi khi cập nhật sản phẩm.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success('Đã xóa sản phẩm khỏi hệ thống!');
    } catch (e) {
      toast.error('Lỗi khi xóa sản phẩm.');
    }
  };

  const handleCreateSupplier = async (values: any) => {
    try {
      await createSupplier(values).unwrap();
      toast.success('Thêm nhà cung cấp mới thành công!');
      setIsNewSupplierOpen(false);
    } catch (e) {
      toast.error('Lỗi khi thêm nhà cung cấp.');
    }
  };

  const handleUpdateSupplier = async (values: any) => {
    if (!editingSupplier) return;
    try {
      await updateSupplier({ id: editingSupplier.id, data: values }).unwrap();
      toast.success('Cập nhật thông tin nhà cung cấp thành công!');
      setEditingSupplier(null);
    } catch (e) {
      toast.error('Lỗi khi cập nhật nhà cung cấp.');
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn ngừng hợp tác với nhà cung cấp này?')) return;
    try {
      await deleteSupplier(id).unwrap();
      toast.success('Xóa nhà cung cấp thành công!');
    } catch (e) {
      toast.error('Lỗi khi xóa nhà cung cấp.');
    }
  };

  const handleCreatePO = async (values: any) => {
    try {
      await createPO(values).unwrap();
      toast.success('Tạo đơn mua hàng PO thành công, đang chờ duyệt.');
      setIsNewPOOpen(false);
    } catch (e) {
      toast.error('Lỗi khi tạo đơn PO.');
    }
  };

  const handleApprovePO = async (id: number) => {
    try {
      await approvePO({ id, approvedBy: 'Admin Hệ Thống' }).unwrap();
      toast.success('Đã duyệt đơn hàng PO thành công!');
    } catch (e) {
      toast.error('Lỗi khi duyệt đơn.');
    }
  };

  const handleReceivePO = async (id: number) => {
    try {
      await receivePO(id).unwrap();
      toast.success('Đã nhận hàng và bổ sung số lượng tồn kho thành công!');
    } catch (e) {
      toast.error('Lỗi khi nhập kho.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Hệ Thống Bán Lẻ & Dịch Vụ (Retail & Inventory)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình cửa hàng bán lẻ, quản lý kho bãi, theo dõi nhà cung cấp, chuỗi cung ứng PO và doanh số bán hàng.
          </Typography>
        </Box>

        {tabValue === 0 && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<MdAdd />}
              onClick={() => setIsNewCategoryOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Thêm Danh Mục
            </Button>
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={() => setIsNewShopOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Thêm Cửa Hàng
            </Button>
          </Box>
        )}

        {tabValue === 1 && (
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => setIsNewProductOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Thêm Sản Phẩm
          </Button>
        )}

        {tabValue === 3 && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<MdAdd />}
              onClick={() => setIsNewSupplierOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Thêm NCC
            </Button>
            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={() => setIsNewPOOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Tạo Đơn PO
            </Button>
          </Box>
        )}
      </Box>

      {/* Navigation tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Danh mục & Cửa hàng" />
          <Tab label="Danh sách sản phẩm" />
          <Tab label="Kho & Tồn kho" />
          <Tab label="Đơn mua hàng & NCC" />
          <Tab label="Báo cáo doanh thu" />
        </Tabs>
      </Box>

      {/* Tab Contents */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Hệ Thống Cửa Hàng Bán Lẻ
                </Typography>
                <Box mb={2}>
                  <TextField
                    size="small"
                    label="Tìm nhanh cửa hàng..."
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    sx={{ width: 300 }}
                  />
                </Box>
                <ShopTable
                  shops={shopsData?.content || []}
                  onEdit={setEditingShop}
                  onDelete={handleDeleteShop}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Danh Mục Phân Nhóm Sản Phẩm
                </Typography>
                <CategoryTable
                  categories={categoriesData?.content || []}
                  onEdit={setEditingCategory}
                  onDelete={handleDeleteCategory}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Box>
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tìm kiếm theo tên sản phẩm, SKU hoặc Barcode..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Danh Mục</InputLabel>
                    <Select
                      value={prodCatFilter}
                      label="Danh Mục"
                      onChange={(e) => setProdCatFilter(e.target.value as any)}
                    >
                      <MenuItem value="">Tất cả danh mục</MenuItem>
                      {(categoriesData?.content || []).map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.categoryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <ProductTable
            products={productsData?.content || []}
            onEdit={setEditingProduct}
            onDelete={handleDeleteProduct}
          />
        </Box>
      )}

      {tabValue === 2 && <InventoryDashboard />}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Theo Dõi Đơn Đặt Hàng PO (Purchase Orders)
                </Typography>
                <Box mb={2}>
                  <TextField
                    size="small"
                    label="Tìm theo số PO, NCC..."
                    value={poSearch}
                    onChange={(e) => setPoSearch(e.target.value)}
                    sx={{ width: 300 }}
                  />
                </Box>
                <PurchaseOrderTable
                  purchaseOrders={poData?.content || []}
                  onApprove={handleApprovePO}
                  onReceive={handleReceivePO}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Nhà Cung Cấp Hàng Hóa (Suppliers)
                </Typography>
                <Box mb={2}>
                  <TextField
                    size="small"
                    label="Tìm theo tên NCC, liên hệ..."
                    value={supSearch}
                    onChange={(e) => setSupSearch(e.target.value)}
                    sx={{ width: 300 }}
                  />
                </Box>
                <SupplierTable
                  suppliers={suppliersData?.content || []}
                  onEdit={setEditingSupplier}
                  onDelete={handleDeleteSupplier}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && <SalesAnalytics />}

      {/* Dialog for Adding Shop */}
      <Dialog open={isNewShopOpen} onClose={() => setIsNewShopOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Thêm Cửa Hàng Mới</DialogTitle>
        <DialogContent>
          <ShopForm onSubmit={handleCreateShop} onCancel={() => setIsNewShopOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Shop */}
      <Dialog open={!!editingShop} onClose={() => setEditingShop(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Chỉnh Sửa Cửa Hàng</DialogTitle>
        <DialogContent>
          {editingShop && <ShopForm initialValues={editingShop} onSubmit={handleUpdateShop} onCancel={() => setEditingShop(null)} />}
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding Category */}
      <Dialog open={isNewCategoryOpen} onClose={() => setIsNewCategoryOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Thêm Danh Mục Nhóm Sản Phẩm</DialogTitle>
        <DialogContent>
          <CategoryForm onSubmit={handleCreateCategory} onCancel={() => setIsNewCategoryOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Category */}
      <Dialog open={!!editingCategory} onClose={() => setEditingCategory(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Chỉnh Sửa Danh Mục</DialogTitle>
        <DialogContent>
          {editingCategory && <CategoryForm initialValues={editingCategory} onSubmit={handleUpdateCategory} onCancel={() => setEditingCategory(null)} />}
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding Product */}
      <Dialog open={isNewProductOpen} onClose={() => setIsNewProductOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Thêm Sản Phẩm Mới</DialogTitle>
        <DialogContent>
          <ProductForm
            categories={categoriesData?.content || []}
            suppliers={suppliersData?.content || []}
            onSubmit={handleCreateProduct}
            onCancel={() => setIsNewProductOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Product */}
      <Dialog open={!!editingProduct} onClose={() => setEditingProduct(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Chỉnh Sửa Sản Phẩm</DialogTitle>
        <DialogContent>
          {editingProduct && (
            <ProductForm
              initialValues={editingProduct}
              categories={categoriesData?.content || []}
              suppliers={suppliersData?.content || []}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding Supplier */}
      <Dialog open={isNewSupplierOpen} onClose={() => setIsNewSupplierOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Thêm Nhà Cung Cấp Mới</DialogTitle>
        <DialogContent>
          <SupplierForm onSubmit={handleCreateSupplier} onCancel={() => setIsNewSupplierOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Supplier */}
      <Dialog open={!!editingSupplier} onClose={() => setEditingSupplier(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Chỉnh Sửa Nhà Cung Cấp</DialogTitle>
        <DialogContent>
          {editingSupplier && <SupplierForm initialValues={editingSupplier} onSubmit={handleUpdateSupplier} onCancel={() => setEditingSupplier(null)} />}
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding Purchase Order */}
      <Dialog open={isNewPOOpen} onClose={() => setIsNewPOOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle fontWeight="bold">Tạo Đơn Hàng Mua Sắm (Purchase Order)</DialogTitle>
        <DialogContent>
          <PurchaseOrderForm
            suppliers={suppliersData?.content || []}
            products={productsData?.content || []}
            onSubmit={handleCreatePO}
            onCancel={() => setIsNewPOOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default RetailListPage;
