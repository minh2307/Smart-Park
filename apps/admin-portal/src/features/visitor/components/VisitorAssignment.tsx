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

  const getRelationshipLabel = (r: string) => {
    switch (r) {
      case 'SELF': return 'Bản thân';
      case 'SPOUSE': return 'Vợ/Chồng';
      case 'CHILD': return 'Con cái';
      case 'PARENT': return 'Cha mẹ';
      case 'FRIEND': return 'Bạn bè';
      case 'OTHER': return 'Khác';
      default: return r;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setErrorMsg('Vui lòng chọn lịch đặt vé trước.');
      return;
    }
    if (selectedVisitorIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một khách tham quan để gán.');
      return;
    }
    onAssign(Number(selectedBookingId), selectedVisitorIds);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
      <FormControl fullWidth>
        <InputLabel id="assign-booking-label">Lịch đặt vé mục tiêu *</InputLabel>
        <Select
          labelId="assign-booking-label"
          value={selectedBookingId}
          label="Lịch đặt vé mục tiêu *"
          onChange={(e) => handleBookingChange(Number(e.target.value))}
        >
          {mockBookings.map((b: Booking) => (
            <MenuItem key={b.id} value={b.id}>
              BK-{String(b.id).padStart(4, '0')} - {b.customer?.fullName} ({b.items?.length || 1} vé)
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentBooking && (
        <Box p={2} bgcolor="action.hover" sx={{ borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">Khách hàng sở hữu</Typography>
          <Typography variant="body2" fontWeight="bold" mb={1.5}>
            {currentBooking.customer?.fullName} ({currentBooking.customer?.email})
          </Typography>
          <Typography variant="caption" color="text.secondary">Trạng thái đặt vé</Typography>
          <Typography variant="body2" fontWeight="bold">
            {currentBooking.status === 1 ? 'ĐÃ THANH TOÁN' : currentBooking.status === 2 ? 'ĐÃ HỦY' : 'CHỜ THANH TOÁN'}
          </Typography>
        </Box>
      )}

      {selectedBookingId && (
        <FormControl fullWidth>
          <InputLabel id="assign-visitors-label">Chọn khách tham quan *</InputLabel>
          <Select
            labelId="assign-visitors-label"
            multiple
            value={selectedVisitorIds}
            input={<OutlinedInput label="Chọn khách tham quan *" />}
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
                <ListItemText primary={`${v.fullName} (${getRelationshipLabel(v.relationship)})`} />
              </MenuItem>
            ))}
            {visitors.length === 0 && !isLoadingVisitors && (
              <MenuItem disabled>
                <ListItemText primary="Không có khách tham quan nào được đăng ký dưới tài khoản khách hàng này." />
              </MenuItem>
            )}
          </Select>
          {visitors.length === 0 && selectedBookingId && (
            <FormHelperText error>
              Vui lòng đăng ký khách tham quan dưới hồ sơ khách hàng này trước.
            </FormHelperText>
          )}
        </FormControl>
      )}

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
        <Button type="submit" variant="contained" loading={loading} disabled={!selectedBookingId}>
          Gán khách tham quan
        </Button>
      </Box>
    </Box>
  );
};
