import React, { useLayoutEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../constants/config";
import { useSceneStore } from "../../stores/sceneStore";

const tempObject = new THREE.Object3D();

export default function SpiralRibbon() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { isExploded } = useSceneStore();

  // 增加数量以形成银河感，如果性能允许可以更多
  const count = CONFIG.counts.ribbonInstances;
  const { treeHeight, treeRadius } = CONFIG.dimensions;

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // 基础螺旋逻辑
      const t = i / count; // 0 to 1
      const turns = 3.5; // 增加圈数
      const angleBase = t * Math.PI * 2 * turns;

      // 增加角度的随机偏移，打破线条感
      const angleRandom = (Math.random() - 0.5) * 0.05 * Math.PI * 2;
      const angle = angleBase + angleRandom;

      // 高度分布，增加垂直方向的随机散布
      const yBase = (t - 0.5) * treeHeight;
      const yRandom = (Math.random() - 0.5) * 0.3;
      const y = yBase + yRandom;

      // 半径分布，形成宽带状银河
      const normalizedY = t;
      const rBase = (1 - normalizedY) * treeRadius + 1; // 稍微远离树体
      const rRandom = (Math.random() - 0.5) * 0.8; // 径向随机扩散
      const r = rBase + rRandom;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const position = new THREE.Vector3(x, y, z);
      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // 尺寸极小，像星星
      const scale = Math.random() * 0.08 + 0.02;

      // 随机相位，用于闪烁动画
      const phase = Math.random() * Math.PI * 2;

      return { position, rotation, scale, t, angle, r, phase, originalY: y };
    });
  }, [count, treeHeight, treeRadius]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];

      // 整体缓慢旋转
      const rotationOffset = time * 0.3;
      // 加上原始角度
      // 注意：这里我们需要重新计算位置，因为我们要绕Y轴旋转
      // 简单的做法是直接旋转 x, z 坐标

      // 重新计算基础位置（不含旋转）
      // 为了性能，我们假设初始位置已经包含了随机性，这里只做整体旋转
      const cosRot = Math.cos(rotationOffset);
      const sinRot = Math.sin(rotationOffset);

      let x = d.position.x * cosRot - d.position.z * sinRot;
      let z = d.position.x * sinRot + d.position.z * cosRot;
      let y = d.position.y;

      // 垂直方向的缓慢漂浮
      y += Math.sin(time * 0.5 + d.phase) * 0.2;

      tempObject.position.set(x, y, z);

      if (isExploded) {
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        tempObject.position.x += (x / len) * 15; // 银河炸得更远
        tempObject.position.y += (y / len) * 15;
        tempObject.position.z += (z / len) * 15;
      }

      // 闪烁效果
      const pulse = Math.sin(time * 3 + d.phase) * 0.3 + 1;
      tempObject.scale.setScalar(d.scale * pulse);

      // 自转
      tempObject.rotation.set(
        d.rotation.x + time * 0.5,
        d.rotation.y + time * 0.5,
        d.rotation.z
      );

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* 使用四面体，更像星星 */}
      <tetrahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial
        color="#FFFFFF"
        emissive="#FFFFFF"
        emissiveIntensity={2.0} // 增强发光
        toneMapped={false}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
}
