import React from 'react';
import { OrbitControls } from '@react-three/drei';

export default function MouseControls() {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      autoRotate={true}
      autoRotateSpeed={0.5}
      minDistance={5}
      maxDistance={20}
    />
  );
}
