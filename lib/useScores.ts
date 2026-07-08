"use client";

import { useCallback, useState } from "react";

export type Score = { h: number; a: number };
export type Side = "h" | "a";

// Clamped score state shared by the Predict list and Match Detail screens.
// Mirrors the design's bump(): clamp each side to 0..15.
export function useScores(initial: Record<string, Score>) {
  const [scores, setScores] = useState<Record<string, Score>>(initial);

  const bump = useCallback((id: string, side: Side, delta: number) => {
    setScores((s) => {
      const cur = s[id];
      const v = Math.max(0, Math.min(15, cur[side] + delta));
      return { ...s, [id]: { ...cur, [side]: v } };
    });
  }, []);

  return { scores, bump };
}

export function verdict(homeName: string, awayName: string, hs: number, as: number) {
  if (hs > as) return `${homeName} win`;
  if (hs < as) return `${awayName} win`;
  return "Draw";
}
