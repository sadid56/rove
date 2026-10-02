import { db } from "@repo/database";
import { projects } from "@repo/database/schema";
import { eq, desc } from "drizzle-orm";
import type { CreateProjectInput } from "./projects.schemas";

export class ProjectsService {
  async create(input: {
    name: string;
    baseUrl: string;
    crawlerConfig?: {
      maxPages?: number;
      sameOrigin?: boolean;
      respectRobots?: boolean;
      excludedPaths?: string[];
      maxConcurrency?: number;
    };
  }) {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const [created] = await db
      .insert(projects)
      .values({
        name: input.name,
        url: input.baseUrl,
        slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
        crawlerConfig: input.crawlerConfig ?? {
          maxPages: 200,
          sameOrigin: true,
          respectRobots: true,
          excludedPaths: []
        }
      })
      .returning();

    return created;
  }

  async list() {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async findById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project ?? null;
  }

  async delete(id: string) {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
}

export const projectsService = new ProjectsService();
