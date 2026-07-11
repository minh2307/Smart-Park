import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import { MdPushPin, MdEdit, MdDelete, MdArchive, MdPublish } from 'react-icons/md';
import { Announcement } from '../types';
import { getRecipientLabel } from '../../notification/components/NotificationTable';

interface AnnouncementCardProps {
  item: Announcement;
  onEdit: (item: Announcement) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (item: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  item,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {item.isPinned && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: '50%',
            p: 0.5,
            zIndex: 1,
            boxShadow: 2,
          }}
        >
          <MdPushPin />
        </Box>
      )}

      <CardMedia
        component="img"
        height="160"
        image={item.bannerImage || 'https://picsum.photos/seed/ann/600/300'}
        alt={item.title}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            label={item.status}
            size="small"
            color={
              item.status === 'PUBLISHED' ? 'success' : item.status === 'ARCHIVED' ? 'default' : 'warning'
            }
          />
          <Chip label={getRecipientLabel(item.targetAudience as any)} size="small" variant="outlined" />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, pr: 3 }} noWrap>
          {item.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {item.content}
        </Typography>

        {item.venueName && (
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Khu vực:</strong> {item.venueName}
          </Typography>
        )}

        {item.rideName && (
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Trò chơi:</strong> {item.rideName}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Đăng lúc: {new Date(item.publishTime).toLocaleString('vi-VN')}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title={item.status === 'PUBLISHED' ? 'Lưu trữ (Archive)' : 'Phát hành (Publish)'}>
            <IconButton onClick={() => onTogglePublish(item)} size="small" color="primary">
              {item.status === 'PUBLISHED' ? <MdArchive /> : <MdPublish />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton onClick={() => onEdit(item)} size="small" color="secondary">
              <MdEdit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
              <MdDelete />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};
