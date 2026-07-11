/**
 * Number Formatting Utilities
 * Currency (VND), percentages, compact numbers for dashboard display
 */

/**
 * Format a number as Vietnamese Dong currency
 */
export const formatCurrency = (value: number, compact = false): string => {
  if (compact) {
    return formatCompactNumber(value, '₫');
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a number as a percentage string
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals).replace('.', ',')}%`;
};

/**
 * Format percentage without sign
 */
export const formatPercentageUnsigned = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals).replace('.', ',')}%`;
};

/**
 * Format large numbers with compact notation (K, M, B)
 */
export const formatCompactNumber = (value: number, suffix = ''): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Use Vietnamese decimal separator (,) instead of (.) for toFixed results
  const formatVal = (val: number) => val.toFixed(1).replace('.', ',');

  if (abs >= 1_000_000_000) {
    return `${sign}${formatVal(abs / 1_000_000_000)} Tỷ${suffix ? ' ' + suffix : ''}`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${formatVal(abs / 1_000_000)} Tr${suffix ? ' ' + suffix : ''}`;
  }
  if (abs >= 1_000) {
    return `${sign}${formatVal(abs / 1_000)} N${suffix ? ' ' + suffix : ''}`;
  }
  return `${sign}${abs.toFixed(0)}${suffix ? ' ' + suffix : ''}`;
};

/**
 * Format a plain number with thousand separators
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format based on KPI type
 */
export const formatKpiValue = (

  value: number,
  format: 'currency' | 'number' | 'percentage',
  compact = true
): string => {
  switch (format) {
    case 'currency':
      return formatCurrency(value, compact);
    case 'percentage':
      return formatPercentageUnsigned(value);
    case 'number':
      return compact ? formatCompactNumber(value) : formatNumber(value);
    default:
      return String(value);
  }
};

/**
 * Format duration in minutes to human-readable
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

/**
 * Format file size in bytes to human-readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1).replace('.', ',')} ${units[i]}`;
};
