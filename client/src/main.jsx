import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App.jsx";
import "./index.css";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontFamily: "Assistant, Cairo, sans-serif", direction: "rtl" } }} />
        </BrowserRouter>
      </ThemeProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}