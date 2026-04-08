import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { palette } from './palette'

let theme = createTheme({
  palette: {
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    background: palette.background,
    text: palette.text,
    divider: palette.divider,
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },

    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: palette.text.secondary,
    },

    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },

    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  spacing: 8,

  shape: {
    borderRadius: 6,
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 6,
          border: `1px solid ${palette.divider}`,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        },

        contained: {
          backgroundColor: palette.primary.main,
          boxShadow: `0 2px 6px ${palette.primary.main}26`, // Adjusted shadow for blue
          '&:hover': {
            backgroundColor: palette.primary.dark,
            boxShadow: `0 3px 8px ${palette.primary.dark}26`, // Adjusted shadow for blue
          },
        },

        outlined: {
          borderColor: palette.divider,
          color: palette.text.primary,
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: `${palette.primary.main}08`,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            fontSize: '1rem',

            '& input, & textarea': {
              fontSize: '1rem',
              padding: '12px 14px',
            },

            '& fieldset': {
              borderColor: palette.divider,
            },

            '&:hover fieldset': {
              borderColor: palette.primary.light,
            },

            '&.Mui-focused fieldset': {
              borderColor: palette.primary.main,
              boxShadow: `0 0 0 2px ${palette.primary.main}25`,
            },
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.95rem',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 16px',
          fontSize: '0.95rem',
        },

        head: {
          fontWeight: 700,
          fontSize: '1rem',
          color: palette.text.primary,
          backgroundColor: `${palette.primary.main}10`,
          borderBottom: `1px solid ${palette.primary.main}30`,
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
  },
})

theme = responsiveFontSizes(theme)

export default theme