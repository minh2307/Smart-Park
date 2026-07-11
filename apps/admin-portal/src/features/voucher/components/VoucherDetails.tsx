import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import { Voucher } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface VoucherDetailsProps {
  voucher: Voucher;
}

export const VoucherDetails: React.FC<VoucherDetailsProps> = ({ voucher }) => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Thong tin chi tiet Voucher
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Ma Voucher:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
            {voucher.code}
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Loai Voucher:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{voucher.voucherType}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Gia tri voucher:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            ${voucher.voucherValue.toLocaleString()}
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Khach hang duoc gan:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{voucher.assignedCustomer || 'Chua gan khach hang'}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Ngay phat hanh:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{voucher.issueDate}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Han su dung:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{voucher.expirationDate}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Ngay su dung:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">
            {voucher.redeemedDate ? new Date(voucher.redeemedDate).toLocaleString() : 'Chua su dung'}
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">Trang thai:</Typography>
        </Grid>
        <Grid item xs={7}>
          <StatusChip status={voucher.status} />
        </Grid>
      </Grid>
    </Box>
  );
};
export default VoucherDetails;
