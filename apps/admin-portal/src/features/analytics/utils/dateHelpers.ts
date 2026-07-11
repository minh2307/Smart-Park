/**
 * Date Helper Utilities
 * Period calculations, date range presets, comparison logic
 */
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangePreset {
  key: string;
  label: string;
  getRange: () => DateRange;
}

/**
 * Predefined date range presets
 */
export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    key: 'today',
    label: 'Hôm nay',
    getRange: () => ({
      startDate: dayjs().startOf('day').toISOString(),
      endDate: dayjs().endOf('day').toISOString(),
    }),
  },
  {
    key: 'yesterday',
    label: 'Hôm qua',
    getRange: () => ({
      startDate: dayjs().subtract(1, 'day').startOf('day').toISOString(),
      endDate: dayjs().subtract(1, 'day').endOf('day').toISOString(),
    }),
  },
  {
    key: 'last7days',
    label: '7 ngày qua',
    getRange: () => ({
      startDate: dayjs().subtract(6, 'day').startOf('day').toISOString(),
      endDate: dayjs().endOf('day').toISOString(),
    }),
  },
  {
    key: 'last30days',
    label: '30 ngày qua',
    getRange: () => ({
      startDate: dayjs().subtract(29, 'day').startOf('day').toISOString(),
      endDate: dayjs().endOf('day').toISOString(),
    }),
  },
  {
    key: 'thisWeek',
    label: 'Tuần này',
    getRange: () => ({
      startDate: dayjs().startOf('isoWeek').toISOString(),
      endDate: dayjs().endOf('isoWeek').toISOString(),
    }),
  },
  {
    key: 'lastWeek',
    label: 'Tuần trước',
    getRange: () => ({
      startDate: dayjs().subtract(1, 'week').startOf('isoWeek').toISOString(),
      endDate: dayjs().subtract(1, 'week').endOf('isoWeek').toISOString(),
    }),
  },
  {
    key: 'thisMonth',
    label: 'Tháng này',
    getRange: () => ({
      startDate: dayjs().startOf('month').toISOString(),
      endDate: dayjs().endOf('month').toISOString(),
    }),
  },
  {
    key: 'lastMonth',
    label: 'Tháng trước',
    getRange: () => ({
      startDate: dayjs().subtract(1, 'month').startOf('month').toISOString(),
      endDate: dayjs().subtract(1, 'month').endOf('month').toISOString(),
    }),
  },
  {
    key: 'thisQuarter',
    label: 'Quý này',
    getRange: () => ({
      startDate: dayjs().startOf('quarter').toISOString(),
      endDate: dayjs().endOf('quarter').toISOString(),
    }),
  },
  {
    key: 'lastQuarter',
    label: 'Quý trước',
    getRange: () => ({
      startDate: dayjs().subtract(1, 'quarter').startOf('quarter').toISOString(),
      endDate: dayjs().subtract(1, 'quarter').endOf('quarter').toISOString(),
    }),
  },
  {
    key: 'thisYear',
    label: 'Năm nay',
    getRange: () => ({
      startDate: dayjs().startOf('year').toISOString(),
      endDate: dayjs().endOf('year').toISOString(),
    }),
  },
  {
    key: 'lastYear',
    label: 'Năm ngoái',
    getRange: () => ({
      startDate: dayjs().subtract(1, 'year').startOf('year').toISOString(),
      endDate: dayjs().subtract(1, 'year').endOf('year').toISOString(),
    }),
  },
];

/**
 * Calculate the previous comparison period
 */
export const getPreviousPeriod = (range: DateRange): DateRange => {
  const start = dayjs(range.startDate);
  const end = dayjs(range.endDate);
  const diffDays = end.diff(start, 'day');

  return {
    startDate: start.subtract(diffDays + 1, 'day').toISOString(),
    endDate: start.subtract(1, 'day').toISOString(),
  };
};

/**
 * Calculate the same period last year for year-over-year comparison
 */
export const getSamePeriodLastYear = (range: DateRange): DateRange => {
  return {
    startDate: dayjs(range.startDate).subtract(1, 'year').toISOString(),
    endDate: dayjs(range.endDate).subtract(1, 'year').toISOString(),
  };
};

/**
 * Format a date for display in charts
 */
export const formatChartDate = (
  date: string,
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year'
): string => {
  const d = dayjs(date);
  switch (groupBy) {
    case 'day':
      return d.format('DD/MM');
    case 'week':
      return `W${d.isoWeek()}`;
    case 'month':
      return d.format('MM/YYYY');
    case 'quarter':
      return `Q${d.quarter()} ${d.year()}`;
    case 'year':
      return d.format('YYYY');
    default:
      return d.format('DD/MM/YYYY');
  }
};

/**
 * Get human-readable label for a date range
 */
export const getDateRangeLabel = (range: DateRange): string => {
  const start = dayjs(range.startDate);
  const end = dayjs(range.endDate);

  if (start.isSame(end, 'day')) {
    return start.format('DD/MM/YYYY');
  }

  return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
};

/**
 * Generate array of dates between two dates for chart x-axis
 */
export const generateDateRange = (
  start: string | Dayjs,
  end: string | Dayjs,
  groupBy: 'day' | 'week' | 'month' = 'day'
): string[] => {
  const dates: string[] = [];
  let current = dayjs(start).startOf(groupBy === 'week' ? 'isoWeek' : groupBy);
  const endDate = dayjs(end);

  while (current.isBefore(endDate) || current.isSame(endDate, groupBy)) {
    dates.push(current.toISOString());
    current = current.add(1, groupBy);
  }

  return dates;
};
