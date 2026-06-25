export function MiniChart({ values }: { values: number[] }) {
  const width = 150;
  const height = 42;
  const min = Math.min(...values) * 0.94;
  const max = Math.max(...values) * 1.06;
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const positive = values[values.length - 1] >= values[0];

  return (
    <svg className="mini-chart" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={positive ? "chart-up" : "chart-down"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "#71d7a0" : "#ff6f79"} stopOpacity=".25" />
          <stop offset="100%" stopColor={positive ? "#71d7a0" : "#ff6f79"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${positive ? "chart-up" : "chart-down"})`}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#71d7a0" : "#ff6f79"}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
