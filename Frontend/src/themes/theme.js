import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5", // Modern Indigo
      light: "#818CF8",
      dark: "#3730A3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0D9488", // Vibrant Teal
      light: "#2DD4BF",
      dark: "#0F766E",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F8FAFC", // Soft Slate Background
      paper: "#ffffff",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    error: {
      main: "#EF4444",
      light: "#FEE2E2",
    },
    success: {
      main: "#10B981",
      light: "#D1FAE5",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
    },
    info: {
      main: "#3B82F6",
      light: "#DBEAFE",
    },
  },

  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontWeight: 500 },
    body2: { fontWeight: 500 },
    button: { fontWeight: 700, textTransform: "none" },
    caption: { fontWeight: 600 },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "10px 24px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #4338CA 0%, #3730A3 100%)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation0: {
          border: "1px solid #E2E8F0",
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
        elevation2: {
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
        elevation3: {
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#F8FAFC",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "#F1F5F9",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.1)",
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #E2E8F0",
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#ffffff",
          color: "#1E293B",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: "6px",
        },
      },
    },
  },
});

export default theme;