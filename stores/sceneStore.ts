import { create } from "zustand";

interface SceneState {
  isHandClosed: boolean;
  setHandClosed: (isClosed: boolean) => void;

  isExploded: boolean;
  setExploded: (isExploded: boolean) => void;

  isCameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;

  isHandOpen: boolean;
  setIsHandOpen: (isOpen: boolean) => void;

  // 新增：手部位置，用于控制视角
  handPosition: { x: number; y: number };

  // 祝福语数据
  wishes: Wish[];
  setWishes: (wishes: Wish[]) => void;
  addWish: (wish: Wish) => void;
}

export interface Wish {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export const useSceneStore = create<SceneState>((set) => ({
  isHandClosed: false,
  setHandClosed: (isHandClosed) => set({ isHandClosed }),

  isExploded: false,
  setExploded: (isExploded) => set({ isExploded }),

  isCameraEnabled: false,
  setCameraEnabled: (enabled) => set({ isCameraEnabled: enabled }),

  isHandOpen: false,
  setIsHandOpen: (isOpen) => set({ isHandOpen: isOpen }),

  handPosition: { x: 0, y: 0 }, // 默认为中心

  wishes: [],
  setWishes: (wishes) => set({ wishes }),
  addWish: (wish) => set((state) => ({ wishes: [...state.wishes, wish] })),
}));
