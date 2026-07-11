import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import {
  Shop,
  Category,
  Product,
  Supplier,
  StockMovement,
  PurchaseOrder,
  InventoryDashboardStats,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// In-memory mock databases
export let mockShops: Shop[] = [
  {
    id: 1,
    shopCode: 'SHP-SOUV01',
    shopName: 'Quầy Lưu Niệm GateOS',
    location: 'Cổng chính - Khu A',
    businessHours: '08:00 - 21:00',
    manager: 'Phạm Thị Thùy',
    category: 'Quà Lưu Niệm',
    status: 'ACTIVE',
    revenue: 45200000,
  },
  {
    id: 2,
    shopCode: 'SHP-FASH02',
    shopName: 'Đồ Thể Thao & Đồ Bơi',
    location: 'Gần Hồ bơi - Khu B',
    businessHours: '08:00 - 19:00',
    manager: 'Đỗ Hữu Nghĩa',
    category: 'Thời Trang',
    status: 'ACTIVE',
    revenue: 32900000,
  },
];

export let mockCategories: Category[] = [
  { id: 1, categoryName: 'Đồ Bơi Nam/Nữ', sortOrder: 1, status: 'ACTIVE', description: 'Trang phục bơi cao cấp dành cho mọi lứa tuổi.' },
  { id: 2, categoryName: 'Kính & Mũ Bơi', sortOrder: 2, status: 'ACTIVE', description: 'Phụ kiện bơi chống nước.' },
  { id: 3, categoryName: 'Quà Lưu Niệm & Móc Khóa', sortOrder: 3, status: 'ACTIVE', description: 'Đồ lưu niệm lưu giữ kỷ niệm GateOS.' },
  { id: 4, categoryName: 'Đồ Chơi & Phao Bơi', sortOrder: 4, status: 'ACTIVE', description: 'Các loại phao tròn, phao nằm đa sắc màu.' },
];

export let mockSuppliers: Supplier[] = [
  {
    id: 1,
    supplierCode: 'SUP-SPEEDO',
    supplierName: 'Speedo Việt Nam Co.',
    contactName: 'Mr. Johnathan',
    email: 'contact@speedo.vn',
    phone: '0901234567',
    address: '120 Nguyễn Văn Linh, Quận 7, TP.HCM',
    status: 'ACTIVE',
  },
  {
    id: 2,
    supplierCode: 'SUP-LOCAL',
    supplierName: 'Đồ Lưu Niệm Phương Đông',
    contactName: 'Bà Nguyễn Thị Bé',
    email: 'phuongdonggift@gmail.com',
    phone: '0987654321',
    address: '45 Lê Lợi, Quận 1, TP.HCM',
    status: 'ACTIVE',
  },
];

export let mockProducts: Product[] = [
  {
    id: 1,
    sku: 'PROD-SWIM001',
    barcode: '8936012345678',
    productName: 'Kính Bơi Speedo Pro',
    categoryId: 2,
    categoryName: 'Kính & Mũ Bơi',
    brand: 'Speedo',
    price: 350000,
    costPrice: 200000,
    discount: 10,
    tax: 10,
    stock: 45,
    minimumStock: 10,
    supplierId: 1,
    supplierName: 'Speedo Việt Nam Co.',
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/goggles/300/200',
  },
  {
    id: 2,
    sku: 'PROD-SWIM002',
    barcode: '8936012345685',
    productName: 'Mũ Bơi Silicon GateOS',
    categoryId: 2,
    categoryName: 'Kính & Mũ Bơi',
    brand: 'GateOS Design',
    price: 90000,
    costPrice: 40000,
    discount: 0,
    tax: 8,
    stock: 5, // low stock alert
    minimumStock: 15,
    supplierId: 1,
    supplierName: 'Speedo Việt Nam Co.',
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/swimcap/300/200',
  },
  {
    id: 3,
    sku: 'PROD-KEY003',
    barcode: '8936012345692',
    productName: 'Móc Khóa Mascot GateOS',
    categoryId: 3,
    categoryName: 'Quà Lưu Niệm & Móc Khóa',
    brand: 'GateOS',
    price: 45000,
    costPrice: 15000,
    discount: 0,
    tax: 8,
    stock: 120,
    minimumStock: 20,
    supplierId: 2,
    supplierName: 'Đồ Lưu Niệm Phương Đông',
    status: 'ACTIVE',
    image: 'https://picsum.photos/seed/keychain/300/200',
  },
  {
    id: 4,
    sku: 'PROD-PHAO004',
    barcode: '8936012345708',
    productName: 'Phao Tròn Đi Biển Hồng Hạc',
    categoryId: 4,
    categoryName: 'Đồ Chơi & Phao Bơi',
    brand: 'Intex',
    price: 250000,
    costPrice: 120000,
    discount: 5,
    tax: 10,
    stock: 0, // out of stock
    minimumStock: 5,
    supplierId: 2,
    supplierName: 'Đồ Lưu Niệm Phương Đông',
    status: 'OUT_OF_STOCK',
    image: 'https://picsum.photos/seed/float/300/200',
  },
];

export let mockStockMovements: StockMovement[] = [
  {
    id: 1,
    movementType: 'IN',
    productId: 1,
    productName: 'Kính Bơi Speedo Pro',
    sku: 'PROD-SWIM001',
    quantity: 50,
    toLocation: 'Kho chính A',
    reason: 'Nhập kho lô hàng mới từ Speedo',
    operator: 'Nguyễn Văn Kho',
    createdAt: '2026-07-08T09:30:00Z',
  },
  {
    id: 2,
    movementType: 'TRANSFER',
    productId: 3,
    productName: 'Móc Khóa Mascot GateOS',
    sku: 'PROD-KEY003',
    quantity: 30,
    fromLocation: 'Kho Tổng',
    toLocation: 'Quầy Lưu Niệm GateOS',
    reason: 'Chuyển hàng trưng bày',
    operator: 'Phạm Thị Thùy',
    createdAt: '2026-07-09T10:15:00Z',
  },
];

export let mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-20260709-01',
    supplierId: 1,
    supplierName: 'Speedo Việt Nam Co.',
    orderDate: '2026-07-09T14:00:00Z',
    expectedDate: '2026-07-15T00:00:00Z',
    totalAmount: 12000000,
    status: 'APPROVED',
    items: [
      {
        productId: 1,
        productName: 'Kính Bơi Speedo Pro',
        quantity: 50,
        costPrice: 200000,
      },
      {
        productId: 2,
        productName: 'Mũ Bơi Silicon GateOS',
        quantity: 50,
        costPrice: 40000,
      },
    ],
    createdBy: 'Phạm Thị Thùy',
    approvedBy: 'Admin Hệ Thống',
  },
];

