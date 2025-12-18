import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "❤️XYHSL❤️",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 预加载 MediaPipe 资源 */}
        <link
          rel="preload"
          href="https://pub-1e3a5383825649febccf7a08a8d30a57.r2.dev/wasm/vision_wasm_internal.wasm"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://pub-1e3a5383825649febccf7a08a8d30a57.r2.dev/wasm/vision_wasm_internal.js"
          as="script"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://pub-1e3a5383825649febccf7a08a8d30a57.r2.dev/gesture_recognizer.task"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
