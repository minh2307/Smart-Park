import { z } from 'zod';

export const gateSchema = z.object({
  code: z.string().min(3, 'Mã cổng phải có ít nhất 3 ký tự').max(20, 'Mã cổng không vượt quá 20 ký tự'),
  name: z.string().min(3, 'Tên cổng phải có ít nhất 3 ký tự').max(100, 'Tên cổng không vượt quá 100 ký tự'),
  type: z.enum(['ENTRY', 'EXIT', 'RIDE', 'VIP']),
  assignedVenueId: z.number({ required_error: 'Vui lòng chọn địa điểm' }),
  assignedZoneId: z.number().nullable().optional(),
  assignedAttractionId: z.number().nullable().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'BUSY', 'MAINTENANCE', 'OFFLINE', 'EMERGENCY', 'DISABLED']),
  deviceStatus: z.enum(['ONLINE', 'OFFLINE', 'ERROR']),
  currentOperator: z.string().nullable().optional(),
  deviceInfo: z.object({
    ipAddress: z.string().ip({ message: 'Địa chỉ IP không đúng định dạng' }),
    macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Địa chỉ MAC không đúng định dạng'),
    firmwareVersion: z.string().min(1, 'Phiên bản phần sụn là bắt buộc'),
  }),
  scannerConfig: z.object({
    autoScan: z.boolean().default(true),
    continuousScan: z.boolean().default(false),
    beepSound: z.boolean().default(true),
    flashLight: z.boolean().default(false),
  }),
  operatingHours: z.object({
    open: z.string().regex(/^([0-9]{2}):([0-9]{2})$/, 'Thời gian mở cửa không đúng định dạng (HH:MM)'),
    close: z.string().regex(/^([0-9]{2}):([0-9]{2})$/, 'Thời gian đóng cửa không đúng định dạng (HH:MM)'),
  }),
});

export type GateInput = z.infer<typeof gateSchema>;
