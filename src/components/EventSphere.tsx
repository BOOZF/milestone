"use client";

import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import { Mesh, Vector3, Group } from "three";
import CircleGeometry from "./CircleGeometry";
import Spinner from "./Spinner";

// Helper functions
const splitStringPreserveWords = (input: string): string[] => {
  const middle = Math.floor(input.length / 2);
  let before = input.lastIndexOf(" ", middle);
  let after = input.indexOf(" ", middle + 1);

  if (middle - before < after - middle) {
    after = before;
  }

  const firstHalf = input.substring(0, after);
  const secondHalf = input.substring(after + 1);

  const temp: string[] = [];
  const array = [firstHalf, secondHalf];

  for (let index = 0; index < array.length; index++) {
    const elem = array[index];
    if (elem !== "") {
      temp.push(elem);
    }
  }

  return temp;
};

// Constants for category keys
const categoryKeys: { [key: string]: number } = {
  our_journey: 1,
  highlights: 2,
  sustainability: 3,
  dark_days: 4,
};

interface EventDetails {
  title: string;
  year: number;
  position: [number, number, number];
  categoryKey: string;
  description: string;
  files: string[];
  thumbnail?: string;
}

interface EventSphereProps {
  index: number;
  position: [number, number, number];
  boxRefs: React.MutableRefObject<THREE.Mesh[]>;
  eventDetails: EventDetails;
  scale: number;
  handleXAxisHighlight: (
    eventPositionIndex: number,
    currentDivision: number,
    categoryKey: string
  ) => void;
  thumbnail: string;
}

interface TransparentClickAreaProps {
  disableClick: React.MutableRefObject<boolean>;
  _handleOnClick: (index: number) => void;
  index: number;
}

function TransparentClickArea({
  disableClick,
  _handleOnClick,
  index,
}: TransparentClickAreaProps) {
  return (
    <mesh
      onClick={(e) => (!disableClick.current ? _handleOnClick(index) : null)}
    >
      <circleGeometry args={[30, 48]} />
      <meshStandardMaterial transparent={true} color={"#000"} opacity={0} />
    </mesh>
  );
}

