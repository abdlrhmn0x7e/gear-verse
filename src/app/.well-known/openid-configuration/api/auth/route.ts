import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { auth } from "~/server/auth";

/** The path-inserted OpenID discovery URL some MCP clients try; /api/auth/.well-known/openid-configuration is served by better-auth itself. */
export const GET = oauthProviderOpenIdConfigMetadata(auth);
