import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  slug: text("slug").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  crawlerConfig: jsonb("crawler_config").$type<{
    maxPages?: number;
    respectRobots?: boolean;
    sameOrigin?: boolean;
    excludedPaths?: string[];
  }>().default({
    maxPages: 100,
    respectRobots: true,
    sameOrigin: true,
    excludedPaths: []
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
