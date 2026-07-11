import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@shared/utils';
import type {
  UserPreferences,
  NotificationPreferences,
  PrivacySettings,
  UserSession,
} from '../types/profile.types';

interface ProfileState {
  preferences: UserPreferences;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  activeSessions: UserSession[];
  avatarUrl: string | null;
}

const defaultPreferences: UserPreferences = {
  language: 'vi',
  theme: 'dark',
  timezone: 'Asia/Ho_Chi_Minh',
  preferredPark: 'Smart Park Grand',
  preferredCommunication: 'EMAIL',
};

const defaultNotifications: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  promotionalNotifications: true,
  membershipNotifications: true,
  bookingNotifications: true,
};

const defaultPrivacy: PrivacySettings = {
  profileVisibility: 'PRIVATE',
  shareVisitHistory: true,
  receivePartnerOffers: false,
};

const mockSessions: UserSession[] = [
  {
    id: 'sess-1',
    deviceName: 'Chrome on Windows Desktop',
    deviceType: 'Desktop',
    location: 'Hanoi, Vietnam',
    lastActive: 'Đang hoạt động',
    current: true,
  },
  {
    id: 'sess-2',
    deviceName: 'Safari on iPhone 15',
    deviceType: 'Mobile',
    location: 'Ho Chi Minh City, Vietnam',
    lastActive: '2 giờ trước',
    current: false,
  },
];

const initialState: ProfileState = {
  preferences: storage.get<UserPreferences>('sp_user_preferences') || defaultPreferences,
  notifications: storage.get<NotificationPreferences>('sp_user_notifications') || defaultNotifications,
  privacy: storage.get<PrivacySettings>('sp_user_privacy') || defaultPrivacy,
  activeSessions: mockSessions,
  avatarUrl: storage.get<string>('sp_user_avatar') || null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      storage.set('sp_user_preferences', state.preferences);
    },
    updateNotifications: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
      storage.set('sp_user_notifications', state.notifications);
    },
    updatePrivacy: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
      storage.set('sp_user_privacy', state.privacy);
    },
    setAvatarUrl: (state, action: PayloadAction<string | null>) => {
      state.avatarUrl = action.payload;
      storage.set('sp_user_avatar', action.payload);
    },
    revokeSession: (state, action: PayloadAction<string>) => {
      state.activeSessions = state.activeSessions.filter((s) => s.id !== action.payload);
    },
    logoutAllOtherDevices: (state) => {
      state.activeSessions = state.activeSessions.filter((s) => s.current);
    },
  },
});

export const {
  updatePreferences,
  updateNotifications,
  updatePrivacy,
  setAvatarUrl,
  revokeSession,
  logoutAllOtherDevices,
} = profileSlice.actions;

export default profileSlice.reducer;
