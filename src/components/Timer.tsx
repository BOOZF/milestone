"use client";

import { useEffect, useRef } from "react";

const Timer = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const timeoutValue = 5 * 60 * 1000; // 5 minutes

  const setTimer = () => {
    startTimeRef.current = new Date();
    timeoutRef.current = setTimeout(() => {
      // Reload the page after 5 minutes of inactivity
      window.location.reload();
    }, timeoutValue);
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTimer();
  };

  useEffect(() => {
    setTimer();

    // Listen for any touch or mouse events in the document
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("mousedown", resetTimer);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
    };
  }, []); // Run this effect only once, when the component is mounted

  return null;
};

export default Timer;
