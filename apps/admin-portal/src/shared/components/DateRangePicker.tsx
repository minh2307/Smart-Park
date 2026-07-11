import React from 'react';
import { Box, TextField } from '@mui/material';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  startDateLabel?: string;
  endDateLabel?: string;
  error?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateLabel = 'Ngay bat dau',
  endDateLabel = 'Ngay ket thuc',
  error,
}) => {
  return (
    <Box>
      <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
        <TextField
          label={startDateLabel}
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!error}
        />
        <TextField
          label={endDateLabel}
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!error}
          helperText={error}
        />
      </Box>
    </Box>
  );
};
export default DateRangePicker;
