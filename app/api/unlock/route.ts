import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, createSession, isAccessConfigured, isPasswordCorrect } from "../../../lib/letter-access";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new NextResponse(null, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const destination = form.get("returnTo") === "/christmas" ? "/christmas" : "/";
  const error = !isAccessConfigured() ? "unavailable" : !isPasswordCorrect(form.get("password")) ? "wrong" : null;
  const url = new URL(error ? "/unlock" : destination, request.url);
  if (error) {
    url.searchParams.set("error", error);
    if (destination !== "/") url.searchParams.set("next", destination);
  }
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  if (!error) {
    response.cookies.set(ACCESS_COOKIE, createSession(), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
    });
  }
  return response;
}
