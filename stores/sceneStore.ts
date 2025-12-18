import { create } from "zustand";

interface SceneState {
  isExploded: boolean;
  setExploded: (isExploded: boolean) => void;

  isCameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;

  isHandOpen: boolean;
  setIsHandOpen: (isOpen: boolean) => void;

  // 新增：手部位置，用于控制视角
  handPosition: { x: number; y: number };
}

export const useSceneStore = create<SceneState>((set) => ({
  isExploded: false,
  setExploded: (isExploded) => set({ isExploded }),

  isCameraEnabled: false,
  setCameraEnabled: (enabled) => set({ isCameraEnabled: enabled }),

  isHandOpen: false,
  setIsHandOpen: (isOpen) => set({ isHandOpen: isOpen }),

  handPosition: { x: 0, y: 0 }, // 默认为中心
}));
