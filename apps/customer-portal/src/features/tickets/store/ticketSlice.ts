import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ticketApi } from '../api/ticketApi';
import type { TicketType, TicketFilters, Venue, TicketCategory } from '../types/ticket.types';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchVenues = createAsyncThunk('tickets/fetchVenues', async () => {
  return ticketApi.getVenues();
});

export const fetchTicketTypes = createAsyncThunk(
  'tickets/fetchTicketTypes',
  async (venueId: number) => {
    return ticketApi.getTicketTypesByVenue(venueId);
  },
);

export const fetchTicketDetail = createAsyncThunk(
  'tickets/fetchTicketDetail',
  async ({ venueId, ticketId }: { venueId: number; ticketId: number }) => {
    return ticketApi.getTicketTypeById(venueId, ticketId);
  },
);

// ─── State ───────────────────────────────────────────────────────────────────

interface TicketState {
  venues: Venue[];
  ticketTypes: TicketType[];
  selectedDetail: TicketType | null;
  selectedVenueId: number | null;
  filters: TicketFilters;
  compareIds: number[];
  loading: {
    venues: boolean;
    tickets: boolean;
    detail: boolean;
  };
  error: string | null;
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
  venues: [],
  ticketTypes: [],
  selectedDetail: null,
  selectedVenueId: null,
  filters: initialFilters,
  compareIds: [],
  loading: { venues: false, tickets: false, detail: false },
  error: null,
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
  extraReducers: (builder) => {
    // venues
    builder
      .addCase(fetchVenues.pending, (state) => { state.loading.venues = true; state.error = null; })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading.venues = false;
        state.venues = action.payload;
        if (action.payload.length > 0 && !state.selectedVenueId) {
          state.selectedVenueId = action.payload[0].id;
        }
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading.venues = false;
        state.error = action.error.message ?? 'Failed to load venues';
      });

    // ticket types
    builder
      .addCase(fetchTicketTypes.pending, (state) => { state.loading.tickets = true; state.error = null; })
      .addCase(fetchTicketTypes.fulfilled, (state, action) => {
        state.loading.tickets = false;
        state.ticketTypes = action.payload;
      })
      .addCase(fetchTicketTypes.rejected, (state, action) => {
        state.loading.tickets = false;
        state.error = action.error.message ?? 'Failed to load tickets';
      });

    // detail
    builder
      .addCase(fetchTicketDetail.pending, (state) => { state.loading.detail = true; state.error = null; })
      .addCase(fetchTicketDetail.fulfilled, (state, action) => {
        state.loading.detail = false;
        state.selectedDetail = action.payload;
      })
      .addCase(fetchTicketDetail.rejected, (state, action) => {
        state.loading.detail = false;
        state.error = action.error.message ?? 'Failed to load ticket detail';
      });
  },
});

export const {
  setSelectedVenue, setSearch, setCategory, setPriceRange, setSortBy,
  setViewMode, setPage, resetFilters, toggleCompare, clearCompare,
} = ticketSlice.actions;

export default ticketSlice.reducer;
