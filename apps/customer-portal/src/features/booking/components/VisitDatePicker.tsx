import React from 'react';
import { Box, TextField, Typography, useTheme, alpha } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';

interface VisitDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  label?: string;
}

export const VisitDatePicker: React.FC<VisitDatePickerProps> = ({
  value,
  onChange,
  minDate = new Date().toISOString().split('T')[0],
  label = 'Ngày tham quan',
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle2"
        fontWeight={700}
        fontFamily="Outfit, sans-serif"
        sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}
      >
        <CalendarMonth sx={{ color: 'primary.main', fontSize: 20 }} />
        {label}
      </Typography>
      <TextField
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ min: minDate }}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
    </Box>
  );
};
