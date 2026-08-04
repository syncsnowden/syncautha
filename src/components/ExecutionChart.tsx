"use client";
import { useState } from "react";

// Execution history sample matching user's timeline graph
const CHART_DATA = [
  { date: "7/9", count: 32 },
  { date: "7/10", count: 28 },
  { date: "7/11", count: 0 },
  { date: "7/12", count: 16 },
  { date: "7/13", count: 35 },
  { date: "7/14", count: 32 },
  { date: "7/15", count: 48 },
  { date: "7/16", count: 22 },
  { date: "7/17", count: 120 },
  { date: "7/18", count: 265 },
  { date: "7/19", count: 98 },
  { date: "7/20", count: 148 },
  { date: "7/21", count: 295 },
  { date: "7/22", count: 74 },
  { date: "7/23", count: 70 },
  { date: "7/24", count: 106 },
  { date: "7/25", count: 76 },
  { date: "7/26", count: 82 },
  { date: "7/27", count: 115 },
  { date: "7/28", count: 32 },
  { date: "7/29", count: 94 },
  { date: "7/30", count: 145 },
  { date: "7/31", count: 120 },
  { date: "8/1", count: 38 },
  { date: "8/2", count: 24 },
  { date: "8/3", count: 15 },
  { date: "8/4", count: 8 },
  { date: "8/5", count: 0 },
  { date: "8/6", count: 0 },
  { date: "8/7", count: 0 },
];

export default function ExecutionChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = 300;
  const width = 1000;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Calculate coordinates for points
  const points = CHART_DATA.map((d, i) => {
    const x = paddingX + (i / (CHART_DATA.length - 1)) * chartW;
    const y = height - paddingY - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  // Construct SVG path line
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Construct gradient area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div
      style={{
        width: "100%",
        background: "#0c0e17",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 18,
        padding: "24px 20px 20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        marginTop: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-chart-line" style={{ color: "#818cf8", fontSize: 14 }} />
            Execution Counter
          </div>
          <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>
            Daily Lua script execution &amp; authentication requests
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Total Executions: <span style={{ color: "#ffffff", fontWeight: 700 }}>2,176</span>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", minWidth: 700, display: "block" }}
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
            </linearGradient>
          </defs>

          {/* Y Axis Gridlines */}
          {[300, 200, 100, 0].map((val) => {
            const y = height - paddingY - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10.5"
                  textAnchor="end"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGrad)" />

          {/* Main Smooth White Line */}
          <path d={pathD} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 6 : 3.5}
                fill="#ffffff"
                stroke="#0c0e17"
                strokeWidth="2"
                style={{ transition: "all 0.15s ease" }}
              />
              {/* Invisible touch/hover target */}
              <circle cx={pt.x} cy={pt.y} r={12} fill="transparent" />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 8}
              fill={hoveredIdx === i ? "#ffffff" : "#64748b"}
              fontSize="10"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontWeight={hoveredIdx === i ? "700" : "400"}
            >
              {pt.date}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: "absolute",
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100}%`,
              transform: "translate(-50%, -130%)",
              background: "#030305",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              pointerEvents: "none",
              boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            <div>{CHART_DATA[hoveredIdx].date}: <span style={{ color: "#818cf8" }}>{CHART_DATA[hoveredIdx].count} Executions</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
