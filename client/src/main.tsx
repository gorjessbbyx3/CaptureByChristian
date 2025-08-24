import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://bf097726307dc7442c13793f2434940d@o4509900392497152.ingest.us.sentry.io/4509900454166528",
  enabled: import.meta.env.PROD,
  sendDefaultPii: true,
});

createRoot(document.getElementById("root")!).render(<App />);
