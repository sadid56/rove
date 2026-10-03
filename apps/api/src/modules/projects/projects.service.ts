import { db, QueryBuilder } from "@repo/database";
import { projects } from "@repo/database/schema";
import { eq, desc } from "drizzle-orm";
import type { CreateProjectInput } from "@repo/contract";

export class ProjectsService {
  async create(input: CreateProjectInput) {
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

  async list(query?: { search?: string; page?: number; pageSize?: number }) {
    if (query?.page || query?.search) {
      return QueryBuilder.from(db, projects)
        .search(query.search, [projects.name, projects.url])
        .orderBy(desc(projects.createdAt))
        .paginate({ page: query.page, pageSize: query.pageSize })
        .execute();
    }
    return QueryBuilder.from(db, projects)
      .orderBy(desc(projects.createdAt))
      .findMany();
  }

  async findById(id: string) {
    return QueryBuilder.from(db, projects)
      .where(eq(projects.id, id))
      .findFirst();
  }

  async delete(id: string) {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
}

export const projectsService = new ProjectsService();
