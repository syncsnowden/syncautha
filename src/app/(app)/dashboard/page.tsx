"use client";
import { useEffect, useState } from "react";
import ExecutionChart from "@/components/ExecutionChart";

interface DashboardStats {
  activeKeys: number;
  totalUsers: number;
  executions: number;
  blocked: number;
  chartData: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats", err);
        setLoading(false);
      });
  }, []);

  const cards = [
    { label: "Active Keys", value: stats?.activeKeys ?? 0, icon: "fa-key", delta: stats?.activeKeys ? "Keys currently bound" : "No active keys" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: "fa-users", delta: stats?.totalUsers ? "Claimed users tracked" : "No users yet" },
    { label: "Executions", value: stats?.executions ?? 0, icon: "fa-chart-line", delta: "Total lifetime runs" },
    { label: "Blocked", value: stats?.blocked ?? 0, icon: "fa-ban", delta: "Access attempts denied" },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your SyncAuth project &amp; script executions.</p>
      </div>

      <div className="page-body">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <div className="spinner" style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            <div className="stat-grid">
              {cards.map((s) => (
                <div key={s.label} className="stat-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span className="stat-label">{s.label}</span>
                    <i className={`fa-solid ${s.icon}`} style={{ color: "var(--accent)", fontSize: 14 }} />
                  </div>
                  <div className="stat-value">{s.value.toLocaleString()}</div>
                  <div className="stat-change">{s.delta}</div>
                </div>
              ))}
            </div>

            <ExecutionChart data={stats?.chartData} total={stats?.executions} />
          </>
        )}
      </div>
    </>
  );
}
