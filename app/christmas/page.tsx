"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import GestureControls from "../../components/interaction/GestureControls";
import WishesInput from "../../components/ui/WishesInput";

const GeometricChristmasTreeScene = dynamic(
  () => import("../../components/scenes/GeometricChristmasTreeScene"),
  { ssr: false },
);

const MusicPlayer = dynamic(() => import("../../components/ui/MusicPlayer"), {
  ssr: false,
});

export default function ChristmasPage() {
  return (
    <main className="christmas-page">
      <GeometricChristmasTreeScene />
      <GestureControls />
      <WishesInput />
      <MusicPlayer />
      <Link href="/1000" className="christmas-back-link">
        ← 回到 1000 天
      </Link>
    </main>
  );
}
