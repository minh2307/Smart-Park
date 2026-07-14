import React from 'react';
import { Card, CardContent, Typography, Divider, Box, Chip } from '@mui/material';
import { Ride } from '../../ride/types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { MdTimer, MdHeight } from 'react-icons/md';

interface RideInformationCardProps {
  ride: Ride | null;
}

export const RideInformationCard: React.FC<RideInformationCardProps> = ({ ride }) => {
  if (!ride) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
        <Typography color="text.secondary" align="center">
          Cổng này không chỉ định cho trò chơi nào.
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          Thông Tin Trò Chơi
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Tên trò chơi:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {ride.name}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Phân khu (Zone):</Typography>
            <Typography variant="body2" fontWeight="bold">
              {ride.zoneName}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Thời gian chờ xếp hàng:</Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <MdTimer color="orange" />
              <Typography variant="body2" fontWeight="bold">
                {ride.queueTimeMinutes || 0} Phút
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Chiều cao quy định:</Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <MdHeight />
              <Typography variant="body2" fontWeight="bold">
                {(ride.restrictions?.minHeight ?? (ride as any).minHeight) ? `>= ${ride.restrictions?.minHeight ?? (ride as any).minHeight} cm` : 'Tự do'}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Trạng Thái hoạt động:</Typography>
            <StatusChip status={ride.status} />
          </Box>

          {(ride.restrictions?.healthWarning ?? (ride as any).healthWarning) && (
            <Chip
              label="Cảnh báo sức khỏe"
              color="error"
              size="small"
              variant="outlined"
              sx={{ mt: 1, fontWeight: 'bold' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
export default RideInformationCard;
