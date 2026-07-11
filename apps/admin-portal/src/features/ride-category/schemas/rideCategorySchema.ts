import { z } from 'zod';

export const rideCategorySchema = z.object({
  name: z.string().min(3, 'Category Name must be at least 3 characters').max(100),
  code: z
    .string()
    .min(3, 'Category Code must be at least 3 characters')
    .max(20)
    .regex(
      /^[A-Z0-9_-]+$/,
      'Category Code must contain only uppercase letters, numbers, hyphens, and underscores'
    ),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type RideCategoryFormInput = z.infer<typeof rideCategorySchema>;
