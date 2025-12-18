import * as THREE from "three";

export const getRandomPositionInCone = (height: number, radius: number) => {
  const y = Math.random() * height;
  const r = (1 - y / height) * radius;
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * r; // Uniform distribution in circle

  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;

  return new THREE.Vector3(x, y - height / 2, z);
};

export const getRandomRotation = () => {
  return new THREE.Euler(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
};

export const getScaleByHeight = (y: number, totalHeight: number) => {
  // Normalize y from -height/2 to height/2 to 0 to 1
  const normalizedY = (y + totalHeight / 2) / totalHeight;
  // Scale decreases as we go up, but maybe not to zero.
  // Let's say base scale is 1, top scale is 0.2
  const scale = 1 - normalizedY * 0.8;
  return Math.max(0.1, scale);
};
