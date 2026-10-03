import {
  SQL,
  and,
  or,
  count,
  ilike,
  asc,
  desc,
  type SQLWrapper,
} from "drizzle-orm";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";
import type { Database } from "./client";

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class QueryBuilder<TTable extends PgTable, TItem = TTable["$inferSelect"]> {
  private conditions: (SQL | SQLWrapper | undefined)[] = [];
  private orderClauses: (SQL | PgColumn)[] = [];
  private pageNumber: number = 1;
  private limitNumber: number = 10;
  private isPaginated: boolean = false;

  constructor(
    private readonly db: Database,
    private readonly table: TTable
  ) {}

  static from<TTable extends PgTable>(db: Database, table: TTable) {
    return new QueryBuilder(db, table);
  }

  where(condition: SQL | SQLWrapper | undefined | null | false): this {
    if (condition) {
      this.conditions.push(condition);
    }
    return this;
  }

  whereIf(
    test: boolean | undefined | null,
    condition: SQL | SQLWrapper | (() => SQL | SQLWrapper | undefined | null)
  ): this {
    if (test) {
      const resolved = typeof condition === "function" ? condition() : condition;
      if (resolved) {
        this.conditions.push(resolved);
      }
    }
    return this;
  }

  search(query: string | undefined | null, columns: PgColumn[]): this {
    const trimmed = query?.trim();
    if (!trimmed || columns.length === 0) {
      return this;
    }

    const searchPattern = `%${trimmed}%`;
    const searchConditions = columns.map((col) => ilike(col, searchPattern));

    if (searchConditions.length === 1) {
      this.conditions.push(searchConditions[0]);
    } else {
      this.conditions.push(or(...searchConditions));
    }

    return this;
  }

  paginate(options?: PaginationOptions): this {
    this.isPaginated = true;
    this.pageNumber = Math.max(1, Number(options?.page ?? 1));
    this.limitNumber = Math.max(1, Math.min(100, Number(options?.pageSize ?? 10)));
    return this;
  }

  orderBy(...orders: (SQL | PgColumn | undefined | null)[]): this {
    for (const order of orders) {
      if (order) {
        this.orderClauses.push(order);
      }
    }
    return this;
  }

  sort(column: PgColumn, direction: "asc" | "desc" = "asc"): this {
    this.orderClauses.push(direction === "desc" ? desc(column) : asc(column));
    return this;
  }

  private getWhereClause(): SQL | undefined {
    const validConditions = this.conditions.filter(Boolean) as (SQL | SQLWrapper)[];
    if (validConditions.length === 0) return undefined;
    if (validConditions.length === 1) return validConditions[0] as SQL;
    return and(...validConditions);
  }

  async count(): Promise<number> {
    const whereClause = this.getWhereClause();
    const [result] = await (this.db as any)
      .select({ count: count() })
      .from(this.table)
      .where(whereClause);

    return Number(result?.count || 0);
  }

  async execute(): Promise<PaginatedResult<TItem>> {
    const whereClause = this.getWhereClause();
    const offset = (this.pageNumber - 1) * this.limitNumber;

    const [totalCount, items] = await Promise.all([
      this.count(),
      (async () => {
        let query = (this.db as any).select().from(this.table);

        if (whereClause) {
          query = query.where(whereClause);
        }

        if (this.orderClauses.length > 0) {
          query = query.orderBy(...this.orderClauses);
        }

        if (this.isPaginated) {
          query = query.limit(this.limitNumber).offset(offset);
        }

        return (await query) as TItem[];
      })(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / this.limitNumber));

    return {
      items,
      totalCount,
      page: this.pageNumber,
      pageSize: this.limitNumber,
      totalPages,
      hasNextPage: this.pageNumber < totalPages,
      hasPreviousPage: this.pageNumber > 1,
    };
  }

  async findMany(): Promise<TItem[]> {
    const whereClause = this.getWhereClause();
    let query = (this.db as any).select().from(this.table);

    if (whereClause) {
      query = query.where(whereClause);
    }

    if (this.orderClauses.length > 0) {
      query = query.orderBy(...this.orderClauses);
    }

    return (await query) as TItem[];
  }

  async findFirst(): Promise<TItem | null> {
    const whereClause = this.getWhereClause();
    let query = (this.db as any).select().from(this.table).limit(1);

    if (whereClause) {
      query = query.where(whereClause);
    }

    if (this.orderClauses.length > 0) {
      query = query.orderBy(...this.orderClauses);
    }

    const [item] = await query;
    return (item as TItem) ?? null;
  }
}
