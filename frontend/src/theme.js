import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C4DFF' }, // Purple
    secondary: { main: '#00E5FF' }, // Cyan
    background: { default: '#0A1929', paper: '#001E3C' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.05em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
  },
});

export default theme;