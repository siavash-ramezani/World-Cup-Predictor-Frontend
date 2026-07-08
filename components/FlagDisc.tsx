import { flagIconCode, teamGradient } from "@/lib/format";

/**
 * Circular team crest.
 *
 * The API sends flags as emoji ("🇫🇷"), but Windows ships no flag glyphs — Chrome
 * renders the regional-indicator pair as two letter boxes. So we decode the emoji
 * to a country code and paint the real flag from the self-hosted `flag-icons` SVG
 * set, which looks identical on every platform. Undecodable flags fall back to the
 * deterministic per-team gradient the original design used.
 */
export default function FlagDisc({
  team,
  size = 44,
  ring = 1,
}: {
  team: { name: string; flag?: string | null };
  size?: number;
  ring?: number;
}) {
  const code = flagIconCode(team);
  const shared = {
    width: size,
    height: size,
    borderRadius: "50%",
    boxShadow: `inset 0 0 0 ${ring}px rgba(255,255,255,0.2)`,
    flexShrink: 0,
    display: "block",
  } as const;

  if (!code) {
    return <div title={team.name} aria-label={team.name} style={{ ...shared, background: teamGradient(team.name) }} />;
  }

  return (
    <span
      // `fis` selects the 1x1 (square) artwork; `cover` fills the circle.
      className={`fi fis fi-${code}`}
      title={team.name}
      aria-label={team.name}
      role="img"
      style={{ ...shared, backgroundSize: "cover", backgroundPosition: "center" }}
    />
  );
}
