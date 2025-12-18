import React, { useLayoutEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../constants/config";
import {
  getRandomPositionInCone,
  getRandomRotation,
} from "../../utils/geometryHelpers";
import { useSceneStore } from "../../stores/sceneStore";

const tempObject = new THREE.Object3D();

export default function GemIcosahedrons() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { isExploded } = useSceneStore();

  const count = CONFIG.counts.icosahedronInstances;
  const { treeHeight, treeRadius } = CONFIG.dimensions;

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Middle layer: restrict height
      // treeHeight is 10. y is 0 to 10 (in helper logic, but helper returns -5 to 5)
      // Let's generate full cone but filter or just use helper.
      // Helper returns y from -height/2 to height/2.
      // We want middle, say -2 to 2.

      // Custom position logic for middle layer
      const y = (Math.random() - 0.5) * (treeHeight * 0.6); // Middle 60%
      // Calculate radius at this y
      // Helper logic: r = (1 - (y + h/2)/h) * R
      const normalizedY = (y + treeHeight / 2) / treeHeight;
      const r = (1 - normalizedY) * treeRadius;

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * r;

      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      const position = new THREE.Vector3(x, y, z);
      const rotation = getRandomRotation();
      const scale = Math.random() * 0.4 + 0.2;

      return { position, rotation, scale };
    });
  }, [count, treeHeight, treeRadius]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    data.forEach((d, i) => {
      tempObject.position.copy(d.position);
      tempObject.rotation.copy(d.rotation);
      tempObject.scale.setScalar(d.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      tempObject.position.set(d.position.x, d.position.y, d.position.z);

      if (isExploded) {
        const len = d.position.length() || 1;
        tempObject.position.x += (d.position.x / len) * 6;
        tempObject.position.y += (d.position.y / len) * 6;
        tempObject.position.z += (d.position.z / len) * 6;
      }

      tempObject.rotation.set(
        d.rotation.x + time * 0.3,
        d.rotation.y + time * 0.3,
        d.rotation.z
      );
      tempObject.scale.setScalar(d.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial
        color={CONFIG.colors.decoration.icosahedron}
        metalness={0.8}
        roughness={0.2}
        emissive={CONFIG.colors.decoration.icosahedron}
        emissiveIntensity={0.3}
      />
    </instancedMesh>
  );
}
