"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Text } from "@react-three/drei";
import { gsap } from "gsap";
import { SlowMo } from "gsap/EasePack";
import useStore from "@/store/useStore";

// Import components
import CameraBounds from "./CameraBounds";
import Particles from "./Particles";
import Points from "./Points";
import StarParticles from "./StarParticles";
import MainCanvas from "./MainCanvas";
import CircleGeometry from "./CircleGeometry";
import Timer from "./Timer";

// Import any types needed
import { Group } from "three";

// Register GSAP plugins
gsap.registerPlugin(SlowMo);

interface AnimationCanvasProps {
  eventsLength: number;
  backgroundImage: string;
}

function AnimationCanvas({
  eventsLength,
  backgroundImage,
}: AnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yaxisDistance = 500;

  const eventSphereScale = 30;

  const eventsXAxisDiff = 250;

  const x_axis_length = (eventsLength * eventsXAxisDiff) / 3;
  const z_axis_length = 68;
  const sep = 3;
  const [pages] = useState(Math.ceil(x_axis_length / 500));
  const mainCanvasRef = useRef<HTMLDivElement>(null);
  const startButton = useRef<Group>(null);

  const boxRefs = useRef<THREE.Mesh[]>([]);
  const linesContainerRef = useRef<Group>(new THREE.Group());
  const backgroundStartAnimation = "0px 0px";
  const { startBtnClicked, setStartBtnClicked } = useStore();
  const lineOneRef = useRef<THREE.InstancedMesh>(null!);
  const lineTwoRef = useRef<THREE.InstancedMesh>(null!);
  const lineThreeRef = useRef<THREE.InstancedMesh>(null!);

  const [cameraSettings] = useState({
    fov: 75,
    aspect: 2,
    near: 0.00001,
    far: 10000,
    position: [100, 0, yaxisDistance] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  });

  const t = 0;

  useEffect(() => {
    if (canvasRef.current) {
      // Calculate the width of your background image
      const backgroundWidth = 8000;
      const scrollSpeed = 5; // Number of pixels to scroll per interval

      // Get the current background position
      const currentPosition = parseInt(
        canvasRef.current.style.backgroundPosition.split(" ")[0],
        10
      );

      // Update the background position
      const newPosition = currentPosition + scrollSpeed;

      // Reset the background position when it reaches the end of the image
      if (newPosition >= 0) {
        canvasRef.current.style.backgroundPosition = `${-backgroundWidth}px 0px`;
      } else {
        canvasRef.current.style.backgroundPosition = `${newPosition}px 0px`;
      }
    }
  }, [canvasRef]);

  const wavePointsRef = useRef<Group>(null);

  const getCircularGeometryList = () => {
    const customScale = eventSphereScale + Math.random() + 20;
    return [
      {
        scale: customScale,
        difference: 1,
        color: "#FFFFFF",
        animFactor: 1,
      },
      {
        scale: customScale * 1.1,
        difference: 0.5,
        color: "#E5E5E5",
        animFactor: 0.8,
      },
      {
        scale: customScale * 1.2,
        difference: 0.3,
        color: "#F2F2F2",
        animFactor: 1.4,
      },
    ];
  };

  const handleStartButton = () => {
    setStartBtnClicked(true);

    if (mainCanvasRef.current) {
      gsap.to(mainCanvasRef.current, {
        y: "-100%", // move to the top
        scale: 0, // scale down
        duration: 1, // animation duration in seconds
      });
    }

    const tl = gsap.timeline();

    if (wavePointsRef.current) {
      tl.to(wavePointsRef.current.position, {
        x: -x_axis_length / 1.5,
        y: 0,
        z: 0,
        duration: 2,
      }).to(wavePointsRef.current.position, { x: 0, y: 0, z: 0, duration: 2 });
    }

    if (startButton.current) {
      gsap.to(startButton.current.position, {
        x: 0,
        y: 2000,
        z: 0,
        duration: 1,
        opacity: 0,
      });
    }
  };

  // Define the parameters of the wave
  const amplitude = 80;
  const waveNumber = 0.005;
  const phaseX = 0;
  const phaseZ = 0;

  const graph = useCallback(
    (x: number, z: number, time: number) => {
      // Define the new amplitude and wave number for the second sine wave
      const amplitude2 = amplitude * 0.5; // Half the amplitude of the first wave
      const waveNumber2 = waveNumber * 2; // Double the frequency of the first wave

      // Calculate the y-value for both sine waves
      const y1 =
        amplitude *
        Math.sin(waveNumber * x + phaseX + time) *
        Math.sin(2 * waveNumber * z + phaseZ + time);
      const y2 =
        amplitude2 *
        Math.sin(waveNumber2 * x + phaseX + time) *
        Math.sin(2 * waveNumber2 * z + phaseZ + time);

      // Sum the y-values of both sine waves
      const y = y1 + y2;

      return y;
    },
    [amplitude, waveNumber, phaseX, phaseZ]
  );

  return (
    <Canvas
      ref={canvasRef}
      camera={cameraSettings}
      style={{
        backgroundImage,
        backgroundPosition: backgroundStartAnimation,
      }}
    >
      <ambientLight intensity={0.5} />

      <Timer />

      {startBtnClicked && (
        <StarParticles
          count={1200}
          displacement={500}
          pointsSize={20}
          xDiff={pages * 300}
          yDiff={100}
          zDiff={100}
        />
      )}

      <Suspense fallback={null}>
        {startBtnClicked && (
          <CameraBounds
            eventsXAxisDiff={eventsXAxisDiff}
            boxRefs={boxRefs}
            canvasRef={canvasRef}
            eventsLength={eventsLength}
          />
        )}
        <group ref={wavePointsRef} position={[-x_axis_length / 1.5, -1000, 0]}>
          <Particles count={60} scale={10} x_axis_length={x_axis_length} />

          <Points
            canvasRef={canvasRef}
            x_axis_length={x_axis_length}
            z_axis_length={z_axis_length}
            sep={sep}
            backgroundStartAnimation={backgroundStartAnimation}
            backgroundImage={backgroundImage}
            t={t}
            boxRefs={boxRefs}
            linesContainerRef={linesContainerRef}
            graph={graph}
            lineOneRef={lineOneRef}
            lineTwoRef={lineTwoRef}
            lineThreeRef={lineThreeRef}
          />

          {/* The modals and events lists will need to be implemented later */}
        </group>
      </Suspense>

      <Suspense fallback={null}>
        {!startBtnClicked && (
          <MainCanvas
            mainCanvasRef={mainCanvasRef}
            canvasRef={canvasRef}
            backgroundStartAnimation={backgroundStartAnimation}
            backgroundImage={backgroundImage}
          />
        )}

        <group
          ref={startButton}
          position={[100, -300, 0]}
          onClick={handleStartButton}
        >
          {getCircularGeometryList().map((circle, index) => (
            <CircleGeometry
              key={index}
              scale={circle.scale}
              difference={circle.difference}
              color={circle.color}
              animFactor={circle.animFactor}
            />
          ))}
          <Text
            position={[0, 0, 0]}
            scale={[20, 20, 20]}
            color="white"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, 0]}
            font="/milestone/typefaces/mob.otf"
          >
            Start
          </Text>

          <mesh>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="white" transparent opacity={0.001} />
          </mesh>
        </group>
      </Suspense>
    </Canvas>
  );
}

export default AnimationCanvas;
