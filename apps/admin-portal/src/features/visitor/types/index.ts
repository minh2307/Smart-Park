export interface Visitor {
  id: number;
  customerId: number;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  identificationNumber: string; // ID Card or Passport
  relationship: 'SELF' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'FRIEND' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE';
  bookingCount: number;
  ticketCount: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTickets?: Array<{
    id: number;
    ticketCode: string;
    validDate: string;
    status: string;
    ticketType?: {
      name: string;
    };
  }>;
}

export interface VisitorFilters {
  page?: number;
  size?: number;
  search?: string;
  customerId?: number;
  relationship?: string;
  status?: string;
}

export interface VisitorListResponse {
  content: Visitor[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
