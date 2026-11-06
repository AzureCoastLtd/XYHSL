import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, isSessionValid } from "./lib/letter-access";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = path === "/unlock" || path === "/api/unlock";
  let response: NextResponse;

  if (isPublic || isSessionValid(request.cookies.get(ACCESS_COOKIE)?.value)) {
    response = NextResponse.next();
  } else if (request.method === "GET" && (path === "/" || path === "/christmas")) {
    const destination = new URL("/unlock", request.url);
    if (path === "/christmas") destination.searchParams.set("next", path);
    response = NextResponse.redirect(destination);
  } else {
    response = new NextResponse(null, { status: 401 });
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static/|fonts/|favicon\\.ico$).*)"],
};
