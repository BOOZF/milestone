"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Mesh, RingGeometry } from "three";

const Spinner = () => {
  const sphereRef = useRef<Mesh>(null);
  let time = 0;

  useFrame((state, delta) => {
    time += delta + 0.07;

    if (sphereRef.current) {
      const radius = 17; // This is the radius of the orbit

      // Calculate the new position of the sphere
      sphereRef.current.position.y = radius * Math.cos(time);
      sphereRef.current.position.x = radius * Math.sin(time);
      sphereRef.current.position.z = 0;
    }
  });

  return (
    <group>
      <mesh geometry={new RingGeometry(15, 19, 32)}>
        <meshBasicMaterial
          attach="material"
          color="#B6B6B6"
          side={THREE.DoubleSide}
        />
      </mesh>

      <Sphere args={[3, 32, 32]} position={[0, 17, 0]} ref={sphereRef}>
        <meshBasicMaterial attach="material" color="#FFFFFF" />
      </Sphere>
    </group>
  );
};

export default Spinner;
