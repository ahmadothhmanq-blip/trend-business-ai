"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Mouse = { nx: number; ny: number };

const MouseCtx = createContext<Mouse>({ nx: 0, ny: 0 });

export function MouseProvider({ children }: { children: React.ReactNode }) {
  const [mouse, setMouse] = useState<Mouse>({ nx: 0, ny: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        nx: (e.clientX / window.innerWidth) * 2 - 1,
        ny: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <MouseCtx.Provider value={mouse}>{children}</MouseCtx.Provider>;
}

export function useMouse() {
  return useContext(MouseCtx);
}
