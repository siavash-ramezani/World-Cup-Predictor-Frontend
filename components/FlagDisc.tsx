import { flagIconCode, teamGradient } from "@/lib/format";

/**
 * Circular team crest.
 *
 * The API sends flags two ways: a real country as emoji ("🇫🇷"), or a fictional/
 * demo team as a generated placeholder image URL. Windows ships no flag glyphs —
 * Chrome renders the regional-indicator pair as two letter boxes — so real-country
 * emoji get decoded to a country code and painted from the self-hosted `flag-icons`
 * SVG set, which looks identical on every platform. Image-URL flags are rendered
 * directly. Anything else (undecodable emoji, no flag) falls back to the
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
  const shared = {
    width: size,
    height: size,
    borderRadius: "50%",
    boxShadow: `inset 0 0 0 ${ring}px rgba(255,255,255,0.2)`,
    flexShrink: 0,
    display: "block",
  } as const;

  if (team.flag && /^https?:\/\//.test(team.flag)) {
    return (
      <img
        src={team.flag}
        alt={team.name}
        title={team.name}
        style={{ ...shared, objectFit: "cover" }}
      />
    );
  }

  const code = flagIconCode(team);

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
