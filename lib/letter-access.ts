import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE = "letter_access";
export const SESSION_SECONDS = 12 * 60 * 60;

export function getPublicOrigin(request: Pick<Request, "url" | "headers">) {
  const host = request.headers.get("host");
  if (!host) return null;
  try {
    const protocol = new URL(request.url).protocol;
    if (protocol !== "http:" && protocol !== "https:") return null;
    const origin = new URL(`${protocol}//${host}`);
    if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return null;
    return origin.origin;
  } catch {
    return null;
  }
}

export function isAccessConfigured() {
  return /^\d{8}$/.test(process.env.LETTER_PASSWORD ?? "")
    && Buffer.byteLength(process.env.LETTER_SESSION_SECRET ?? "") >= 32;
}

export function isPasswordCorrect(value: unknown) {
  if (!isAccessConfigured() || typeof value !== "string" || !/^\d{8}$/.test(value)) return false;
  const digest = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(digest(value), digest(process.env.LETTER_PASSWORD!));
}

function sign(payload: string) {
  return createHmac("sha256", process.env.LETTER_SESSION_SECRET!)
    .update(process.env.LETTER_PASSWORD!).update("\0").update(payload).digest();
}

export function createSession(now = Date.now()) {
  if (!isAccessConfigured()) throw new Error("Letter access is not configured");
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  const payload = `${expires}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload).toString("base64url")}`;
}

export function isSessionValid(token: string | undefined, now = Date.now()) {
  if (!isAccessConfigured() || !token) return false;
  const match = /^(\d{10})\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[1]);
  const seconds = Math.floor(now / 1000);
  if (expires <= seconds) return false;
  const signature = Buffer.from(match[3], "base64url");
  return timingSafeEqual(signature, sign(`${match[1]}.${match[2]}`));
}
