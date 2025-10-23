import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieCache } from "better-auth/cookies";
import { notFound } from "next/navigation";

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await getCookieCache(req);

  // Return not found if the user trying to access an admin route without proper authentication
  if (session?.user.role !== "admin" && path.startsWith("/admin")) {
    return notFound();
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
