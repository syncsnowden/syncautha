"use client";
import { useState } from "react";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"name" | "ip" | "hwid">("name");

  const FILTER_OPTIONS = [
    { key: "name", label: "Display name", icon: "fa-user" },
    { key: "ip",   label: "IP address",   icon: "fa-network-wired" },
    { key: "hwid", label: "HWID",         icon: "fa-fingerprint" },
  ] as const;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">All users who have authenticated with your license keys.</p>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All users</span>
            {/* Search bar + filter */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Filter type toggle */}
              <div style={{
                display: "flex",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}>
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setFilter(opt.key)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 500,
                      background: filter === opt.key ? "var(--bg-3)" : "transparent",
                      color: filter === opt.key ? "var(--text-1)" : "var(--text-3)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <i className={`fa-solid ${opt.icon}`} style={{ fontSize: 11 }} />
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="input-icon-wrap" style={{ width: 220 }}>
                <i className="fa-solid fa-magnifying-glass input-prefix-icon" />
                <input
                  className="input"
                  placeholder={`Search by ${FILTER_OPTIONS.find(o => o.key === filter)?.label}…`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Display name</th>
                  <th>IP address</th>
                  <th>HWID</th>
                  <th>Last seen</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon"><i className="fa-solid fa-users" /></div>
                      <div className="empty-title">No users yet</div>
                      <div className="empty-desc">
                        Users appear here once they authenticate with a license key.
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
