/**
 * GitHub-style activity heatmap, 52 weeks × 7 days.
 * Density biased toward recent months.
 */
const WEEKS = 52;
const DAYS = 7;

function generateActivity(): number[][] {
  // Deterministic pseudo-random for stable mockup
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const grid: number[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = [];
    // recency bias: recent weeks more dense
    const recency = w / WEEKS;
    for (let d = 0; d < DAYS; d++) {
      const baseChance = 0.18 + recency * 0.45;
      const r = rand();
      let level = 0;
      if (r < baseChance * 0.55) level = 1;
      if (r < baseChance * 0.3) level = 2;
      if (r < baseChance * 0.12) level = 3;
      // Weekends slightly more active
      if ((d === 5 || d === 6) && r < baseChance * 0.6) level = Math.max(level, 2);
      week.push(level);
    }
    grid.push(week);
  }
  return grid;
}

const ACTIVITY = generateActivity();
const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const DAYS_LABEL = ["L", "M", "M", "J", "V", "S", "D"];

const levelColor = (lvl: number) => {
  switch (lvl) {
    case 1: return "hsl(var(--primary) / 0.3)";
    case 2: return "hsl(var(--primary) / 0.6)";
    case 3: return "hsl(var(--primary))";
    default: return "hsl(0 0% 12%)";
  }
};

export const Heatmap = () => {
  return (
    <div>
      {/* Months row */}
      <div className="flex pl-5 mb-1.5" style={{ gap: 2 }}>
        {MONTHS.map((m) => (
          <span
            key={m}
            className="font-condensed text-[8px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.1em", width: `${(WEEKS / 12) * 10}px` }}
          >
            {m}
          </span>
        ))}
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col mr-1.5" style={{ gap: 2 }}>
          {DAYS_LABEL.map((d, i) => (
            <span
              key={i}
              className="font-condensed text-[8px] text-muted-foreground leading-none flex items-center"
              style={{ height: 8 }}
            >
              {i % 2 === 0 ? d : ""}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex" style={{ gap: 2 }}>
          {ACTIVITY.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: 2 }}>
              {week.map((lvl, di) => (
                <div
                  key={di}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 1.5,
                    backgroundColor: levelColor(lvl),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span
          className="font-condensed text-[9px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.1em" }}
        >
          Menos
        </span>
        {[0, 1, 2, 3].map((l) => (
          <div
            key={l}
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: levelColor(l),
            }}
          />
        ))}
        <span
          className="font-condensed text-[9px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.1em" }}
        >
          Más
        </span>
      </div>
    </div>
  );
};
