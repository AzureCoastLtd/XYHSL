import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PasswordGate from "../../components/anniversary/PasswordGate";
import { ACCESS_COOKIE, isAccessConfigured, isSessionValid } from "../../lib/letter-access";

export const metadata: Metadata = {
  title: "只为你打开 · 一封私信",
  description: "有些话，只想说给你听。",
};

export default async function UnlockPage({ searchParams }: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.next === "/christmas" ? "/christmas" : "/";
  if (isSessionValid((await cookies()).get(ACCESS_COOKIE)?.value)) redirect(returnTo);
  const error = !isAccessConfigured() || params.error === "unavailable" ? "unavailable"
    : params.error === "wrong" ? "wrong" : undefined;
  return <PasswordGate error={error} returnTo={returnTo} />;
}
