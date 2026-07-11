import { z } from 'zod';

export const rideCategorySchema = z.object({
  name: z.string().min(3, 'Tên danh mục phải có ít nhất 3 ký tự').max(100),
  code: z
    .string()
    .min(3, 'Mã danh mục phải có ít nhất 3 ký tự')
    .max(20)
    .regex(
      /^[A-Z0-9_-]+$/,
      'Mã danh mục chỉ được chứa chữ cái viết hoa, chữ số, dấu gạch nối và dấu gạch dưới'
    ),
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type RideCategoryFormInput = z.infer<typeof rideCategorySchema>;
