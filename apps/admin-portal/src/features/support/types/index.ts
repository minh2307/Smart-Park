export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type SupportStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'ESCALATED';

export type SupportCategory = 'TICKET_REFUND' | 'MEMBERSHIP' | 'LOST_FOUND' | 'FACILITY' | 'COMPLAINT' | 'OTHER';

export interface SupportMessage {
  id: number;
  senderName: string;
  senderRole: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  messageText: string;
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  ticketCode: string; // e.g. SUP-1002
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  assigneeName?: string;
  description: string;
  messages: SupportMessage[];
  slaDeadline: string; // ISO date string
  slaStatus: 'MET' | 'BREACHED' | 'WARNING';
  knowledgeBaseLinks?: { articleId: number; title: string }[];
  resolvedAt?: string;
  createdAt: string;
}

export interface SupportTicketFilters {
  search?: string;
  category?: SupportCategory | '';
  priority?: SupportPriority | '';
  status?: SupportStatus | '';
  page?: number;
  size?: number;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  slaComplianceRate: number;
  customerSatisfactionScore: number; // e.g. 4.6 out of 5
  averageResponseTimeMinutes: number;
  averageResolutionTimeMinutes: number;
  ticketsByCategory: { category: string; count: number }[];
  ticketsByStatus: { status: string; count: number }[];
}
