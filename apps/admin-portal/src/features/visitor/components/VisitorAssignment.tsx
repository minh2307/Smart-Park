import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Typography,
  Alert,
  FormHelperText,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { useGetVisitorsByCustomerIdQuery } from '../services/visitorApi';
import { mockBookings } from '../../booking/services/bookingApi';
import { Booking } from '../../booking/types';

interface VisitorAssignmentProps {
  onAssign: (bookingId: number, visitorIds: number[]) => void;
  loading?: boolean;
}

export const VisitorAssignment: React.FC<VisitorAssignmentProps> = ({
  onAssign,
  loading = false,
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState<number | ''>('');
  const [selectedVisitorIds, setSelectedVisitorIds] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find the selected booking details
  const currentBooking = mockBookings.find((b: Booking) => b.id === selectedBookingId);
  const customerId = currentBooking?.customerId;

  // Retrieve visitors belonging to the booking's customer owner
  const { data: visitors = [], isLoading: isLoadingVisitors } = useGetVisitorsByCustomerIdQuery(
    customerId || 0,
    { skip: !customerId }
  );

  const handleBookingChange = (id: number) => {
    setSelectedBookingId(id);
    setSelectedVisitorIds([]);
    setErrorMsg(null);
  };

  const handleVisitorToggle = (visitorId: number) => {
    setSelectedVisitorIds((prev) =>
      prev.includes(visitorId)
        ? prev.filter((id) => id !== visitorId)
        : [...prev, visitorId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setErrorMsg('Please select a booking target first.');
      return;
    }
    if (selectedVisitorIds.length === 0) {
      setErrorMsg('Please select at least one visitor to assign.');
      return;
    }
    onAssign(Number(selectedBookingId), selectedVisitorIds);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
      <FormControl fullWidth>
        <InputLabel id="assign-booking-label">Booking Target *</InputLabel>
        <Select
          labelId="assign-booking-label"
          value={selectedBookingId}
          label="Booking Target *"
          onChange={(e) => handleBookingChange(Number(e.target.value))}
        >
          {mockBookings.map((b: Booking) => (
            <MenuItem key={b.id} value={b.id}>
              BK-{String(b.id).padStart(4, '0')} - {b.customer?.fullName} ({b.items?.length || 1} tickets)
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentBooking && (
        <Box p={2} bgcolor="action.hover" sx={{ borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">Customer Owner</Typography>
          <Typography variant="body2" fontWeight="bold" mb={1.5}>
            {currentBooking.customer?.fullName} ({currentBooking.customer?.email})
          </Typography>
          <Typography variant="caption" color="text.secondary">Booking Status</Typography>
          <Typography variant="body2" fontWeight="bold">
            {currentBooking.status === 1 ? 'PAID' : currentBooking.status === 2 ? 'CANCELLED' : 'PENDING'}
          </Typography>
        </Box>
      )}

      {selectedBookingId && (
        <FormControl fullWidth>
          <InputLabel id="assign-visitors-label">Select Visitors *</InputLabel>
          <Select
            labelId="assign-visitors-label"
            multiple
            value={selectedVisitorIds}
            input={<OutlinedInput label="Select Visitors *" />}
            renderValue={(selected) =>
              (selected as number[])
                .map((id) => visitors.find((v) => v.id === id)?.fullName || '')
                .filter(Boolean)
                .join(', ')
            }
            disabled={isLoadingVisitors}
          >
            {visitors.map((v) => (
              <MenuItem key={v.id} value={v.id} onClick={() => handleVisitorToggle(v.id)}>
                <Checkbox checked={selectedVisitorIds.includes(v.id)} />
                <ListItemText primary={`${v.fullName} (${v.relationship})`} />
              </MenuItem>
            ))}
            {visitors.length === 0 && !isLoadingVisitors && (
              <MenuItem disabled>
                <ListItemText primary="No visitors registered under this customer account." />
              </MenuItem>
            )}
          </Select>
          {visitors.length === 0 && selectedBookingId && (
            <FormHelperText error>
              Please register visitors under this customer profile first.
            </FormHelperText>
          )}
        </FormControl>
      )}

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
        <Button type="submit" variant="contained" loading={loading} disabled={!selectedBookingId}>
          Assign Visitors
        </Button>
      </Box>
    </Box>
  );
};
