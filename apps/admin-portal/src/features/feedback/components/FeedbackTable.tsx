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
  Chip,
  Tooltip,
  Typography,
  TablePagination,
  Rating,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { MdReply, MdCheckCircle, MdDelete } from 'react-icons/md';
import { Feedback, FeedbackCategory, FeedbackStatus } from '../types';

interface FeedbackTableProps {
  feedbacks: Feedback[];
  totalElements: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onReply: (id: number, replyContent: string) => void;
  onResolve: (id: number) => void;
  onDelete: (id: number) => void;
}

export const getCategoryChipColor = (cat: FeedbackCategory) => {
  switch (cat) {
    case 'RIDE':
      return 'primary';
    case 'RESTAURANT':
      return 'secondary';
    case 'PARKING':
      return 'success';
    case 'LOCKER':
      return 'warning';
    case 'TICKET':
      return 'info';
    case 'BOOKING':
      return 'default';
    case 'STAFF':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusColor = (status: FeedbackStatus) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'REPLIED':
      return 'info';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  feedbacks,
  totalElements,
  page,
  size,
  onPageChange,
  onSizeChange,
  onReply,
  onResolve,
  onDelete,
}) => {
  const [replyTarget, setReplyTarget] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyTarget && replyText.trim()) {
      onReply(replyTarget.id, replyText);
      setReplyTarget(null);
      setReplyText('');
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Khách Hàng</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phân Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Đánh Giá</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ý Kiến Khách Hàng</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phản Hồi CSKH</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có ý kiến phản hồi nào từ khách hàng.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>#{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.customerEmail}
                    </Typography>
                    {item.bookingCode && (
                      <Chip label={`Đơn: ${item.bookingCode}`} size="small" variant="outlined" sx={{ mt: 0.5, height: '20px' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" color={getCategoryChipColor(item.category)} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Rating value={item.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: '280px' }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {item.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Gửi ngày: {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: '240px' }}>
                    {item.replyContent ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          "{item.replyContent}"
                        </Typography>
                        <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                          Đã gửi bởi: {item.assignedStaff} lúc {new Date(item.repliedAt || '').toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        Chưa có phản hồi
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Gửi phản hồi">
                      <span>
                        <IconButton
                          onClick={() => {
                            setReplyTarget(item);
                            setReplyText(item.replyContent || '');
                          }}
                          size="small"
                          color="primary"
                          disabled={item.status === 'RESOLVED'}
                        >
                          <MdReply />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Giải quyết xong">
                      <span>
                        <IconButton
                          onClick={() => onResolve(item.id)}
                          size="small"
                          color="success"
                          disabled={item.status === 'RESOLVED' || !item.replyContent}
                        >
                          <MdCheckCircle />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={size}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
      />

      {/* Reply Dialog */}
      <Dialog open={!!replyTarget} onClose={() => setReplyTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Phản hồi ý kiến của {replyTarget?.customerName}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <strong>Nội dung ý kiến:</strong> {replyTarget?.content}
          </Typography>
          <TextField
            label="Nội dung trả lời chính thức"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            placeholder="Kính gửi quý khách, chúng tôi chân thành cảm ơn ý kiến đóng góp của quý khách..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyTarget(null)}>Hủy Bỏ</Button>
          <Button onClick={handleReplySubmit} variant="contained" color="primary" disabled={!replyText.trim()}>
            Gửi Phản Hồi
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
