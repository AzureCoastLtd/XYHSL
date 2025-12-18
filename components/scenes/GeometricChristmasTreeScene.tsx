import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import ChristmasTree from "../geometry/ChristmasTree";
import DecorativeCubes from "../geometry/DecorativeCubes";
import GemIcosahedrons from "../geometry/GemIcosahedrons";
import SpiralRibbon from "../geometry/SpiralRibbon";
import TreeTopperStar from "../effects/TreeTopperStar";
import SnowParticles from "../effects/SnowParticles";
import PostProcessing from "../effects/PostProcessing";
import { useSceneStore } from "../../stores/sceneStore";
import { CONFIG } from "../../constants/config";
import PhotoGallery from "../geometry/PhotoGallery";

// --- 内部组件：处理平滑动画 ---
function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  const { isHandOpen, isCameraEnabled, handPosition } = useSceneStore();

  // 目标缩放值
  const normalScale = CONFIG.dimensions.targetScale || 0.8;

  // 修改：爆炸时不需要放大太多，因为粒子本身已经飞得很远了
  // 甚至可以稍微缩小一点，让用户能看到整个星系
  const explodedScale = normalScale * 0.6;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. 缩放逻辑 (使用 damp 平滑阻尼)
    const targetScale =
      isCameraEnabled && isHandOpen ? explodedScale : normalScale;

    // 动态调整速度：
    // 爆炸时 (isHandOpen=true): 3.0 (稍微快一点点，保持张力)
    // 恢复时 (isHandOpen=false): 6.0 (大幅加快，产生强力吸回的效果)
    const animSpeed = isCameraEnabled && isHandOpen ? 3.0 : 6.0;

    groupRef.current.scale.x = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      targetScale,
      animSpeed,
      delta
    );
    groupRef.current.scale.y = THREE.MathUtils.damp(
      groupRef.current.scale.y,
      targetScale,
      animSpeed,
      delta
    );
    groupRef.current.scale.z = THREE.MathUtils.damp(
      groupRef.current.scale.z,
      targetScale,
      animSpeed,
      delta
    );

    // 2. 视角控制逻辑
    if (isCameraEnabled) {
      // 增加死区 (Deadzone)，防止手微抖动导致画面晃动
      const deadzone = 0.05;
      let targetX = -handPosition.x;

      if (Math.abs(targetX) < deadzone) targetX = 0;

      // 1. Y 轴 (水平旋转)：跟随手势左右移动
      const targetRotationY = targetX * Math.PI * 0.8;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotationY,
        2,
        delta
      );

      // 2. X 轴 (前后倾斜)：强制归零，保持竖直
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        0,
        2,
        delta
      );

      // 3. Z 轴 (左右倾斜)：强制归零
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        0,
        2,
        delta
      );
    } else {
      // 自动旋转
      // 修改：增加 % (Math.PI * 2)，防止数值无限累积
      // 这样切换到摄像头模式时，就不会疯狂倒转了
      groupRef.current.rotation.y =
        (groupRef.current.rotation.y + delta * 0.1) % (Math.PI * 2);

      // 复位 X 轴
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        0,
        2,
        delta
      );
      // 复位 Z 轴
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        0,
        2,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <ChristmasTree />
      <DecorativeCubes />
      <GemIcosahedrons />
      <SpiralRibbon />
      <TreeTopperStar />
    </group>
  );
}

// --- 主组件 ---
export default function GeometricChristmasTreeScene() {
  // 注意：GestureControls 已经在 page.tsx 中引入，这里不需要重复引入逻辑
  // 这里只负责渲染 3D 场景

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          toneMappingExposure: 0.6,
          alpha: true,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />

        <ambientLight intensity={0.1} color="#FFB7C5" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#FF69B4" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.2}
          color="#E6E6FA"
        />
        <spotLight
          position={[0, 20, 0]}
          angle={0.5}
          penumbra={1}
          intensity={0.5}
          color="#FFFFFF"
        />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.5} />
          <SceneContent />
          <PhotoGallery />
          <SnowParticles />
        </Suspense>

        <PostProcessing />
      </Canvas>
    </div>
  );
}
