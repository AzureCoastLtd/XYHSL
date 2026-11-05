import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XYHSL · 一封写给未来的信",
  description: "这封信写在纸上，而我们的故事藏在这里。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
