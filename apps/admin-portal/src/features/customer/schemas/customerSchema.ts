import { z } from 'zod';

export const customerFormSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .nonempty('Full name is required'),
  email: z.string()
    .email('Invalid email address')
    .nonempty('Email is required'),
  phone: z.string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number format')
    .nonempty('Phone number is required'),
  birthDate: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return date < new Date();
    }, {
      message: 'Birth date must be in the past',
    }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional(),
  address: z.string()
    .max(200, 'Address cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  membershipTierId: z.number().optional().or(z.literal('')),
  initialPoints: z.number().min(0, 'Points cannot be negative').optional(),
});

export type CustomerFormInput = z.infer<typeof customerFormSchema>;