function EventSphere({
  index,
  position,
  boxRefs,
  eventDetails,
  scale,
  handleXAxisHighlight,
  thumbnail,
}: EventSphereProps) {
  const textSize = 16;
  const titleTextSize = 12;

  let circleGeometry = new THREE.CircleGeometry(scale / 10, 48);
  const meshRef = useRef<Mesh>(null);
  const textRef = useRef<Group>(null);
  const markerLineRef = useRef<Group>(null);
  const sphereGroupRef = useRef<Group>(null);
  const markerTextRef = useRef<Group>(null);

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const [animationProgress, setAnimationProgress] = useState(0);
  const [scaleUpEventImage, setScaleUpEventImage] = useState(false);
  const [scaleDownEventImage, setScaleDownEventImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const eventImageTexture = useLoader(TextureLoader, eventDetails.thumbnail || thumbnail);
  const eventImageMeshRef = useRef<Mesh>(null);
  const eventImageAnimationScale = 0.05;
  const disableClick = useRef<boolean>(false);

  useEffect(() => {
    if (markerLineRef.current) {
      markerLineRef.current.visible = true;
    }
    if (markerTextRef.current) {
      markerTextRef.current.visible = true;
    }
  }, []);

  useFrame(({ clock }) => {
    const scaleFactor = 0.09;
    const elapsedTime = clock.getElapsedTime();
    const scaleFactorX = 1 + Math.sin(elapsedTime) * scaleFactor;
    const scaleFactorY = 1 + Math.sin(elapsedTime + Math.PI / 3) * scaleFactor;
    const scaleFactorZ =
      1 + Math.sin(elapsedTime + (2 * Math.PI) / 3) * scaleFactor;

    if (meshRef.current) {
      meshRef.current.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);
    }

    if (textRef.current) {
      const textScaleFactor = 1 + Math.sin(elapsedTime) * scaleFactor;
      textRef.current.scale.set(
        textSize * textScaleFactor,
        textSize * textScaleFactor,
        textSize * textScaleFactor
      );
    }

    if (scaleUpEventImage && eventImageMeshRef.current) {
      eventImageMeshRef.current.scale.set(
        animationProgress * 15,
        animationProgress * 15,
        animationProgress * 15
      );
      setAnimationProgress(
        Math.min(1, animationProgress + eventImageAnimationScale)
      );
      if (meshRef.current) {
        meshRef.current.scale.set(0, 0, 0);
      }
    }

    if (scaleDownEventImage && eventImageMeshRef.current) {
      eventImageMeshRef.current.scale.set(
        animationProgress * 15,
        animationProgress * 15,
        animationProgress * 15
      );
      setAnimationProgress(
        Math.max(animationProgress - eventImageAnimationScale, 0)
      );
      if (meshRef.current) {
        meshRef.current.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);
      }
    }

    if (animationProgress <= 0 && scaleDownEventImage) {
      setScaleDownEventImage(false);
      setScaleUpEventImage(false);
    }
  });

  function findDivision(
    rectangleWidth: number,
    numberOfDivisions: number,
    objectDistanceFromLeft: number
  ): number {
    const divisionWidth = rectangleWidth / numberOfDivisions;
    const division = Math.ceil(objectDistanceFromLeft / divisionWidth);
    return division;
  }

  const _handleOnClick = (index: number) => {
    setIsLoading(true);

    setTimeout(() => {
      disableClick.current = true;
      const spherePosition = new THREE.Vector3();
      if (meshRef.current) {
        meshRef.current.getWorldPosition(spherePosition);
        const projectedPosition = spherePosition.project(camera);

        const xCanvas = ((projectedPosition.x + 1) / 2) * width;
        const distanceFromLeft = Math.max(0, Math.min(width, xCanvas));
        const currentDivision = findDivision(width, 3, distanceFromLeft);

        setIsLoading(false);
        handleXAxisHighlight(index, currentDivision, eventDetails.categoryKey);
        disableClick.current = false;

        // Play sound
        new Audio("/milestone/content/jar_deny.wav").play();

        // Call API to handle key insertion
        handleKeyInsertion(eventDetails.categoryKey);
      }
    }, 2000);
  };

  const handleKeyInsertion = async (key: string) => {
    const keyValue = categoryKeys[key];
    var requestOptions = {
      method: "POST",
      redirect: "follow" as RequestRedirect,
    };

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/insert-key?key=${keyValue}`,
      requestOptions
    );
  };

  const circleShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      thickness: { value: 500 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float thickness;
      varying vec2 vUv;
  
      void main() {
        float dist = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.5 - thickness, 0.5, dist);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
  });

  const getCircularGeometryList = () => {
    const customScale = scale + Math.random();
    return [
      {
        scale: customScale,
        difference: 2,
        color: "#FFFFFF",
        animFactor: 1,
      },
      {
        scale: customScale * 1.1,
        difference: 0.5,
        color: "#FFFFFF",
        animFactor: 0.8,
      },
      {
        scale: customScale * 1.2,
        difference: 0.3,
        color: "#FFFFFF",
        animFactor: 1.4,
      },
    ];
  };

  return (
    <group
      ref={(ref) => {
        if (ref) {
          boxRefs.current[index] = ref as unknown as THREE.Mesh;
        }
      }}
      position={position}
    >
      <mesh ref={sphereGroupRef}>
        {getCircularGeometryList().map((circle, index) => (
          <CircleGeometry
            key={index}
            scale={circle.scale}
            difference={circle.difference}
            color={circle.color}
            animFactor={circle.animFactor}
          />
        ))}

        <mesh ref={meshRef} geometry={circleGeometry} rotation={[0, 0, 0]}>
          <circleGeometry args={[scale / 10, 32]} />
          <primitive object={circleShaderMaterial} />
        </mesh>

        <TransparentClickArea
          disableClick={disableClick}
          _handleOnClick={_handleOnClick}
          index={index}
        />

        <Line
          ref={markerLineRef as unknown as React.RefObject<THREE.Line>}
          points={[
            [0, 0, 0],
            [0, 80, 0],
          ]}
          color="white"
          lineWidth={1}
        />

        <Text
          ref={markerTextRef as unknown as React.RefObject<Text>}
          position={[0, 130, 0]}
          scale={[textSize, textSize, textSize]}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          font="/milestone/fonts/Prometo_XBd.ttf"
        >
          {eventDetails.year}
        </Text>

        <Text
          ref={markerTextRef as unknown as React.RefObject<Text>}
          position={[0, 108, 0]}
          scale={[titleTextSize, titleTextSize, titleTextSize]}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          font="/milestone/fonts/Prometo_Trial_Md.ttf"
        >
          {splitStringPreserveWords(eventDetails.title)[0]}
        </Text>

        <Text
          ref={markerTextRef as unknown as React.RefObject<Text>}
          position={[0, 92, 0]}
          scale={[titleTextSize, titleTextSize, titleTextSize]}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          font="/milestone/fonts/Prometo_Trial_Md.ttf"
        >
          {splitStringPreserveWords(eventDetails.title)[1]}
        </Text>

        {isLoading && <Spinner />}
      </mesh>
    </group>
  );
}

export default EventSphere;
