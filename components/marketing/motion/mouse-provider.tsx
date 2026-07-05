"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type MousePos = { x: number; y: number; nx: number; ny: number };

const defaultPos: MousePos = { x: 0, y: 0, nx: 0, ny: 0 };
const MouseCtx = createContext<MousePos>(defaultPos);

export function MouseProvider({ children }: { children: ReactNode }) {
  const [pos, setPos] = useState(defaultPos);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX,
        y: e.clientY,
        nx: (e.clientX / window.innerWidth - 0.5) * 2,
        ny: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <MouseCtx.Provider value={pos}>{children}</MouseCtx.Provider>;
}

export function useMousePosition() {
  return useContext(MouseCtx);
}
