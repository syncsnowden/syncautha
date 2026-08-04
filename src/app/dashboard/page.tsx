"use client";

import Image from "next/image";
import Link from "next/link";

const stats = [
  { icon: "fa-key", label: "Active Keys", value: "0", color: "#00c8e0" },
  { icon: "fa-users", label: "Total Users", value: "0", color: "#818cf8" },
  { icon: "fa-shield-halved", label: "Auth Checks", value: "0", color: "#34d399" },
  { icon: "fa-ban", label: "Blocked", value: "0", color: "#f87171" },
];

export default function DashboardPage() {
  return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "rgba(6,13,31,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }} className="text-gradient">
            SyncAuth
          </span>
          <div className="badge badge-cyan" style={{ marginLeft: 6 }}>
            Dashboard
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
            <i className="fa-solid fa-bell" />
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--cyan) 0%, #0099b3 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#060d1f",
              cursor: "pointer",
            }}
          >
            U
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, padding: "40px 32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Welcome */}
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }} className="text-gradient">
            Good to see you 👋
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Your SyncAuth dashboard. Manage keys, monitor usage, and protect your scripts.
          </p>
        </div>

        {/* Stats */}
        <div
          className="animate-fade-up delay-100"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card"
              style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {s.label}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${s.color}18`,
                    border: `1px solid ${s.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: "0.85rem" }} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="glass-card animate-fade-up delay-200" style={{ padding: "60px 32px", textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "rgba(0,200,224,0.08)",
              border: "1px solid rgba(0,200,224,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <i className="fa-solid fa-key" style={{ fontSize: "2rem", color: "var(--cyan)" }} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 10 }}>No licenses yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: 380, margin: "0 auto 24px" }}>
            Create your first license key to start protecting your scripts and tracking users.
          </p>
          <button className="btn-primary" style={{ width: "auto", padding: "12px 28px" }}>
            <i className="fa-solid fa-plus" />
            Create License Key
          </button>
        </div>
      </div>
    </div>
  );
}
