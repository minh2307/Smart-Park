import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { MdAdd, MdDelete } from 'react-icons/md';
import { Supplier, Product } from '../types';
import { toast } from 'react-toastify';

interface PurchaseOrderFormProps {
  suppliers: Supplier[];
  products: Product[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  suppliers,
  products,
  onSubmit,
  onCancel,
}) => {
  const [supplierId, setSupplierId] = useState<number | ''>(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(10);
  const [costPrice, setCostPrice] = useState(50000);
  const [items, setItems] = useState<{ productId: number; productName: string; quantity: number; costPrice: number }[]>([]);

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.warning('Vui lòng chọn sản phẩm!');
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    // Check if duplicate
    if (items.some((item) => item.productId === prod.id)) {
      toast.warning('Sản phẩm đã được chọn. Vui lòng xóa bớt hoặc tạo đơn khác.');
      return;
    }

    setItems([...items, {
      productId: prod.id,
      productName: prod.productName,
      quantity,
      costPrice,
    }]);

    setSelectedProductId('');
  };

  const handleRemoveItem = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.warning('Vui lòng chọn nhà cung cấp!');
      return;
    }
    if (items.length === 0) {
      toast.warning('Danh sách sản phẩm mua hàng trống!');
      return;
    }

    onSubmit({
      supplierId,
      items,
      totalAmount,
      createdBy: 'Phạm Thị Thùy',
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmitForm} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Chọn nhà cung cấp</InputLabel>
            <Select
              value={supplierId}
              label="Chọn nhà cung cấp"
              onChange={(e) => setSupplierId(e.target.value as any)}
            >
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.supplierName} ({s.supplierCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 3, mb: 1.5 }}>
        Chọn Sản Phẩm Yêu Cầu Cung Cấp
      </Typography>

      <Grid container spacing={2} alignItems="center" bgcolor="action.hover" p={1.5} borderRadius={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Sản phẩm</InputLabel>
            <Select
              value={selectedProductId}
              label="Sản phẩm"
              onChange={(e) => {
                const id = e.target.value as number;
                setSelectedProductId(id);
                const prod = products.find((p) => p.id === id);
                if (prod) setCostPrice(prod.costPrice);
              }}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.productName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Số lượng mua"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Đơn giá nhập"
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={handleAddItem}
            sx={{ height: 40, borderRadius: 1.5 }}
          >
            Thêm
          </Button>
        </Grid>
      </Grid>

      {/* Selected Items List */}
      <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        {items.length === 0 ? (
          <ListItem>
            <ListItemText primary="Chưa chọn mặt hàng nào." />
          </ListItem>
        ) : (
          items.map((item, idx) => (
            <ListItem
              key={idx}
              secondaryAction={
                <IconButton edge="end" color="error" onClick={() => handleRemoveItem(idx)}>
                  <MdDelete />
                </IconButton>
              }
            >
              <ListItemText
                primary={item.productName}
                secondary={`Số lượng: ${item.quantity} | Giá nhập: ${item.costPrice.toLocaleString()}đ | Thành tiền: ${(item.costPrice * item.quantity).toLocaleString()}đ`}
              />
            </ListItem>
          ))
        )}
      </List>

      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="action.hover" borderRadius={2} mb={3}>
        <Typography fontWeight="bold">TỔNG GIÁ TRỊ ĐƠN PO:</Typography>
        <Typography fontWeight="bold" color="primary.main" variant="h6">
          {totalAmount.toLocaleString()}đ
        </Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={1.5}>
        <Button onClick={onCancel} variant="outlined">
          Hủy bỏ
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Tạo Đơn Hàng (PO)
        </Button>
      </Box>
    </Box>
  );
};
export default PurchaseOrderForm;
