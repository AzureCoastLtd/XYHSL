"use client";

import { useRef, useEffect, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || hasStarted) return;

    // 监听首次点击，自动播放
    const handleFirstClick = async () => {
      try {
        audio.volume = 0.3;
        await audio.play();
        setHasStarted(true);
        console.log("音乐已启动");
      } catch (e) {
        console.error("播放失败", e);
      }
    };

    // 只监听一次点击
    document.addEventListener("click", handleFirstClick, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, [hasStarted]);

  return (
    <audio
      ref={audioRef}
      src="/christmas-holiday-festive-cheer-snow-427231.mp3"
      loop
      preload="auto"
    />
  );
}
