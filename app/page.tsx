"use client";

import dynamic from "next/dynamic";
import GestureControls from "../components/interaction/GestureControls";

const GeometricChristmasTreeScene = dynamic(
  () => import("../components/scenes/GeometricChristmasTreeScene"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#000000] relative">
      <GeometricChristmasTreeScene />
      <GestureControls />
    </main>
  );
}
