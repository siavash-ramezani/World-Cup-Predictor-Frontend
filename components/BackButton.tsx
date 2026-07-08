"use client";

import { useRouter } from "next/navigation";
import { c } from "@/lib/theme";
import { ChevronLeft } from "@/components/icons";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      aria-label="Back"
      className="pressable"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: c.surface,
        border: `1px solid ${c.border3}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: c.text2,
      }}
    >
      <ChevronLeft size={16} />
    </button>
  );
}
