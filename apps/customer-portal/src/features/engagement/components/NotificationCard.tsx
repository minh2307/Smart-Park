import React from 'react';
import { Box, Typography, IconButton, Tooltip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MailIcon from '@mui/icons-material/Mail';
import SmsIcon from '@mui/icons-material/Sms';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import type { Notification } from '../types/engagement.types';
import { formatDate } from '@shared/utils';

interface NotificationCardProps {
  notification: Notification;
  isRead: boolean;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  EMAIL: <MailIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />,
  SMS: <SmsIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />,
  PUSH: <PhoneAndroidIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />,
  IN_APP: <NotificationsActiveIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />,
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isRead,
  onMarkRead,
  onDelete,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.18 } }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box
        sx={{
          position: 'relative',
          p: { xs: 2, md: 2.5 },
          bgcolor: isRead ? 'rgba(15,23,42,0.4)' : 'rgba(30,41,59,0.55)',
          border: '1px solid',
          borderColor: isRead ? 'rgba(255,255,255,0.05)' : 'rgba(45,212,191,0.18)',
          borderRadius: 3.5,
          display: 'flex',
          gap: 2,
          transition: 'border-color 0.25s, box-shadow 0.25s',
          boxShadow: isRead ? 'none' : '0 2px 16px rgba(45,212,191,0.04)',
          '&:hover': {
            borderColor: isRead ? 'rgba(255,255,255,0.1)' : 'rgba(45,212,191,0.3)',
          },
        }}
      >
        {/* Unread indicator: small left border accent instead of glow dot (anti-neon rule) */}
        {!isRead && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
              width: 3,
              borderRadius: '0 2px 2px 0',
              bgcolor: '#2dd4bf',
            }}
          />
        )}

        {/* Icon inner bezel */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            bgcolor: isRead ? 'rgba(255,255,255,0.04)' : 'rgba(45,212,191,0.08)',
            border: '1px solid',
            borderColor: isRead ? 'rgba(255,255,255,0.07)' : 'rgba(45,212,191,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: isRead ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {TYPE_ICON[notification.type] ?? TYPE_ICON.IN_APP}
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: isRead ? 600 : 800,
              color: isRead ? 'rgba(255,255,255,0.6)' : '#ffffff',
              letterSpacing: '-0.01em',
              mb: 0.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {notification.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isRead ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.6)',
              lineHeight: 1.55,
              mb: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {notification.content}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.28)', fontWeight: 600, fontFamily: 'monospace' }}
          >
            {formatDate(notification.createdAt)}
          </Typography>
        </Box>

        {/* Actions */}
        <Stack spacing={0.5} justifyContent="center" flexShrink={0}>
          {!isRead && (
            <Tooltip title="Danh dau da doc" arrow placement="left">
              <IconButton
                size="small"
                onClick={() => onMarkRead(notification.id)}
                sx={{
                  color: 'rgba(255,255,255,0.3)',
                  width: 32,
                  height: 32,
                  '&:hover': { color: '#2dd4bf', bgcolor: 'rgba(45,212,191,0.08)' },
                  '&:active': { transform: 'scale(0.94)' },
                  transition: 'all 0.18s',
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xoa thong bao" arrow placement="left">
            <IconButton
              size="small"
              onClick={() => onDelete(notification.id)}
              sx={{
                color: 'rgba(255,255,255,0.3)',
                width: 32,
                height: 32,
                '&:hover': { color: '#f87171', bgcolor: 'rgba(248,113,113,0.08)' },
                '&:active': { transform: 'scale(0.94)' },
                transition: 'all 0.18s',
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </motion.div>
  );
};
