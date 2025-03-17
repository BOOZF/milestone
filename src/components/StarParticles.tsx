"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, PointsMaterial } from "three";

const getRandomArbitrary = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateBoxPositions = (
  count: number,
  displacement: number,
  xDiff: number,
  yDiff: number,
  zDiff: number
): Float32Array => {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = getRandomArbitrary(-xDiff * 0.2, xDiff * 10);
    const y = getRandomArbitrary(-yDiff, yDiff) * getRandomArbitrary(1, 3);
    const z = getRandomArbitrary(zDiff * 0.8, zDiff);
    positions.push(x, y, z);
  }
  return new Float32Array(positions);
};

interface StarParticlesProps {
  count: number;
  displacement: number;
  pointsSize: number;
  xDiff: number;
  yDiff: number;
  zDiff: number;
}

const StarParticles = ({
  count,
  displacement,
  pointsSize,
  xDiff,
  yDiff,
  zDiff,
}: StarParticlesProps) => {
  const bufferRef = useRef<BufferAttribute>(null);
  const [positions, setPositions] = useState<Float32Array>(
    generateBoxPositions(count, displacement, xDiff, yDiff, zDiff)
  );

  const pointsMaterial = new PointsMaterial({
    color: "#808080",
    size: pointsSize,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
  });

  useEffect(() => {
    const tempPositions = generateBoxPositions(
      count,
      displacement,
      xDiff,
      yDiff,
      zDiff
    );
    setPositions(tempPositions);
  }, [count, displacement, xDiff, yDiff, zDiff]);

  useEffect(() => {
    if (positions.length > 0 && bufferRef.current) {
      bufferRef.current.needsUpdate = true;
    }
  }, [positions]);

  useFrame(() => {
    if (!bufferRef.current) return;

    const positions = bufferRef.current.array;

    for (let coordIndex = 0; coordIndex < positions.length; coordIndex += 3) {
      const scale = getRandomArbitrary(1, 100);
      positions[coordIndex] +=
        (Math.sin(Date.now() * 0.0001 + positions[coordIndex + 1] * 10) *
          scale) /
        500;
    }

    bufferRef.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <primitive object={pointsMaterial} />
    </points>
  );
};

export default StarParticles;
