"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  Group,
  RawShaderMaterial,
  Matrix4,
  Vector3,
  Quaternion,
} from "three";

interface Coordinate {
  x: number;
  z: number;
}

interface PointsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  x_axis_length: number;
  z_axis_length: number;
  sep: number;
  backgroundStartAnimation: string;
  backgroundImage: string;
  t: number;
  boxRefs: React.MutableRefObject<THREE.Mesh[]>;
  linesContainerRef: React.MutableRefObject<Group>;
  graph: (x: number, z: number, t: number) => number;
  lineOneRef: React.MutableRefObject<THREE.InstancedMesh>;
  lineTwoRef: React.MutableRefObject<THREE.InstancedMesh>;
  lineThreeRef: React.MutableRefObject<THREE.InstancedMesh>;
}

const Points = ({
  canvasRef,
  x_axis_length,
  z_axis_length,
  sep,
  backgroundStartAnimation,
  backgroundImage,
  t,
  boxRefs,
  linesContainerRef,
  graph,
  lineOneRef,
  lineTwoRef,
  lineThreeRef,
}: PointsProps) => {
  const bufferRef = useRef<BufferAttribute>(null);
  const scrollDelta = useRef(0);
  const scrollDirection = useRef<"up" | "down" | null>(null);
  const targetRotationY = useRef(0);

  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      scrollDirection.current = e.deltaY >= 0 ? "down" : "up";
      targetRotationY.current = e.deltaY * scrollDelta.current;
    };

    window.addEventListener("wheel", handleWheel);

    if (canvasRef.current) {
      canvasRef.current.style.backgroundImage = backgroundImage;
      canvasRef.current.style.backgroundPosition = backgroundStartAnimation;
    }

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [backgroundImage, backgroundStartAnimation]);

  const getRandomArbitrary = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  const positions = useMemo(() => {
    const positions: number[] = [];
    const coords: Coordinate[] = [];

    let zAxisDist = 1;
    for (let zi = 0; zi < z_axis_length; zi += zAxisDist) {
      const xAxisDist = getRandomArbitrary(1, 4);
      const z = sep * zi;

      for (let xi = 0; xi < x_axis_length; xi += xAxisDist) {
        const x = sep * xi;
        const y = 0;
        positions.push(x, y, z);
        coords.push({ x, z });
      }
      zAxisDist = 1;
    }

    setCoordinates(coords);
    return new Float32Array(positions);
  }, [x_axis_length, z_axis_length, sep]);

  const waveShaderMaterial = new RawShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDimensions: { value: new THREE.Vector2(x_axis_length, z_axis_length) },
    },
    vertexShader: `
      uniform mat4 projectionMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 modelMatrix;
      attribute vec3 position;
      varying vec3 vPosition;

      void main() {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        gl_PointSize = 3.0;
        vPosition = position;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec2 uDimensions;
      varying vec3 vPosition;

      void main() {
        if (vPosition.x < 500.0 || vPosition.x > 12000.0) {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 0.03);
        } else if (vPosition.x < 1000.0 || vPosition.x > 3000.0) {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 0.11);
        } else {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 0.18);
        }
      }
    `,
    transparent: true,
    alphaTest: 0.5,
  });

  const renderLine = (
    lineRef: React.MutableRefObject<THREE.InstancedMesh>,
    z: number
  ) => {
    const instanceMesh = lineRef.current;
    if (instanceMesh) {
      const matrix = new Matrix4();
      for (let xi = 0; xi < x_axis_length; xi++) {
        const x = sep * xi;
        const y = graph(x, z, t);
        matrix.compose(
          new Vector3(x, y, z),
          new Quaternion(),
          new Vector3(1, 1, 1)
        );
        instanceMesh.setMatrixAt(xi, matrix);
      }
      instanceMesh.instanceMatrix.needsUpdate = true;
    }
  };

  useFrame(() => {
    if (!bufferRef.current) return;

    waveShaderMaterial.uniforms.uTime.value = t;

    const positions = bufferRef.current.array;
    let i = 0;
    for (const coord of coordinates) {
      const y = graph(coord.x, coord.z, t);
      positions[i + 1] = y;
      i += 3;
    }

    bufferRef.current.needsUpdate = true;

    boxRefs.current.forEach((box) => {
      if (box) {
        const { x, z } = box.position;
        box.position.y = graph(x, z, t);
      }
    });

    linesContainerRef.current.children.forEach((line) => {
      const lineGeometry = (line as THREE.Line).geometry;
      const positions = lineGeometry.attributes.position.array;

      for (let index = 0; index < positions.length; index += 3) {
        const x = positions[index];
        const z = positions[index + 2];
        const y = graph(x, z, t);
        positions[index + 1] = y;
      }

      lineGeometry.attributes.position.needsUpdate = true;
    });

    [lineOneRef, lineTwoRef, lineThreeRef].forEach((lineRef) => {
      renderLine(lineRef, lineRef.current?.position.z || 0);
    });
  });

  return (
    <group position={[0, 0, 0]}>
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
        <primitive attach="material" object={waveShaderMaterial} />
      </points>
      <group ref={linesContainerRef} />
    </group>
  );
};

export default Points;
