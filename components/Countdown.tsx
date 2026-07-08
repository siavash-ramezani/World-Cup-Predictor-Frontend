"use client";

import { useEffect, useState } from "react";
import { countdownLabel } from "@/lib/format";

/**
 * Live "2h 14m" ticker. Renders a neutral placeholder until mounted so the
 * server-rendered HTML can't disagree with the client clock.
 */
export default function Countdown({
  deadlineMs,
  lockedText = "Locked",
  uppercase = false,
}: {
  deadlineMs: number;
  lockedText?: string;
  uppercase?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span suppressHydrationWarning>…</span>;

  const label = countdownLabel(deadlineMs, now) ?? lockedText;
  return <span suppressHydrationWarning>{uppercase ? label.toUpperCase() : label}</span>;
}
