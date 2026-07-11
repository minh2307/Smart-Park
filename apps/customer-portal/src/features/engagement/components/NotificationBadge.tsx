import React, { useMemo } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useGetNotificationsQuery } from '../services/engagementApi';
import { useAppSelector } from '../../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const NotificationBadge: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const customerId = user?.id || 0;

  // Retrieve notifications
  const { data: notificationsData } = useGetNotificationsQuery(
    { page: 0, size: 50 },
    { skip: !customerId }
  );

  // Retrieve local read/deleted states from store
  const { localReadIds, localDeletedIds } = useAppSelector((state) => state.engagement);

  // Compute unread count in real-time
  const unreadCount = useMemo(() => {
    if (!notificationsData?.content) return 0;
    
    return notificationsData.content.filter((n) => {
      const isDeleted = localDeletedIds.includes(n.id);
      if (isDeleted) return false;

      const isRead = n.status === 'READ' || localReadIds.includes(n.id);
      return !isRead;
    }).length;
  }, [notificationsData, localReadIds, localDeletedIds]);

  const handleBadgeClick = () => {
    navigate(`${ROUTES.ENGAGEMENT}?tab=notifications`);
  };

  return (
    <Tooltip title="Thông báo" arrow>
      <IconButton
        color="inherit"
        onClick={handleBadgeClick}
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            color: '#2dd4bf',
            bgcolor: 'rgba(45, 212, 191, 0.1)',
          },
          transition: 'all 0.2s',
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#ef4444',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.7rem',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
