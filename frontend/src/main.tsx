import { CssBaseline } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
