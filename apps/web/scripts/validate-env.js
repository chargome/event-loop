#!/usr/bin/env node

/**
 * Validates that all required environment variables are present before build
 */

const requiredEnvVars = ["VITE_CLERK_PUBLISHABLE_KEY", "VITE_API_URL"];

console.log("🔍 Validating environment variables...");

const missing = requiredEnvVars.filter((key) => {
  const value = process.env[key];
  return !value || value.trim() === "";
});

if (missing.length > 0) {
  console.error("\n❌ Build failed: Missing required environment variables:");
  missing.forEach((key) => {
    console.error(`   - ${key}`);
  });

  console.error("\n💡 How to fix this in Cloudflare Pages:");
  console.error("\n📋 Via Cloudflare Dashboard:");
  console.error("   1. Go to Cloudflare Dashboard → Pages");
  console.error("   2. Select your site → Settings → Environment variables");
  console.error("   3. Add the missing variables for Production environment");

  console.error("\n🔧 Via Wrangler CLI:");
  missing.forEach((key) => {
    console.error(`   wrangler pages secret put ${key}`);
  });

  console.error("\n📝 Expected values:");
  console.error(
    "   VITE_CLERK_PUBLISHABLE_KEY: pk_test_... (from Clerk Dashboard)"
  );
  console.error(
    "   VITE_API_URL: https://event-loop-api.your-subdomain.workers.dev"
  );

  console.error("\n🔄 After setting variables, redeploy your Pages site.");

  process.exit(1);
}

console.log("✅ All required environment variables are present!");
console.log("🚀 Proceeding with build...");
