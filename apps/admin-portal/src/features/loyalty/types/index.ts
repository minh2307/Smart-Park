export type TransactionType = 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';

export type TransactionSource = 'TICKET_BOOKING' | 'FOOD_BEVERAGE' | 'GIFT_SHOP' | 'MANUAL' | 'REFERRAL';

export interface PointTransaction {
  id: number;
  customerId: number;
  customerName: string;
  membershipCode: string;
  type: TransactionType;
  points: number;
  balanceAfter: number;
  source: TransactionSource;
  bookingCode?: string;
  paymentId?: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  operatorName?: string;
  createdAt: string;
}

export interface PointRulesConfig {
  earnRate: number; // e.g. 1 point per $1
  redeemRate: number; // e.g. 100 points = $1 (0.01 value)
  maxEarnPerTx: number;
  maxRedeemPerTx: number;
  minRedeemTx: number;
  expirationMonths: number;
  firstPurchaseBonus: number;
  birthdayBonus: number;
  referralBonus: number;
  multipliers: {
    weekend: number;
    holiday: number;
    specialEvent: number;
  };
}

export interface PointAdjustmentRequest {
  id: number;
  customerId: number;
  customerName: string;
  type: 'ADD' | 'DEDUCT';
  points: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface LoyaltySummary {
  totalEarned: number;
  totalRedeemed: number;
  expiringSoon: number;
  activeEarners: number;
}
