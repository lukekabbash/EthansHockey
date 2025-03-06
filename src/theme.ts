import { createTheme } from '@mui/material/styles';

// Nashville Predators color scheme
const predatorsColors = {
  gold: '#FFB81C',
  navy: '#041E42',
  silver: '#8A8D8F',
  white: '#FFFFFF',
  goldLight: '#FFCF5F',
  navyDark: '#031126',
};

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: predatorsColors.gold,
      dark: predatorsColors.goldLight,
      contrastText: predatorsColors.navy,
    },
    secondary: {
      main: predatorsColors.navy,
      dark: predatorsColors.navyDark,
      contrastText: predatorsColors.white,
    },
    background: {
      default: '#f5f5f5',
      paper: predatorsColors.white,
    },
    text: {
      primary: predatorsColors.navy,
      secondary: predatorsColors.silver,
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: predatorsColors.goldLight,
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: predatorsColors.navyDark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme; 