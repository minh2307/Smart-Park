import { z } from 'zod';

export const parkingAreaSchema = z.object({
  code: z.string().min(2, 'Mã bãi đỗ phải từ 2 ký tự').max(10, 'Mã bãi đỗ không quá 10 ký tự'),
  name: z.string().min(2, 'Tên bãi đỗ phải từ 2 ký tự'),
  parkId: z.number({ required_error: 'Vui lòng chọn công viên' }),
  totalSpaces: z.number().min(1, 'Tổng số chỗ đỗ phải lớn hơn 0'),
  operatingHours: z.string().min(1, 'Vui lòng nhập giờ hoạt động'),
  pricingPolicy: z.string().min(1, 'Vui lòng nhập chính sách giá'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
});

export type ParkingAreaFormValues = z.infer<typeof parkingAreaSchema>;
