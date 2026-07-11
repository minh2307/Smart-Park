import React from 'react';
import { Box, Typography, Card, Chip } from '@mui/material';
import { RideMaintenance } from '../types';
import { MdBuild, MdCheckCircle, MdCancel, MdSchedule, MdAttachMoney } from 'react-icons/md';

interface MaintenanceTimelineProps {
  logs?: RideMaintenance[];
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No maintenance logs recorded for this ride.
        </Typography>
      </Card>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: <MdCheckCircle size={16} />, color: 'success.main', bg: 'success.light' };
      case 'IN_PROGRESS':
        return { icon: <MdBuild size={16} />, color: 'warning.main', bg: 'warning.light' };
      case 'CANCELLED':
        return { icon: <MdCancel size={16} />, color: 'error.main', bg: 'error.light' };
      default:
        return { icon: <MdSchedule size={16} />, color: 'info.main', bg: 'info.light' };
    }
  };

  return (
    <Box sx={{ position: 'relative', pl: 3, borderLeft: '2px solid', borderColor: 'divider', ml: 1, my: 1 }}>
      {logs.map((log, index) => {
        const config = getStatusConfig(log.status);
        return (
          <Box key={log.id} sx={{ mb: index === logs.length - 1 ? 0 : 3, position: 'relative' }}>
            {/* Timeline bullet icon */}
            <Box
              sx={{
                position: 'absolute',
                left: -37,
                top: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: config.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {config.icon}
            </Box>

            {/* Timeline content */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {log.description}
                  </Typography>
                  <Chip
                    size="small"
                    label={log.status}
                    color={
                      log.status === 'COMPLETED'
                        ? 'success'
                        : log.status === 'IN_PROGRESS'
                        ? 'warning'
                        : log.status === 'CANCELLED'
                        ? 'error'
                        : 'info'
                    }
                    sx={{ fontSize: '0.65rem', height: 16, fontWeight: 'bold' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Scheduled: {new Date(log.scheduledDate).toLocaleDateString()}
                  {log.completionDate && ` | Done: ${new Date(log.completionDate).toLocaleDateString()}`}
                </Typography>
              </Box>

              {log.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {log.notes}
                </Typography>
              )}

              <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                <Typography variant="caption" color="text.disabled" fontWeight={500}>
                  Technician: {log.technicianName}
                </Typography>
                {log.cost !== undefined && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    gap={0.25}
                  >
                    <MdAttachMoney size={14} /> Cost: ${log.cost.toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
