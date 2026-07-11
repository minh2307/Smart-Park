import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import type { Incident } from '../types/engagement.types';

interface TicketTimelineProps {
  incident: Incident;
}

type StepKey = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

const STEPS: { key: StepKey; label: string; description: string }[] = [
  { key: 'OPEN', label: 'Tiếp nhận', description: 'Yêu cầu hỗ trợ đã được hệ thống ghi nhận.' },
  { key: 'INVESTIGATING', label: 'Đang xử lý', description: 'Nhân viên đang điều tra và phân tích.' },
  { key: 'RESOLVED', label: 'Đã giải quyết', description: 'Vấn đề đã được xử lý thành công.' },
  { key: 'CLOSED', label: 'Hoàn tất', description: 'Ticket đã được đóng.' },
];

const STATUS_ORDER: StepKey[] = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ incident }) => {
  const currentStatus = (incident.status || 'OPEN') as StepKey;
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <Box sx={{ position: 'relative', py: 1 }}>
      {/* Vertical connector line */}
      <Box
        sx={{
          position: 'absolute',
          left: 19,
          top: 28,
          bottom: 28,
          width: 2,
          bgcolor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 1,
        }}
      />

      <Stack spacing={3}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;

          return (
            <Stack key={step.key} direction="row" spacing={2.5} alignItems="flex-start">
              {/* Timeline dot */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isCompleted ? '#2dd4bf' : 'rgba(255, 255, 255, 0.1)',
                  bgcolor: isCompleted ? 'rgba(45, 212, 191, 0.12)' : 'rgba(30, 41, 59, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: isActive ? '0 0 12px rgba(45, 212, 191, 0.4)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {isCompleted ? (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2dd4bf' }} />
                ) : (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)' }} />
                )}
              </Box>

              <Box sx={{ pt: 0.7 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: isActive ? 800 : 600,
                    color: isCompleted ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                    mb: 0.3,
                  }}
                >
                  {step.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: isCompleted ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)' }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};
