import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, isSessionValid } from "../../lib/letter-access";

export const metadata: Metadata = {
  title: "圣诞树 · XYHSL",
  description: "保留给你的那棵几何圣诞树。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChristmasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isSessionValid((await cookies()).get(ACCESS_COOKIE)?.value)) redirect("/unlock?next=/christmas");
  return children;
}
