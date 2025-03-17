"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface CircleGeometryProps {
  scale: number;
  difference: number;
  color: string;
  animFactor: number;
}

const CircleGeometry = ({
  scale,
  difference,
  color,
  animFactor,
}: CircleGeometryProps) => {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const scaleFactor = 0.09;
      const elapsedTime = clock.getElapsedTime() * animFactor;
      const scaleFactorX = 1 + Math.sin(elapsedTime) * scaleFactor;
      const scaleFactorY =
        1 + Math.sin(elapsedTime + Math.PI / 3) * scaleFactor;
      const scaleFactorZ =
        1 + Math.sin(elapsedTime + (2 * Math.PI) / 3) * scaleFactor;

      ref.current.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);
      ref.current.rotation.z += Math.sin(elapsedTime * 0.5) * 0.01;
    }
  });

  return (
    <mesh visible rotation={[0, 0, 0]} castShadow ref={ref}>
      <ringGeometry args={[scale - difference, scale, 32]} />
      <meshBasicMaterial attach="material" color={color} />
    </mesh>
  );
};

export default CircleGeometry;
