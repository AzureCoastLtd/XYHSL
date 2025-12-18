import React, { useLayoutEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../constants/config";
import {
  getRandomPositionInCone,
  getRandomRotation,
  getScaleByHeight,
} from "../../utils/geometryHelpers";
import { useSceneStore } from "../../stores/sceneStore";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

// 伪随机函数，用于生成确定的爆炸位置
const randomPos = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export default function ChristmasTree() {
  const deepRef = useRef<THREE.InstancedMesh>(null);
  const decoRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);

  const { isExploded } = useSceneStore();
  const { treeHeight, treeRadius } = CONFIG.dimensions;

  // 动画平滑因子 (0 = 树, 1 = 爆炸)
  const explosionFactor = useRef(0);

  const deepCount = CONFIG.counts.treeDeepInstances;
  const decoCount = CONFIG.counts.treeShineInstances;
  const glowCount = CONFIG.counts.glowCount;

  // --- 数据生成 ---
  const deepData = useMemo(() => {
    return new Array(deepCount).fill(0).map(() => {
      const pos = getRandomPositionInCone(treeHeight, treeRadius);
      const color =
        Math.random() > 0.6
          ? CONFIG.colors.tree.deepBase
          : CONFIG.colors.tree.vividPink;
      return {
        pos,
        rot: getRandomRotation(),
        scale:
          getScaleByHeight(pos.y, treeHeight) * (Math.random() * 0.3 + 0.4),
        color,
      };
    });
  }, [deepCount, treeHeight, treeRadius]);

  const decoData = useMemo(() => {
    return new Array(decoCount).fill(0).map(() => {
      // 修改：半径从 1.0 -> 0.95，让装饰物稍微嵌入树体，防止浮空感
      const pos = getRandomPositionInCone(treeHeight, treeRadius * 0.95);
      const rand = Math.random();
      let color;
      if (rand > 0.75)
        color =
          Math.random() > 0.5
            ? CONFIG.colors.tree.luxuryGold
            : CONFIG.colors.tree.champagne;
      else
        color =
          Math.random() > 0.5
            ? CONFIG.colors.tree.dreamyPink
            : CONFIG.colors.tree.roseGold;
      return {
        pos,
        rot: getRandomRotation(),
        scale: Math.random() * 0.2 + 0.05,
        color,
      };
    });
  }, [decoCount, treeHeight, treeRadius]);

  const glowData = useMemo(() => {
    return new Array(glowCount).fill(0).map((_, i) => {
      // 修改：半径从 1.15 -> 1.05，让光晕更贴近树
      const pos = getRandomPositionInCone(treeHeight, treeRadius * 1.05);
      const color =
        Math.random() > 0.8 ? "#FFFFFF" : CONFIG.colors.tree.dreamyPink;
      return {
        pos,
        rot: getRandomRotation(),
        scale: Math.random() * 0.05 + 0.02,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        color,
      };
    });
  }, [glowCount, treeHeight, treeRadius]);

  // --- 初始化 ---
  useLayoutEffect(() => {
    const initLayer = (ref: any, data: any[]) => {
      if (ref.current) {
        data.forEach((d, i) => {
          tempObject.position.copy(d.pos);
          tempObject.rotation.copy(d.rot);
          tempObject.scale.setScalar(d.scale);
          tempObject.updateMatrix();
          ref.current.setMatrixAt(i, tempObject.matrix);
          tempColor.set(d.color);
          ref.current.setColorAt(i, tempColor);
        });
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor)
          ref.current.instanceColor.needsUpdate = true;
      }
    };
    initLayer(deepRef, deepData);
    initLayer(decoRef, decoData);
    initLayer(glowRef, glowData);
  }, [deepData, decoData, glowData]);

  // --- 核心动画循环 ---
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // 1. 同步速度逻辑：
    // 爆炸时 (isExploded=true): 3.0 (保持张力)
    // 恢复时 (isExploded=false): 6.0 (快速吸回)
    const animSpeed = isExploded ? 3.0 : 6.0;

    // 平滑计算爆炸进度
    explosionFactor.current = THREE.MathUtils.damp(
      explosionFactor.current,
      isExploded ? 1 : 0,
      animSpeed, // 使用动态速度
      delta
    );

    const t = explosionFactor.current; // 当前进度 0~1
    const isAnimating = t > 0.001;

    // 统一的浮动参数，确保所有层同步呼吸，消除偏移感
    const floatFrequency = 0.5;
    const floatAmplitude = 0.08;

    // 辅助函数：计算爆炸位置
    const getExplodedPos = (i: number, baseScale: number) => {
      const u = randomPos(i) * Math.PI * 2;
      const v = randomPos(i + 100) * Math.PI - Math.PI / 2;
      const r = 5 + randomPos(i + 200) * 15 * baseScale;

      const x = r * Math.cos(v) * Math.cos(u);
      const y = r * Math.sin(v) + treeHeight / 2;
      const z = r * Math.cos(v) * Math.sin(u);

      const rotSpeed = 0.2 * (1 - baseScale * 0.5);
      const cosR = Math.cos(time * rotSpeed);
      const sinR = Math.sin(time * rotSpeed);

      return new THREE.Vector3(x * cosR - z * sinR, y, x * sinR + z * cosR);
    };

    // --- 1. 深色基底 (核心引力场) ---
    if (deepRef.current) {
      for (let i = 0; i < deepData.length; i++) {
        const d = deepData[i];

        // 树状态位置
        const treePos = d.pos.clone();
        // 统一浮动公式
        treePos.y += Math.sin(time * floatFrequency + d.pos.x) * floatAmplitude;

        if (isAnimating) {
          const expPos = getExplodedPos(i, 0.8);
          tempObject.position.lerpVectors(treePos, expPos, t);
          tempObject.rotation.set(
            d.rot.x + time * t,
            d.rot.y + time * t,
            d.rot.z + time * t
          );
        } else {
          tempObject.position.copy(treePos);
          tempObject.rotation.copy(d.rot);
        }

        tempObject.scale.setScalar(d.scale);
        tempObject.updateMatrix();
        deepRef.current.setMatrixAt(i, tempObject.matrix);
      }
      deepRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- 2. 装饰层 (飞溅的碎片) ---
    if (decoRef.current) {
      for (let i = 0; i < decoData.length; i++) {
        const d = decoData[i];

        const treePos = d.pos.clone();
        // 关键修改：使用与基底完全一致的浮动公式，确保"钉"在树上
        treePos.y += Math.sin(time * floatFrequency + d.pos.x) * floatAmplitude;

        if (isAnimating) {
          const expPos = getExplodedPos(i + 1000, 1.5);
          expPos.addScalar(Math.sin(time * 5 + i) * 0.2 * t);
          tempObject.position.lerpVectors(treePos, expPos, t);
          tempObject.rotation.set(time * 2, time * 2, time * 2);
        } else {
          tempObject.position.copy(treePos);
          tempObject.rotation.copy(d.rot);
          tempObject.rotation.y += time * 0.2; // 减慢自转
        }

        tempObject.scale.setScalar(d.scale);
        tempObject.updateMatrix();
        decoRef.current.setMatrixAt(i, tempObject.matrix);
      }
      decoRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- 3. 高光粒子 (巨大的星云) ---
    if (glowRef.current) {
      for (let i = 0; i < glowData.length; i++) {
        const d = glowData[i];

        // 树状态：减慢螺旋，减小偏移
        const angle = time * 0.1 + d.pos.y * 0.5; // 减慢旋转
        const treeX = d.pos.x + Math.cos(angle) * 0.05; // 减小水平偏移
        const treeZ = d.pos.z + Math.sin(angle) * 0.05;

        // Y轴同步呼吸 + 自身微弱浮动
        const treeY =
          d.pos.y +
          Math.sin(time * floatFrequency + d.pos.x) * floatAmplitude +
          Math.sin(time * d.speed) * 0.1;

        const treePos = new THREE.Vector3(treeX, treeY, treeZ);

        if (isAnimating) {
          const r = 2 + randomPos(i) * 20;
          const theta = time * 0.2 + randomPos(i + 500) * Math.PI * 2;
          const spiralY = (randomPos(i + 200) - 0.5) * 10 + treeHeight / 2;

          const expPos = new THREE.Vector3(
            Math.cos(theta) * r,
            spiralY,
            Math.sin(theta) * r
          );

          tempObject.position.lerpVectors(treePos, expPos, t);

          const pulse = (Math.sin(time * 10 + i) + 1) * 0.5;
          tempObject.scale.setScalar(d.scale * (1 + t * 2 + pulse * t));
        } else {
          tempObject.position.copy(treePos);
          const pulse = (Math.sin(time * 3 + d.phase) + 1) * 0.5 + 0.5;
          tempObject.scale.setScalar(d.scale * pulse);
        }

        tempObject.rotation.set(time, time, time);
        tempObject.updateMatrix();
        glowRef.current.setMatrixAt(i, tempObject.matrix);
      }
      glowRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. 深色基底 */}
      <instancedMesh ref={deepRef} args={[undefined, undefined, deepCount]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color="#FFFFFF"
          metalness={0.5}
          roughness={0.5}
          envMapIntensity={0.1}
          emissive={CONFIG.colors.tree.deepBase}
          emissiveIntensity={0.5}
        />
      </instancedMesh>

      {/* 2. 装饰层 */}
      <instancedMesh ref={decoRef} args={[undefined, undefined, decoCount]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#FFFFFF"
          metalness={0.9}
          roughness={0.3}
          envMapIntensity={0.3}
          emissive={CONFIG.colors.tree.roseGold}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </instancedMesh>

      {/* 3. 高光粒子 */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, glowCount]}>
        <tetrahedronGeometry args={[0.1, 0]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
