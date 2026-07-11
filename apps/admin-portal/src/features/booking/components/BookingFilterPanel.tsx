import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, IconButton } from '@mui/material';
import { MdRefresh, MdClearAll, MdSearch } from 'react-icons/md';
import { useGetVenuesQuery } from '../../venue/services/venueApi';

interface BookingFilterPanelProps {
  search: string;
  status: string;
  venueId: number | '';
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onVenueChange: (val: number | '') => void;
  onReset: () => void;
  onRefresh: () => void;
}

export const BookingFilterPanel: React.FC<BookingFilterPanelProps> = ({
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

  const bookingStatuses = [
    { value: '0', label: 'Pending' },
    { value: '1', label: 'Paid' },
    { value: '2', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'REFUNDED', label: 'Refunded' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" width="100%">
      <TextField
        size="small"
        placeholder="Search Order ID/Customer..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <MdSearch size={18} style={{ marginRight: 8, color: '#999' }} />,
        }}
        sx={{ width: { xs: '100%', sm: 240 } }}
      />

      <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
        <InputLabel id="booking-status-filter-label">Order Status</InputLabel>
        <Select
          labelId="booking-status-filter-label"
          id="booking-status-filter"
          value={status}
          label="Order Status"
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {bookingStatuses.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
        <InputLabel id="booking-venue-filter-label">Venue</InputLabel>
        <Select
          labelId="booking-venue-filter-label"
          id="booking-venue-filter"
          value={venueId}
          label="Venue"
          onChange={(e) => onVenueChange(e.target.value as number | '')}
        >
          <MenuItem value="">All Venues</MenuItem>
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
          Reset
        </Button>
        <IconButton onClick={onRefresh} title="Refresh Data" color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <MdRefresh size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};
