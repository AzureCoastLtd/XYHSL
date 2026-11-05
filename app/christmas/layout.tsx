import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "圣诞树 · XYHSL",
  description: "保留给你的那棵几何圣诞树。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChristmasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
