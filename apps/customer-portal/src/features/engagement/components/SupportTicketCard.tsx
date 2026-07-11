import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import BugReportIcon from '@mui/icons-material/BugReport';
import type { Incident } from '../types/engagement.types';
import { formatDate } from '@shared/utils';

interface SupportTicketCardProps {
  incident: Incident;
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Thấp', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)' },
  MEDIUM: { label: 'Trung bình', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  HIGH: { label: 'Cao', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
  CRITICAL: { label: 'Nghiêm trọng', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Đang mở', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.1)' },
  INVESTIGATING: { label: 'Đang điều tra', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  RESOLVED: { label: 'Đã giải quyết', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  CLOSED: { label: 'Đã đóng', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
};

export const SupportTicketCard: React.FC<SupportTicketCardProps> = ({ incident }) => {
  const severity = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.LOW;
  const status = STATUS_CONFIG[incident.status || 'OPEN'] || STATUS_CONFIG.OPEN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          position: 'relative',
          p: 3,
          bgcolor: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: severity.color,
            opacity: 0.8,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: severity.bg,
                border: `1px solid ${severity.color}30`,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: severity.color,
                flexShrink: 0,
              }}
            >
              <BugReportIcon fontSize="small" />
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 0.5 }}
              >
                #{incident.id} - KHU VỰC: {incident.zone?.name || `Zone ${incident.zone?.id}`}
              </Typography>
              <Chip
                label={severity.label}
                size="small"
                sx={{
                  ml: 1.5,
                  bgcolor: severity.bg,
                  color: severity.color,
                  border: `1px solid ${severity.color}30`,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
          </Stack>

          <Chip
            label={status.label}
            size="small"
            sx={{
              bgcolor: status.bg,
              color: status.color,
              border: `1px solid ${status.color}30`,
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          />
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          {incident.description}
        </Typography>

        {incident.resolutionDetails && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
              borderRadius: 2.5,
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#22c55e', fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              PHẢN HỒI TỪ BAN QUẢN LÝ
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5 }}>
              {incident.resolutionDetails}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 600 }}>
          Báo cáo vào: {incident.createdAt ? formatDate(incident.createdAt) : 'Vừa xong'}
        </Typography>
      </Box>
    </motion.div>
  );
};
