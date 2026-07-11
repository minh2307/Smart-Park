import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TicketFilters, TicketCategory } from '../types/ticket.types';

// ─── State ───────────────────────────────────────────────────────────────────

interface TicketState {
  selectedVenueId: number | null;
  filters: TicketFilters;
  compareIds: number[];
  viewMode: 'grid' | 'list';
  currentPage: number;
  itemsPerPage: number;
}

const initialFilters: TicketFilters = {
  search: '',
  category: 'ALL',
  priceMin: 0,
  priceMax: 5000000,
  sortBy: 'popular',
};

const initialState: TicketState = {
  selectedVenueId: null,
  filters: initialFilters,
  compareIds: [],
  viewMode: 'grid',
  currentPage: 0,
  itemsPerPage: 12,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSelectedVenue(state, action: PayloadAction<number>) {
      state.selectedVenueId = action.payload;
      state.currentPage = 0;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.currentPage = 0;
    },
    setCategory(state, action: PayloadAction<TicketCategory | 'ALL'>) {
      state.filters.category = action.payload;
      state.currentPage = 0;
    },
    setPriceRange(state, action: PayloadAction<[number, number]>) {
      state.filters.priceMin = action.payload[0];
      state.filters.priceMax = action.payload[1];
      state.currentPage = 0;
    },
    setSortBy(state, action: PayloadAction<TicketFilters['sortBy']>) {
      state.filters.sortBy = action.payload;
    },
    setViewMode(state, action: PayloadAction<'grid' | 'list'>) {
      state.viewMode = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    resetFilters(state) {
      state.filters = initialFilters;
      state.currentPage = 0;
    },
    toggleCompare(state, action: PayloadAction<number>) {
      const id = action.payload;
      if (state.compareIds.includes(id)) {
        state.compareIds = state.compareIds.filter((c) => c !== id);
      } else if (state.compareIds.length < 3) {
        state.compareIds.push(id);
      }
    },
    clearCompare(state) {
      state.compareIds = [];
    },
  },
});

export const {
  setSelectedVenue, setSearch, setCategory, setPriceRange, setSortBy,
  setViewMode, setPage, resetFilters, toggleCompare, clearCompare,
} = ticketSlice.actions;

export default ticketSlice.reducer;
