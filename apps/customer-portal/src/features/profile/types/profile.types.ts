export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface CustomerProfile {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  address?: string;
  status: CustomerStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferences {
  language: 'vi' | 'en';
  theme: 'dark' | 'light';
  timezone: string;
  preferredPark: string;
  preferredCommunication: 'EMAIL' | 'SMS' | 'PUSH';
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  promotionalNotifications: boolean;
  membershipNotifications: boolean;
  bookingNotifications: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE';
  shareVisitHistory: boolean;
  receivePartnerOffers: boolean;
}

export interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  location: string;
  lastActive: string;
  current: boolean;
}
