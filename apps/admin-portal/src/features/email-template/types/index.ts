export interface EmailTemplate {
  id: number;
  templateName: string;
  subject: string;
  bodyHtml: string;
  variables: string[]; // List of placeholders like {{username}}, {{bookingCode}}
  category: 'REGISTRATION' | 'BOOKING' | 'PAYMENT' | 'REFUND' | 'SECURITY' | 'MARKETING' | 'SUPPORT' | 'SYSTEM';
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface EmailTemplateFilters {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
}
