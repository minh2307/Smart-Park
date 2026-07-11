import { z } from 'zod';

export const ticketSchema = z.object({
  status: z.enum([
    'DRAFT',
    'AVAILABLE',
    'RESERVED',
    'SOLD',
    'ACTIVATED',
    'USED',
    'PARTIALLY_USED',
    'EXPIRED',
    'CANCELLED',
    'REFUNDED',
  ]),
  validDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  maxUses: z.number().min(1, 'Max uses must be at least 1'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export type TicketInput = z.infer<typeof ticketSchema>;
