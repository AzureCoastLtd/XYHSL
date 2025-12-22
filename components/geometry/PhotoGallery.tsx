import React, { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Image, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useSceneStore } from "../../stores/sceneStore";

// 示例图片数据
const PHOTOS = [
  { url: "/images/1.webp", title: "Memory 1" },
  { url: "/images/2.webp", title: "Memory 2" },
  { url: "/images/3.webp", title: "Memory 3" },
  { url: "/images/4.webp", title: "Memory 4" },
  { url: "/images/5.webp", title: "Memory 5" },
  { url: "/images/6.webp", title: "Memory 6" },
  { url: "/images/7.webp", title: "Memory 7" },
  { url: "/images/8.webp", title: "Memory 8" },
  { url: "/images/9.webp", title: "Memory 9" },
];

function PhotoFrame({
  url,
  index,
  total,
  isActive,
}: {
  url: string;
  index: number;
  total: number;
  isActive: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const frontImageRef = useRef<any>(null);
  const backImageRef = useRef<any>(null);

  const { isExploded } = useSceneStore();
  const { camera } = useThree();

  // 1. 树形态位置
  const treePos = useMemo(() => {
    const seed = index * 123.45;
    const random = (offset: number) => Math.sin(seed + offset) * 0.5 + 0.5;
    // 调整高度分布范围，使其更均匀地分布在树上 (假设树高约 4.5)
    const hBase = -3.5;
    const hRange = 5.5;
    // 使用 index/total 确保均匀分布，减少随机性带来的聚集
    const y = hBase + (index / total) * hRange + (random(1) - 0.5) * 1.0;

    const coneRadius = 1 * (1 - y / 3.5);
    // 稍微往外一点，避免陷进树里
    const r = Math.max(0.5, coneRadius + 0.2 + random(2) * 0.3);
    const angle = random(2) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
  }, [index, total]);

  // 2. 爆炸形态位置
  const explodedPos = useMemo(() => {
    const seed = index * 789.12;
    const random = (offset: number) => Math.sin(seed + offset);
    const r = 3.0 + Math.abs(random(1)) * 2.5;
    const theta = random(2) * Math.PI * 2;
    const phi = Math.PI / 2 + random(3) * 0.5;
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) + 2.5,
      r * Math.cos(phi)
    );
  }, [index]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    // --- 动画目标计算 ---
    let targetPosition = new THREE.Vector3();
    let targetQuaternion = new THREE.Quaternion();
    let targetScale = 1;

    if (isActive) {
      // [全屏展示模式]
      // 距离相机近一点，防止被其他物体遮挡
      const distance = 1.0;
      const forward = new THREE.Vector3(0, 0, -distance);
      forward.applyQuaternion(camera.quaternion);
      targetPosition.copy(camera.position).add(forward);

      targetQuaternion.copy(camera.quaternion);

      // 计算视口高度
      const vH =
        camera instanceof THREE.PerspectiveCamera
          ? 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance
          : (camera as any).top - (camera as any).bottom;

      // 计算视口宽度
      const aspect = (camera as any).aspect || 1;
      const vW = vH * aspect;

      const baseHeight = 1.6;
      const baseWidth = 1.1;

      // 计算缩放比例：取宽高中较小的一个，确保完全显示且最大化 (Contain模式)
      // 提高到 98% 的屏幕占比，几乎全屏
      const scaleH = (vH * 0.98) / baseHeight;
      const scaleW = (vW * 0.98) / baseWidth;

      targetScale = Math.min(scaleH, scaleW);
    } else if (isExploded) {
      // [爆炸模式]
      targetPosition.copy(explodedPos);
      targetScale = 1.0; // 移除悬停放大
      targetPosition.y += Math.sin(state.clock.elapsedTime + index) * 0.1;

      const lookAtPos = new THREE.Vector3(0, 2.5, 0);
      const m = new THREE.Matrix4();
      m.lookAt(targetPosition, lookAtPos, new THREE.Vector3(0, 1, 0));
      targetQuaternion.setFromRotationMatrix(m);
    } else {
      // [树模式]
      targetPosition.copy(treePos);
      targetScale = 0.3;

      const lookAtTarget = new THREE.Vector3(
        treePos.x * 2,
        treePos.y,
        treePos.z * 2
      );
      const m = new THREE.Matrix4();
      m.lookAt(targetPosition, lookAtTarget, new THREE.Vector3(0, 1, 0));
      targetQuaternion.setFromRotationMatrix(m);

      const tilt = new THREE.Quaternion();
      tilt.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.2);
      targetQuaternion.multiply(tilt);
    }

    // --- 应用动画 ---
    const speed = isActive ? 12 : 6;

    ref.current.position.lerp(targetPosition, delta * speed);
    ref.current.quaternion.slerp(targetQuaternion, delta * speed);

    ref.current.scale.setScalar(
      THREE.MathUtils.damp(ref.current.scale.x, targetScale, speed, delta)
    );

    // 边框高亮反馈
    if (ref.current.children[0]) {
      const mesh = ref.current.children[0] as THREE.Mesh;
      // 确保材质存在且类型正确
      if (mesh.material) {
        const material = mesh.material as THREE.MeshStandardMaterial;
        // 激活时：纯白 (#FFFFFF)
        // 平时：极简灰白 (#F5F5F5)
        const targetColor = isActive ? "#FFFFFF" : "#F5F5F5";
        material.color.lerp(new THREE.Color(targetColor), delta * 5);
      }
    }
  });

  return (
    <group ref={ref}>
      {/* 1. 极简哑光背板：超薄、圆角、全包围 */}
      {/* 尺寸比照片略大 (1.05 x 1.55)，形成极窄的边框 */}
      <RoundedBox args={[1.05, 1.55, 0.02]} radius={0.01} smoothness={4}>
        <meshStandardMaterial
          color="#F5F5F5"
          roughness={0.8} // 高粗糙度，哑光质感
          metalness={0.0} // 无金属感
        />
      </RoundedBox>

      {/* 2. 正面照片 */}
      <Image
        ref={frontImageRef}
        url={url}
        scale={[1, 1.5]}
        position={[0, 0, 0.011]} // 微微突出于金属板
        transparent
      />

      {/* 3. 背面照片 */}
      <Image
        ref={backImageRef}
        url={url}
        scale={[1, 1.5]}
        position={[0, 0, -0.011]}
        rotation={[0, Math.PI, 0]}
        transparent
      />
    </group>
  );
}

