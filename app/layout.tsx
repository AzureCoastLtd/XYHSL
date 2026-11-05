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
      <head>
        <noscript>
          <style>{`
            .ann-reveal { opacity: 1 !important; transform: none !important; }
            .ann-blur-reveal > span { opacity: 1 !important; filter: none !important; transform: none !important; }
            .ann-hero-action { display: none; }
          `}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
