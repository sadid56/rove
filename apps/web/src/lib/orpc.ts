import { createORPCClient, type ClientContext, type ClientLink } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppContract, ContractRouterClient } from "@repo/contract";
import { getRpcUrl } from "./env";

function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

const rawLink = new RPCLink({
  url: () => getRpcUrl(),
  headers: (options) => {
    return (options?.context as any)?.headers || {};
  },
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  },
});

export const link: ClientLink<ClientContext> = {
  call: (path: readonly string[], input: unknown, options: any) => {
    const kebabPath = path.map(toKebabCase);
    return rawLink.call(kebabPath, input, options);
  },
};

export const orpcClient: ContractRouterClient<AppContract> = createORPCClient(link);
export const client = orpcClient;
export const api = orpcClient;

export const orpc = createTanstackQueryUtils(orpcClient);
