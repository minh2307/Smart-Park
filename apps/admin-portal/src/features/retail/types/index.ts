export type ShopStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Shop {
  id: number;
  shopCode: string;
  shopName: string;
  location: string;
  businessHours: string;
  manager: string;
  category: string;
  status: ShopStatus;
  revenue: number;
}

export interface Category {
  id: number;
  categoryName: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  description?: string;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  image?: string;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  productName: string;
  categoryId: number;
  categoryName?: string;
  brand: string;
  price: number;
  costPrice: number;
  discount: number; // percentage
  tax: number; // percentage
  stock: number;
  minimumStock: number;
  supplierId: number;
  supplierName?: string;
  status: ProductStatus;
  image?: string;
}

export interface Supplier {
  id: number;
  supplierCode: string;
  supplierName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export interface StockMovement {
  id: number;
  movementType: StockMovementType;
  productId: number;
  productName?: string;
  sku?: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  operator: string;
  createdAt: string;
}

export type PurchaseOrderStatus = 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName?: string;
  orderDate: string;
  expectedDate?: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    costPrice: number;
  }[];
  createdBy: string;
  approvedBy?: string;
}

export interface InventoryDashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockItemsCount: number;
  expiredItemsCount: number;
  damagedItemsCount: number;
  reservedStockCount: number;
  recentMovements: StockMovement[];
}
