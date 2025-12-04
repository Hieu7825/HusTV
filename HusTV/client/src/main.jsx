// client/src/main.jsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.jsx";
import "./index.css";

// ✅ Get Clerk Publishable Key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ✅ Validate Clerk key exists
if (!PUBLISHABLE_KEY) {
  console.error("❌ Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
  throw new Error("Missing Publishable Key");
}

// ✅ Log initialization (only in development)
if (import.meta.env.DEV) {
  console.log("🚀 Initializing HusTV Client...");
  console.log("📦 Clerk Key:", PUBLISHABLE_KEY.substring(0, 20) + "...");
}

// ✅ Removed StrictMode to prevent double API calls in development
createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);
