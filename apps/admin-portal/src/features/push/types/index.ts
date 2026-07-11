export interface PushNotificationConfig {
  id: number;
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  actionButtonText?: string;
  isSilent: boolean;
  topic?: string;
  targetGroup?: string;
  sentCount: number;
  clickCount: number;
  createdAt: string;
  sentAt?: string;
}

export interface PushNotificationFilters {
  search?: string;
  topic?: string;
  page?: number;
  size?: number;
}
