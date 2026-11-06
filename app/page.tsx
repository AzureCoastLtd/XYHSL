import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, isSessionValid } from "../lib/letter-access";

import AnniversaryExperience from "../components/anniversary/AnniversaryExperience";
import { anniversaryDates, futureEntries, letterContent, photoEntries, timelineEntries } from "../components/anniversary/data";

export const metadata: Metadata = {
  title: "1000 天 · 一封互动情书",
  description: "这封信写在纸上，而我们的故事藏在这里。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Home() {
  if (!isSessionValid((await cookies()).get(ACCESS_COOKIE)?.value)) redirect("/unlock");
  return <AnniversaryExperience content={{ anniversaryDates, futureEntries, letterContent, photoEntries, timelineEntries }} />;
}
