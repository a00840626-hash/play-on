/**
 * Tiny SVG sparkline showing ranking improvement (lower = better).
 * X axis = months, Y axis = ranking position (inverted).
 */
export const RankingChart = () => {
  // Ranking values from #800 (worst) → #247 (best), 6 months
  const data = [800, 690, 612, 540, 410, 247];
  const w = 160;
  const h = 60;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 4;

  const points = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    // Lower rank number = higher on chart
    const y = pad + ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const fillPath =
    `${linePath} L ${points[points.length - 1][0].toFixed(1)} ${h} L ${points[0][0].toFixed(1)} ${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#rankFill)" />
      <path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === points.length - 1 ? 3 : 1.75}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth={i === points.length - 1 ? 1.5 : 0}
        />
      ))}
    </svg>
  );
};
