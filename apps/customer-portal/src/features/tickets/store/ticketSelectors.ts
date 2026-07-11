import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { TicketType } from '../types/ticket.types';


export const selectVenues = (state: RootState) => state.tickets.venues;
export const selectSelectedVenueId = (state: RootState) => state.tickets.selectedVenueId;
export const selectFilters = (state: RootState) => state.tickets.filters;
export const selectViewMode = (state: RootState) => state.tickets.viewMode;
export const selectCurrentPage = (state: RootState) => state.tickets.currentPage;
export const selectItemsPerPage = (state: RootState) => state.tickets.itemsPerPage;
export const selectCompareIds = (state: RootState) => state.tickets.compareIds;
export const selectSelectedDetail = (state: RootState) => state.tickets.selectedDetail;
export const selectLoading = (state: RootState) => state.tickets.loading;
export const selectError = (state: RootState) => state.tickets.error;

export const selectFilteredTickets = createSelector(
  [(state: RootState) => state.tickets.ticketTypes, selectFilters],
  (tickets, filters): TicketType[] => {
    let result = [...tickets];

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q),
      );
    }

    // Category filter
    if (filters.category !== 'ALL') {
      result = result.filter((t) => t.category === filters.category);
    }

    // Price range filter
    result = result.filter(
      (t) => t.price >= filters.priceMin && t.price <= filters.priceMax,
    );

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return result;
  },
);

export const selectPaginatedTickets = createSelector(
  [selectFilteredTickets, selectCurrentPage, selectItemsPerPage],
  (tickets, page, perPage): TicketType[] => {
    const start = page * perPage;
    return tickets.slice(start, start + perPage);
  },
);

export const selectTotalPages = createSelector(
  [selectFilteredTickets, selectItemsPerPage],
  (tickets, perPage) => Math.ceil(tickets.length / perPage),
);

export const selectCompareTickets = createSelector(
  [(state: RootState) => state.tickets.ticketTypes, selectCompareIds],
  (tickets, ids): TicketType[] => tickets.filter((t) => ids.includes(t.id)),
);

export const selectSelectedVenue = createSelector(
  [selectVenues, selectSelectedVenueId],
  (venues, id) => venues.find((v) => v.id === id) ?? null,
);
