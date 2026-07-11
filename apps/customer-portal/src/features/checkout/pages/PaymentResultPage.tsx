import React, { useEffect, useState } from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { PaymentResultCard } from '../components/PaymentResultCard';
import { useCreatePaymentSessionMutation } from '../api/checkoutApi';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING'>('PENDING');

  // VNPay returns:
  // vnp_ResponseCode
  // vnp_TxnRef (contains orderCode-timestamp)
  // vnp_Amount
  // vnp_TransactionNo
  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef') || '';
  const amountStr = searchParams.get('vnp_Amount') || '0';
  const transactionNo = searchParams.get('vnp_TransactionNo') || '';

  // Extract orderCode from txnRef (format: orderCode-timestamp)
  const orderCode = txnRef.includes('-') ? txnRef.split('-')[0] : txnRef;
  const amount = Number(amountStr) / 100;

  const [createPaymentSession, { isLoading: isRetrying }] = useCreatePaymentSessionMutation();

  useEffect(() => {
    if (responseCode === '00') {
      setStatus('SUCCESS');
    } else if (responseCode === '24') {
      setStatus('CANCELLED');
    } else if (responseCode) {
      setStatus('FAILED');
    } else {
      setStatus('PENDING');
    }
  }, [responseCode]);

  const handleRetryPayment = async () => {
    if (!orderCode) return;
    try {
      const response = await createPaymentSession({
        orderCode,
        paymentMethodCode: 'VNPAY', // retry with VNPAY
      }).unwrap();

      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (err) {
      console.error('Failed to retry payment', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PaymentResultCard
        status={status}
        bookingCode={orderCode}
        transactionId={transactionNo}
        amount={amount}
        onRetry={status !== 'SUCCESS' ? handleRetryPayment : undefined}
        isRetrying={isRetrying}
      />
    </Container>
  );
};
