import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, createSession, getPublicOrigin, getReturnPath, isAccessConfigured, isPasswordCorrect } from "../../../lib/letter-access";

export async function POST(request: NextRequest) {
  const origin = getPublicOrigin(request);
  if (!origin || request.headers.get("origin") !== origin) {
    return new NextResponse(null, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const destination = getReturnPath(form.get("returnTo"));
  const error = !isAccessConfigured() ? "unavailable" : !isPasswordCorrect(form.get("password")) ? "wrong" : null;
  const url = new URL(error ? "/unlock" : destination, origin);
  if (error) {
    url.searchParams.set("error", error);
    url.searchParams.set("next", destination);
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
