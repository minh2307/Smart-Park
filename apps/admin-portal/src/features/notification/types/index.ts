export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WEB';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

export type RecipientType =
  | 'ALL_USERS'
  | 'CUSTOMERS'
  | 'MEMBERS'
  | 'VIP_MEMBERS'
  | 'VISITORS'
  | 'STAFF'
  | 'OPERATORS'
  | 'MANAGERS'
  | 'ADMINS'
  | 'CUSTOM_GROUP';

export type NotificationStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED' | 'SENDING';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  recipientType: RecipientType;
  status: NotificationStatus;
  scheduledTime?: string;
  sentTime?: string;
  createdBy: string;
  expirationTime?: string;
  deepLink?: string;
  actionButtonText?: string;
  attachments?: string[];
  failureReason?: string;
  deliveryCount: number;
  readCount: number;
}

export interface NotificationFilters {
  search?: string;
  channel?: NotificationChannel | '';
  priority?: NotificationPriority | '';
  status?: NotificationStatus | '';
  recipientType?: RecipientType | '';
  page?: number;
  size?: number;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  scheduledNotifications: number;
  failedNotifications: number;
  pushSuccessRate: number;
  emailSuccessRate: number;
  smsSuccessRate: number;
  deliveryTrend: { date: string; sent: number; failed: number }[];
}
