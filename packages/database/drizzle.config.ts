import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "@repo/config";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for drizzle-kit");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL
  }
});

