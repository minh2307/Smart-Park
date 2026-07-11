import { z } from 'zod';

export const visitorFormSchema = z.object({
  customerId: z.number({ required_error: 'Please select a customer owner' }).min(1, 'Please select a customer owner'),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .nonempty('Full name is required'),
  age: z.coerce.number({ invalid_type_error: 'Age must be a number' })
    .min(0, 'Age cannot be negative')
    .max(120, 'Age cannot exceed 120 years'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
  nationality: z.string()
    .min(2, 'Nationality must be at least 2 characters')
    .nonempty('Nationality is required'),
  identificationNumber: z.string()
    .min(5, 'Identification number must be at least 5 characters')
    .max(30, 'Identification number cannot exceed 30 characters')
    .nonempty('Identification number (ID/Passport) is required'),
  relationship: z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'FRIEND', 'OTHER'], {
    required_error: 'Relationship to customer is required',
  }),
  emergencyContactName: z.string()
    .max(100, 'Contact name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      return /^[+]?[0-9\s\-()]+$/.test(val);
    }, {
      message: 'Invalid phone number format',
    }),
  medicalNotes: z.string()
    .max(500, 'Medical notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type VisitorFormInput = z.infer<typeof visitorFormSchema>;
