export type FeedbackCategory =
  | 'RIDE'
  | 'RESTAURANT'
  | 'PARKING'
  | 'LOCKER'
  | 'TICKET'
  | 'BOOKING'
  | 'STAFF'
  | 'FACILITY'
  | 'APPLICATION'
  | 'OTHER';

export type FeedbackStatus = 'PENDING' | 'REPLIED' | 'RESOLVED' | 'CLOSED';

export interface Feedback {
  id: number;
  customerName: string;
  customerEmail: string;
  bookingCode?: string;
  rating: number; // 1 to 5 stars
  category: FeedbackCategory;
  content: string;
  status: FeedbackStatus;
  assignedStaff?: string;
  replyContent?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface FeedbackFilters {
  search?: string;
  category?: FeedbackCategory | '';
  status?: FeedbackStatus | '';
  rating?: number | '';
  page?: number;
  size?: number;
}
