export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  createdAt: string;
}

export interface Feedback {
  id?: number;
  customer: { id: number; fullName?: string };
  category: 'RIDE' | 'FOOD' | 'STAFF' | 'FACILITY' | 'SAFETY' | 'OTHER';
  content: string;
  rating: number;
  assignedEmployeeId?: number | null;
  status?: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  createdAt?: string;
}

export interface Zone {
  id: number;
  name: string;
  code: string;
  description?: string;
  maxCapacity?: number;
  status: 'ACTIVE' | 'CLOSED';
}

export interface Park {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Incident {
  id?: number;
  zone: { id: number; name?: string; code?: string };
  reporterId: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  resolutionDetails?: string | null;
  createdAt?: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface ContactInfo {
  hotline: string;
  email: string;
  address: string;
  openingHours: string;
  socials: {
    facebook: string;
    youtube: string;
    tiktok: string;
  };
}
