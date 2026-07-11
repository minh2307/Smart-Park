/**
 * FilterPanel - Global analytics filter bar
 * Date range, venue selector, group by, comparison mode
 */
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import { MdCompareArrows, MdRefresh } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { setDateRange, setGroupBy, setCompareWith, setSelectedVenue } from '../../store/analyticsSlice';
import { DateRangePicker } from './DateRangePicker';

interface FilterPanelProps {
  onRefresh?: () => void;
  showGroupBy?: boolean;
  showCompare?: boolean;
  showVenue?: boolean;
  venues?: { id: number; name: string }[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onRefresh,
  showGroupBy = true,
  showCompare = true,
  showVenue = true,
  venues = [],
}) => {
  const dispatch = useDispatch();
  const { dateRange, groupBy, compareWith, selectedVenueId } = useSelector(
    (state: RootState) => (state as any).analytics
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <DateRangePicker
        value={dateRange}
        onChange={(range) => dispatch(setDateRange(range))}
      />

      {showVenue && venues.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Venue</InputLabel>
          <Select
            value={selectedVenueId || ''}
            label="Venue"
            onChange={(e) => dispatch(setSelectedVenue(e.target.value ? Number(e.target.value) : null))}
          >
            <MenuItem value="">All Venues</MenuItem>
            {venues.map((v) => (
              <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showGroupBy && (
        <ToggleButtonGroup
          value={groupBy}
          exclusive
          onChange={(_, val) => val && dispatch(setGroupBy(val))}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px !important',
            },
          }}
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="quarter">Quarter</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      )}

      {showCompare && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Compare</InputLabel>
          <Select
            value={compareWith}
            label="Compare"
            onChange={(e) => dispatch(setCompareWith(e.target.value as any))}
            startAdornment={<MdCompareArrows size={14} style={{ marginRight: 4 }} />}
          >
            <MenuItem value="none">No Comparison</MenuItem>
            <MenuItem value="previous_period">Previous Period</MenuItem>
            <MenuItem value="previous_year">Previous Year</MenuItem>
          </Select>
        </FormControl>
      )}

      <Box sx={{ flex: 1 }} />

      {onRefresh && (
        <Tooltip title="Refresh Data">
          <IconButton onClick={onRefresh} size="small" color="primary">
            <MdRefresh size={18} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
