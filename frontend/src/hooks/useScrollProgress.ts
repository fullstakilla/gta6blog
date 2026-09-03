"use client";

import { useEffect, useState } from "react";
import { MINI_TIMER_SHOW_AT } from "@/lib/constants";

export interface ScrollProgress {
  progress: number;
  scrolled: boolean;
  pastMiniTimerThreshold: boolean;
}

export function useScrollProgress(): ScrollProgress {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      setProgress(p);
      setScrolled(window.scrollY > 30);
      setPast(window.scrollY > window.innerHeight * MINI_TIMER_SHOW_AT);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { progress, scrolled, pastMiniTimerThreshold: past };
}
