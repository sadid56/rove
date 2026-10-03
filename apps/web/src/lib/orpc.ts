import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppContract, ContractRouterClient } from "@repo/contract";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL;
}

export const link = new RPCLink({
  url: () => `${getBaseUrl()}/rpc`,
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  },
});

export const orpcClient: ContractRouterClient<AppContract> = createORPCClient(link);
export const client = orpcClient;

export const orpc = createTanstackQueryUtils(orpcClient);

