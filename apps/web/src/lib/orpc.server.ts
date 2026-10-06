import { cookies } from "next/headers";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppContract, ContractRouterClient } from "@repo/contract";
import { getApiUrl } from "./env";

function toCamelCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

const rawServerLink = new RPCLink({
  url: () => `${getApiUrl()}/v1/orpc`,
  headers: async () => {
    const headers: Record<string, string> = {};
    try {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("better-auth.session_token")?.value;
      if (sessionToken) {
        headers["Cookie"] = `better-auth.session_token=${sessionToken}`;
      }
    } catch {
      // Ignored when outside active request scope (e.g. build time)
    }
    return headers;
  },
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      cache: "no-store",
    });
  },
});

export const api: ContractRouterClient<AppContract> = createORPCClient({
  call: (path: readonly string[], input: unknown, options: any) => {
    const kebabPath = path.map(toCamelCase);
    return rawServerLink.call(kebabPath, input, options);
  },
});

export const serverClient = api;
