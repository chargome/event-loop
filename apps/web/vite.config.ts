import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  // Log environment variables for debugging
  define: {
    __BUILD_TIME_ENV_CHECK__: JSON.stringify({
      hasClerkKey: !!process.env.VITE_CLERK_PUBLISHABLE_KEY,
      hasApiUrl: !!process.env.VITE_API_URL,
      nodeEnv: process.env.NODE_ENV,
      cfPages: !!process.env.CF_PAGES,
    }),
  },
});
