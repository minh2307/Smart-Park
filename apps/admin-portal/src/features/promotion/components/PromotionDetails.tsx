import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import { Promotion } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface PromotionDetailsProps {
  promotion: Promotion;
}

export const PromotionDetails: React.FC<PromotionDetailsProps> = ({ promotion }) => {
  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={4}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Thong tin chung
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Ten khuyen mai:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2" fontWeight={500}>{promotion.name}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Ma khuyen mai:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>{promotion.code}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Chien dich:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{promotion.campaignName}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Trang thai:</Typography>
            </Grid>
            <Grid item xs={8}>
              <StatusChip status={promotion.status} />
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Do uu tien:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{promotion.priority}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Cong don:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{promotion.stackable ? 'Co' : 'Khong'}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Thoi gian:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{promotion.startDate} den {promotion.endDate}</Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Discount Rules */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Thong tin quy tac giam gia
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Loai khuyen mai:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2" fontWeight={500}>{promotion.promotionType}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Kieu giam gia:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2">{promotion.discountType === 'PERCENTAGE' ? 'Phan tram (%)' : 'So tien co dinh'}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Muc giam gia:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `$${promotion.discountValue}`}
              </Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Giam toi da:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2">{promotion.maxDiscount ? `$${promotion.maxDiscount}` : 'Khong gioi han'}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Gia tri don toi thieu:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2">{promotion.minOrderAmount ? `$${promotion.minOrderAmount}` : 'Khong yeu cau'}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Quota gioi han:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2">{promotion.usageCount} / {promotion.maxUsage || 'Vo han'}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Con lai:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2" fontWeight={500}>{promotion.remainingQuota}</Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Eligibility Rules */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Dieu kien ap dung (Eligibility Rules)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Dia diem ap dung (Venues)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {promotion.applicableVenues.length > 0 ? (
                    promotion.applicableVenues.map((v) => (
                      <Chip key={v} label={v} size="small" variant="outlined" color="primary" />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">Ap dung cho tat ca dia diem</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Loai ve ap dung (Ticket Types)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {promotion.applicableTicketTypes.length > 0 ? (
                    promotion.applicableTicketTypes.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" color="primary" />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">Ap dung cho tat ca cac loai ve</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Hang thanh vien ap dung (Memberships)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {promotion.applicableMemberships.length > 0 ? (
                    promotion.applicableMemberships.map((m) => (
                      <Chip key={m} label={m} size="small" variant="outlined" color="secondary" />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">Ap dung cho moi doi tuong thanh vien</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Nhom khach hang ap dung (Customer Groups)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {promotion.applicableCustomerGroups.length > 0 ? (
                    promotion.applicableCustomerGroups.map((g) => (
                      <Chip key={g} label={g} size="small" variant="outlined" color="secondary" />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">Ap dung cho moi khach hang</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default PromotionDetails;
