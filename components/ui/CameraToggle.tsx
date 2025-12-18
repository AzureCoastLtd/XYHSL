import { useSceneStore } from "../../stores/sceneStore";

export default function CameraToggle() {
  const { isCameraEnabled, setCameraEnabled: toggleCamera } = useSceneStore();

  return (
    <button
      onClick={() => toggleCamera(!isCameraEnabled)}
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-bold transition-all duration-300 ${
        isCameraEnabled
          ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(255,20,147,0.5)]"
          : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
      }`}
    >
      {isCameraEnabled ? "📷 Camera ON" : "📷 Camera OFF"}
    </button>
  );
}
