import { z } from 'zod';

export const bookingSchema = z.object({
  customerId: z.number({ required_error: 'Please select a customer' }).min(1, 'Please select a customer'),
  venueId: z.number({ required_error: 'Please select a venue' }).min(1, 'Please select a venue'),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  items: z.array(
    z.object({
      ticketTypeId: z.number().min(1, 'Select a ticket type'),
      quantity: z.number().min(1, 'Quantity must be at least 1').max(20, 'Max 20 tickets per type'),
    })
  ).min(1, 'Add at least one ticket type'),
  visitors: z.array(
    z.object({
      fullName: z.string().min(2, 'Name must be at least 2 characters'),
      phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
      idCard: z.string().min(9, 'ID card must be at least 9 characters').optional().or(z.literal('')),
    })
  ).optional(),
  paymentMethod: z.enum(['CHUYEN_KHOAN_QR', 'TIEN_MAT']).default('CHUYEN_KHOAN_QR'),
  promotionCode: z.string().optional().or(z.literal('')),
});

export type BookingInput = z.infer<typeof bookingSchema>;
