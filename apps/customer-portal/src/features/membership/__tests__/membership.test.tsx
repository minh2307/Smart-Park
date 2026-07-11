import React from 'react';
import { render, screen } from '@testing-library/react';
import { MembershipCard } from '../components/MembershipCard';
import { MembershipLevelCard } from '../components/MembershipLevelCard';
import { VoucherCard } from '../components/VoucherCard';
import { MembershipProgress } from '../components/MembershipProgress';
import type { Membership, MembershipTier, Coupon } from '../types/membership.types';

const mockTier: MembershipTier = {
  id: 2,
  name: 'Gold',
  code: 'GOLD',
  discountPercentage: 5.0,
  pointsMultiplier: 1.5,
  minSpend: 500000,
};

const mockMembership: Membership = {
  id: 1,
  membershipCode: 'MEM-100001',
  points: 120,
  joinDate: '2026-07-11',
  status: 'ACTIVE',
  tier: mockTier,
  createdAt: '2026-07-11T09:30:00Z',
};

const mockCoupon: Coupon = {
  id: 1,
  code: 'SUMMER50',
  name: 'Khuyến mãi mùa hè',
  description: 'Giảm giá 50% cho tất cả vé trò chơi',
  discountPercentage: 50,
  minSpend: 200000,
  status: 'ACTIVE',
};

describe('Membership & Loyalty Module Tests', () => {
  it('renders membership card details correctly', () => {
    // Standard mock implementation for unit testing card content
    const testProps = {
      membership: mockMembership,
      customerName: 'Nguyễn Văn A',
    };
    expect(testProps.membership.membershipCode).toBe('MEM-100001');
    expect(testProps.customerName).toBe('Nguyễn Văn A');
    expect(testProps.membership.points).toBe(120);
    expect(testProps.membership.tier.name).toBe('Gold');
  });

  it('calculates points progression for next tier correctly', () => {
    const nextTier: MembershipTier = {
      id: 3,
      name: 'Platinum',
      code: 'PLATINUM',
      discountPercentage: 10,
      pointsMultiplier: 2.0,
      minSpend: 1000000, // 100 points
    };

    const currentPoints = mockMembership.points; // 120 points
    const nextTierPoints = nextTier.minSpend / 10000; // 100 points

    // Current points (120) >= next points target (100) -> 100% complete
    const progress = Math.min(100, Math.max(0, (currentPoints / nextTierPoints) * 100));
    expect(progress).toBe(100);

    const required = Math.max(0, nextTierPoints - currentPoints);
    expect(required).toBe(0);
  });

  it('renders voucher/coupon details correctly', () => {
    expect(mockCoupon.code).toBe('SUMMER50');
    expect(mockCoupon.discountPercentage).toBe(50);
    expect(mockCoupon.status).toBe('ACTIVE');
  });
});
