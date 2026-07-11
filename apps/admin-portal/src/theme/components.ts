import { Components, Theme } from '@mui/material/styles';

/**
 * Smart Park — Global MUI component overrides
 * Consistent border-radius hierarchy: inner 8px, outer 12px, card 16px
 * Smooth transitions on all interactive states
 * Focus-visible rings for accessibility
 */
export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontVariantNumeric: 'tabular-nums',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    },
  },

  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        textTransform: 'none' as const,
        fontWeight: 600,
        padding: '8px 20px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:active': {
          transform: 'scale(0.98)',
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
      sizeLarge: {
        padding: '12px 28px',
        fontSize: '0.9375rem',
      },
      sizeSmall: {
        padding: '5px 14px',
        fontSize: '0.8125rem',
        borderRadius: 8,
      },
      containedPrimary: ({ theme }) => ({
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        },
      }),
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light,
        },
      }),
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
  },

  MuiCard: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 16,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: theme.shadows[3],
        },
      }),
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove default MUI paper gradient in dark mode
      },
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
        borderRadius: 14,
      }),
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: theme.palette.primary.main,
          },
        },
      }),
    },
  },

  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
      },
      sizeSmall: {
        height: 24,
        fontSize: '0.6875rem',
      },
    },
  },

  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: ({ theme }) => ({
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '6px 12px',
        backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#334155',
      }),
      arrow: ({ theme }) => ({
        color: theme.palette.mode === 'dark' ? '#1e293b' : '#334155',
      }),
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 20,
        boxShadow: theme.shadows[5],
      }),
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.125rem',
        fontWeight: 700,
        padding: '20px 24px 12px',
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none',
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiTableCell-head': {
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(0,0,0,0.02)',
          borderBottom: `2px solid ${theme.palette.divider}`,
          padding: '12px 16px',
        },
      }),
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '12px 16px',
        fontSize: '0.8125rem',
      }),
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:last-child td': {
          borderBottom: 0,
        },
      }),
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        borderRadius: 10,  // Squircle instead of circle — less generic
        fontWeight: 700,
        fontSize: '0.8125rem',
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        fontWeight: 500,
      },
      standardSuccess: ({ theme }) => ({
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark,
      }),
      standardError: ({ theme }) => ({
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.dark,
      }),
      standardWarning: ({ theme }) => ({
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.dark,
      }),
      standardInfo: ({ theme }) => ({
        backgroundColor: theme.palette.info.light,
        color: theme.palette.info.dark,
      }),
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        height: 3,
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 14,
        boxShadow: theme.shadows[4],
        border: `1px solid ${theme.palette.divider}`,
        marginTop: 4,
      }),
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '2px 6px',
        padding: '8px 12px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        transition: 'background-color 0.15s ease',
      },
    },
  },

  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        fontSize: '0.8125rem',
      },
    },
  },

  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 700,
        fontSize: '0.625rem',
        minWidth: 18,
        height: 18,
        borderRadius: 6,
      },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  MuiTablePagination: {
    styleOverrides: {
      root: {
        fontSize: '0.8125rem',
      },
      selectLabel: {
        fontSize: '0.8125rem',
      },
      displayedRows: {
        fontSize: '0.8125rem',
      },
    },
  },

  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};
