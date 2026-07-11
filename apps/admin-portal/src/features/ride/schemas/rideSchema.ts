import { z } from 'zod';

export const rideSchema = z.object({
  name: z.string().min(3, 'Ride Name must be at least 3 characters').max(150),
  code: z
    .string()
    .min(3, 'Ride Code must be at least 3 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Ride Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1 person/hour'),
  durationSeconds: z.coerce.number().int().min(5, 'Duration must be at least 5 seconds').optional().or(z.literal('')),
  status: z.enum([
    'OPERATING',
    'CLOSED',
    'MAINTENANCE',
    'TEMPORARILY_CLOSED',
    'EMERGENCY_STOP',
    'RESERVED',
  ]),
  venueId: z.coerce.number().int().min(1, 'Please select a venue'),
  zoneId: z.coerce.number().int().min(1, 'Please select a zone'),
  rideCategoryId: z.coerce.number().int().min(1, 'Please select a category'),
  operatingHours: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Open hour must be in HH:MM format'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Close hour must be in HH:MM format'),
  }),
  restrictions: z.object({
    minHeight: z.coerce.number().int().min(0).optional().or(z.literal('')),
    maxHeight: z.coerce.number().int().min(0).optional().or(z.literal('')),
    minAge: z.coerce.number().int().min(0).optional().or(z.literal('')),
    maxAge: z.coerce.number().int().min(0).optional().or(z.literal('')),
    minWeight: z.coerce.number().int().min(0).optional().or(z.literal('')),
    maxWeight: z.coerce.number().int().min(0).optional().or(z.literal('')),
    healthWarning: z.boolean().default(false),
    pregnancyRestriction: z.boolean().default(false),
    accessibilityFriendly: z.boolean().default(false),
    safetyNotes: z.string().max(500, 'Safety notes cannot exceed 500 characters').optional().or(z.literal('')),
  }),
});

export type RideFormInput = z.infer<typeof rideSchema>;
