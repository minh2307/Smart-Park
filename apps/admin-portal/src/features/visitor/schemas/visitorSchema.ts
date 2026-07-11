import { z } from 'zod';

export const visitorFormSchema = z.object({
  customerId: z.number({ required_error: 'Vui lòng chọn tài khoản khách hàng sở hữu' }).min(1, 'Vui lòng chọn tài khoản khách hàng sở hữu'),
  fullName: z.string()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .nonempty('Họ và tên là bắt buộc'),
  age: z.coerce.number({ invalid_type_error: 'Tuổi phải là số' })
    .min(0, 'Tuổi không được là số âm')
    .max(120, 'Tuổi không được vượt quá 120 tuổi'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Vui lòng chọn giới tính' }),
  nationality: z.string()
    .min(2, 'Quốc tịch phải có ít nhất 2 ký tự')
    .nonempty('Vui lòng nhập quốc tịch'),
  identificationNumber: z.string()
    .min(5, 'Số giấy tờ tùy thân phải có ít nhất 5 ký tự')
    .max(30, 'Số giấy tờ tùy thân không được vượt quá 30 ký tự')
    .nonempty('Số giấy tờ tùy thân (CMND/CCCD/Hộ chiếu) là bắt buộc'),
  relationship: z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'FRIEND', 'OTHER'], {
    required_error: 'Vui lòng chọn mối quan hệ với chủ tài khoản',
  }),
  emergencyContactName: z.string()
    .max(100, 'Tên người liên hệ không được vượt quá 100 ký tự')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      return /^[+]?[0-9\s\-()]+$/.test(val);
    }, {
      message: 'Số điện thoại liên hệ khẩn cấp không đúng định dạng',
    }),
  medicalNotes: z.string()
    .max(500, 'Lưu ý y tế không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type VisitorFormInput = z.infer<typeof visitorFormSchema>;
