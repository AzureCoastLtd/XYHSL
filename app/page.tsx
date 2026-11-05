import type { Metadata } from "next";

import AnniversaryExperience from "../components/anniversary/AnniversaryExperience";

export const metadata: Metadata = {
  title: "1000 天 · 一封互动情书",
  description: "这封信写在纸上，而我们的故事藏在这里。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return <AnniversaryExperience />;
}
