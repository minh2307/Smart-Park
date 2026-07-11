export interface SMSTemplate {
  id: number;
  templateName: string;
  body: string;
  variables: string[];
  category: 'OTP' | 'NOTIFICATION' | 'TRANSACTION' | 'MARKETING' | 'ALERT';
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface SMSTemplateFilters {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
}
