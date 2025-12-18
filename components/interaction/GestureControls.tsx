import { useSceneStore } from "../../stores/sceneStore";
import { useGestureRecognition } from "../../hooks/useGestureRecognition";

export default function GestureControls() {
  const { isCameraEnabled, setCameraEnabled, isHandOpen } = useSceneStore();
  // 确保 Hook 被调用以启动摄像头逻辑
  const { videoRef } = useGestureRecognition();

  return (
    <>
      {/* 1. 隐藏的 Video 元素 */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />

      {/* 3. 极简控制 UI */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* 开关按钮：更简约的设计 */}
        <button
          onClick={() => setCameraEnabled(!isCameraEnabled)}
          className={`
            group relative flex items-center gap-2 px-4 py-2 rounded-full 
            backdrop-blur-xl border transition-all duration-500
            ${
              isCameraEnabled
                ? "bg-white/10 border-green-400/50 text-green-400"
                : "bg-black/20 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCameraEnabled ? "bg-green-400 animate-pulse" : "bg-gray-500"
            }`}
          />
          <span className="text-xs font-medium tracking-wider uppercase">
            {isCameraEnabled ? "Gesture ON" : "Enable Camera"}
          </span>
        </button>

        {/* 状态文字提示：仅在变化时显示或保持极简 */}
        <div
          className={`
            transition-all duration-500 overflow-hidden flex flex-col items-end
            ${
              isCameraEnabled
                ? "opacity-100 max-h-20 translate-y-0"
                : "opacity-0 max-h-0 -translate-y-2"
            }
          `}
        >
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
            Current State
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-light tracking-widest ${
                isHandOpen
                  ? "text-pink-400 drop-shadow-[0_0_8px_rgba(255,20,147,0.8)]"
                  : "text-white/80"
              }`}
            >
              {isHandOpen ? "UNLEASH" : "NORMAL"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
