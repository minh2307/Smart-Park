import React from 'react';
import { Card, CardContent, Typography, Divider, Box, Avatar } from '@mui/material';
import { MdPerson } from 'react-icons/md';
import { StatusChip } from '../../../shared/components/StatusChip';

interface VisitorInformationCardProps {
  visitor: {
    fullName: string;
    phone: string;
    membershipTier?: string;
    points?: number;
    status: string;
  } | null;
}

export const VisitorInformationCard: React.FC<VisitorInformationCardProps> = ({ visitor }) => {
  if (!visitor) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
        <Typography color="text.secondary" align="center">
          Không có thông tin khách hàng.
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <MdPerson />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {visitor.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SĐT: {visitor.phone}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Thành Viên (Tier):</Typography>
            <Typography variant="body2" fontWeight="bold" color="secondary">
              {visitor.membershipTier || 'Khách vãng lai'}
            </Typography>
          </Box>

          {visitor.points !== undefined && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Điểm Tích Lũy:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {visitor.points} Điểm
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Trạng Thái:</Typography>
            <StatusChip status={visitor.status} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default VisitorInformationCard;
