import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000", "http://localhost:4000", process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL].filter(
    Boolean,
  ) as string[],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  basePath: "/api/v1/auth",
});
