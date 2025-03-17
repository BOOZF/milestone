"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Circle } from "@react-three/drei";
import { Mesh } from "three";

const getRandomArbitrary = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

interface ParticleProps {
  position: number;
  x_axis_length: number;
}

const Particle = ({ position, x_axis_length }: ParticleProps) => {
  const scale = getRandomArbitrary(1, 200);
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x +=
        (Math.sin(Date.now() * 0.001 + position * 10) * scale) / 100;
    }
  });

  return (
    <Circle
      ref={ref}
      args={[scale]}
      position={[
        getRandomArbitrary(-300, x_axis_length * 4),
        getRandomArbitrary(-300, 300),
        getRandomArbitrary(-100, -30),
      ]}
    >
      <meshBasicMaterial transparent opacity={0.05} />
    </Circle>
  );
};

interface ParticlesProps {
  count: number;
  scale: number;
  x_axis_length: number;
}

const Particles = ({ count, scale, x_axis_length }: ParticlesProps) => {
  const particles = useMemo(() => {
    return [...Array(count)].map((_, i) => (
      <Particle key={i} position={i * scale} x_axis_length={x_axis_length} />
    ));
  }, [count, scale, x_axis_length]);

  return <>{particles}</>;
};

export default Particles;
