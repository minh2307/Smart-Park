import React from 'react';
import { Box, Button, Typography, Paper, Divider, Grid } from '@mui/material';
import { MdPrint } from 'react-icons/md';
import { POSOrder } from '../types';

interface ReceiptViewerProps {
  order: POSOrder;
  onPrint: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ order, onPrint }) => {
  return (
    <Box sx={{ maxWidth: 380, mx: 'auto', p: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          backgroundColor: '#fffff8',
          fontFamily: 'monospace',
          borderStyle: 'dashed',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
          GATEOS ENTERPRISE POS
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
          Cửa hàng Bán Lẻ & Dịch Vụ
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={2}>
          ĐT: 1900.5656 - Web: gateos.vn
        </Typography>

        <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <Typography variant="caption">Mã HĐ: {order.orderNumber}</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="caption">
              Ngày: {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">KH: {order.customerName || 'Khách Vãng Lai'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

        {/* Header items */}
        <Grid container spacing={0.5} mb={1} fontWeight="bold">
          <Grid item xs={6}>
            <Typography variant="caption" fontWeight="bold">Tên món/sản phẩm</Typography>
          </Grid>
          <Grid item xs={2} textAlign="right">
            <Typography variant="caption" fontWeight="bold">SL</Typography>
          </Grid>
          <Grid item xs={4} textAlign="right">
            <Typography variant="caption" fontWeight="bold">Thành tiền</Typography>
          </Grid>
        </Grid>

        {order.items.map((item, idx) => (
          <Grid container spacing={0.5} key={idx} mb={0.5}>
            <Grid item xs={6}>
              <Typography variant="caption">{item.product.productName}</Typography>
            </Grid>
            <Grid item xs={2} textAlign="right">
              <Typography variant="caption">{item.quantity}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="right">
              <Typography variant="caption">{(item.finalPrice * item.quantity).toLocaleString()}đ</Typography>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Tạm tính:</Typography>
          <Typography variant="caption">{order.subtotal.toLocaleString()}đ</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Giảm giá:</Typography>
          <Typography variant="caption">-{order.discountAmount.toLocaleString()}đ</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Thuế (VAT):</Typography>
          <Typography variant="caption">+{order.taxAmount.toLocaleString()}đ</Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

        <Box display="flex" justifyContent="space-between" fontWeight="bold" mb={1}>
          <Typography variant="subtitle2" fontWeight="bold">TỔNG CỘNG:</Typography>
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
            {order.totalAmount.toLocaleString()}đ
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Phương thức thanh toán:</Typography>
          <Typography variant="caption">{order.paymentMethod}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Khách đưa:</Typography>
          <Typography variant="caption">{order.amountPaid.toLocaleString()}đ</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="caption">Trả lại khách:</Typography>
          <Typography variant="caption">{order.changeAmount.toLocaleString()}đ</Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

        <Typography variant="caption" display="block" align="center" sx={{ fontStyle: 'italic' }}>
          Cảm ơn quý khách. Hẹn gặp lại!
        </Typography>
      </Paper>

      <Button
        variant="contained"
        fullWidth
        startIcon={<MdPrint />}
        onClick={onPrint}
        sx={{ mt: 2, borderRadius: 2 }}
      >
        In Hóa Đơn (Print)
      </Button>
    </Box>
  );
};
export default ReceiptViewer;
