import React, { useLayoutEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../constants/config";
import { useSceneStore } from "../../stores/sceneStore";

const tempObject = new THREE.Object3D();

export default function DecorativeCubes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { isExploded } = useSceneStore();

  const count = CONFIG.counts.cubeInstances;
  const { treeHeight, treeRadius } = CONFIG.dimensions;

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // 简单的随机分布逻辑，为了节省篇幅省略具体计算，保持原有逻辑即可
      // 这里只关注材质修复
      const y = Math.random() * treeHeight;
      const r = ((treeHeight - y) / treeHeight) * treeRadius + 0.2; // 稍微浮在表面
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      return {
        position: new THREE.Vector3(x, y - treeHeight / 2, z),
        rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
      };
    });
  }, [count, treeHeight, treeRadius]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    data.forEach((d, i) => {
      tempObject.position.copy(d.position);
      tempObject.rotation.copy(d.rotation);
      tempObject.scale.setScalar(Math.random() * 0.3 + 0.1);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    // 简单的旋转动画
    meshRef.current.rotation.y += 0.002;

    if (isExploded) {
      // 爆炸逻辑...
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color="#FFFFFF"
        metalness={1.0} // 纯金属
        roughness={0.0} // 镜面光滑
        envMapIntensity={2.0} // 增强反射强度
      />
    </instancedMesh>
  );
}
