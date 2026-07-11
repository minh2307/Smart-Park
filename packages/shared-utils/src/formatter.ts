import dayjs from 'dayjs';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const formatDate = (date: string | Date | number, formatStr = 'DD/MM/YYYY'): string => {
  if (!date) return '';
  return dayjs(date).format(formatStr);
};

export const formatDateTime = (date: string | Date | number, formatStr = 'DD/MM/YYYY HH:mm'): string => {
  if (!date) return '';
  return dayjs(date).format(formatStr);
};
