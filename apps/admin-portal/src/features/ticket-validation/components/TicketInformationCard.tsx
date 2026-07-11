import React from 'react';
import { Card, CardContent, Typography, Divider, Box } from '@mui/material';
import { Ticket } from '../../ticket/types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface TicketInformationCardProps {
  ticket: Ticket | null;
}

export const TicketInformationCard: React.FC<TicketInformationCardProps> = ({ ticket }) => {
  if (!ticket) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
        <Typography color="text.secondary" align="center">
          Vui lòng quét hoặc nhập mã vé để hiển thị thông tin chi tiết.
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          Thông Tin Vé
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Mã Vé (Code):</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
              {ticket.ticketCode}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Loại Vé (Type):</Typography>
            <Typography variant="body2" fontWeight="bold">
              {ticket.ticketType?.name || 'Vé thường'}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Ngày sử dụng:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {ticket.validDate}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Trạng Thái:</Typography>
            <StatusChip status={ticket.status} />
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Giá trị:</Typography>
            <Typography variant="body2" fontWeight="bold">
              250.000đ
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default TicketInformationCard;
