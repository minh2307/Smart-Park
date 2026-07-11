import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { OrderStatusChip } from './OrderStatusChip';
import { formatCurrency, formatDate } from '@shared/utils';
import type { Order } from '../types/order.types';

interface OrderTableProps {
  orders: Order[];
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Mã đơn hàng
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Ngày mua
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Số lượng
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Tổng tiền
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Trạng thái
            </TableCell>
            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 800, fontFamily: 'Outfit, sans-serif', textAlign: 'right' }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const totalQty = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
            return (
              <TableRow
                key={order.id}
                sx={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  },
                }}
              >
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                  {order.orderCode}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                  {totalQty} vé
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                  {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <OrderStatusChip status={order.status} />
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    sx={{
                      fontWeight: 700,
                      color: '#2dd4bf',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(45, 212, 191, 0.08)',
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
