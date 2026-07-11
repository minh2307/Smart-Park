import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải dài ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
