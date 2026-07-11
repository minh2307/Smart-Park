import axios from 'axios';
import type { TicketType, Venue } from '../types/ticket.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const apiClient = axios.create({ baseURL: BASE_URL });

export const ticketApi = {
  /** GET /venues - list all active venues */
  getVenues: async (): Promise<Venue[]> => {
    const { data } = await apiClient.get('/venues', { params: { status: 1, size: 100 } });
    return data.content ?? data;
  },

  /** GET /venues/{id}/ticket-types - list ticket types for a venue */
  getTicketTypesByVenue: async (venueId: number): Promise<TicketType[]> => {
    const { data } = await apiClient.get(`/venues/${venueId}/ticket-types`);
    return Array.isArray(data) ? data : data.content ?? [];
  },

  /** GET /ticket-types/{id} is not in OpenAPI - we derive detail from the list */
  getTicketTypeById: async (venueId: number, ticketId: number): Promise<TicketType | null> => {
    const list = await ticketApi.getTicketTypesByVenue(venueId);
    return list.find((t) => t.id === ticketId) ?? null;
  },
};
