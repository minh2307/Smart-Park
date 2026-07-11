import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { OrderStatusChip } from './OrderStatusChip';
import { formatCurrency, formatDate } from '@shared/utils';
import type { Payment } from '../types/order.types';

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ payments }) => {
  if (!payments || payments.length === 0) {
    return (
      <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ py: 3, textAlign: 'center' }}>
        Chưa ghi nhận giao dịch thanh toán nào cho đơn hàng này.
      </Typography>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
          <TableRow>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, py: 1.5 }}>
              Mã giao dịch
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, py: 1.5 }}>
              Cổng thanh toán
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, py: 1.5 }}>
              Thời gian
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, py: 1.5 }}>
              Số tiền
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, py: 1.5 }}>
              Trạng thái
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, fontFamily: 'monospace' }}>
                {payment.transactionReference}
              </TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>
                {payment.paymentMethod?.name || payment.paymentMethod?.code || 'VNPay'}
              </TableCell>
              <TableCell sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {payment.paymentTime ? formatDate(payment.paymentTime) : 'N/A'}
              </TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>
                <OrderStatusChip status={payment.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
