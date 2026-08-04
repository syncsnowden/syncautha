"use client";
import ExecutionChart from "@/components/ExecutionChart";

const stats = [
  { label: "Active Keys", value: "0", icon: "fa-key", delta: "No keys yet" },
  { label: "Total Users", value: "0", icon: "fa-users", delta: "No users yet" },
  { label: "Auth Checks", value: "0", icon: "fa-shield-halved", delta: "Last 30 days" },
  { label: "Blocked", value: "0", icon: "fa-ban", delta: "Last 30 days" },
];

export default function DashboardPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your SyncAuth project &amp; script executions.</p>
      </div>

      <div className="page-body">
        {/* Stats Grid */}
        <div className="stat-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span className="stat-label">{s.label}</span>
                <i className={`fa-solid ${s.icon}`} style={{ color: "var(--text-3)", fontSize: 13 }} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-change">{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Execution Counter Graph (Matching user screenshot) */}
        <ExecutionChart />

      </div>
    </>
  );
}
