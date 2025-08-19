import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./db/migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // this runs in node, not deno
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    url: process.env.DATABASE_URL!,
  },
});
