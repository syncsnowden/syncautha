"use client";
import { useState, useMemo } from "react";

interface ExecutionChartProps {
  data?: { date: string; count: number }[];
  total?: number;
}

export default function ExecutionChart({ data = [], total = 0 }: ExecutionChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 });
    }
    return dates;
  }, [data]);

  const maxVal = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.count), 0);
    return max > 0 ? Math.ceil(max / 10) * 10 : 100;
  }, [chartData]);

  const width = 1000;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = useMemo(() => {
    return chartData.map((d, i) => {
      const x = paddingX + (i / (chartData.length - 1)) * chartW;
      const y = height - paddingY - (d.count / maxVal) * chartH;
      return { x, y, ...d };
    });
  }, [chartData, chartW, chartH, maxVal]);

  const pathD = useMemo(() => {
    return points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "");
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    return `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }, [pathD, points]);

  const yLabels = useMemo(() => {
    return [maxVal, Math.round(maxVal * 2 / 3), Math.round(maxVal / 3), 0];
  }, [maxVal]);

  return (
    <div style={{ width: "100%", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 20px 20px", marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-chart-line" style={{ color: "var(--accent)", fontSize: 14 }} />
            Execution Counter
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 2 }}>
            Daily Lua script execution &amp; authentication requests
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
          Total Executions: <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{total}</span>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", minWidth: 700, display: "block" }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 200, 224, 0.15)" />
              <stop offset="100%" stopColor="rgba(0, 200, 224, 0.0)" />
            </linearGradient>
          </defs>

          {yLabels.map((val) => {
            const y = height - paddingY - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="4 4" />
                <text x={paddingX - 10} y={y + 4} fill="var(--text-3)" fontSize="10.5" textAnchor="end" fontFamily="Inter, sans-serif">{val}</text>
              </g>
            );
          })}

          <path d={areaD} fill="url(#chartGrad)" />
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((pt, i) => (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: "pointer" }}>
              <circle cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 6 : 3.5} fill="var(--accent)" stroke="var(--bg-1)" strokeWidth="2" style={{ transition: "all 0.15s ease" }} />
              <circle cx={pt.x} cy={pt.y} r={12} fill="transparent" />
            </g>
          ))}

          {points.map((pt, i) => {
            const showLabel = i % 3 === 0 || i === points.length - 1;
            return showLabel ? (
              <text key={i} x={pt.x} y={height - 8} fill={hoveredIdx === i ? "var(--text-1)" : "var(--text-3)"} fontSize="10" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={hoveredIdx === i ? "600" : "400"}>
                {pt.date}
              </text>
            ) : null;
          })}
        </svg>

        {hoveredIdx !== null && (
          <div
            style={{
              position: "absolute",
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100}%`,
              transform: "translate(-50%, -130%)",
              background: "var(--bg-1)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 12px",
              color: "var(--text-1)",
              fontSize: 12,
              fontWeight: 600,
              pointerEvents: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            {chartData[hoveredIdx].date}: <span style={{ color: "var(--accent)" }}>{chartData[hoveredIdx].count} Executions</span>
          </div>
        )}
      </div>
    </div>
  );
}
