import { z } from 'zod';

export const userCreateSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  role: z.enum(['ADMIN', 'NHAN_VIEN'], { required_error: 'Vui lòng chọn vai trò' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED']).default('ACTIVE'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const userUpdateSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  role: z.enum(['ADMIN', 'NHAN_VIEN']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED']),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
