import React from 'react';
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
} from '@mui/material';
import { MdVisibility, MdDelete, MdContentCopy } from 'react-icons/md';
import { NotificationItem, NotificationChannel, NotificationPriority, NotificationStatus, RecipientType } from '../types';

interface NotificationTableProps {
  notifications: NotificationItem[];
  totalElements: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onViewDetails: (item: NotificationItem) => void;
  onDuplicate: (item: NotificationItem) => void;
  onDelete: (id: number) => void;
}

export const getChannelChipColor = (channel: NotificationChannel) => {
  switch (channel) {
    case 'IN_APP':
      return 'primary';
    case 'EMAIL':
      return 'secondary';
    case 'SMS':
      return 'success';
    case 'PUSH':
      return 'info';
    case 'WEB':
      return 'warning';
    default:
      return 'default';
  }
};

export const getChannelLabel = (channel: NotificationChannel) => {
  switch (channel) {
    case 'IN_APP':
      return 'Trong ứng dụng';
    case 'EMAIL':
      return 'Email';
    case 'SMS':
      return 'SMS';
    case 'PUSH':
      return 'Đẩy (Push)';
    case 'WEB':
      return 'Web';
    default:
      return channel;
  }
};

export const getPriorityChipColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'LOW':
      return 'default';
    case 'NORMAL':
      return 'primary';
    case 'HIGH':
      return 'warning';
    case 'CRITICAL':
    case 'EMERGENCY':
      return 'error';
    default:
      return 'default';
  }
};

export const getPriorityLabel = (priority: NotificationPriority) => {
  switch (priority) {
    case 'LOW':
      return 'Thấp';
    case 'NORMAL':
      return 'Thường';
    case 'HIGH':
      return 'Cao';
    case 'CRITICAL':
      return 'Khẩn cấp';
    case 'EMERGENCY':
      return 'Nguy cấp';
    default:
      return priority;
  }
};

export const getStatusChipColor = (status: NotificationStatus) => {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'SCHEDULED':
      return 'warning';
    case 'SENT':
      return 'success';
    case 'FAILED':
      return 'error';
    case 'SENDING':
      return 'primary';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: NotificationStatus) => {
  switch (status) {
    case 'DRAFT':
      return 'Bản nháp';
    case 'SCHEDULED':
      return 'Đã lập lịch';
    case 'SENT':
      return 'Đã gửi';
    case 'FAILED':
      return 'Thất bại';
    case 'SENDING':
      return 'Đang gửi';
    default:
      return status;
  }
};

export const getRecipientLabel = (type: RecipientType) => {
  switch (type) {
    case 'ALL_USERS':
      return 'Tất cả người dùng';
    case 'CUSTOMERS':
      return 'Khách hàng mua vé';
    case 'MEMBERS':
      return 'Hội viên thường';
    case 'VIP_MEMBERS':
      return 'Hội viên VIP';
    case 'VISITORS':
      return 'Khách tham quan';
    case 'STAFF':
      return 'Nhân viên vận hành';
    case 'OPERATORS':
      return 'Điều hành viên';
    case 'MANAGERS':
      return 'Quản lý quầy/vé';
    case 'ADMINS':
      return 'Quản trị viên';
    case 'CUSTOM_GROUP':
      return 'Nhóm tùy chỉnh';
    default:
      return 'Không xác định';
  }
};

export const NotificationTable: React.FC<NotificationTableProps> = ({
  notifications,
  totalElements,
  page,
  size,
  onPageChange,
  onSizeChange,
  onViewDetails,
  onDuplicate,
  onDelete,
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tiêu Đề</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kênh Gửi</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Độ Ưu Tiên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Đối Tượng Nhận</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Thời Gian</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy dữ liệu thông báo phù hợp.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>#{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 280 }}>
                      {item.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getChannelLabel(item.channel)} size="small" color={getChannelChipColor(item.channel)} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={getPriorityLabel(item.priority)} size="small" color={getPriorityChipColor(item.priority)} />
                  </TableCell>
                  <TableCell>{getRecipientLabel(item.recipientType)}</TableCell>
                  <TableCell>
                    <Chip label={getStatusLabel(item.status)} size="small" color={getStatusChipColor(item.status)} variant="filled" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {item.status === 'SCHEDULED' ? 'Lập lịch: ' : 'Đã gửi: '}
                      {new Date(item.scheduledTime || item.sentTime || '').toLocaleString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Xem chi tiết">
                      <IconButton onClick={() => onViewDetails(item)} size="small" color="primary">
                        <MdVisibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Nhân bản mẫu">
                      <IconButton onClick={() => onDuplicate(item)} size="small" color="secondary">
                        <MdContentCopy />
                      </IconButton>
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
        labelRowsPerPage="Số dòng mỗi trang:"
      />
    </Paper>
  );
};
