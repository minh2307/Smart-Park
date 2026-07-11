import React from 'react';
import { Box, Typography, Divider, Grid, Card, CardContent, Button } from '@mui/material';
import { NotificationItem } from '../types';
import { getRecipientLabel, getChannelLabel, getPriorityLabel, getStatusLabel } from './NotificationTable';

interface NotificationPreviewProps {
  item: NotificationItem;
  onClose: () => void;
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({ item, onClose }) => {
  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Chi Tiết Thông Báo #{item.id}
        </Typography>
        <Button size="small" onClick={onClose}>
          Đóng
        </Button>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
        {item.title}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, whiteSpace: 'pre-wrap' }}>
        {item.message}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Kênh Gửi
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getChannelLabel(item.channel)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Độ Ưu Tiên
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getPriorityLabel(item.priority)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Đối Tượng
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getRecipientLabel(item.recipientType)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Trạng Thái
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getStatusLabel(item.status)}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Người Tạo
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {item.createdBy}
          </Typography>
        </Grid>

        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Thời Gian
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {item.sentTime ? new Date(item.sentTime).toLocaleString('vi-VN') : 'Chưa gửi'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Thống Kê Phát Hành
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                Số thiết bị đã nhận
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                {item.deliveryCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                Số người đã đọc
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                {item.readCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {item.status === 'FAILED' && (
        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.light', mb: 3 }}>
          <Typography variant="caption" color="error.dark" display="block" sx={{ fontWeight: 600 }}>
            Nhật ký lỗi (Failure Log)
          </Typography>
          <Typography variant="body2" color="error.dark">
            {item.failureReason || 'Lỗi không xác định từ cổng dịch vụ ngoại vi.'}
          </Typography>
        </Box>
      )}

      {(item.deepLink || item.actionButtonText) && (
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
            Thông Tin Nút Bấm Điều Hướng
          </Typography>
          <Typography variant="body2">
            <strong>Nhãn nút:</strong> {item.actionButtonText || 'N/A'}<br />
            <strong>Đường dẫn:</strong> <code>{item.deepLink || 'N/A'}</code>
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="contained" onClick={onClose}>
          Đóng Chi Tiết
        </Button>
      </Box>
    </Box>
  );
};
