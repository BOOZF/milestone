"use client";

import { useEffect, useRef } from "react";
import { Html } from "@react-three/drei";

interface MainCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mainCanvasRef: React.RefObject<HTMLDivElement>;
  backgroundStartAnimation: string;
  backgroundImage: string;
}

export default function MainCanvas({
  canvasRef,
  mainCanvasRef,
  backgroundStartAnimation,
  backgroundImage,
}: MainCanvasProps) {
  const scrollDirection = useRef<"up" | "down" | null>(null);
  const scrollDelta = useRef<number>(0);
  const targetRotationY = useRef<number>(0);

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

  return (
    <Html center>
      <div
        ref={mainCanvasRef}
        style={{
          height: "50vh",
          width: "100vw",
          marginLeft: "210px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            fontSize: "4rem",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          History of Milestones
        </h1>
      </div>
    </Html>
  );
}
