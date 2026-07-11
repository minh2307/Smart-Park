import React, { useState, useMemo } from 'react';
import { Stack, Box, TextField, InputAdornment, Button, Tabs, Tab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { AnimatePresence } from 'framer-motion';
import { NotificationCard } from './NotificationCard';
import { EmptyState } from './EmptyState';
import type { Notification } from '../types/engagement.types';

interface NotificationListProps {
  notifications: Notification[];
  localReadIds: number[];
  localDeletedIds: number[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: (ids: number[]) => void;
  onDelete: (id: number) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  localReadIds,
  localDeletedIds,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Filter out locally deleted ones, then apply state and search filters
  const processedNotifications = useMemo(() => {
    return notifications
      .filter((n) => !localDeletedIds.includes(n.id))
      .map((n) => ({
        ...n,
        isReadLocal: n.status === 'READ' || localReadIds.includes(n.id),
      }));
  }, [notifications, localReadIds, localDeletedIds]);

  const filteredNotifications = useMemo(() => {
    let result = [...processedNotifications];

    // Filter by Read/Unread
    if (activeTab === 'READ') {
      result = result.filter((n) => n.isReadLocal);
    } else if (activeTab === 'UNREAD') {
      result = result.filter((n) => !n.isReadLocal);
    }

    // Filter by type
    if (typeFilter !== 'ALL') {
      result = result.filter((n) => n.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    return result;
  }, [processedNotifications, activeTab, typeFilter, searchQuery]);

  const unreadIds = useMemo(() => {
    return processedNotifications.filter((n) => !n.isReadLocal).map((n) => n.id);
  }, [processedNotifications]);

  return (
    <Box>
      {/* Search & Actions Bar */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <TextField
          size="small"
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            maxWidth: { md: 400 },
            '& .MuiOutlinedInput-root': {
              color: '#ffffff',
              bgcolor: 'rgba(30, 41, 59, 0.4)',
              borderRadius: 2.5,
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
            },
          }}
        />

        <Stack direction="row" spacing={1.5} sx={{ alignSelf: 'flex-end' }}>
          {unreadIds.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => onMarkAllRead(unreadIds)}
              sx={{
                color: '#2dd4bf',
                borderColor: 'rgba(45, 212, 191, 0.3)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#2dd4bf',
                  bgcolor: 'rgba(45, 212, 191, 0.08)',
                },
              }}
            >
              Đọc tất cả ({unreadIds.length})
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Tabs Filtering Bar */}
      <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            '& .MuiTabs-indicator': { bgcolor: '#2dd4bf' },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 'auto',
              px: 3,
              '&.Mui-selected': { color: '#2dd4bf' },
            },
          }}
        >
          <Tab value="ALL" label="Tất cả" />
          <Tab value="UNREAD" label={`Chưa đọc (${unreadIds.length})`} />
          <Tab value="READ" label="Đã đọc" />
        </Tabs>
      </Box>

      {/* Main List Rendering */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={NotificationsOffIcon}
          title="Không có thông báo nào"
          description={
            searchQuery
              ? 'Không tìm thấy thông báo nào trùng khớp với từ khóa tìm kiếm của bạn.'
              : 'Hộp thư của bạn hiện đang trống.'
          }
        />
      ) : (
        <Stack spacing={2.5}>
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                isRead={notif.isReadLocal}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </Stack>
      )}
    </Box>
  );
};
