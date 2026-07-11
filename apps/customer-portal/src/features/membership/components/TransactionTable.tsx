import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import type { PointHistory } from '../types/membership.types';

interface TransactionTableProps {
  historyList: PointHistory[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ historyList }) => {
  return (
    <TableContainer component={Paper} sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Thời gian</TableCell>
            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Nội dung chi tiết</TableCell>
            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Mã Đơn</TableCell>
            <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>Điểm thưởng</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historyList.map((logItem) => (
            <TableRow key={logItem.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <TableCell sx={{ color: '#ffffff' }}>{logItem.createdAt}</TableCell>
              <TableCell sx={{ color: '#ffffff' }}>{logItem.reason}</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                {logItem.orderId ? `#${logItem.orderId}` : 'N/A'}
              </TableCell>
              <TableCell align="right">
                {logItem.pointsEarned > 0 ? (
                  <Chip
                    label={`+${logItem.pointsEarned}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#4caf50', fontWeight: 'bold', border: '1px solid rgba(46, 125, 50, 0.3)' }}
                  />
                ) : logItem.pointsRedeemed > 0 ? (
                  <Chip
                    label={`-${logItem.pointsRedeemed}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336', fontWeight: 'bold', border: '1px solid rgba(211, 47, 47, 0.3)' }}
                  />
                ) : (
                  '0'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
