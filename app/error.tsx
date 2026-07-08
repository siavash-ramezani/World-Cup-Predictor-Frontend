"use client";

import { useEffect } from "react";
import { c, font } from "@/lib/theme";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="screen">
      <div
        className="scroll"
        style={{ padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: c.muted, fontSize: 13.5, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
          We couldn&apos;t load this screen. If the prediction API isn&apos;t running, start the Laravel server and try
          again.
        </p>
        {error.message && (
          <p
            style={{
              color: c.muted2,
              fontSize: 11.5,
              marginTop: 14,
              fontFamily: "ui-monospace, monospace",
              wordBreak: "break-word",
              maxWidth: 320,
            }}
          >
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="pressable"
          style={{
            marginTop: 24,
            background: c.lime,
            color: c.limeInk,
            borderRadius: 12,
            padding: "12px 22px",
            fontFamily: font.display,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
