import { z } from 'zod';

export const feedbackSchema = z.object({
  category: z.enum(['RIDE', 'FOOD', 'STAFF', 'FACILITY', 'SAFETY', 'OTHER'], {
    errorMap: () => ({ message: 'Vui lòng chọn danh mục phản hồi' }),
  }),
  content: z
    .string()
    .min(10, 'Nội dung phản hồi phải chứa ít nhất 10 ký tự')
    .max(1000, 'Nội dung phản hồi không được vượt quá 1000 ký tự'),
  rating: z
    .number()
    .min(1, 'Vui lòng chọn đánh giá tối thiểu 1 sao')
    .max(5, 'Đánh giá tối đa là 5 sao'),
});

export const supportTicketSchema = z.object({
  parkId: z.number({ required_error: 'Vui lòng chọn phân khu công viên' }),
  zoneId: z.number({ required_error: 'Vui lòng chọn khu vực xảy ra sự cố hoặc cần hỗ trợ' }),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: 'Vui lòng chọn mức độ nghiêm trọng' }),
  }),
  description: z
    .string()
    .min(10, 'Vui lòng cung cấp chi tiết yêu cầu hỗ trợ (tối thiểu 10 ký tự)')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
export type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;
