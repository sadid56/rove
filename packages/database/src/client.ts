import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL, sanitizeDatabaseUrl } from "@repo/config";
import * as schema from "./schema/index";

const connectionUri = sanitizeDatabaseUrl(DATABASE_URL);

if (!connectionUri) {
  throw new Error("DATABASE_URL environment variable is required. Add it to .env at the monorepo root.");
}

const client = postgres(connectionUri, {
  prepare: false,
  ssl: "require",
  max: 10
});



export const db = drizzle(client, { schema });
export type Database = typeof db;
