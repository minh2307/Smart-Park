import type { RootState } from '../../../store';

export const selectSelectedVenueId = (state: RootState) => state.tickets.selectedVenueId;
export const selectFilters = (state: RootState) => state.tickets.filters;
export const selectViewMode = (state: RootState) => state.tickets.viewMode;
export const selectCurrentPage = (state: RootState) => state.tickets.currentPage;
export const selectItemsPerPage = (state: RootState) => state.tickets.itemsPerPage;
export const selectCompareIds = (state: RootState) => state.tickets.compareIds;
