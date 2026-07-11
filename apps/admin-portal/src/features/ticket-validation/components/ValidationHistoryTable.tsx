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
  Tooltip,
  Typography,
} from '@mui/material';
import { MdVisibility } from 'react-icons/md';
import { ValidationLog } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import dayjs from 'dayjs';

interface ValidationHistoryTableProps {
  logs: ValidationLog[];
  onViewDetails: (log: ValidationLog) => void;
}

export const ValidationHistoryTable: React.FC<ValidationHistoryTableProps> = ({
  logs,
  onViewDetails,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Vé</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Khách Hàng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thời Gian Quét</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Cổng / Trò Chơi</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Nhân Viên Trực</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái Quét</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chi Tiết Lỗi</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hành Động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">Chưa có lịch sử quét vé nào</Typography>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{log.ticketCode}</TableCell>
                <TableCell>{log.customerName}</TableCell>
                <TableCell>{dayjs(log.checkInTime).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {log.gateCode}
                  </Typography>
                  {log.attractionName && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Trò chơi: {log.attractionName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{log.operatorName}</TableCell>
                <TableCell>
                  <StatusChip status={log.status} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                    {log.failureReason || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Xem thông tin vé">
                    <IconButton onClick={() => onViewDetails(log)} color="info" size="small">
                      <MdVisibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default ValidationHistoryTable;
