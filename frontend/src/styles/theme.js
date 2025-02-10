// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB6C1',       // Soft pink
      light: '#FFE5E9',      // Very light pink
      dark: '#FF8FA3',       // Medium pink
      contrastText: '#FFF',
    },
    secondary: {
      main: '#6C5B7B',       // Mauve accent
      contrastText: '#FFF',
    },
    background: {
      default: '#FFFFFF',     // Pure white
      paper: '#FFF5F7',       // Subtle pink
    },
    text: {
      primary: '#2E2E2E',     // Dark gray
      secondary: '#5D5D5D',   // Medium gray
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '4rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 32px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
});

export default theme;