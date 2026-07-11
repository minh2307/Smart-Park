import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';
import { Product, Category, Supplier } from '../types';

const productSchema = z.object({
  productName: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  sku: z.string().min(3, 'Mã SKU phải từ 3 ký tự'),
  barcode: z.string().min(5, 'Mã vạch phải từ 5 ký tự'),
  categoryId: z.number({ required_error: 'Vui lòng chọn danh mục' }),
  brand: z.string().min(2, 'Thương hiệu phải có ít nhất 2 ký tự'),
  price: z.number().min(0, 'Giá bán không nhỏ hơn 0'),
  costPrice: z.number().min(0, 'Giá vốn không nhỏ hơn 0'),
  discount: z.number().min(0).max(100, 'Chiết khấu từ 0% đến 100%'),
  tax: z.number().min(0).max(100, 'Thuế suất VAT từ 0% đến 100%'),
  stock: z.number().min(0, 'Tồn kho không nhỏ hơn 0'),
  minimumStock: z.number().min(0, 'Cảnh báo tồn kho tối thiểu không nhỏ hơn 0'),
  supplierId: z.number({ required_error: 'Vui lòng chọn nhà cung cấp' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'] as const),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onSubmit: (values: ProductFormData) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  categories,
  suppliers,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: initialValues?.productName || '',
      sku: initialValues?.sku || '',
      barcode: initialValues?.barcode || '',
      categoryId: initialValues?.categoryId || (categories[0]?.id || 1),
      brand: initialValues?.brand || '',
      price: initialValues?.price || 0,
      costPrice: initialValues?.costPrice || 0,
      discount: initialValues?.discount || 0,
      tax: initialValues?.tax || 10,
      stock: initialValues?.stock || 0,
      minimumStock: initialValues?.minimumStock || 5,
      supplierId: initialValues?.supplierId || (suppliers[0]?.id || 1),
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="productName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Sản Phẩm"
                error={!!errors.productName}
                helperText={errors.productName?.message}
                placeholder="Ví dụ: Kính Bơi Speedo Pro"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nhãn Hiệu / Brand"
                error={!!errors.brand}
                helperText={errors.brand?.message}
                placeholder="Ví dụ: Speedo"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mã định danh SKU"
                error={!!errors.sku}
                helperText={errors.sku?.message}
                placeholder="Ví dụ: PROD-SWIM001"
                disabled={!!initialValues}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="barcode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mã Vạch (Barcode)"
                error={!!errors.barcode}
                helperText={errors.barcode?.message}
                placeholder="Ví dụ: 8936012345678"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.categoryId}>
            <InputLabel>Danh mục nhóm sản phẩm</InputLabel>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Danh mục nhóm sản phẩm" onChange={(e) => field.onChange(Number(e.target.value))}>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.supplierId}>
            <InputLabel>Nhà cung cấp gốc</InputLabel>
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Nhà cung cấp gốc" onChange={(e) => field.onChange(Number(e.target.value))}>
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.supplierName}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.supplierId && <FormHelperText>{errors.supplierId.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="costPrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Giá Vốn (VNĐ)"
                error={!!errors.costPrice}
                helperText={errors.costPrice?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Giá Bán Lẻ (VNĐ)"
                error={!!errors.price}
                helperText={errors.price?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Controller
            name="tax"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Thuế VAT (%)"
                error={!!errors.tax}
                helperText={errors.tax?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Chiết khấu (%)"
                error={!!errors.discount}
                helperText={errors.discount?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Tồn Kho Thực Tế"
                error={!!errors.stock}
                helperText={errors.stock?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Controller
            name="minimumStock"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Tối Thiểu (Min)"
                error={!!errors.minimumStock}
                helperText={errors.minimumStock?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Trạng thái sản phẩm</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Trạng thái sản phẩm">
                  <MenuItem value="ACTIVE">Hoạt Động</MenuItem>
                  <MenuItem value="INACTIVE">Ngừng Kinh Doanh</MenuItem>
                  <MenuItem value="OUT_OF_STOCK">Hết Hàng</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
        <Button onClick={onCancel} variant="outlined">
          Hủy bỏ
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Lưu Lại
        </Button>
      </Box>
    </Box>
  );
};
export default ProductForm;
