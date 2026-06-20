import { useAvatarUrl } from "@/hooks/useAvatarUrl";

interface Props {
  name?: string | null;
  avatarPath?: string | null;
  size?: number;
  className?: string;
}

function initialsOf(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function colorOf(name?: string | null) {
  const seed = (name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;
  return `hsl(${hue} 55% 35%)`;
}

export const InitialsAvatar = ({ name, avatarPath, size = 48, className = "" }: Props) => {
  const signedUrl = useAvatarUrl(avatarPath);
  const initials = initialsOf(name);

  if (signedUrl) {
    return (
      <img
        src={signedUrl}
        alt={name || "avatar"}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          border: "2px solid hsl(var(--primary) / 0.4)",
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-display text-primary-foreground shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        lineHeight: 1,
        background: colorOf(name),
        border: "2px solid hsl(var(--primary) / 0.4)",
      }}
      aria-label={name || "avatar"}
    >
      {initials}
    </div>
  );
};
