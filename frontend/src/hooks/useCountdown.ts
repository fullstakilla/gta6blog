"use client";

import { useEffect, useState } from "react";

export interface CountdownState {
  days: string;
  hrs: string;
  mins: string;
  secs: string;
  flip: { d: number; h: number; m: number; s: number };
}

const INITIAL: CountdownState = {
  days: "247",
  hrs: "14",
  mins: "32",
  secs: "08",
  flip: { d: 0, h: 0, m: 0, s: 0 },
};

const pad = (n: number) => String(n).padStart(2, "0");

function compute(target: number, prev: CountdownState): CountdownState {
  const diff = Math.max(0, target - Date.now());
  const days = String(Math.floor(diff / 86400000));
  const hrs = pad(Math.floor(diff / 3600000) % 24);
  const mins = pad(Math.floor(diff / 60000) % 60);
  const secs = pad(Math.floor(diff / 1000) % 60);
  return {
    days,
    hrs,
    mins,
    secs,
    flip: {
      d: prev.days === days ? prev.flip.d : 1 - prev.flip.d,
      h: prev.hrs === hrs ? prev.flip.h : 1 - prev.flip.h,
      m: prev.mins === mins ? prev.flip.m : 1 - prev.flip.m,
      s: prev.secs === secs ? prev.flip.s : 1 - prev.flip.s,
    },
  };
}

export function useCountdown(releaseISO: string): CountdownState {
  const [target] = useState<number>(() => {
    const parsed = new Date(releaseISO).getTime();
    return parsed && parsed - Date.now() > 0
      ? parsed
      : Date.now() + ((247 * 24 + 14) * 60 + 32) * 60000 + 8000;
  });
  const [state, setState] = useState<CountdownState>(() => compute(target, INITIAL));
  useEffect(() => {
    const iv = setInterval(() => {
      setState((s) => compute(target, s));
    }, 1000);
    return () => clearInterval(iv);
  }, [target]);
  return state;
}
