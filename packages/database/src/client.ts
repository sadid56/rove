import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import * as schema from "./schema/index";

// Load .env from the database package root (works regardless of which app imports this)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Add it to packages/database/.env");
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: "require",
  max: 10
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
