import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
// 移除 Sparkles，改用自定义 Mesh
// import { Sparkles } from "@react-three/drei";
import { CONFIG } from "../../constants/config";
import { useSceneStore } from "../../stores/sceneStore";

// 新增：自定义环绕粒子组件，替代不可控的 Sparkles
function OrbitingParticles() {
  const count = 18; // 粒子数量

  // 生成静态数据
  const particles = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => ({
      // 均匀分布初始角度
      angle: (i / count) * Math.PI * 2,
      // 半径在 0.6 - 1.0 之间，紧贴星星
      radius: 0.6 + Math.random() * 0.4,
      // 速度非常慢且均匀：0.2 - 0.4
      speed: 0.2 + Math.random() * 0.2,
      // 垂直偏移，形成立体感
      y: (Math.random() - 0.5) * 0.6,
      // 大小
      size: 0.02 + Math.random() * 0.02,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, i) => {
        const data = particles[i];
        // 计算新位置：简单的圆周运动
        // 乘以 0.5 让整体速度更慢，符合"轻微移动"的需求
        const currentAngle = data.angle + time * data.speed * 0.5;

        mesh.position.x = Math.cos(currentAngle) * data.radius;
        mesh.position.z = Math.sin(currentAngle) * data.radius;
        // 加上微弱的上下浮动，像呼吸一样
        mesh.position.y = data.y + Math.sin(time + i) * 0.05;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.8}
            toneMapped={false} // 确保发光
          />
        </mesh>
      ))}
    </group>
  );
}

export default function TreeTopperStar() {
  const groupRef = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const { treeHeight } = CONFIG.dimensions;
  const { isExploded } = useSceneStore();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // 整体悬浮动画
      groupRef.current.position.y =
        treeHeight / 2 + 0.5 + Math.sin(time) * 0.07;

      // 爆炸时向上飞
      if (isExploded) {
        groupRef.current.position.y += 5;
      }
    }

    if (starRef.current) {
      // 持续自转
      starRef.current.rotation.y = time * 0.3;
      starRef.current.rotation.z = Math.sin(time * 0.5) * 0.07; // 轻微摆动
    }
  });

  // 创建五角星形状 (使用 ExtrudeGeometry + Shape)
  const starShape = React.useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.3;
    const innerRadius = outerRadius / 2;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2,
  };

  return (
    <group ref={groupRef} position={[0, treeHeight / 2, 0]}>
      {/* 核心星星 */}
      <mesh
        ref={starRef}
        rotation={[0.2, 0, 0.1]} // 初始倾斜角度
      >
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial
          color="#FFFFFF" // 纯白
          emissive="#FFFFFF" // 白色自发光
          emissiveIntensity={3.0} // 极高亮度触发 Bloom
          toneMapped={false}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* 内部核心光晕 (点光源) */}
      <pointLight intensity={2} distance={5} color="#FFFFFF" decay={2} />

      {/* 替换 Sparkles 为自定义的可控粒子 */}
      <OrbitingParticles />
    </group>
  );
}
