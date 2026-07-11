export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'EXPIRED';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: AnnouncementStatus;
  isPinned: boolean;
  targetAudience: string;
  venueId?: number;
  venueName?: string;
  rideId?: number;
  rideName?: string;
  publishTime: string;
  expirationTime?: string;
  bannerImage?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
}

export interface AnnouncementFilters {
  search?: string;
  status?: AnnouncementStatus | '';
  venueId?: number | '';
  rideId?: number | '';
  page?: number;
  size?: number;
}
