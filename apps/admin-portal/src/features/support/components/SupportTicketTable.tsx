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
import { MdChat, MdDelete } from 'react-icons/md';
import { SupportTicket, SupportPriority, SupportStatus, SupportCategory } from '../types';

interface SupportTicketTableProps {
  tickets: SupportTicket[];
  totalElements: number;
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onSelectTicket: (ticket: SupportTicket) => void;
  onDeleteTicket: (id: number) => void;
}

export const getPriorityChip = (p: SupportPriority) => {
  switch (p) {
    case 'LOW':
      return <Chip label="LOW" size="small" variant="outlined" />;
    case 'NORMAL':
      return <Chip label="NORMAL" size="small" color="primary" variant="outlined" />;
    case 'HIGH':
      return <Chip label="HIGH" size="small" color="warning" />;
    case 'URGENT':
      return <Chip label="URGENT" size="small" color="error" sx={{ fontWeight: 600 }} />;
    default:
      return null;
  }
};

export const getStatusChip = (s: SupportStatus) => {
  switch (s) {
    case 'OPEN':
      return <Chip label="OPEN" size="small" color="error" />;
    case 'ASSIGNED':
      return <Chip label="ASSIGNED" size="small" color="warning" />;
    case 'IN_PROGRESS':
      return <Chip label="IN_PROGRESS" size="small" color="primary" />;
    case 'WAITING_CUSTOMER':
      return <Chip label="WAITING_CUSTOMER" size="small" color="secondary" variant="outlined" />;
    case 'RESOLVED':
      return <Chip label="RESOLVED" size="small" color="success" />;
    case 'CLOSED':
      return <Chip label="CLOSED" size="small" variant="outlined" />;
    case 'ESCALATED':
      return <Chip label="ESCALATED" size="small" color="error" />;
    default:
      return <Chip label={s} size="small" />;
  }
};

export const getSlaChip = (status: 'MET' | 'BREACHED' | 'WARNING') => {
  switch (status) {
    case 'MET':
      return <Chip label="SLA Đạt" size="small" color="success" variant="outlined" />;
    case 'WARNING':
      return <Chip label="SLA Sắp Hết Hạn" size="small" color="warning" variant="filled" />;
    case 'BREACHED':
      return <Chip label="SLA Quá Hạn" size="small" color="error" variant="filled" sx={{ fontWeight: 600 }} />;
    default:
      return null;
  }
};

export const getCategoryLabel = (cat: SupportCategory) => {
  switch (cat) {
    case 'TICKET_REFUND':
      return 'Hoàn tiền vé';
    case 'MEMBERSHIP':
      return 'Thành viên / Loyalty';
    case 'LOST_FOUND':
      return 'Thất lạc hành lý';
    case 'FACILITY':
      return 'Hạ tầng / Locker';
    case 'COMPLAINT':
      return 'Khiếu nại dịch vụ';
    case 'OTHER':
      return 'Yêu cầu khác';
    default:
      return cat;
  }
};

export const SupportTicketTable: React.FC<SupportTicketTableProps> = ({
  tickets,
  totalElements,
  page,
  size,
  onPageChange,
  onSizeChange,
  onSelectTicket,
  onDeleteTicket,
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Mã Ticket</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Khách Hàng</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Chủ Đề</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phân Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Độ Ưu Tiên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SLA Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hạn Xử Lý (Deadline)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có yêu cầu hỗ trợ nào trong danh sách.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{item.ticketCode}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.customerEmail}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: '200px' }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {item.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{getCategoryLabel(item.category)}</TableCell>
                  <TableCell>{getPriorityChip(item.priority)}</TableCell>
                  <TableCell>{getStatusChip(item.status)}</TableCell>
                  <TableCell>{getSlaChip(item.slaStatus)}</TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {new Date(item.slaDeadline).toLocaleString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Mở phòng hội thoại CSKH">
                      <IconButton onClick={() => onSelectTicket(item)} size="small" color="primary">
                        <MdChat />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => onDeleteTicket(item.id)} size="small" color="error">
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
    </Paper>
  );
};
