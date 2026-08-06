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
    const fetchStats = async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        const { data: { session } } = await sb.auth.getSession();
        let token = session?.access_token || "";
        
        if (!token) {
          const raw = localStorage.getItem("syncauth_session");
          if (raw) token = JSON.parse(raw)?.access_token || "";
        }
        
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const r = await fetch("/api/dashboard/stats", { headers });
        if (r.ok) {
          setStats(await r.json());
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const maxKeys = stats?.maxKeys ?? 200;
  const activeKeys = stats?.activeKeys ?? 0;
  const plan = stats?.plan ?? "Free";

  const cards = [
    { label: "Active Keys", value: activeKeys, icon: "fa-key", delta: activeKeys ? "Keys currently bound" : "No active keys", isKeys: true },
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
                <div key={s.label} className="stat-card" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span className="stat-label">{s.label}</span>
                    <i className={`fa-solid ${s.icon}`} style={{ color: "var(--accent)", fontSize: 14 }} />
                  </div>
                  <div className="stat-value">{s.value.toLocaleString()}</div>
                  <div className="stat-change" style={{ marginBottom: s.isKeys ? 8 : 0 }}>{s.delta}</div>
                  
                  {s.isKeys && (
                    <div style={{ marginTop: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                        <span>{s.value} / {maxKeys} <span style={{ opacity: 0.7 }}>({plan})</span></span>
                        <span style={{ color: s.value >= maxKeys ? "#ef4444" : "var(--text-2)" }}>{Math.round(Math.min(100, (s.value / maxKeys) * 100))}%</span>
                      </div>
                      <div style={{ height: 4, background: "var(--border-2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ 
                          height: "100%", 
                          width: `${Math.min(100, (s.value / maxKeys) * 100)}%`, 
                          background: s.value >= maxKeys ? "#ef4444" : "var(--accent)", 
                          borderRadius: 99, 
                          transition: "width 0.4s ease" 
                        }} />
                      </div>
                    </div>
                  )}
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