export default function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { isHandClosed, isExploded, isCameraEnabled } = useSceneStore();

  // 防抖和状态记录
  const debounceTimer = useRef(0);
  const isClosedRef = useRef(false);

  // 优化：使用洗牌队列保证所有图片都能均匀展示
  const queueRef = useRef<number[]>([]);

  // 洗牌函数
  const shuffleQueue = () => {
    const newQueue = Array.from({ length: PHOTOS.length }, (_, i) => i);
    for (let i = newQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
    }
    return newQueue;
  };

  useFrame((state, delta) => {
    // 只有在开启摄像头且爆炸模式下才响应手势
    if (!isCameraEnabled || !isExploded) {
      if (activeIndex !== null) setActiveIndex(null);
      return;
    }

    // 状态防抖逻辑
    if (isHandClosed !== isClosedRef.current) {
      debounceTimer.current = 0;
      isClosedRef.current = isHandClosed;
    } else {
      debounceTimer.current += delta;
    }

    // 只有状态稳定超过 0.1秒 才执行动作
    if (debounceTimer.current > 0.1) {
      if (isHandClosed && activeIndex === null) {
        // [捏合] 且当前无展示 -> 从队列取一张

        // 如果队列空了，重新洗牌
        if (queueRef.current.length === 0) {
          queueRef.current = shuffleQueue();
        }

        // 取出并移除第一个
        const nextIndex = queueRef.current.shift();

        if (nextIndex !== undefined) {
          setActiveIndex(nextIndex);
        }
      } else if (!isHandClosed && activeIndex !== null) {
        // [松开] 且当前有展示 -> 归位
        setActiveIndex(null);
      }
    }
  });

  return (
    <group>
      {PHOTOS.map((photo, index) => (
        <PhotoFrame
          key={index}
          index={index}
          total={PHOTOS.length}
          url={photo.url}
          isActive={activeIndex === index}
        />
      ))}
    </group>
  );
}
