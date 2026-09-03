"use client";

import { useEffect, useRef, useState } from "react";
import { EXIT_INTENT_TOP_THRESHOLD } from "@/lib/constants";

export function useExitIntent() {
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= EXIT_INTENT_TOP_THRESHOLD && !shownRef.current) {
        shownRef.current = true;
        setOpen(true);
      }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, []);

  return { open, close: () => setOpen(false) };
}
