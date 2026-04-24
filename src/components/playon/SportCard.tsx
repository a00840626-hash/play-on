interface SportStat {
  value: string;
  label: string;
}

interface SportCardProps {
  icon: string;
  name: string;
  subtitle: string;
  level: string;
  elo: string;
  accent: "football" | "tennis" | "basket" | "volley";
  stats: [SportStat, SportStat, SportStat];
  achievements: string[];
  winRate: number; // 0-100
  record: string;
}

const accentMap = {
  football: {
    border: "border-l-sport-football",
    text: "text-sport-football",
    bg: "bg-sport-football/10",
    gradient: "linear-gradient(135deg, #0d1f0d 0%, #0a0a0a 100%)",
    ring: "border-[#1a2a1a]",
  },
  tennis: {
    border: "border-l-sport-tennis",
    text: "text-sport-tennis",
    bg: "bg-sport-tennis/10",
    gradient: "linear-gradient(135deg, #0d1220 0%, #0a0a0a 100%)",
    ring: "border-[#142036]",
  },
  basket: {
    border: "border-l-sport-basket",
    text: "text-sport-basket",
    bg: "bg-sport-basket/10",
    gradient: "linear-gradient(135deg, #1a0d00 0%, #0a0a0a 100%)",
    ring: "border-[#2a1808]",
  },
  volley: {
    border: "border-l-sport-volley",
    text: "text-sport-volley",
    bg: "bg-sport-volley/10",
    gradient: "linear-gradient(135deg, #1a1500 0%, #0a0a0a 100%)",
    ring: "border-[#2a2208]",
  },
};

export const SportCard = ({
  icon,
  name,
  subtitle,
  level,
  elo,
  accent,
  stats,
  achievements,
  winRate,
  record,
}: SportCardProps) => {
  const a = accentMap[accent];

  return (
    <div
      className={`rounded-lg border ${a.ring} border-l-[3px] ${a.border} p-5`}
      style={{ background: a.gradient }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[26px] leading-none">{icon}</span>
            <h3 className="font-display text-[22px] leading-none text-foreground">
              {name}
            </h3>
          </div>
          <p
            className={`font-condensed font-semibold text-[10px] uppercase mt-2 ${a.text}`}
            style={{ letterSpacing: "0.2em" }}
          >
            {subtitle}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span
            className={`inline-block font-condensed font-bold text-[11px] uppercase ${a.text} ${a.bg} px-2.5 py-1 rounded-[3px]`}
            style={{ letterSpacing: "0.1em" }}
          >
            {level}
          </span>
          <p className="font-mono-tech text-[11px] text-muted-foreground mt-1.5">
            ELO {elo}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="text-left">
            <div className={`font-display text-[40px] leading-none ${a.text}`}>
              {s.value}
            </div>
            <div
              className="font-condensed text-[10px] uppercase text-muted-foreground mt-1"
              style={{ letterSpacing: "0.12em" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Achievements horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mb-5">
        {achievements.map((ach, i) => (
          <span
            key={i}
            className="shrink-0 font-condensed font-bold text-[10px] uppercase px-3 py-1.5 rounded-full border whitespace-nowrap"
            style={{
              letterSpacing: "0.08em",
              backgroundColor: "hsl(var(--trophy) / 0.1)",
              color: "hsl(var(--trophy))",
              borderColor: "hsl(var(--trophy) / 0.3)",
            }}
          >
            {ach}
          </span>
        ))}
      </div>

      {/* Win rate bar */}
      <div>
        <div className="flex items-end justify-between mb-1.5">
          <span
            className="font-condensed text-[10px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.12em" }}
          >
            Win Rate
          </span>
          <span className={`font-display text-[20px] leading-none ${a.text}`}>
            {winRate}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${winRate}%`,
              backgroundColor: `hsl(var(--sport-${accent}))`,
            }}
          />
        </div>
        <p className="font-mono-tech text-[10px] text-muted-foreground mt-1.5">
          {record}
        </p>
      </div>
    </div>
  );
};
