import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// In development, Vite proxies /api → http://localhost:5000
// so we don't need a base URL (requests go to same origin).
// In production, set VITE_API_URL to your deployed backend URL.
const apiUrl = import.meta.env.VITE_API_URL ?? "";
setBaseUrl(apiUrl || null);

createRoot(document.getElementById("root")!).render(<App />);
