"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
export const runtime = "edge";

interface UserItem {
  hwid: string;
  key: string;
  ip: string;
  username: string;
  display_name: string;
  executor: string;
  last_seen: number;
  status: "active" | "banned";
  project_name: string;
  project_id: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"name" | "ip" | "hwid">("name");
  const [loading, setLoading] = useState(true);

  const FILTER_OPTIONS = [
    { key: "name", label: "Display name", icon: "fa-user" },
    { key: "ip",   label: "IP address",   icon: "fa-network-wired" },
    { key: "hwid", label: "HWID",         icon: "fa-fingerprint" },
  ] as const;

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        toast.error("Failed to load users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    if (filter === "name") {
      return (
        u.username.toLowerCase().includes(s) ||
        u.display_name.toLowerCase().includes(s) ||
        u.project_name.toLowerCase().includes(s)
      );
    }
    if (filter === "ip") {
      return u.ip.toLowerCase().includes(s);
    }
    if (filter === "hwid") {
      return u.hwid.toLowerCase().includes(s);
    }
    return false;
  });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">All users who have authenticated with your license keys.</p>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All users ({filteredUsers.length})</span>
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

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setLoading(true);
                  fetchUsers();
                }}
                style={{ width: "auto" }}
                disabled={loading}
              >
                <i className="fa-solid fa-arrows-rotate" />
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <div className="spinner" style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Display name</th>
                    <th>Project</th>
                    <th>IP address</th>
                    <th>HWID</th>
                    <th>Last seen</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-icon"><i className="fa-solid fa-users" /></div>
                        <div className="empty-title">No users found</div>
                        <div className="empty-desc">
                          {search ? "No users match your search criteria." : "Users appear here once they authenticate with a license key."}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Display name</th>
                    <th>Project</th>
                    <th>IP address</th>
                    <th>HWID</th>
                    <th>Last seen</th>
                    <th>Status</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.hwid}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-1)" }}>{u.display_name}</span>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>@{u.username} ({u.executor})</span>
                        </div>
                      </td>
                      <td>{u.project_name}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.ip}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)" }}>{u.hwid}</td>
                      <td>{new Date(u.last_seen).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-primary">Active</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={async () => {
                            if (!confirm("Are you sure you want to delete this user? This will kick them out of the game and delete their associated key.")) return;
                            try {
                              const res = await fetch(`/api/users?hwid=${u.hwid}&project_id=${u.project_id}`, { method: "DELETE" });
                              if (res.ok) {
                                toast.success("User deleted & license revoked!");
                                fetchUsers();
                              } else {
                                toast.error("Failed to delete user");
                              }
                            } catch {
                              toast.error("Error deleting user");
                            }
                          }}
                          style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171" }}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
