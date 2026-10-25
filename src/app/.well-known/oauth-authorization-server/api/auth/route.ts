import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { auth } from "~/server/auth";

/** RFC 8414 metadata for the issuer (better-auth's base URL, /api/auth), which clients look up at the origin's root. */
export const GET = oauthProviderAuthServerMetadata(auth);
