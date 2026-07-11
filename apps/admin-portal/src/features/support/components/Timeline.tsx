import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { SupportMessage } from '../types';

interface TimelineProps {
  messages: SupportMessage[];
}

export const Timeline: React.FC<TimelineProps> = ({ messages }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, height: '100%', overflowY: 'auto' }}>
      {messages.map((msg) => {
        const isCustomer = msg.senderRole === 'CUSTOMER';
        const isSystem = msg.senderRole === 'SYSTEM';

        if (isSystem) {
          return (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <Box sx={{ bgcolor: 'action.hover', px: 2, py: 0.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" align="center">
                  [Hệ Thống] {msg.messageText} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                </Typography>
              </Box>
            </Box>
          );
        }

        return (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: isCustomer ? 'row' : 'row-reverse',
              alignItems: 'flex-start',
              gap: 1.5,
              alignSelf: isCustomer ? 'flex-start' : 'flex-end',
              maxWidth: '75%',
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '12px',
                bgcolor: isCustomer ? 'primary.main' : 'success.main',
              }}
            >
              {msg.senderName.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Box
                sx={{
                  bgcolor: isCustomer ? 'primary.lighter' : 'success.lighter',
                  color: 'text.primary',
                  borderRadius: isCustomer ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                  p: 2,
                  boxShadow: 1,
                  border: '1px solid',
                  borderColor: isCustomer ? 'primary.light' : 'success.light',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {msg.senderName} ({msg.senderRole === 'STAFF' ? 'Nhân viên hỗ trợ' : 'Khách hàng'})
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {msg.messageText}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: isCustomer ? 'left' : 'right' }}>
                {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
export default Timeline;
