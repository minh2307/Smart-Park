import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(2, 'Tên địa điểm phải có ít nhất 2 ký tự'),
  venueCode: z.string().min(3, 'Mã địa điểm phải có ít nhất 3 ký tự'),
  description: z.string().optional(),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  city: z.string().min(2, 'Vui lòng nhập Thành phố'),
  provinceState: z.string().optional(),
  country: z.string().min(2, 'Vui lòng nhập Quốc gia'),
  postalCode: z.string().optional(),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').optional().or(z.literal('')),
  email: z.string().email('Địa chỉ email không hợp lệ').optional().or(z.literal('')),
  website: z.string().url('Đường dẫn website không hợp lệ').optional().or(z.literal('')),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng thời gian không hợp lệ (HH:MM)'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng thời gian không hợp lệ (HH:MM)'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'CLOSED']).default('ACTIVE'),
});

export type VenueInput = z.infer<typeof venueSchema>;
