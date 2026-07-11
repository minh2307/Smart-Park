import { z } from 'zod';

export const bookingSchema = z.object({
  customerId: z.number({ required_error: 'Vui lòng chọn khách hàng' }).min(1, 'Vui lòng chọn khách hàng'),
  venueId: z.number({ required_error: 'Vui lòng chọn địa điểm' }).min(1, 'Vui lòng chọn địa điểm'),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải ở định dạng YYYY-MM-DD'),
  items: z.array(
    z.object({
      ticketTypeId: z.number().min(1, 'Vui lòng chọn loại vé'),
      quantity: z.number().min(1, 'Số lượng phải ít nhất là 1').max(20, 'Tối đa 20 vé cho mỗi loại'),
    })
  ).min(1, 'Thêm ít nhất một loại vé'),
  visitors: z.array(
    z.object({
      fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên'),
      phone: z.string().min(10, 'Số điện thoại phải từ 10 chữ số trở lên').optional().or(z.literal('')),
      idCard: z.string().min(9, 'CCCD/Hộ chiếu phải từ 9 ký tự trở lên').optional().or(z.literal('')),
    })
  ).optional(),
  paymentMethod: z.enum(['CHUYEN_KHOAN_QR', 'TIEN_MAT']).default('CHUYEN_KHOAN_QR'),
  promotionCode: z.string().optional().or(z.literal('')),
});

export type BookingInput = z.infer<typeof bookingSchema>;
