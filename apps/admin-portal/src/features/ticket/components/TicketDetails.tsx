import React from 'react';
import { Box, Grid, Typography, Paper, Divider, Stack, Alert, Chip } from '@mui/material';
import { Ticket } from '../types';
import { StatusChip } from './StatusChip';
import { QRCodeViewer } from './QRCodeViewer';
import { BarcodeViewer } from './BarcodeViewer';
import { MdCalendarToday, MdHistory, MdPayment } from 'react-icons/md';
import dayjs from 'dayjs';

interface TicketDetailsProps {
  ticket: Ticket;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket }) => {
  const isExpired = dayjs(ticket.validDate).isBefore(dayjs(), 'day');

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={3}>
        {/* Left Column: Information */}
        <Grid item xs={12} md={7} display="flex" flexDirection="column" gap={3}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Chi tiết vé
              </Typography>
              <StatusChip status={ticket.status} type="ticket" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Mã vé</Typography>
                <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                  {ticket.ticketCode}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Loại vé</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {ticket.ticketType?.name || 'Vào cổng'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Giá tiền</Typography>
                <Typography variant="body1" fontWeight={500} color="primary.main">
                  {ticket.ticketType?.price ? `${(ticket.ticketType.price * 25000).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Phân khu</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {ticket.venue?.name || 'Cổng chính'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Visitor */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Thông tin khách hàng & Khách tham quan
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Họ và tên</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {ticket.customer?.fullName || 'Khách mua trực tiếp'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Địa chỉ Email</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {ticket.customer?.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {ticket.customer?.phone || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Validity & Usage */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Hiệu lực & Lượt sử dụng
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {isExpired && ticket.status !== 'USED' && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                Vé này đã hết hạn và không còn giá trị để vào cửa.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Ngày phát hành</Typography>
                <Typography variant="body2" display="flex" alignItems="center" gap={0.5} fontWeight={500}>
                  <MdCalendarToday size={16} />
                  {dayjs(ticket.createdAt).format('YYYY-MM-DD')}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Ngày hết hạn</Typography>
                <Typography variant="body2" display="flex" alignItems="center" gap={0.5} fontWeight={500} color={isExpired ? 'error.main' : 'text.primary'}>
                  <MdCalendarToday size={16} />
                  {dayjs(ticket.validDate).format('YYYY-MM-DD')}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Số lần đã dùng</Typography>
                <Typography variant="body1" fontWeight={600} color="secondary.main">
                  {ticket.usageCount}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Số lượt còn lại</Typography>
                <Typography variant="body1" fontWeight={600} color={ticket.remainingUses > 0 ? 'success.main' : 'error.main'}>
                  {ticket.remainingUses}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Scan History / Logs */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <MdHistory />
              Nhật ký Check-in / Lịch sử sử dụng
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {(!ticket.scans || ticket.scans.length === 0) ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Chưa có lịch sử check-in cho vé này.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {ticket.scans.map((scan, idx) => (
                  <Box key={scan.id || idx} p={1.5} sx={{ borderLeft: '3px solid', borderColor: scan.status === 'THANH_CONG' ? 'success.main' : 'error.main', bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>
                        {scan.attractionName}
                      </Typography>
                      <Chip
                        label={scan.status === 'THANH_CONG' ? 'THÀNH CÔNG' : 'THẤT BẠI'}
                        color={scan.status === 'THANH_CONG' ? 'success' : 'error'}
                        size="small"
                        sx={{ height: 20, fontSize: '0.625rem' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Thời gian check-in: {dayjs(scan.checkInTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Right Column: QR and Barcode */}
        <Grid item xs={12} md={5} display="flex" flexDirection="column" gap={3}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Mã QR soát vé an toàn
            </Typography>
            <QRCodeViewer value={ticket.ticketCode} size={200} label={ticket.ticketCode} />
            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, px: 2 }}>
              Mã token mã hóa động. Vui lòng trình mã này tại cổng soát vé tự động.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Xem trước Mã vạch (Barcode)
            </Typography>
            <BarcodeViewer value={ticket.ticketCode} />
          </Paper>

          {/* Payment & Audit Info */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={1.5}>
              <MdPayment /> Thông tin thanh toán & Đối soát
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Mã đơn hàng thanh toán</Typography>
                <Typography variant="body2" fontWeight={500}>#{ticket.orderId || 'N/A'}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Tạo bởi</Typography>
                <Typography variant="body2" fontWeight={500}>Quản trị hệ thống</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Thời gian tạo</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {dayjs(ticket.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
