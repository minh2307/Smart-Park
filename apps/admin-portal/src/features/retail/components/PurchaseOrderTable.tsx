import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { MdCheck, MdAssignmentTurnedIn } from 'react-icons/md';
import { PurchaseOrder } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  onApprove: (id: number) => void;
  onReceive: (id: number) => void;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  purchaseOrders,
  onApprove,
  onReceive,
}) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Số Đơn PO</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Nhà Cung Cấp</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chi Tiết Hàng Đặt</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tổng Giá Trị</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Người Tạo</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Người Duyệt</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Duyệt / Nhập Kho</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {purchaseOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                Không có đơn mua hàng (PO) nào.
              </TableCell>
            </TableRow>
          ) : (
            purchaseOrders.map((po) => (
              <TableRow key={po.id} hover>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{po.poNumber}</TableCell>
                <TableCell>{po.supplierName || '—'}</TableCell>
                <TableCell>
                  <Box>
                    {po.items.map((item, idx) => (
                      <Typography variant="caption" display="block" key={idx}>
                        - {item.productName} (SL: {item.quantity})
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{po.totalAmount.toLocaleString()}đ</TableCell>
                <TableCell>{po.createdBy}</TableCell>
                <TableCell>{po.approvedBy || '—'}</TableCell>
                <TableCell>
                  <StatusChip status={po.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    {po.status === 'PENDING' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<MdCheck />}
                        onClick={() => onApprove(po.id)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        Duyệt PO
                      </Button>
                    )}
                    {po.status === 'APPROVED' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<MdAssignmentTurnedIn />}
                        onClick={() => onReceive(po.id)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        Nhập Kho
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default PurchaseOrderTable;
