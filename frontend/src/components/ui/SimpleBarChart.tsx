interface BarChartDatum {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarChartDatum[];
  height?: number;
}

/**
 * Small dependency-free bar chart (no charting library installed in this
 * project, so this is plain SVG). Good enough for simple counts/comparisons.
 */
export function SimpleBarChart({ data, height = 160 }: SimpleBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 100 / data.length;

  return (
    <div className="bar-chart">
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="bar-chart-svg">
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 24);
          return (
            <g key={d.label}>
              <rect
                x={i * barWidth + barWidth * 0.15}
                y={height - 24 - barHeight}
                width={barWidth * 0.7}
                height={barHeight}
                rx={1.5}
                fill={d.color ?? "var(--accent-primary)"}
              />
            </g>
          );
        })}
      </svg>
      <div className="bar-chart-labels">
        {data.map((d) => (
          <div key={d.label} className="bar-chart-label">
            <span>{d.label}</span>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
