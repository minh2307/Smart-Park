import React, { useRef } from 'react';
import { Box, Typography, Button, Stack, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import GetAppIcon from '@mui/icons-material/GetApp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { formatCurrency, formatDate } from '@shared/utils';
import type { Order } from '../types/order.types';

interface InvoiceCardProps {
  order: Order;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ order }) => {
  const theme = useTheme();
  const [openPreview, setOpenPreview] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn ${order.orderCode}</title>
            <style>
              body { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 40px; line-height: 1.5; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
              .title { font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0; }
              .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
              .meta-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
              .meta-value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 4px; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              .table th { border-bottom: 2px solid #e2e8f0; text-align: left; padding: 12px 8px; color: #64748b; font-size: 12px; text-transform: uppercase; }
              .table td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; font-size: 14px; }
              .total-section { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; margin-top: 20px; }
              .total-row { display: flex; width: 300px; justify-content: space-between; font-size: 14px; }
              .total-row.grand { font-size: 18px; font-weight: 800; border-top: 2px solid #0f172a; padding-top: 10px; }
              .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Hóa đơn giá trị gia tăng</h1>
              <div class="subtitle">Smart Park Amusement & Resort</div>
            </div>
            <div class="meta-grid">
              <div>
                <div class="meta-label">Mã hóa đơn</div>
                <div class="meta-value">${order.orderCode}</div>
                <div class="meta-label" style="margin-top: 15px;">Ngày thanh toán</div>
                <div class="meta-value">${formatDate(order.createdAt)}</div>
              </div>
              <div>
                <div class="meta-label">Khách hàng</div>
                <div class="meta-value">${order.customer?.fullName}</div>
                <div class="meta-label" style="margin-top: 15px;">Liên hệ</div>
                <div class="meta-value">${order.customer?.email} - ${order.customer?.phone || 'N/A'}</div>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Mô tả sản phẩm</th>
                  <th style="text-align: right;">Đơn giá</th>
                  <th style="text-align: center;">Số lượng</th>
                  <th style="text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${order.items?.map(item => `
                  <tr>
                    <td>Vé Vui Chơi Smart Park (Mã loại: ${item.referenceId})</td>
                    <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.totalPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total-section">
              <div class="total-row">
                <span>Tạm tính:</span>
                <span>${formatCurrency(order.subtotal)}</span>
              </div>
              <div class="total-row">
                <span>Chiết khấu:</span>
                <span>-${formatCurrency(order.discountAmount)}</span>
              </div>
              <div class="total-row">
                <span>Thuế (10%):</span>
                <span>${formatCurrency(order.taxAmount)}</span>
              </div>
              <div class="total-row grand">
                <span>Tổng cộng:</span>
                <span>${formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
            <div class="footer">
              Cảm ơn quý khách đã sử dụng dịch vụ tại Smart Park!
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        p: 3,
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, bgcolor: 'rgba(45, 212, 191, 0.1)', borderRadius: 2 }}>
            <ReceiptIcon sx={{ color: '#2dd4bf' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>
              Hóa đơn & Biên lai
            </Typography>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.4)">
              Tải hóa đơn VAT và biên lai giao dịch điện tử.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={() => setOpenPreview(true)}
            disabled={order.status !== 'PAID'}
            sx={{
              flexGrow: 1,
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#2dd4bf',
                color: '#0f172a',
                borderColor: '#2dd4bf',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            Xem trước
          </Button>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={order.status !== 'PAID'}
            sx={{
              flexGrow: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#2dd4bf',
                color: '#2dd4bf',
                bgcolor: 'rgba(45, 212, 191, 0.05)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            In hóa đơn
          </Button>
        </Stack>
      </Stack>

      {/* Invoice Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          Xem trước hóa đơn
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {/* Printable Container Mock */}
          <Box
            ref={printRef}
            sx={{
              bgcolor: '#ffffff',
              color: '#0f172a',
              borderRadius: 2,
              p: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <Box sx={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', pb: 2, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                Hóa đơn giá trị gia tăng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Smart Park Amusement & Resort
              </Typography>
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mã hóa đơn</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.orderCode}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', mt: 2 }}>Ngày thanh toán</Typography>
                <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Khách hàng</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.customer?.fullName}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', mt: 2 }}>Email liên hệ</Typography>
                <Typography variant="body2">{order.customer?.email}</Typography>
              </Box>
            </Stack>

            <Box sx={{ borderBottom: '2px solid #e2e8f0', pb: 1, mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ px: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>Chi tiết dịch vụ</Typography>
                <Stack direction="row" spacing={4} sx={{ width: 300, justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>Đơn giá</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>SL</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Thành tiền</Typography>
                </Stack>
              </Stack>
            </Box>

            <Stack spacing={1.5} sx={{ mb: 4 }}>
              {order.items?.map((item) => (
                <Stack key={item.id} direction="row" justifyContent="space-between" sx={{ px: 1, borderBottom: '1px solid #f1f5f9', pb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Vé Vui Chơi Smart Park (Mã loại: {item.referenceId})
                  </Typography>
                  <Stack direction="row" spacing={4} sx={{ width: 300, justifyContent: 'space-between' }}>
                    <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', width: 20 }}>{item.quantity}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>{formatCurrency(item.totalPrice)}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>

            <Stack spacing={1.5} alignItems="flex-end" sx={{ mt: 4 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ width: 250, fontSize: '0.875rem' }}>
                <Typography color="text.secondary">Tạm tính:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(order.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ width: 250, fontSize: '0.875rem' }}>
                <Typography color="text.secondary">Giảm giá:</Typography>
                <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>-{formatCurrency(order.discountAmount)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ width: 250, fontSize: '0.875rem' }}>
                <Typography color="text.secondary">Thuế (10%):</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(order.taxAmount)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ width: 250, borderTop: '2px solid #0f172a', pt: 1.5 }}>
                <Typography sx={{ fontWeight: 800 }}>Tổng tiền:</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(order.totalAmount)}</Typography>
              </Stack>
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', mt: 6, borderTop: '1px dashed #cbd5e1', pt: 2 }}>
              Cảm ơn quý khách đã lựa chọn Smart Park!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={() => setOpenPreview(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, textTransform: 'none' }}>
            Đóng
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              handlePrint();
              setOpenPreview(false);
            }}
            sx={{
              bgcolor: '#2dd4bf',
              color: '#0f172a',
              fontWeight: 800,
              textTransform: 'none',
              px: 3,
              borderRadius: 2,
              '&:hover': { bgcolor: '#0ea5e9', color: '#ffffff' },
            }}
          >
            In ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
