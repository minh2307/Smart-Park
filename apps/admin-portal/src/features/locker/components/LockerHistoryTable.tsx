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
import { LockerRental } from '../types';
import dayjs from 'dayjs';

interface LockerHistoryTableProps {
  rentals: LockerRental[];
}

export const LockerHistoryTable: React.FC<LockerHistoryTableProps> = ({ rentals }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Hợp Đồng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Tủ</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Khách Hàng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Bắt Đầu</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Kết Thúc</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Đặt Cọc</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thanh Toán</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rentals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                Chưa có dữ liệu thuê tủ đồ nào.
              </TableCell>
            </TableRow>
          ) : (
            rentals.map((rental) => (
              <TableRow key={rental.id} hover>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{rental.bookingCode}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{rental.lockerCode}</TableCell>
                <TableCell>{rental.customerName}</TableCell>
                <TableCell>{dayjs(rental.startTime).format('DD/MM/YYYY HH:mm')}</TableCell>
                <TableCell>
                  {rental.endTime ? dayjs(rental.endTime).format('DD/MM/YYYY HH:mm') : '—'}
                </TableCell>
                <TableCell>{rental.depositAmount.toLocaleString()}đ</TableCell>
                <TableCell>
                  {rental.amountPaid ? `${rental.amountPaid.toLocaleString()}đ` : 'Chưa tính'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={rental.status === 'ACTIVE' ? 'Đang thuê' : 'Đã trả'}
                    color={rental.status === 'ACTIVE' ? 'primary' : 'success'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default LockerHistoryTable;
