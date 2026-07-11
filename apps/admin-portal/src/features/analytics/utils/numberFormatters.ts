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
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format percentage without sign
 */
export const formatPercentageUnsigned = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with compact notation (K, M, B)
 */
export const formatCompactNumber = (value: number, prefix = ''): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}${prefix}${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${prefix}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${prefix}${abs.toFixed(0)}`;
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
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format file size in bytes to human-readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};
