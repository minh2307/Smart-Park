/**
 * ECharts Theme Configuration
 * Consistent with MUI palette - Teal accent, warm slate neutrals
 * Supports both light and dark mode
 */

export const CHART_COLORS = [
  '#0d9488', // Teal-600 (primary)
  '#0ea5e9', // Sky-500
  '#f59e0b', // Amber-500
  '#22c55e', // Green-500
  '#ef4444', // Red-500
  '#8b5cf6', // Violet-500
  '#f97316', // Orange-500
  '#ec4899', // Pink-500
  '#06b6d4', // Cyan-500
  '#84cc16', // Lime-500
] as const;

export const CHART_COLORS_LIGHT = [
  '#ccfbf1', // Teal-100
  '#e0f2fe', // Sky-100
  '#fef3c7', // Amber-100
  '#dcfce7', // Green-100
  '#fef2f2', // Red-100
  '#ede9fe', // Violet-100
  '#fff7ed', // Orange-100
  '#fce7f3', // Pink-100
] as const;

export interface EChartsThemeConfig {
  textColor: string;
  textSecondaryColor: string;
  axisLineColor: string;
  splitLineColor: string;
  backgroundColor: string;
  tooltipBg: string;
  tooltipBorder: string;
}

export const LIGHT_THEME_CONFIG: EChartsThemeConfig = {
  textColor: '#1e293b',
  textSecondaryColor: '#64748b',
  axisLineColor: 'rgba(148, 163, 184, 0.3)',
  splitLineColor: 'rgba(148, 163, 184, 0.12)',
  backgroundColor: 'transparent',
  tooltipBg: '#ffffff',
  tooltipBorder: 'rgba(148, 163, 184, 0.2)',
};

export const DARK_THEME_CONFIG: EChartsThemeConfig = {
  textColor: '#e2e8f0',
  textSecondaryColor: '#94a3b8',
  axisLineColor: 'rgba(148, 163, 184, 0.2)',
  splitLineColor: 'rgba(148, 163, 184, 0.08)',
  backgroundColor: 'transparent',
  tooltipBg: '#1e293b',
  tooltipBorder: 'rgba(148, 163, 184, 0.15)',
};

export const getChartThemeConfig = (mode: 'light' | 'dark'): EChartsThemeConfig => {
  return mode === 'dark' ? DARK_THEME_CONFIG : LIGHT_THEME_CONFIG;
};

/**
 * Base ECharts option builder - applies theme consistently
 */
export const getBaseChartOption = (mode: 'light' | 'dark') => {
  const theme = getChartThemeConfig(mode);
  return {
    color: [...CHART_COLORS],
    backgroundColor: theme.backgroundColor,
    textStyle: {
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: theme.textColor,
      fontSize: 12,
    },
    title: {
      textStyle: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: theme.textColor,
      },
      subtextStyle: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: 12,
        color: theme.textSecondaryColor,
      },
    },
    tooltip: {
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: theme.textColor,
        fontSize: 12,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
      extraCssText: 'border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); padding: 10px 14px;',
    },
    legend: {
      textStyle: {
        color: theme.textSecondaryColor,
        fontSize: 12,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 16,
    },
    grid: {
      left: 0,
      right: 8,
      top: 36,
      bottom: 0,
      containLabel: true,
    },
    xAxis: {
      axisLine: {
        lineStyle: { color: theme.axisLineColor },
      },
      axisTick: { show: false },
      axisLabel: {
        color: theme.textSecondaryColor,
        fontSize: 11,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
      splitLine: {
        lineStyle: { color: theme.splitLineColor },
      },
    },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: theme.textSecondaryColor,
        fontSize: 11,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
      splitLine: {
        lineStyle: {
          color: theme.splitLineColor,
          type: 'dashed' as const,
        },
      },
    },
  };
};
