import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail, Float, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSceneStore, Wish } from "../../stores/sceneStore";

function GalaxyDiamond({
  wish,
  index,
  total,
}: {
  wish: Wish;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);

  // 银河系轨道参数 - 更有序的螺旋
  const params = useMemo(() => {
    // 基础角度：根据索引均匀分布在圆周上，形成有序队列
    const baseAngle = (index / total) * Math.PI * 2;

    // 半径：分层分布，避免重叠
    // 0-3: 内圈 (3-4), 4-7: 中圈 (5-6), 8+: 外圈 (7-8)
    const layer = Math.floor(index / 3);
    const radius = 5.5 + layer * 1.5 + (index % 3) * 0.5;

    // 高度：形成螺旋上升/下降的结构
    // 比如：-2 到 5 之间均匀分布
    const yBase = -2 + (index / total) * 6;

    // 速度：内圈快，外圈慢 (开普勒定律风格，或者为了视觉效果反过来)
    // 这里为了视觉统一，用相近的速度
    const speed = 0.2;

    // 轨道倾角：让整个星系有点倾斜感
    const inclination = Math.PI / 6; // 30度倾斜

    return { baseAngle, radius, yBase, speed, inclination };
  }, [index, total]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // 计算当前轨道角度
    const currentAngle = params.baseAngle + time * params.speed;

    // 基础圆周运动
    let x = Math.cos(currentAngle) * params.radius;
    let z = Math.sin(currentAngle) * params.radius;
    let y = params.yBase;

    // 应用倾角旋转 (绕X轴)
    // y' = y*cos(theta) - z*sin(theta)
    // z' = y*sin(theta) + z*cos(theta)
    const yRotated =
      y * Math.cos(params.inclination) - z * Math.sin(params.inclination);
    const zRotated =
      y * Math.sin(params.inclination) + z * Math.cos(params.inclination);

    // 加上轻微的垂直浮动
    const floatY = Math.sin(time * 1.5 + index) * 0.2;

    groupRef.current.position.set(x, yRotated + floatY, zRotated);

    // 自身旋转
    groupRef.current.rotation.x += 0.02;
    groupRef.current.rotation.y += 0.03;

    // 文字始终朝向相机
    if (textRef.current) {
      textRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        {/* 拖尾效果 - 像彗星/流星 */}
        <Trail
          width={1.2}
          length={8} // 更长的尾巴
          color={new THREE.Color("#aaddff")}
          attenuation={(t) => t * t} // 尾部渐隐
        >
          {/* 钻石本体 */}
          <mesh>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#88ccff"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        </Trail>

        {/* 外部光晕 */}
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial
            color="#4488ff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 名字显示 - 悬浮在钻石上方 */}
        <group position={[0, 0.3, 0]} ref={textRef}>
          <Text
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {wish.name}
          </Text>
        </group>
      </Float>
    </group>
  );
}

export default function ParticlePentagrams() {
  const { wishes } = useSceneStore();

  // 只取最新的10条，避免太乱
  const displayWishes = useMemo(() => {
    return wishes.slice(0, 10);
  }, [wishes]);

  return (
    <group>
      {displayWishes.map((wish, index) => (
        <GalaxyDiamond
          key={wish.id}
          wish={wish}
          index={index}
          total={displayWishes.length}
        />
      ))}
    </group>
  );
}
