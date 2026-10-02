import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "@/server/router";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const link = new RPCLink({
  url: () => `${getBaseUrl()}/rpc`,
});

export const orpcClient: RouterClient<AppRouter> = createORPCClient(link);
export const client = orpcClient as any;

export const orpc = createTanstackQueryUtils(orpcClient);
