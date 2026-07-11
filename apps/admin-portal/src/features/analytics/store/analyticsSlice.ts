/**
 * Analytics UI State Slice
 * Manages date range, filters, layout preferences, comparison mode
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

interface AnalyticsState {
  dateRange: {
    startDate: string;
    endDate: string;
    preset: string;
  };
  selectedVenueId: number | null;
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
  compareWith: 'previous_period' | 'previous_year' | 'none';
  refreshInterval: number;
  autoRefresh: boolean;
}

const initialState: AnalyticsState = {
  dateRange: {
    startDate: dayjs().subtract(29, 'day').startOf('day').toISOString(),
    endDate: dayjs().endOf('day').toISOString(),
    preset: 'last30days',
  },
  selectedVenueId: null,
  groupBy: 'day',
  compareWith: 'none',
  refreshInterval: 30000,
  autoRefresh: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string; preset: string }>) {
      state.dateRange = action.payload;
    },
    setSelectedVenue(state, action: PayloadAction<number | null>) {
      state.selectedVenueId = action.payload;
    },
    setGroupBy(state, action: PayloadAction<AnalyticsState['groupBy']>) {
      state.groupBy = action.payload;
    },
    setCompareWith(state, action: PayloadAction<AnalyticsState['compareWith']>) {
      state.compareWith = action.payload;
    },
    setAutoRefresh(state, action: PayloadAction<boolean>) {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval(state, action: PayloadAction<number>) {
      state.refreshInterval = action.payload;
    },
  },
});

export const {
  setDateRange,
  setSelectedVenue,
  setGroupBy,
  setCompareWith,
  setAutoRefresh,
  setRefreshInterval,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
