import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./app/App.jsx";
import "./styles/index.css";
import { AuthProvider } from "./app/context/AuthContext.jsx"; 

// Only report to Sentry in production, and only if a DSN is actually
// configured — keeps local dev quiet and avoids crashing on a missing env var.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (import.meta.env.MODE === 'production' && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    // Keep this light for now — no session replay / performance tracing yet,
    // just error capture. Can be expanded later once the basics are proven out.
    integrations: [],
    tracesSampleRate: 0,
  });
}

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);