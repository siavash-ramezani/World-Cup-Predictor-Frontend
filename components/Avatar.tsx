"use client";

import { useState } from "react";
import { avatarGradient, initials } from "@/lib/format";
import { c, font } from "@/lib/theme";

/**
 * The API returns `avatar_url` (local /avatars/*.jpg or a ui-avatars.com URL).
 * If it fails to load we fall back to initials on a deterministic gradient.
 */
export default function Avatar({
  name,
  src,
  size = 38,
  ring,
  fontSize,
  color = c.bg,
}: {
  name: string;
  src?: string | null;
  size?: number;
  ring?: string;
  fontSize?: number;
  color?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImg = !!src && !broken;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarGradient(name),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: ring && ring !== "transparent" ? `0 0 0 2px ${ring}` : undefined,
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: fontSize ?? Math.round(size * 0.34),
        color,
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setBroken(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
