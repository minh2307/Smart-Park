import { z } from 'zod';

export const rideSchema = z.object({
  name: z.string().min(3, 'Tên trò chơi phải có ít nhất 3 ký tự').max(150),
  code: z
    .string()
    .min(3, 'Mã trò chơi phải có ít nhất 3 ký tự')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Mã trò chơi chỉ được chứa chữ cái viết hoa, chữ số, dấu gạch nối và dấu gạch dưới'),
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').optional().or(z.literal('')),
  capacity: z.coerce.number().int().min(1, 'Công suất phải đạt ít nhất 1 người/giờ'),
  durationSeconds: z.coerce.number().int().min(5, 'Thời lượng chu kỳ phải đạt ít nhất 5 giây').optional().or(z.literal('')),
  status: z.enum([
    'OPERATING',
    'CLOSED',
    'MAINTENANCE',
    'TEMPORARILY_CLOSED',
    'EMERGENCY_STOP',
    'RESERVED',
  ]),
  venueId: z.coerce.number().int().min(1, 'Vui lòng chọn địa điểm'),
  zoneId: z.coerce.number().int().min(1, 'Vui lòng chọn phân khu'),
  rideCategoryId: z.coerce.number().int().min(1, 'Vui lòng chọn danh mục'),
  operatingHours: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ mở cửa phải có định dạng HH:MM'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ đóng cửa phải có định dạng HH:MM'),
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
    safetyNotes: z.string().max(500, 'Lưu ý an toàn không được vượt quá 500 ký tự').optional().or(z.literal('')),
  }),
});

export type RideFormInput = z.infer<typeof rideSchema>;
