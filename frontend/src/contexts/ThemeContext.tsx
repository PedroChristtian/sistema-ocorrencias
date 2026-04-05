import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, type Theme } from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const ELECTRIC_INDIGO = "#6366f1";
const ELECTRIC_INDIGO_LIGHT = "#818cf8";
const ELECTRIC_INDIGO_DARK = "#4f46e5";

function buildTheme(mode: ThemeMode): Theme {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: ELECTRIC_INDIGO,
        light: ELECTRIC_INDIGO_LIGHT,
        dark: ELECTRIC_INDIGO_DARK,
      },
      secondary: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
      },
      ...(isDark
        ? {
            background: {
              default: "#0f172a",
              paper: "#1e293b",
            },
            text: {
              primary: "#e2e8f0",
              secondary: "#94a3b8",
            },
            divider: "rgba(148, 163, 184, 0.12)",
          }
        : {
            background: {
              default: "#f8fafc",
              paper: "#ffffff",
            },
            text: {
              primary: "#1e293b",
              secondary: "#64748b",
            },
          }),
      success: { main: "#10b981", light: "#34d399", dark: "#059669" },
      warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
      error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
      info: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 600, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
          "*::-webkit-scrollbar": {
            width: 8,
            height: 8,
          },
          "*::-webkit-scrollbar-track": {
            background: isDark ? "#0f172a" : "#f1f5f9",
          },
          "*::-webkit-scrollbar-thumb": {
            background: isDark
              ? "rgba(99, 102, 241, 0.3)"
              : "rgba(100, 116, 139, 0.3)",
            borderRadius: 4,
          },
          "*::-webkit-scrollbar-thumb:hover": {
            background: isDark
              ? "rgba(99, 102, 241, 0.5)"
              : "rgba(100, 116, 139, 0.5)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 16,
            ...(isDark
              ? {
                  border: "1px solid rgba(148, 163, 184, 0.08)",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
                }
              : {
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
                }),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "8px 20px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          contained: {
            background: `linear-gradient(135deg, ${ELECTRIC_INDIGO} 0%, ${ELECTRIC_INDIGO_DARK} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${ELECTRIC_INDIGO_LIGHT} 0%, ${ELECTRIC_INDIGO} 100%)`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(isDark
              ? {
                  backgroundColor: "#1e293b",
                  borderRight: "1px solid rgba(148, 163, 184, 0.08)",
                }
              : {}),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(12px)",
            ...(isDark
              ? {
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
                }
              : {
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                  color: "#1e293b",
                }),
            boxShadow: isDark
              ? "0 1px 8px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            ...(isDark
              ? { border: "1px solid rgba(148, 163, 184, 0.08)" }
              : {}),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: "2px 8px",
            "&.Mui-selected": {
              backgroundColor: isDark
                ? "rgba(99, 102, 241, 0.15)"
                : "rgba(99, 102, 241, 0.08)",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(99, 102, 241, 0.25)"
                  : "rgba(99, 102, 241, 0.12)",
              },
            },
          },
        },
      },
    },
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(
    () => (sessionStorage.getItem("theme_mode") as ThemeMode) || "dark"
  );

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      sessionStorage.setItem("theme_mode", next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}
