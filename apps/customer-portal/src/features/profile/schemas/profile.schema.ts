import { z } from 'zod';

export const profileValidationSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Họ và tên phải có ít nhất 3 ký tự')
    .max(100, 'Họ và tên không quá 100 ký tự'),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Số điện thoại không hợp lệ (từ 10 đến 15 chữ số)'),
  address: z
    .string()
    .max(200, 'Địa chỉ không quá 200 ký tự')
    .optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ. Vui lòng chọn định dạng YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export const passwordValidationSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ cái thường')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số')
    .regex(/[^a-zA-Z0-9]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Xác nhận mật khẩu mới không trùng khớp',
  path: ['confirmPassword'],
});

export type ProfileFormValues = z.infer<typeof profileValidationSchema>;
export type PasswordFormValues = z.infer<typeof passwordValidationSchema>;
