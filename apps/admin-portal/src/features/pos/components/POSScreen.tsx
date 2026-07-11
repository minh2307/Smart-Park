import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  MdDelete,
  MdAdd,
  MdRemove,
  MdShoppingCart,
  MdReceipt,
  MdClose,
  MdPause,
  MdPlayArrow,
  MdQrCode,
} from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
} from '../../retail/services/retailApi';
import { Product } from '../../retail/types';
import { CartItem, POSOrder } from '../types';
import {
  useCreatePOSOrderMutation,
  useGetPOSOrdersQuery,
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} from '../services/posApi';
import { BarcodeScanner } from './BarcodeScanner';
import { QRCodeScanner } from './QRCodeScanner';
import { ReceiptViewer } from './ReceiptViewer';

export const POSScreen: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'QR' | 'SPLIT'>('CASH');
  const [amountPaid, setAmountPaid] = useState(0);

  // Dialogs
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<POSOrder | null>(null);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  // Shift local state
  const [shiftOperator, setShiftOperator] = useState('Phạm Thị Thùy');
  const [shiftInitialCash, setShiftInitialCash] = useState(1000000);
  const [shiftClosedCash, setShiftClosedCash] = useState(0);

  // API Queries & Mutations
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: productsData } = useGetProductsQuery({
    search: search || undefined,
    categoryId: selectedCatId || undefined,
  });

  const { data: activeShift } = useGetCurrentShiftQuery();
  const { data: heldOrdersData } = useGetPOSOrdersQuery({ status: 'HELD' });

  const [createOrder] = useCreatePOSOrderMutation();
  const [openShift] = useOpenShiftMutation();
  const [closeShift] = useCloseShiftMutation();

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100 + (couponCode === 'GIAM50K' ? 50000 : 0);
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((subtotalAfterDiscount * 0.1).toFixed(0)); // 10% tax
  const totalAmount = subtotalAfterDiscount + taxAmount;
  const changeAmount = Math.max(0, amountPaid - totalAmount);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng trong kho!');
      return;
    }

    const existingIdx = cart.findIndex((item) => item.product.id === product.id);
    if (existingIdx !== -1) {
      const currentQty = cart[existingIdx].quantity;
      if (currentQty >= product.stock) {
        toast.warning('Không thể bán vượt quá số lượng hàng tồn kho!');
        return;
      }
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
      const discountedPrice = product.price - (product.price * product.discount) / 100;
      setCart([...cart, { product, quantity: 1, discountPercentage: product.discount, finalPrice: discountedPrice }]);
    }
  };

  const handleUpdateQty = (idx: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[idx].quantity + delta;
    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      if (newQty > updated[idx].product.stock) {
        toast.warning('Đã đạt giới hạn tồn kho của sản phẩm!');
        return;
      }
      updated[idx].quantity = newQty;
    }
    setCart(updated);
  };

  const handleRemoveFromCart = (idx: number) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
  };

  const handleBarcodeScan = (barcode: string) => {
    const prod = productsData?.content.find((p) => p.barcode === barcode);
    if (prod) {
      handleAddToCart(prod);
      toast.success(`Đã thêm: ${prod.productName}`);
    } else {
      toast.error(`Không tìm thấy sản phẩm có mã vạch: ${barcode}`);
    }
  };

  const handleQRScanResult = (result: string) => {
    setIsQRScannerOpen(false);
    if (result === 'MEM-VIP-999') {
      setCustomerName('Khách Hàng VIP (Nguyễn Văn A)');
      setDiscountPercent(15);
      toast.success('Áp dụng chiết khấu thành viên VIP: giảm 15%');
    } else if (result === 'GIAM50K') {
      setCouponCode('GIAM50K');
      toast.success('Áp dụng mã Coupon: Giảm ngay 50.000đ');
    } else if (result === 'VOUCHER100') {
      setVoucherCode('VOUCHER100');
      setAmountPaid((prev) => prev + 100000);
      toast.success('Áp dụng Voucher thanh toán: 100.000đ');
    }
  };

  const handleHoldOrderSubmit = async () => {
    if (cart.length === 0) return;
    try {
      await createOrder({
        items: cart,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: 'HELD',
        holdReason,
        customerName: customerName || 'Chờ thanh toán',
      }).unwrap();
      toast.success('Đã lưu trữ đơn hàng chờ xử lý.');
      setCart([]);
      setCustomerName('');
      setHoldReason('');
      setIsHoldDialogOpen(false);
    } catch (e) {
      toast.error('Lỗi khi lưu đơn hàng tạm hoãn.');
    }
  };

  const handleResumeOrder = (order: POSOrder) => {
    setCart(order.items);
    setCustomerName(order.customerName || '');
    // mark resolved order as completed or remove from database
    toast.success(`Đã tải lại đơn hàng: ${order.orderNumber}`);
  };

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      toast.warning('Giỏ hàng trống!');
      return;
    }
    if (!activeShift) {
      toast.error('Vui lòng mở ca làm việc trước khi thực hiện bán hàng!');
      setIsShiftDialogOpen(true);
      return;
    }

    try {
      const order = await createOrder({
        items: cart,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod,
        amountPaid: amountPaid || totalAmount,
        changeAmount: amountPaid ? changeAmount : 0,
        customerName: customerName || 'Khách Vãng Lai',
        couponCode,
        voucherCode,
        status: 'COMPLETED',
      }).unwrap();

      toast.success('Thanh toán đơn hàng thành công!');
      setActiveReceiptOrder(order);
      setCart([]);
      setCustomerName('');
      setCouponCode('');
      setVoucherCode('');
      setDiscountPercent(0);
      setAmountPaid(0);
    } catch (e) {
      toast.error('Gặp lỗi khi tạo hóa đơn thanh toán.');
    }
  };

  const handleOpenShiftSubmit = async () => {
    try {
      await openShift({ operatorName: shiftOperator, initialCash: shiftInitialCash }).unwrap();
      toast.success('Bắt đầu ca làm việc thành công!');
      setIsShiftDialogOpen(false);
    } catch (e) {
      toast.error('Không thể mở ca làm việc.');
    }
  };

  const handleCloseShiftSubmit = async () => {
    try {
      await closeShift({ closedCash: shiftClosedCash }).unwrap();
      toast.success('Đã chốt sổ và đóng ca làm việc thành công!');
      setIsShiftDialogOpen(false);
    } catch (e) {
      toast.error('Lỗi khi đóng ca.');
    }
  };

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Thiết Bị Bán Hàng (POS Terminal)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {activeShift ? (
              <Box component="span" color="success.main" fontWeight="bold">
                ● ĐANG MỞ CA: Trực ca {activeShift.operatorName} | Bắt đầu lúc {new Date(activeShift.startTime).toLocaleTimeString()}
              </Box>
            ) : (
              <Box component="span" color="error.main" fontWeight="bold">
                ● ĐÃ ĐÓNG CA: Vui lòng mở ca để bán hàng.
              </Box>
            )}
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={() => setIsShiftDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Quản Lý Ca (Shift)
          </Button>
          {heldOrdersData?.content && heldOrdersData.content.length > 0 && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<MdPlayArrow />}
              onClick={() => {
                const order = heldOrdersData.content[0];
                handleResumeOrder(order);
              }}
              sx={{ borderRadius: 2 }}
            >
              Phục Hồi ({heldOrdersData.content.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Terminal View */}
      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
        {/* Left Side: Product Selector */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <BarcodeScanner onScan={handleBarcodeScan} />

              <Box display="flex" gap={2} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tìm kiếm sản phẩm nhanh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={selectedCatId}
                    label="Danh mục"
                    onChange={(e) => setSelectedCatId(e.target.value as any)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {(categoriesData?.content || []).map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Products Catalog list */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                <Grid container spacing={2}>
                  {(productsData?.content || []).map((p) => (
                    <Grid item xs={6} sm={4} key={p.id}>
                      <Card
                        variant="outlined"
                        onClick={() => handleAddToCart(p)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          textAlign: 'center',
                          height: '100%',
                          border: p.stock === 0 ? '1px dashed' : '1px solid',
                          borderColor: p.stock === 0 ? 'error.main' : 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          },
                        }}
                      >
                        {p.image && (
                          <Box
                            component="img"
                            src={p.image}
                            sx={{ width: '100%', height: 100, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                          />
                        )}
                        <Box p={1.5}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {p.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Kho: {p.stock} sản phẩm
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mt={0.5}>
                            {p.price.toLocaleString()}đ
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Checkout Panel */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <MdShoppingCart /> Giỏ Hàng
                </Typography>
                <Chip label={`${cart.length} món`} color="primary" size="small" />
              </Box>

              {/* Cart List */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 2, mb: 2, minHeight: 120 }}>
                {cart.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" py={4}>
                    <Typography color="text.secondary">Giỏ hàng rỗng.</Typography>
                  </Box>
                ) : (
                  <List dense>
                    {cart.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem>
                          <ListItemText
                            primary={item.product.productName}
                            secondary={`Đơn giá: ${item.finalPrice.toLocaleString()}đ`}
                          />
                          <Box display="flex" alignItems="center" gap={1} mr={4}>
                            <IconButton size="small" onClick={() => handleUpdateQty(idx, -1)}>
                              <MdRemove />
                            </IconButton>
                            <Typography variant="body2" fontWeight="bold">
                              {item.quantity}
                            </Typography>
                            <IconButton size="small" onClick={() => handleUpdateQty(idx, 1)}>
                              <MdAdd />
                            </IconButton>
                          </Box>
                          <ListItemSecondaryAction>
                            <IconButton size="small" color="error" onClick={() => handleRemoveFromCart(idx)}>
                              <MdDelete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>

              {/* Customer, Promos & Payments input */}
              <Grid container spacing={1.5} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MdQrCode />}
                    onClick={() => setIsQRScannerOpen(true)}
                    sx={{ height: 40, borderRadius: 2 }}
                  >
                    Quét Thẻ/Promo
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phương thức thanh toán</InputLabel>
                    <Select
                      value={paymentMethod}
                      label="Phương thức thanh toán"
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <MenuItem value="CASH">Tiền mặt (Cash)</MenuItem>
                      <MenuItem value="CARD">Thẻ ngân hàng (Card)</MenuItem>
                      <MenuItem value="QR">Chuyển khoản QR (QR Pay)</MenuItem>
                      <MenuItem value="SPLIT">Thanh toán hỗn hợp (Split)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {paymentMethod === 'CASH' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Tiền mặt khách đưa (VNĐ)"
                      value={amountPaid || ''}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Checkout Calculation Summary */}
              <Box bgcolor="action.hover" p={2} borderRadius={2} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Tạm tính:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {subtotal.toLocaleString()}đ
                  </Typography>
                </Box>
                {discountAmount > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={0.5} color="error.main">
                    <Typography variant="body2">Giảm giá:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      -{discountAmount.toLocaleString()}đ
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Thuế (VAT 10%):</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {taxAmount.toLocaleString()}đ
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="subtitle1" fontWeight="bold">Tổng cộng:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                    {totalAmount.toLocaleString()}đ
                  </Typography>
                </Box>
                {paymentMethod === 'CASH' && amountPaid > 0 && (
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" fontWeight="bold">Tiền thừa trả khách:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {changeAmount.toLocaleString()}đ
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action buttons */}
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<MdPause />}
                    onClick={() => setIsHoldDialogOpen(true)}
                    disabled={cart.length === 0}
                    sx={{ borderRadius: 2 }}
                  >
                    Hoãn (Hold)
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<MdReceipt />}
                    onClick={handleCheckoutSubmit}
                    disabled={cart.length === 0}
                    sx={{ borderRadius: 2 }}
                  >
                    Thanh Toán
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Scanner simulation Dialog */}
      <Dialog open={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <QRCodeScanner
            onScanResult={handleQRScanResult}
            onCancel={() => setIsQRScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Shift Dialog */}
      <Dialog open={isShiftDialogOpen} onClose={() => setIsShiftDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">
          {activeShift ? 'Đóng Ca & Chốt Sổ' : 'Mở Ca Làm Việc'}
        </DialogTitle>
        <DialogContent>
          {!activeShift ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên nhân viên thu ngân"
                  value={shiftOperator}
                  onChange={(e) => setShiftOperator(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Tiền mặt đầu ca (VNĐ)"
                  value={shiftInitialCash}
                  onChange={(e) => setShiftInitialCash(Number(e.target.value))}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" mb={1}>
                  Thu ngân: <strong>{activeShift.operatorName}</strong>
                </Typography>
                <Typography variant="body2" mb={2}>
                  Thời gian mở ca: {new Date(activeShift.startTime).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Doanh thu tiền mặt đếm thực tế chốt ca (VNĐ)"
                  value={shiftClosedCash}
                  onChange={(e) => setShiftClosedCash(Number(e.target.value))}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsShiftDialogOpen(false)}>Hủy</Button>
          {!activeShift ? (
            <Button onClick={handleOpenShiftSubmit} variant="contained">
              Mở Ca
            </Button>
          ) : (
            <Button onClick={handleCloseShiftSubmit} variant="contained" color="error">
              Đóng Ca & Chốt
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Hold Order Dialog */}
      <Dialog open={isHoldDialogOpen} onClose={() => setIsHoldDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Tạm Hoãn Đơn Hàng</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            sx={{ mt: 1 }}
            label="Lý do hoãn (Ví dụ: khách đi lấy thêm đồ, v.v.)"
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsHoldDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleHoldOrderSubmit} variant="contained" color="warning">
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Viewer Dialog */}
      <Dialog open={!!activeReceiptOrder} onClose={() => setActiveReceiptOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Xem Trước Hóa Đơn
          <IconButton size="small" onClick={() => setActiveReceiptOrder(null)}>
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {activeReceiptOrder && (
            <ReceiptViewer
              order={activeReceiptOrder}
              onPrint={() => {
                toast.success('In hóa đơn thành công!');
                setActiveReceiptOrder(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default POSScreen;
