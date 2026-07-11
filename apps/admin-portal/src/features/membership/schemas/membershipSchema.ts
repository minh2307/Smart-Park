import { z } from 'zod';

export const pointRulesSchema = z.object({
  upgradeThreshold: z.number({ required_error: 'Upgrade points required' })
    .min(0, 'Must be 0 or positive'),
  downgradeThreshold: z.number({ required_error: 'Downgrade threshold points required' })
    .min(0, 'Must be 0 or positive'),
  expirationMonths: z.number({ required_error: 'Expiration period is required' })
    .min(1, 'Must be at least 1 month')
    .max(120, 'Max 120 months'),
  renewalPoints: z.number({ required_error: 'Renewal points reward required' })
    .min(0, 'Must be 0 or positive'),
});

export const benefitConfigSchema = z.object({
  ticketDiscount: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  foodDiscount: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  shopDiscount: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  parkingDiscount: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  lockerDiscount: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  priorityQueue: z.boolean().default(false),
  fastPass: z.boolean().default(false),
  birthdayGift: z.boolean().default(false),
  vipLoungeAccess: z.boolean().default(false),
  freeParking: z.boolean().default(false),
  freeLocker: z.boolean().default(false),
  earlyParkEntry: z.boolean().default(false),
});

export const membershipTierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters')
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric and underscores only'),
  discountPercentage: z.number({ required_error: 'Discount percentage is required' })
    .min(0, 'Min 0%')
    .max(100, 'Max 100%'),
  pointsMultiplier: z.number({ required_error: 'Points multiplier is required' })
    .min(1.0, 'Multiplier must be at least 1.0')
    .max(10.0, 'Multiplier cannot exceed 10.0'),
  minSpend: z.number({ required_error: 'Minimum spend amount is required' })
    .min(0, 'Must be 0 or positive'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  benefits: benefitConfigSchema,
  pointRules: pointRulesSchema,
  applicableTicketTypes: z.array(z.string()).default([]),
  applicableVenues: z.array(z.string()).default([]),
  applicableAttractions: z.array(z.string()).default([]),
});

export const membershipSchema = z.object({
  customerId: z.number({ required_error: 'Customer selection is required' }),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(6, 'Invalid phone number'),
  tierId: z.number({ required_error: 'Membership tier selection is required' }),
  membershipCode: z.string().min(3, 'Membership Code must be at least 3 characters'),
  points: z.number().min(0, 'Points must be 0 or positive'),
  joinDate: z.string().min(1, 'Join date is required'),
  expirationDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED']).default('ACTIVE'),
});

export type MembershipTierFormValues = z.infer<typeof membershipTierSchema>;
export type MembershipFormValues = z.infer<typeof membershipSchema>;
