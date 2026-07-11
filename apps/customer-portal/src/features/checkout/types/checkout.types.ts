export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  provider: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PaymentRequest {
  orderCode: string;
  paymentMethodCode: string;
}

export interface PaymentResponse {
  paymentUrl: string;
}

export interface CheckoutState {
  paymentStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  checkoutStatus: 'IDLE' | 'LOADING' | 'COMPLETED' | 'ERROR';
  redirectStatus: 'IDLE' | 'REDIRECTING' | 'COMPLETED' | 'ERROR';
  transactionId: string | null;
  error: string | null;
}
