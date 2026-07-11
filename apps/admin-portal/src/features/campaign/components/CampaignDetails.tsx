import React from 'react';
import { Box, Typography, Grid, Divider, LinearProgress, Paper } from '@mui/material';
import { Campaign } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface CampaignDetailsProps {
  campaign: Campaign;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  const budgetSpentPercent = campaign.status === 'COMPLETED' ? 100 : campaign.status === 'ACTIVE' ? 65 : 0;
  const budgetSpentAmount = (campaign.budget * budgetSpentPercent) / 100;

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Chi tiet chien dich & hieu suat
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        {/* Left Column: Basic Details */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Ma chien dich:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                {campaign.code}
              </Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Ten chien dich:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2" fontWeight={500}>{campaign.name}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Mo ta:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2">{campaign.description || 'Khong co mo ta.'}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Thoi gian chay:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body2">{campaign.startDate} ~ {campaign.endDate}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="body2" color="text.secondary">Trang thai:</Typography>
            </Grid>
            <Grid item xs={7}>
              <StatusChip status={campaign.status} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column: Performance and Budgets */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Hieu suat ngan sach
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="text.secondary">Ngan sach da su dung</Typography>
              <Typography variant="caption" fontWeight="bold">
                ${budgetSpentAmount.toLocaleString()} / ${campaign.budget.toLocaleString()} ({budgetSpentPercent}%)
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={budgetSpentPercent} color="primary" sx={{ height: 8, borderRadius: 4 }} />
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: '12px' }}>
                <Typography variant="caption" color="text.secondary">Muc tieu chuyen doi</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                  {campaign.targetConversion}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: '12px' }}>
                <Typography variant="caption" color="text.secondary">Tong doanh thu mang lai</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                  ${campaign.totalRevenue.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default CampaignDetails;
