"use client";

import { useEffect, useRef, useState } from "react";
import { LS_KEYS } from "@/lib/constants";

export interface SplashState {
  visible: boolean;
  lines: number;
}

export function useSplash(): SplashState {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState(0);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    let first = false;
    try {
      first = !localStorage.getItem(LS_KEYS.firstVisit);
    } catch {}
    if (!first) return;
    setVisible(true);
    try {
      localStorage.setItem(LS_KEYS.firstVisit, "1");
    } catch {}
    const li = setInterval(() => {
      setLines((l) => (l >= 3 ? l : l + 1));
    }, 480);
    setTimeout(() => {
      clearInterval(li);
      setVisible(false);
    }, 2100);
  }, []);

  return { visible, lines };
}
