import { implement, ORPCError } from "@orpc/server";
import type { AnyContractProcedure } from "@orpc/contract";

export type ORPCErrorCode =
  "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_SUPPORTED" | "TIMEOUT" | "CONFLICT" | "INTERNAL_SERVER_ERROR";

export function createProcedure<TContract extends AnyContractProcedure>(
  contract: TContract,
  handler: (input: any, context?: any) => Promise<any> | any,
  defaultErrorCode: ORPCErrorCode = "BAD_REQUEST",
) {
  return (implement(contract) as any).handler(async ({ input, context }: any) => {
    try {
      return await handler(input, context);
    } catch (err: any) {
      if (err instanceof ORPCError) {
        throw err;
      }
      throw new ORPCError(defaultErrorCode, {
        message: err?.message || "Operation failed",
      });
    }
  });
}