export const retailApi = createApi({
  reducerPath: 'retailApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Shop', 'Category', 'Product', 'Supplier', 'StockMovement', 'PurchaseOrder', 'InventoryStats'],
  endpoints: (builder) => ({
    getInventoryStats: builder.query<InventoryDashboardStats, void>({
      queryFn: async () => {
        const totalProducts = mockProducts.length;
        const totalStockValue = mockProducts.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
        const lowStockItemsCount = mockProducts.filter((p) => p.stock <= p.minimumStock).length;
        const expiredItemsCount = 0; // Mocked
        const damagedItemsCount = 1; // Mocked
        const reservedStockCount = 5;

        return {
          data: {
            totalProducts,
            totalStockValue,
            lowStockItemsCount,
            expiredItemsCount,
            damagedItemsCount,
            reservedStockCount,
            recentMovements: mockStockMovements.slice(0, 5),
          },
        };
      },
      providesTags: ['InventoryStats'],
    }),

    getShops: builder.query<{ content: Shop[] }, { search?: string }>({
      queryFn: async (filters) => {
        let filtered = [...mockShops];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((shop) => shop.shopName.toLowerCase().includes(s) || shop.shopCode.toLowerCase().includes(s));
        }
        return { data: { content: filtered } };
      },
      providesTags: ['Shop'],
    }),

    createShop: builder.mutation<Shop, Partial<Shop>>({
      queryFn: async (body) => {
        const newShop: Shop = {
          id: mockShops.length + 1,
          shopCode: body.shopCode || `SHP-${Math.floor(1000 + Math.random() * 9000)}`,
          shopName: body.shopName || 'Cửa hàng mới',
          location: body.location || 'N/A',
          businessHours: body.businessHours || '08:00 - 22:00',
          manager: body.manager || 'N/A',
          category: body.category || 'Lưu niệm',
          status: 'ACTIVE',
          revenue: 0,
        };
        mockShops.push(newShop);
        return { data: newShop };
      },
      invalidatesTags: ['Shop'],
    }),

    updateShop: builder.mutation<Shop, { id: number; data: Partial<Shop> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockShops.findIndex((s) => s.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockShops[idx] = { ...mockShops[idx], ...data };
        return { data: mockShops[idx] };
      },
      invalidatesTags: ['Shop'],
    }),

    deleteShop: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockShops = mockShops.filter((s) => s.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Shop'],
    }),

    getCategories: builder.query<{ content: Category[] }, { search?: string }>({
      queryFn: async (filters) => {
        let filtered = [...mockCategories];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((c) => c.categoryName.toLowerCase().includes(s));
        }
        return { data: { content: filtered } };
      },
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      queryFn: async (body) => {
        const newCat: Category = {
          id: mockCategories.length + 1,
          categoryName: body.categoryName || 'Danh mục mới',
          description: body.description || '',
          sortOrder: body.sortOrder || 1,
          status: 'ACTIVE',
        };
        mockCategories.push(newCat);
        return { data: newCat };
      },
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<Category, { id: number; data: Partial<Category> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockCategories.findIndex((c) => c.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockCategories[idx] = { ...mockCategories[idx], ...data };
        return { data: mockCategories[idx] };
      },
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockCategories = mockCategories.filter((c) => c.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Category'],
    }),

    getProducts: builder.query<{ content: Product[]; totalElements: number; totalPages: number }, { search?: string; categoryId?: number | ''; page?: number; size?: number }>({
      queryFn: async (filters) => {
        let filtered = [...mockProducts];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.productName.toLowerCase().includes(s) ||
              p.sku.toLowerCase().includes(s) ||
              p.barcode.toLowerCase().includes(s)
          );
        }
        if (filters.categoryId) {
          filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
        }

        const size = filters.size || 10;
        const page = filters.page || 0;
        const offset = page * size;
        const content = filtered.slice(offset, offset + size);

        return {
          data: {
            content,
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / size),
          },
        };
      },
      providesTags: ['Product', 'InventoryStats'],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      queryFn: async (body) => {
        const cat = mockCategories.find((c) => c.id === body.categoryId);
        const sup = mockSuppliers.find((s) => s.id === body.supplierId);
        const newProd: Product = {
          id: mockProducts.length + 1,
          sku: body.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
          barcode: body.barcode || `893${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          productName: body.productName || 'Sản phẩm mới',
          categoryId: body.categoryId || 1,
          categoryName: cat?.categoryName || 'Mặc định',
          brand: body.brand || 'Thương hiệu',
          price: body.price || 0,
          costPrice: body.costPrice || 0,
          discount: body.discount || 0,
          tax: body.tax || 10,
          stock: body.stock || 0,
          minimumStock: body.minimumStock || 5,
          supplierId: body.supplierId || 1,
          supplierName: sup?.supplierName || 'Nhà cung cấp chính',
          status: body.stock && body.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
          image: body.image || 'https://picsum.photos/seed/newproduct/300/200',
        };
        mockProducts.push(newProd);
        return { data: newProd };
      },
      invalidatesTags: ['Product', 'InventoryStats'],
    }),

    updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockProducts.findIndex((p) => p.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockProducts[idx] = { ...mockProducts[idx], ...data };
        if (mockProducts[idx].stock > 0 && mockProducts[idx].status === 'OUT_OF_STOCK') {
          mockProducts[idx].status = 'ACTIVE';
        } else if (mockProducts[idx].stock === 0) {
          mockProducts[idx].status = 'OUT_OF_STOCK';
        }
        return { data: mockProducts[idx] };
      },
      invalidatesTags: ['Product', 'InventoryStats'],
    }),

    deleteProduct: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockProducts = mockProducts.filter((p) => p.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Product', 'InventoryStats'],
    }),

    getSuppliers: builder.query<{ content: Supplier[] }, { search?: string }>({
      queryFn: async (filters) => {
        let filtered = [...mockSuppliers];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (sup) =>
              sup.supplierName.toLowerCase().includes(s) ||
              sup.supplierCode.toLowerCase().includes(s) ||
              sup.contactName.toLowerCase().includes(s)
          );
        }
        return { data: { content: filtered } };
      },
      providesTags: ['Supplier'],
    }),

    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      queryFn: async (body) => {
        const newSup: Supplier = {
          id: mockSuppliers.length + 1,
          supplierCode: body.supplierCode || `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
          supplierName: body.supplierName || 'Nhà cung cấp mới',
          contactName: body.contactName || 'Người liên hệ',
          email: body.email || 'supplier@email.com',
          phone: body.phone || 'N/A',
          address: body.address || 'N/A',
          status: 'ACTIVE',
        };
        mockSuppliers.push(newSup);
        return { data: newSup };
      },
      invalidatesTags: ['Supplier'],
    }),

    updateSupplier: builder.mutation<Supplier, { id: number; data: Partial<Supplier> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockSuppliers.findIndex((s) => s.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockSuppliers[idx] = { ...mockSuppliers[idx], ...data };
        return { data: mockSuppliers[idx] };
      },
      invalidatesTags: ['Supplier'],
    }),

    deleteSupplier: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockSuppliers = mockSuppliers.filter((s) => s.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Supplier'],
    }),

    getStockMovements: builder.query<{ content: StockMovement[] }, { search?: string }>({
      queryFn: async (filters) => {
        let filtered = [...mockStockMovements];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.productName?.toLowerCase().includes(s) ||
              m.sku?.toLowerCase().includes(s) ||
              m.reason.toLowerCase().includes(s)
          );
        }
        return { data: { content: filtered } };
      },
      providesTags: ['StockMovement'],
    }),

    createStockMovement: builder.mutation<StockMovement, Partial<StockMovement>>({
      queryFn: async (body) => {
        const prod = mockProducts.find((p) => p.id === body.productId);
        if (!prod) return { error: { status: 404, statusText: 'Product Not Found', data: null } };

        const newMov: StockMovement = {
          id: mockStockMovements.length + 1,
          movementType: body.movementType || 'ADJUSTMENT',
          productId: body.productId || 1,
          productName: prod.productName,
          sku: prod.sku,
          quantity: body.quantity || 0,
          fromLocation: body.fromLocation,
          toLocation: body.toLocation,
          reason: body.reason || 'Điều chỉnh kho định kỳ',
          operator: body.operator || 'Nhân viên kho',
          createdAt: new Date().toISOString(),
        };

        // Adjust stock values accordingly
        if (newMov.movementType === 'IN') {
          prod.stock += newMov.quantity;
        } else if (newMov.movementType === 'OUT') {
          prod.stock = Math.max(0, prod.stock - newMov.quantity);
        } else if (newMov.movementType === 'ADJUSTMENT') {
          prod.stock = newMov.quantity; // set absolute stock value
        }

        mockStockMovements.unshift(newMov);
        return { data: newMov };
      },
      invalidatesTags: ['StockMovement', 'Product', 'InventoryStats'],
    }),

    getPurchaseOrders: builder.query<{ content: PurchaseOrder[] }, { search?: string }>({
      queryFn: async (filters) => {
        let filtered = [...mockPurchaseOrders];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (po) =>
              po.poNumber.toLowerCase().includes(s) ||
              po.supplierName?.toLowerCase().includes(s)
          );
        }
        return { data: { content: filtered } };
      },
      providesTags: ['PurchaseOrder'],
    }),

    createPurchaseOrder: builder.mutation<PurchaseOrder, Partial<PurchaseOrder>>({
      queryFn: async (body) => {
        const sup = mockSuppliers.find((s) => s.id === body.supplierId);
        const newPO: PurchaseOrder = {
          id: mockPurchaseOrders.length + 1,
          poNumber: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
          supplierId: body.supplierId || 1,
          supplierName: sup?.supplierName || 'Nhà cung cấp Speedo',
          orderDate: new Date().toISOString(),
          expectedDate: body.expectedDate,
          totalAmount: body.totalAmount || 0,
          status: 'PENDING',
          items: body.items || [],
          createdBy: body.createdBy || 'Phạm Thị Thùy',
        };
        mockPurchaseOrders.unshift(newPO);
        return { data: newPO };
      },
      invalidatesTags: ['PurchaseOrder'],
    }),

    approvePurchaseOrder: builder.mutation<PurchaseOrder, { id: number; approvedBy: string }>({
      queryFn: async ({ id, approvedBy }) => {
        const po = mockPurchaseOrders.find((p) => p.id === id);
        if (!po) return { error: { status: 404, statusText: 'PO Not Found', data: null } };
        po.status = 'APPROVED';
        po.approvedBy = approvedBy;
        return { data: po };
      },
      invalidatesTags: ['PurchaseOrder'],
    }),

    receivePurchaseOrder: builder.mutation<PurchaseOrder, number>({
      queryFn: async (id) => {
        const po = mockPurchaseOrders.find((p) => p.id === id);
        if (!po) return { error: { status: 404, statusText: 'PO Not Found', data: null } };
        po.status = 'RECEIVED';

        // Add quantities to product stock
        po.items.forEach((item) => {
          const prod = mockProducts.find((p) => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
            if (prod.status === 'OUT_OF_STOCK') prod.status = 'ACTIVE';
          }
        });

        return { data: po };
      },
      invalidatesTags: ['PurchaseOrder', 'Product', 'InventoryStats'],
    }),
  }),
});

export const {
  useGetInventoryStatsQuery,
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
  useGetStockMovementsQuery,
  useCreateStockMovementMutation,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useApprovePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
} = retailApi;
