import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@mui/material';
import { MdEdit, MdDelete, MdQrCode } from 'react-icons/md';
import { Product } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Sản Phẩm</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giá Gốc</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giá Bán</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Thuế / CK</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Số Lượng Tồn</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nhà Cung Cấp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  Không tìm thấy sản phẩm nào trong hệ thống.
                </TableCell>
              </TableRow>
            ) : (
              products.map((prod) => {
                const isLowStock = prod.stock <= prod.minimumStock;
                return (
                  <TableRow key={prod.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        {prod.image && (
                          <Box
                            component="img"
                            src={prod.image}
                            alt={prod.productName}
                            sx={{ width: 44, height: 44, borderRadius: 2, objectFit: 'cover' }}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {prod.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Phân loại: {prod.categoryName || 'Mặc định'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{prod.sku}</TableCell>
                    <TableCell>{prod.costPrice.toLocaleString()}đ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{prod.price.toLocaleString()}đ</TableCell>
                    <TableCell>
                      {prod.tax}% VAT {prod.discount > 0 && `| CK: ${prod.discount}%`}
                    </TableCell>
                    <TableCell>
                      <Box color={isLowStock ? 'error.main' : 'text.primary'} fontWeight={isLowStock ? 'bold' : 'normal'}>
                        {prod.stock} {isLowStock && `(Min: ${prod.minimumStock})`}
                      </Box>
                    </TableCell>
                    <TableCell>{prod.supplierName || '—'}</TableCell>
                    <TableCell>
                      <StatusChip status={prod.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={0.5}>
                        <Tooltip title="Xem mã vạch / QR">
                          <IconButton size="small" color="primary" onClick={() => setSelectedBarcode(prod.barcode)}>
                            <MdQrCode />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="default" onClick={() => onEdit(prod)}>
                            <MdEdit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa sản phẩm">
                          <IconButton size="small" color="error" onClick={() => onDelete(prod.id)}>
                            <MdDelete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Barcode/QR Code Dialog Viewer */}
      <Dialog
        open={!!selectedBarcode}
        onClose={() => setSelectedBarcode(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold" align="center">Mã Vạch Sản Phẩm (Barcode)</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          {selectedBarcode && (
            <Box sx={{ border: 1, borderColor: 'divider', p: 3, borderRadius: 2, bgcolor: '#fff', textAlign: 'center' }}>
              {/* Simple simulated SVG barcode lines representation */}
              <Box display="flex" justifyContent="center" gap="2px" height={60} width={180} mb={1.5} bgcolor="#000" />
              <Typography variant="body1" fontWeight="bold" sx={{ letterSpacing: 2, fontFamily: 'monospace' }}>
                {selectedBarcode}
              </Typography>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Sử dụng thiết bị POS quét mã này để nhận dạng nhanh sản phẩm.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default ProductTable;
