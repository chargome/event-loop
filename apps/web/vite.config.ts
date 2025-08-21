import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Validate required environment variables
function validateEnvVars() {
  const required = ["VITE_CLERK_PUBLISHABLE_KEY", "VITE_API_URL"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Build failed: Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\n💡 Set these in Cloudflare Pages:");
    console.error(
      "   Dashboard → Pages → Your Site → Settings → Environment Variables"
    );
    console.error("   Or use: wrangler pages secret put <KEY>");
    process.exit(1);
  }

  console.log("✅ All required environment variables are present");
}

export default defineConfig({
  plugins: [
    {
      name: "validate-env",
      configResolved() {
        // Only validate when VALIDATE_ENV is set (for production builds)
        if (process.env.VALIDATE_ENV === "true") {
          validateEnvVars();
        }
      },
    },
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
});
