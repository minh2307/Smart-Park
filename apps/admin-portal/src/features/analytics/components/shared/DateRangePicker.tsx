/**
 * DateRangePicker - Custom date range selector with presets
 */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Popover,
  TextField,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import { MdCalendarToday } from 'react-icons/md';
import dayjs from 'dayjs';
import { DATE_RANGE_PRESETS, type DateRange } from '../../utils/dateHelpers';

interface DateRangePickerProps {
  value: DateRange & { preset: string };
  onChange: (range: DateRange & { preset: string }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [customStart, setCustomStart] = useState(dayjs(value.startDate).format('YYYY-MM-DD'));
  const [customEnd, setCustomEnd] = useState(dayjs(value.endDate).format('YYYY-MM-DD'));

  const open = Boolean(anchorEl);

  const handlePresetClick = (presetKey: string) => {
    const preset = DATE_RANGE_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    const range = preset.getRange();
    onChange({ ...range, preset: presetKey });
    setAnchorEl(null);
  };

  const handleCustomApply = () => {
    onChange({
      startDate: dayjs(customStart).startOf('day').toISOString(),
      endDate: dayjs(customEnd).endOf('day').toISOString(),
      preset: 'custom',
    });
    setAnchorEl(null);
  };

  const activePreset = DATE_RANGE_PRESETS.find((p) => p.key === value.preset);
  const displayLabel = activePreset
    ? activePreset.label
    : `${dayjs(value.startDate).format('DD/MM')} - ${dayjs(value.endDate).format('DD/MM')}`;

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<MdCalendarToday size={14} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderColor: 'divider',
          color: 'text.primary',
          px: 2,
        }}
      >
        {displayLabel}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { mt: 1, p: 2.5, width: 320, borderRadius: '14px' },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Select Period
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {DATE_RANGE_PRESETS.map((preset) => (
            <Chip
              key={preset.key}
              label={preset.label}
              size="small"
              variant={value.preset === preset.key ? 'filled' : 'outlined'}
              color={value.preset === preset.key ? 'primary' : 'default'}
              onClick={() => handlePresetClick(preset.key)}
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          ))}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Custom Range
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <TextField
            type="date"
            size="small"
            label="Start"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            type="date"
            size="small"
            label="End"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
        <Button variant="contained" size="small" fullWidth onClick={handleCustomApply}>
          Apply Custom Range
        </Button>
      </Popover>
    </>
  );
};
