import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { auth, isActiveAdmin } from "~/server/auth";

/**
 * Where an authorization code may be delivered without asking. Consent is given on the admin's behalf, so a client
 * someone registered with their own redirect URI must never get it silently: the code only reaches the redirect host.
 */
const trustedRedirectHosts = new Set([
  "chatgpt.com",
  "chat.openai.com",
  "claude.ai",
  "claude.com",
  ...(env.NODE_ENV !== "production" ? ["localhost", "127.0.0.1"] : []),
]);

function isTrustedRedirect(redirectUri: string | null) {
  if (!redirectUri || !URL.canParse(redirectUri)) return false;
  const { protocol, hostname } = new URL(redirectUri);
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  return (
    trustedRedirectHosts.has(hostname) &&
    (protocol === "https:" || (isLocal && protocol === "http:"))
  );
}

/** The OAuth consent page: admins connecting ChatGPT or Claude skip the consent screen, everyone else is refused. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.search.slice(1);
  const { secret } = await auth.$context;

  if (!(await verifyOAuthQueryParams(query, secret))) {
    return new Response(
      "This link is invalid or has expired. Start connecting again from ChatGPT or Claude.",
      { status: 400 },
    );
  }

  // the cookie cache could still hold a role or ban from before a change
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  });
  if (!session || !isActiveAdmin(session.user)) {
    return NextResponse.redirect(new URL("/connect/denied", request.url));
  }

  if (!isTrustedRedirect(request.nextUrl.searchParams.get("redirect_uri"))) {
    return NextResponse.redirect(
      new URL("/connect/denied?reason=client", request.url),
    );
  }

  const response = await auth.api.oauth2Consent({
    body: { accept: true, oauth_query: query },
    headers: request.headers,
    // consent finishes by running the authorize endpoint, which reads the request
    request,
    // the parsed result comes back empty; the response carries the redirect
    asResponse: true,
  });
  const { url } = (await response.json()) as { url?: string };
  if (!response.ok || !url) {
    return new Response(
      "Couldn't finish connecting. Start again from ChatGPT or Claude.",
      { status: 400 },
    );
  }

  return NextResponse.redirect(new URL(url, request.url));
}
