import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "~/server/auth";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.search.slice(1);
  const { secret } = await auth.$context;

  if (!(await verifyOAuthQueryParams(query, secret))) {
    return new Response(
      "This sign in link is invalid or has expired. Start connecting again from ChatGPT or Claude.",
      { status: 400 },
    );
  }

  const response = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/",
      // read by the oauth-provider plugin's hook, which isn't part of this endpoint's body type
      ...{ oauth_query: query },
    },
    headers: request.headers,
    asResponse: true,
  });
  const { url } = (await response.json()) as { url?: string };

  if (!response.ok || !url) {
    return new Response(
      "Couldn't start signing in with Google. Start connecting again from ChatGPT or Claude.",
      { status: 400 },
    );
  }

  const redirect = NextResponse.redirect(url, 302);
  for (const cookie of response.headers.getSetCookie()) {
    redirect.headers.append("set-cookie", cookie);
  }
  return redirect;
}
