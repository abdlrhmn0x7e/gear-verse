import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./server/auth";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Return not found if the user trying to access an admin route without proper authentication
  if (session?.user.role !== "admin" && path.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/admin/:path*",
};
