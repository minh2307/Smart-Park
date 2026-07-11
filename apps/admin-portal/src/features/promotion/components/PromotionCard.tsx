import React from 'react';
import { Card, CardContent, Typography, Box, Divider, IconButton } from '@mui/material';
import { Promotion } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PiTicket, PiCalendarBlank, PiCopy } from 'react-icons/pi';
import { toast } from 'react-toastify';

interface PromotionCardProps {
  promotion: Promotion;
  onViewDetails?: (p: Promotion) => void;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onViewDetails }) => {
  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promotion.code);
    toast.success('Da sao chep ma khuyen mai!');
  };

  return (
    <Card
      sx={{
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.06)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' },
        cursor: onViewDetails ? 'pointer' : 'default',
      }}
      onClick={() => onViewDetails && onViewDetails(promotion)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: '12px',
              bgcolor: 'primary.light',
              color: 'primary.main',
              mr: 2,
            }}
          >
            <PiTicket size={24} />
          </Box>
          <StatusChip status={promotion.status} />
        </Box>

        <Typography variant="h6" fontWeight="bold" noWrap gutterBottom>
          {promotion.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              bgcolor: 'action.hover',
              px: 1,
              py: 0.5,
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {promotion.code}
          </Typography>
          <IconButton size="small" onClick={handleCopyCode}>
            <PiCopy size={16} />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px', mb: 2 }}>
          {promotion.description || 'Khong co mo ta chi tiet cho khuyen mai nay.'}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary">
            Giam gia:
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {promotion.discountType === 'PERCENTAGE'
              ? `${promotion.discountValue}%`
              : `$${promotion.discountValue}`}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="caption" color="text.secondary">
            Da su dung:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {promotion.usageCount} / {promotion.maxUsage || 'Vo han'}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} color="text.secondary">
          <PiCalendarBlank size={16} />
          <Typography variant="caption">
            {promotion.startDate} ~ {promotion.endDate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PromotionCard;
