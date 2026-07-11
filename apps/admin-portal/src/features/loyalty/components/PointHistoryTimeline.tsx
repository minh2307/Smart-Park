import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { MdTrendingUp, MdTrendingDown, MdStars } from 'react-icons/md';
import { PointTransaction } from '../types';

interface PointHistoryTimelineProps {
  transactions: PointTransaction[];
}

export const PointHistoryTimeline: React.FC<PointHistoryTimelineProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No historical transactions for this customer.
      </Typography>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 4, '&::before': { content: '""', position: 'absolute', left: 16, top: 8, bottom: 8, width: '2px', bgcolor: 'divider' } }}>
      {transactions.map((tx) => {
        const isAddition = tx.type === 'EARNED' || (tx.type === 'ADJUSTED' && tx.points > 0);
        return (
          <Box key={tx.id} sx={{ position: 'relative', mb: 3, '&:last-child': { mb: 0 } }}>
            {/* Timeline icon / node */}
            <Box
              sx={{
                position: 'absolute',
                left: -32,
                top: 2,
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: isAddition ? 'success.light' : 'error.light',
                color: isAddition ? 'success.contrastText' : 'error.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                zIndex: 1,
              }}
            >
              {isAddition ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
            </Box>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {tx.description}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MdStars color="#eab308" size={16} />
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={isAddition ? 'success.main' : 'error.main'}
                    >
                      {tx.points > 0 ? `+${tx.points}` : tx.points}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Source: {tx.source} {tx.bookingCode && `| Booking Ref: ${tx.bookingCode}`}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Timestamp: {new Date(tx.createdAt).toLocaleString()}
                </Typography>
                {tx.operatorName && (
                  <Typography variant="caption" color="info.main" display="block" sx={{ mt: 0.5 }}>
                    Handled by Operator: {tx.operatorName}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};
