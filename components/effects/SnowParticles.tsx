import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 自定义 Shader 材质
const SnowMaterial = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color("#FFFFFF") },
  },
  vertexShader: `
    uniform float time;
    attribute float size;
    attribute float speed;
    varying float vOpacity;

    void main() {
      vec3 pos = position;
      
      // 1. 让雪花下落 (循环运动)
      // 范围在 -10 到 10 之间循环
      pos.y = 10.0 - mod(10.0 - pos.y + time * speed, 20.0);
      
      // 2. 添加一点水平摆动
      pos.x += sin(time * 0.5 + pos.y) * 0.2;
      pos.z += cos(time * 0.3 + pos.y) * 0.2;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // --- 核心修复逻辑 ---
      // 计算粒子到摄像机的距离 (-mvPosition.z)
      float dist = -mvPosition.z;
      
      // 如果距离小于 4.0，透明度开始衰减；距离小于 1.0，完全透明
      // smoothstep(min, max, value)
      vOpacity = smoothstep(1.0, 4.0, dist);

      // 大小随距离衰减，但限制最大尺寸，防止贴脸时过大
      gl_PointSize = size * (30.0 / dist);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying float vOpacity;

    void main() {
      // 如果透明度太低，直接丢弃，优化性能
      if (vOpacity < 0.01) discard;

      // 绘制圆形粒子 (软边缘)
      vec2 coord = gl_PointCoord - vec2(0.5);
      float strength = 1.0 - length(coord) * 2.0;
      strength = clamp(strength, 0.0, 1.0);
      
      // 边缘羽化
      strength = pow(strength, 1.5);

      gl_FragColor = vec4(color, strength * vOpacity * 0.8);
    }
  `,
};

export default function SnowParticles() {
  const count = 600; // 雪花数量
  const meshRef = useRef<THREE.Points>(null);

  // 生成静态数据
  const [positions, sizes, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 随机分布在 x: -15~15, y: -10~10, z: -15~15 的空间内
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // 随机大小
      sizes[i] = Math.random() * 4.0 + 2.0;

      // 随机下落速度
      speeds[i] = Math.random() * 1.5 + 0.5;
    }

    return [positions, sizes, speeds];
  }, []);

  // 动画循环
  useFrame((state) => {
    if (meshRef.current) {
      // 更新 Shader 中的 time
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value =
        state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        args={[SnowMaterial]}
        transparent
        depthWrite={false} // 不遮挡其他物体
        blending={THREE.AdditiveBlending} // 发光叠加模式，看起来更梦幻
      />
    </points>
  );
}
