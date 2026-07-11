import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, IconButton } from '@mui/material';
import { MdRefresh, MdClearAll, MdSearch } from 'react-icons/md';
import { TicketStatus } from '../types';
import { useGetVenuesQuery } from '../../venue/services/venueApi';

interface TicketFilterPanelProps {
  search: string;
  status: TicketStatus | '';
  venueId: number | '';
  onSearchChange: (val: string) => void;
  onStatusChange: (val: TicketStatus | '') => void;
  onVenueChange: (val: number | '') => void;
  onReset: () => void;
  onRefresh: () => void;
}

export const TicketFilterPanel: React.FC<TicketFilterPanelProps> = ({
  search,
  status,
  venueId,
  onSearchChange,
  onStatusChange,
  onVenueChange,
  onReset,
  onRefresh,
}) => {
  const { data: venuesData } = useGetVenuesQuery({ page: 0, size: 100 });
  const venues = venuesData?.content || [];

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Handled via state, but we can trigger refresh or wait for typing
    }
  };

  const ticketStatuses: TicketStatus[] = [
    'DRAFT',
    'AVAILABLE',
    'RESERVED',
    'SOLD',
    'ACTIVATED',
    'USED',
    'PARTIALLY_USED',
    'EXPIRED',
    'CANCELLED',
    'REFUNDED',
  ];

  const statusLabels: Record<TicketStatus, string> = {
    DRAFT: 'Bản nháp',
    AVAILABLE: 'Có sẵn',
    RESERVED: 'Đã giữ chỗ',
    SOLD: 'Đã bán',
    ACTIVATED: 'Đã kích hoạt',
    USED: 'Đã sử dụng',
    PARTIALLY_USED: 'Sử dụng một phần',
    EXPIRED: 'Đã hết hạn',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" width="100%">
      <TextField
        size="small"
        placeholder="Tìm kiếm mã/khách hàng..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={handleSearchKeyPress}
        InputProps={{
          startAdornment: <MdSearch size={18} style={{ marginRight: 8, color: '#999' }} />,
        }}
        sx={{ width: { xs: '100%', sm: 220 } }}
      />

      <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
        <InputLabel id="ticket-status-filter-label">Trạng thái</InputLabel>
        <Select
          labelId="ticket-status-filter-label"
          id="ticket-status-filter"
          value={status}
          label="Trạng thái"
          onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          {ticketStatuses.map((s) => (
            <MenuItem key={s} value={s}>
              {statusLabels[s] || s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
        <InputLabel id="ticket-venue-filter-label">Địa điểm</InputLabel>
        <Select
          labelId="ticket-venue-filter-label"
          id="ticket-venue-filter"
          value={venueId}
          label="Địa điểm"
          onChange={(e) => onVenueChange(e.target.value as number | '')}
        >
          <MenuItem value="">Tất cả địa điểm</MenuItem>
          {venues.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" gap={1} ml={{ xs: 0, sm: 'auto' }} width={{ xs: '100%', sm: 'auto' }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<MdClearAll />}
          onClick={onReset}
          size="small"
          sx={{ flexGrow: { xs: 1, sm: 0 } }}
        >
          Đặt lại
        </Button>
        <IconButton onClick={onRefresh} title="Làm mới" color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <MdRefresh size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};
