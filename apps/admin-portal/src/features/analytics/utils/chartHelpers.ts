/**
 * ECharts Helper Utilities
 * Common option builders for line, bar, pie, area, heatmap, etc.
 */
import type { EChartsOption } from 'echarts';
import { getBaseChartOption, CHART_COLORS } from '../constants/chartTheme';
import { formatCurrency, formatCompactNumber, formatPercentageUnsigned } from './numberFormatters';

type ThemeMode = 'light' | 'dark';

/**
 * Build a line chart option
 */
export const buildLineChartOption = (
  mode: ThemeMode,
  categories: string[],
  series: { name: string; data: number[]; color?: string; areaStyle?: boolean }[],
  valueFormat: 'currency' | 'number' | 'percentage' = 'number'
): EChartsOption => {
  const base = getBaseChartOption(mode);
  return {
    ...base,
    xAxis: {
      ...base.xAxis,
      type: 'category',
      data: categories,
      boundaryGap: false,
    },
    yAxis: {
      ...base.yAxis,
      type: 'value',
      axisLabel: {
        ...base.yAxis.axisLabel,
        formatter: (val: number) => formatAxisValue(val, valueFormat),
      },
    },
    series: series.map((s, i) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      itemStyle: {
        color: s.color || CHART_COLORS[i % CHART_COLORS.length],
      },
      lineStyle: {
        width: 2.5,
      },
      areaStyle: s.areaStyle
        ? {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${s.color || CHART_COLORS[i % CHART_COLORS.length]}33` },
                { offset: 1, color: `${s.color || CHART_COLORS[i % CHART_COLORS.length]}05` },
              ],
            },
          }
        : undefined,
      emphasis: {
        focus: 'series' as const,
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
      },
    })),
    tooltip: {
      ...base.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: 'rgba(0,0,0,0.1)' } },
    },
  };
};

/**
 * Build a bar chart option
 */
export const buildBarChartOption = (
  mode: ThemeMode,
  categories: string[],
  series: { name: string; data: number[]; color?: string }[],
  horizontal = false,
  valueFormat: 'currency' | 'number' | 'percentage' = 'number'
): EChartsOption => {
  const base = getBaseChartOption(mode);
  const categoryAxis = {
    ...base.xAxis,
    type: 'category' as const,
    data: categories,
  };
  const valueAxis = {
    ...base.yAxis,
    type: 'value' as const,
    axisLabel: {
      ...base.yAxis.axisLabel,
      formatter: (val: number) => formatAxisValue(val, valueFormat),
    },
  };

  return {
    ...base,
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: series.map((s, i) => ({
      name: s.name,
      type: 'bar' as const,
      data: s.data,
      barMaxWidth: 32,
      itemStyle: {
        color: s.color || CHART_COLORS[i % CHART_COLORS.length],
        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
      },
    })),
    tooltip: {
      ...base.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
  };
};

/**
 * Build a pie/donut chart option
 */
export const buildPieChartOption = (
  mode: ThemeMode,
  data: { name: string; value: number }[],
  donut = true,
  valueFormat: 'currency' | 'number' | 'percentage' = 'number'
): EChartsOption => {
  const base = getBaseChartOption(mode);
  return {
    ...base,
    grid: undefined,
    xAxis: undefined,
    yAxis: undefined,
    series: [
      {
        type: 'pie' as const,
        radius: donut ? ['45%', '72%'] : ['0%', '72%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        padAngle: donut ? 2 : 0,
        itemStyle: {
          borderRadius: donut ? 6 : 0,
          borderColor: mode === 'dark' ? '#141c2e' : '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params: any) =>
            `${params.name}\n${params.percent}%`,
          fontSize: 11,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold' as const },
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        data: data.map((d, i) => ({
          ...d,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
      },
    ],
    tooltip: {
      ...base.tooltip,
      trigger: 'item',
      formatter: (params: any) => {
        const formatted = formatTooltipValue(params.value as number, valueFormat);
        return `${params.name}<br/>${formatted} (${params.percent}%)`;
      },
    },
  };
};

/**
 * Build a heatmap chart option
 */
export const buildHeatmapOption = (
  mode: ThemeMode,
  xLabels: string[],
  yLabels: string[],
  data: [number, number, number][]
): EChartsOption => {
  const base = getBaseChartOption(mode);
  const maxValue = Math.max(...data.map((d) => d[2]));

  return {
    ...base,
    grid: { left: 80, right: 40, top: 20, bottom: 60, containLabel: false },
    xAxis: {
      ...base.xAxis,
      type: 'category',
      data: xLabels,
      splitArea: { show: true },
    },
    yAxis: {
      ...base.yAxis,
      type: 'category',
      data: yLabels,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: 0,
      inRange: {
        color: mode === 'dark'
          ? ['#0c1222', '#0d948820', '#0d948850', '#0d948890', '#0d9488']
          : ['#f0fdfa', '#ccfbf1', '#5eead4', '#14b8a6', '#0d9488'],
      },
      textStyle: { color: base.textStyle.color },
    },
    series: [
      {
        type: 'heatmap' as const,
        data,
        label: {
          show: true,
          fontSize: 10,
          color: mode === 'dark' ? '#e2e8f0' : '#1e293b',
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      },
    ],
    tooltip: {
      ...base.tooltip,
      position: 'top',
    },
  };
};

/**
 * Build a gauge chart option (for utilization, occupancy)
 */
export const buildGaugeOption = (
  mode: ThemeMode,
  value: number,
  title: string,
  color?: string
): EChartsOption => {
  const base = getBaseChartOption(mode);
  const gaugeColor = color || CHART_COLORS[0];

  return {
    ...base,
    grid: undefined,
    xAxis: undefined,
    yAxis: undefined,
    series: [
      {
        type: 'gauge' as const,
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: '90%',
        progress: {
          show: true,
          width: 14,
          roundCap: true,
          itemStyle: { color: gaugeColor },
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [[1, mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)']],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: {
          offsetCenter: [0, '70%'],
          fontSize: 12,
          fontWeight: 500,
          color: base.textStyle.color,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '0%'],
          fontSize: 28,
          fontWeight: 800,
          formatter: '{value}%',
          color: base.textStyle.color,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        data: [{ value, name: title }],
      },
    ],
  };
};

/**
 * Format values for axis labels
 */
const formatAxisValue = (
  value: number,
  format: 'currency' | 'number' | 'percentage'
): string => {
  switch (format) {
    case 'currency':
      return formatCompactNumber(value, '₫');
    case 'percentage':
      return `${value}%`;
    case 'number':
      return formatCompactNumber(value);
    default:
      return String(value);
  }
};

/**
 * Format values for tooltip display
 */
const formatTooltipValue = (
  value: number,
  format: 'currency' | 'number' | 'percentage'
): string => {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentageUnsigned(value);
    case 'number':
      return new Intl.NumberFormat('vi-VN').format(value);
    default:
      return String(value);
  }
};
