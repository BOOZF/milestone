"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap, Power4 } from "gsap";

interface CameraBoundsProps {
  boxRefs: React.MutableRefObject<THREE.Mesh[]>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  eventsXAxisDiff: number;
  eventsLength: number;
}

const getDecadeOfMostYears = (years: number[]): number | string => {
  const decadesFrequency: { [key: number]: number } = {};

  for (let i = 0; i < years.length; i++) {
    const decade = Math.floor(years[i] / 10) * 10;
    decadesFrequency[decade] = (decadesFrequency[decade] || 0) + 1;
  }

  let maxDecade = null;
  let maxCount = 0;
  for (const decade in decadesFrequency) {
    if (decadesFrequency[decade] > maxCount) {
      maxCount = decadesFrequency[decade];
      maxDecade = parseInt(decade);
    }
  }

  return maxDecade !== null ? maxDecade : "No years provided";
};

const CameraBounds = ({
  boxRefs,
  canvasRef,
  eventsXAxisDiff,
  eventsLength,
}: CameraBoundsProps) => {
  const { camera } = useThree();
  const initialXRef = useRef<number>(0);
  const firstDecade = 1960;
  const prevousDecadeRef = useRef<number>(firstDecade);
  const minX = -eventsXAxisDiff / 2;
  const maxX = eventsLength * eventsXAxisDiff + 100;
  const minRotationY = -0.5;
  const maxRotationY = 0.5;
  let scrollEndTimer: NodeJS.Timeout;

  const handleBackgroundColorChange = () => {
    const eventsYearCurrentlyInView: number[] = [];

    boxRefs.current.forEach((box, index) => {
      if (box) {
        const boundingBox = new THREE.Box3().setFromObject(box);
        const frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(
          new THREE.Matrix4().multiplyMatrices(
            camera.projectionMatrix,
            camera.matrixWorldInverse
          )
        );

        if (frustum.intersectsBox(boundingBox)) {
          // In a real app, we'd get the year from the event data
          // For now, we'll use a placeholder
          eventsYearCurrentlyInView.push(1960 + index);
        }
      }
    });

    const decade = parseInt(
      getDecadeOfMostYears(eventsYearCurrentlyInView).toString()
    );
    const maxbackgrounWidth = 13440;
    const positionOffset = maxbackgrounWidth / 10;

    if (canvasRef.current) {
      if (decade > prevousDecadeRef.current) {
        const currentPosition = parseInt(
          canvasRef.current.style.backgroundPosition.split(" ")[0],
          10
        );
        const newPosition = currentPosition - positionOffset;
        if (newPosition >= -maxbackgrounWidth) {
          gsap.to(canvasRef.current.style, {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
              gsap.to(canvasRef.current.style, {
                backgroundPosition: `${newPosition}px 0px`,
                duration: 2,
              });
            },
          });
        }
        prevousDecadeRef.current = decade;
      } else if (decade < prevousDecadeRef.current) {
        const currentPosition = parseInt(
          canvasRef.current.style.backgroundPosition.split(" ")[0],
          10
        );
        const newPosition = currentPosition + positionOffset;
        if (newPosition <= 0) {
          gsap.to(canvasRef.current.style, {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
              gsap.to(canvasRef.current.style, {
                backgroundPosition: `${newPosition}px 0px`,
                duration: 2,
              });
            },
          });
        }
        prevousDecadeRef.current = decade;
      }
    }
  };

  const handleWheelScroll = (e: WheelEvent) => {
    const moveAmountX = e.deltaY * 13 * 2;
    const newX = camera.position.x + moveAmountX;
    const newRotationY = (moveAmountX / window.innerWidth) * Math.PI * -1;

    if (newX >= minX && newX <= maxX) {
      gsap.killTweensOf(camera.position);
      gsap.to(camera.position, {
        duration: 2.5,
        ease: Power4.easeOut,
        x: newX,
      });

      if (moveAmountX > -30 || moveAmountX < 30) {
        gsap.killTweensOf(camera.rotation);
        gsap.to(camera.rotation, {
          y: Math.max(Math.min(newRotationY, maxRotationY), minRotationY),
          duration: 0.5,
        });
      }
    }

    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      gsap.killTweensOf(camera.rotation);
      gsap.to(camera.rotation, {
        y: 0,
        duration: 1,
      });
      handleBackgroundColorChange();
    }, 50);
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    initialXRef.current = touch.clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    const currentX = touch.clientX;
    let distanceX = currentX - initialXRef.current;
    distanceX = distanceX * -1;
    const direction = distanceX > 0 ? -1 : 1;
    const newX = camera.position.x + distanceX * 3;

    if (newX >= minX && newX <= maxX) {
      gsap.to(camera.position, {
        duration: 2,
        ease: Power4.easeOut,
        x: newX,
      });
    }

    gsap.to(camera.rotation, {
      y: direction * 0.5,
      duration: 0.5,
    });
  };

  const handleTouchEnd = () => {
    gsap.to(camera.rotation, {
      y: 0,
      duration: 1.5,
    });
    handleBackgroundColorChange();
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheelScroll);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheelScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [camera]);

  return null;
};

export default CameraBounds;
