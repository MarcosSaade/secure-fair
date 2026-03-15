import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { palette } from './palette';

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
    subtitle1: { fontSize: '1rem', fontWeight: 500, color: palette.text.secondary },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  spacing: 8,
  shape: {
    borderRadius: 6, // Less rounded (was 12)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(27, 95, 145, 0.2)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(27, 95, 145, 0.15)',
          backgroundColor: palette.primary.light, // Lighter blue
          '&:hover': {
            backgroundColor: palette.primary.main,
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
      defaultProps: {
        disableElevation: false,
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
            '&:hover fieldset': {
              borderColor: palette.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary.main,
              boxShadow: `0 0 0 3px ${palette.primary.main}20`,
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            fontSize: '1rem',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 6,
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
          padding: '14px 16px', // Larger padding
          fontSize: '0.95rem',
        },
        head: {
          fontWeight: 700,
          fontSize: '1rem',
          backgroundColor: `${palette.primary.light}20`,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& thead th': {
            fontWeight: 700,
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;