import React from 'react';
import { Box, Typography } from '@mui/material';
import { MdCheckCircle, MdRadioButtonUnchecked, MdErrorOutline } from 'react-icons/md';

interface TimelineStep {
  title: string;
  description?: string;
  timestamp?: string;
  status: 'done' | 'active' | 'pending' | 'failed';
}

interface BookingTimelineProps {
  steps: TimelineStep[];
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({ steps }) => {
  return (
    <Box display="flex" flexDirection="column" sx={{ pl: 2, py: 1 }}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        
        let icon = <MdRadioButtonUnchecked size={20} color="#bdbdbd" />;
        let color = 'text.secondary';
        
        if (step.status === 'done') {
          icon = <MdCheckCircle size={20} color="#2e7d32" />;
          color = 'success.main';
        } else if (step.status === 'active') {
          icon = <MdCheckCircle size={20} color="#0288d1" />;
          color = 'info.main';
        } else if (step.status === 'failed') {
          icon = <MdErrorOutline size={20} color="#d32f2f" />;
          color = 'error.main';
        }

        return (
          <Box key={idx} display="flex" position="relative" sx={{ pb: isLast ? 0 : 2.5 }}>
            {/* Vertical Connector Line */}
            {!isLast && (
              <Box
                position="absolute"
                left={9}
                top={22}
                bottom={0}
                width={2}
                bgcolor={step.status === 'done' ? 'success.main' : 'divider'}
                sx={{ opacity: step.status === 'done' ? 0.8 : 0.5 }}
              />
            )}

            {/* Left Icon */}
            <Box display="flex" alignItems="center" justifyContent="center" width={20} height={20} mr={2} sx={{ mt: 0.25, zIndex: 1 }}>
              {icon}
            </Box>

            {/* Content right side */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color={color}>
                {step.title}
              </Typography>
              {step.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {step.description}
                </Typography>
              )}
              {step.timestamp && (
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                  {step.timestamp}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
