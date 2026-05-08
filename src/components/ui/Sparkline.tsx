interface Props {
  values: number[];
  color?: string;
  height?: number;
}

export default function Sparkline({ values, color = '#4f8df7', height = 40 }: Props) {
  if (values.length === 0) return null;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(1, max - min);
  const w = 200;
  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * w;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" height={height}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polyline
        points={[`0,${height}`, ...points, `${w},${height}`].join(' ')}
        fill={`url(#g-${color})`}
      />
    </svg>
  );
}
