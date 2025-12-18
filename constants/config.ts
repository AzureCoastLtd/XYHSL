import { COLORS } from "../utils/colorPalette";

export const CONFIG = {
  counts: {
    // 1. 核心发光粒子 (星尘)
    glowCount: 30000,
    // 2. 深色基底 (骨架)
    treeDeepInstances: 2000,
    // 3. 金属中层 (反光面)
    treeShineInstances: 8000,

    // 其他装饰
    cubeInstances: 0,
    icosahedronInstances: 100,
    ribbonInstances: 2000,
  },
  colors: COLORS,
  dimensions: {
    // 缩小尺寸，适应手机屏幕
    treeHeight: 10, // 12 -> 10
    treeRadius: 3.5, // 4.5 -> 3.5
    targetScale: 0.8, // 1.0 -> 0.9
  },
  animation: {
    floatSpeed: 0.2,
    floatAmplitude: 0.2,
    rotationSpeed: 0.1,
    // 新增：入场动画时长
    introDuration: 2.0,
  },
};
