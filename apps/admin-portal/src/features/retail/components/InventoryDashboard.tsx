import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { MdAdd, MdWarning, MdArrowDownward, MdArrowUpward, MdCompareArrows, MdSettings } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetInventoryStatsQuery,
  useGetProductsQuery,
  useCreateStockMovementMutation,
  useGetStockMovementsQuery,
} from '../services/retailApi';
import { Product, StockMovementType } from '../types';

export const InventoryDashboard: React.FC = () => {
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useGetInventoryStatsQuery();
  const { data: productsData } = useGetProductsQuery({ size: 100 });
  const { data: movementsData, refetch: refetchMovements } = useGetStockMovementsQuery({});
  const [createMovement] = useCreateStockMovementMutation();

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<StockMovementType>('IN');
  const [quantity, setQuantity] = useState(1);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [reason, setReason] = useState('');
  const [operator, setOperator] = useState('Nhân viên kho');

  const handleCreateMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.warning('Vui lòng chọn sản phẩm!');
      return;
    }
    try {
      await createMovement({
        productId: Number(selectedProductId),
        movementType,
        quantity,
        fromLocation: movementType === 'OUT' || movementType === 'TRANSFER' ? fromLocation : undefined,
        toLocation: movementType === 'IN' || movementType === 'TRANSFER' || movementType === 'ADJUSTMENT' ? toLocation : undefined,
        reason,
        operator,
      }).unwrap();

      toast.success('Ghi nhận điều chỉnh kho thành công!');
      setIsMoveOpen(false);
      setSelectedProductId('');
      setQuantity(1);
      setFromLocation('');
      setToLocation('');
      setReason('');
      refetchStats();
      refetchMovements();
    } catch (e) {
      toast.error('Lỗi khi điều chỉnh kho.');
    }
  };

  if (isLoadingStats || !stats) {
    return <Typography sx={{ p: 2 }}>Đang tải dữ liệu kho hàng...</Typography>;
  }

  const kpis = [
    {
      title: 'Danh Mục Sản Phẩm',
      value: stats.totalProducts,
      desc: 'Sản phẩm kinh doanh',
      icon: <MdSettings style={{ fontSize: '2rem', color: '#1976d2' }} />,
    },
    {
      title: 'Tổng Giá Trị Tồn Kho',
      value: `${stats.totalStockValue.toLocaleString()}đ`,
      desc: 'Tính theo giá vốn hàng bán',
      icon: <MdArrowUpward style={{ fontSize: '2rem', color: '#2e7d32' }} />,
    },
    {
      title: 'Sản Phẩm Sắp Hết Hàng',
      value: stats.lowStockItemsCount,
      desc: 'Vượt hạn mức tối thiểu',
      icon: <MdWarning style={{ fontSize: '2rem', color: '#d32f2f' }} />,
      color: stats.lowStockItemsCount > 0 ? 'error.main' : 'text.primary',
    },
    {
      title: 'Tồn Kho Đang Giữ',
      value: stats.reservedStockCount,
      desc: 'Giữ hàng cho đơn đặt trước',
      icon: <MdCompareArrows style={{ fontSize: '2rem', color: '#ed6c02' }} />,
    },
  ];

  return (
    <Box mb={4}>
      {/* Top action grid */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Tổng Quan Kho & Tồn Kho (Warehouse Management)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MdAdd />}
          onClick={() => setIsMoveOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Nhập / Xuất / Điều Chỉnh Kho
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0px 4px 10px rgba(0,0,0,0.02)' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="bold">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ my: 1, color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {kpi.desc}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* History Stock movements list */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Lịch Sử Biến Động Kho (Stock Movement Logs)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời Gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại Biến Động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sản Phẩm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã SKU</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số Lượng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Từ Kho</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Đến Kho</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lý Do</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nhân Viên</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(movementsData?.content || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      Chưa có biến động kho nào được ghi nhận.
                    </TableCell>
                  </TableRow>
                ) : (
                  (movementsData?.content || []).map((mov) => (
                    <TableRow key={mov.id} hover>
                      <TableCell>{new Date(mov.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {mov.movementType === 'IN' && (
                          <Box component="span" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MdArrowUpward /> Nhập Kho
                          </Box>
                        )}
                        {mov.movementType === 'OUT' && (
                          <Box component="span" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MdArrowDownward /> Xuất Kho
                          </Box>
                        )}
                        {mov.movementType === 'TRANSFER' && (
                          <Box component="span" sx={{ color: 'info.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MdCompareArrows /> Luân Chuyển
                          </Box>
                        )}
                        {mov.movementType === 'ADJUSTMENT' && (
                          <Box component="span" sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MdSettings /> Cân Bằng Kho
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{mov.productName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{mov.sku}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{mov.quantity}</TableCell>
                      <TableCell>{mov.fromLocation || '—'}</TableCell>
                      <TableCell>{mov.toLocation || '—'}</TableCell>
                      <TableCell>{mov.reason}</TableCell>
                      <TableCell>{mov.operator}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Adjust Stock Movement Dialog Modal */}
      <Dialog
        open={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle fontWeight="bold">Điều Chỉnh Kho Hàng</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateMovementSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Chọn sản phẩm điều chỉnh</InputLabel>
              <Select
                value={selectedProductId}
                label="Chọn sản phẩm điều chỉnh"
                onChange={(e) => setSelectedProductId(e.target.value as any)}
              >
                {(productsData?.content || []).map((p: Product) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.productName} (SKU: {p.sku} - Tồn hiện tại: {p.stock})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Loại hình điều chỉnh</InputLabel>
              <Select
                value={movementType}
                label="Loại hình điều chỉnh"
                onChange={(e) => setMovementType(e.target.value as any)}
              >
                <MenuItem value="IN">Nhập hàng mới / bổ sung (Stock In)</MenuItem>
                <MenuItem value="OUT">Xuất hủy / trả hàng (Stock Out)</MenuItem>
                <MenuItem value="TRANSFER">Luân chuyển nội bộ (Transfer)</MenuItem>
                <MenuItem value="ADJUSTMENT">Cân bằng số lượng kho (Adjustment)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label={movementType === 'ADJUSTMENT' ? 'Số lượng chốt thực tế mới' : 'Số lượng biến động'}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            {(movementType === 'OUT' || movementType === 'TRANSFER') && (
              <TextField
                fullWidth
                label="Từ kho / Xuất phát"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="Ví dụ: Kho chính"
              />
            )}

            {(movementType === 'IN' || movementType === 'TRANSFER' || movementType === 'ADJUSTMENT') && (
              <TextField
                fullWidth
                label="Đến kho / Đích đến"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="Ví dụ: Kho phụ / Quầy bán hàng"
              />
            )}

            <TextField
              fullWidth
              label="Lý do điều chỉnh"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Nhập hàng bổ sung từ PO, Điều chỉnh định kỳ"
            />

            <TextField
              fullWidth
              label="Nhân viên thực hiện"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            />

            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={2}>
              <Button onClick={() => setIsMoveOpen(false)} variant="outlined">
                Hủy
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Cập Nhật
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default InventoryDashboard;
