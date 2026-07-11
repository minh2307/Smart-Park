import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import { MdHistory, MdPersonAdd, MdEdit, MdPayment, MdBlock } from 'react-icons/md';
import { CustomerActivityLog } from '../types';

interface CustomerTimelineProps {
  activities?: CustomerActivityLog[];
}

export const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No activities logged for this customer.
        </Typography>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return { icon: <MdPersonAdd size={18} />, color: 'success.main', bg: 'success.light' };
      case 'UPDATE':
        return { icon: <MdEdit size={18} />, color: 'info.main', bg: 'info.light' };
      case 'TRANSACTION':
        return { icon: <MdPayment size={18} />, color: 'primary.main', bg: 'primary.light' };
      case 'SUSPEND':
      case 'BLOCK':
        return { icon: <MdBlock size={18} />, color: 'error.main', bg: 'error.light' };
      default:
        return { icon: <MdHistory size={18} />, color: 'text.secondary', bg: 'action.selected' };
    }
  };

  return (
    <Box sx={{ position: 'relative', pl: 3, borderLeft: '2px solid', borderColor: 'divider', ml: 1, my: 1 }}>
      {activities.map((act, index) => {
        const { icon, color, bg } = getActionIcon(act.action);
        return (
          <Box key={act.id} sx={{ mb: index === activities.length - 1 ? 0 : 3, position: 'relative' }}>
            {/* Timeline bullet icon */}
            <Box
              sx={{
                position: 'absolute',
                left: -37,
                top: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {icon}
            </Box>

            {/* Timeline content */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="baseline">
                <Typography variant="subtitle2" fontWeight="bold">
                  {act.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(act.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {act.description}
              </Typography>
              {act.ipAddress && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25, fontFamily: 'monospace' }}>
                  IP: {act.ipAddress}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
