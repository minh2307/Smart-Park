import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { MdTrendingUp, MdTrendingDown, MdEventBusy } from 'react-icons/md';
import { PointTransaction } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface PointTransactionTableProps {
  data: PointTransaction[];
  loading: boolean;
}

export const PointTransactionTable: React.FC<PointTransactionTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Khách hàng / Thẻ</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Điểm thay đổi</TableCell>
              <TableCell>Kênh nguồn</TableCell>
              <TableCell>Mã tham chiếu</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày giao dịch</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton width={120} /><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={110} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Không tìm thấy giao dịch điểm tích lũy nào.
        </Typography>
      </Paper>
    );
  }

  const getTypeIcon = (type: string, points: number) => {
    switch (type) {
      case 'EARNED':
        return <MdTrendingUp color="#2e7d32" size={18} />;
      case 'REDEEMED':
        return <MdTrendingDown color="#d32f2f" size={18} />;
      case 'EXPIRED':
        return <MdEventBusy color="#757575" size={18} />;
      case 'ADJUSTED':
      default:
        return points > 0 ? <MdTrendingUp color="#0288d1" size={18} /> : <MdTrendingDown color="#0288d1" size={18} />;
    }
  };

  const translateType = (type: string) => {
    switch (type) {
      case 'EARNED': return 'Tích lũy';
      case 'REDEEMED': return 'Quy đổi';
      case 'EXPIRED': return 'Hết hạn';
      case 'ADJUSTED': return 'Điều chỉnh';
      default: return type;
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell>Khách hàng / Thẻ</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Điểm thay đổi</TableCell>
            <TableCell>Kênh nguồn</TableCell>
            <TableCell>Mã tham chiếu</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Ngày giao dịch</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((tx) => (
            <TableRow key={tx.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {tx.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {tx.membershipCode}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {getTypeIcon(tx.type, tx.points)}
                  <Typography variant="body2" fontWeight="bold">
                    {translateType(tx.type)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={
                    tx.type === 'EARNED' || (tx.type === 'ADJUSTED' && tx.points > 0)
                      ? 'success.main'
                      : tx.type === 'REDEEMED' || (tx.type === 'ADJUSTED' && tx.points < 0)
                      ? 'error.main'
                      : 'text.secondary'
                  }
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{tx.source}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {tx.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {tx.bookingCode || tx.paymentId || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <StatusChip status={tx.status} />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
