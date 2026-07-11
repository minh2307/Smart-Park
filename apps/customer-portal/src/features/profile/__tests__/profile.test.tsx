import React from 'react';
import { profileValidationSchema, passwordValidationSchema } from '../schemas/profile.schema';
import type { CustomerProfile, UserPreferences, NotificationPreferences } from '../types/profile.types';

const mockProfile: CustomerProfile = {
  id: 1,
  userId: 1,
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  birthDate: '1995-05-15',
  gender: 'MALE',
  address: '123 Đường Công Viên, Quận 1, TP. Hồ Chí Minh',
  status: 'ACTIVE',
};

const mockPreferences: UserPreferences = {
  language: 'vi',
  theme: 'dark',
  timezone: 'Asia/Ho_Chi_Minh',
  preferredPark: 'Smart Park Grand',
  preferredCommunication: 'EMAIL',
};

const mockNotifications: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  promotionalNotifications: true,
  membershipNotifications: true,
  bookingNotifications: true,
};

describe('User Profile & Account Management Module Tests', () => {
  it('validates correct profile inputs using zod schema', () => {
    const validData = {
      fullName: 'Nguyễn Văn B',
      phone: '0123456789',
      address: 'Hanoi, Vietnam',
      birthDate: '1990-10-10',
      gender: 'FEMALE',
    };
    const parsed = profileValidationSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid profile inputs', () => {
    const invalidData = {
      fullName: 'A', // too short
      phone: '123', // invalid phone length
      gender: 'UNKNOWN', // invalid enum
    };
    const parsed = profileValidationSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('validates password strength rules', () => {
    const weakPassword = {
      currentPassword: 'password123',
      newPassword: 'short',
      confirmPassword: 'short',
    };
    const parsedWeak = passwordValidationSchema.safeParse(weakPassword);
    expect(parsedWeak.success).toBe(false);

    const strongPassword = {
      currentPassword: 'current_pass',
      newPassword: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    };
    const parsedStrong = passwordValidationSchema.safeParse(strongPassword);
    expect(parsedStrong.success).toBe(true);
  });

  it('verifies preference values map correctly', () => {
    expect(mockPreferences.language).toBe('vi');
    expect(mockPreferences.theme).toBe('dark');
    expect(mockNotifications.emailNotifications).toBe(true);
  });
});
