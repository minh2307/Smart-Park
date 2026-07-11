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
          <InputLabel>Địa điểm</InputLabel>
          <Select
            value={selectedVenueId || ''}
            label="Địa điểm"
            onChange={(e) => dispatch(setSelectedVenue(e.target.value ? Number(e.target.value) : null))}
          >
            <MenuItem value="">Tất cả địa điểm</MenuItem>
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
          <ToggleButton value="day">Ngày</ToggleButton>
          <ToggleButton value="week">Tuần</ToggleButton>
          <ToggleButton value="month">Tháng</ToggleButton>
          <ToggleButton value="quarter">Quý</ToggleButton>
          <ToggleButton value="year">Năm</ToggleButton>
        </ToggleButtonGroup>
      )}

      {showCompare && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>So sánh</InputLabel>
          <Select
            value={compareWith}
            label="So sánh"
            onChange={(e) => dispatch(setCompareWith(e.target.value as any))}
            startAdornment={<MdCompareArrows size={14} style={{ marginRight: 4 }} />}
          >
            <MenuItem value="none">Không so sánh</MenuItem>
            <MenuItem value="previous_period">Kỳ trước</MenuItem>
            <MenuItem value="previous_year">Năm trước</MenuItem>
          </Select>
        </FormControl>
      )}

      <Box sx={{ flex: 1 }} />

      {onRefresh && (
        <Tooltip title="Làm mới dữ liệu">
          <IconButton onClick={onRefresh} size="small" color="primary">
            <MdRefresh size={18} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
