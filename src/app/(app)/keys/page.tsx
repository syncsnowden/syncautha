"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface KeyItem {
  key: string;
  project_id: string;
  project_name: string;
  hwid: string | null;
  created: number;
  expires: number;
  status: "unused" | "used";
  linked_reward: string | null;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const res = await fetch("/api/keys", { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        setKeys(data);
      } else {
        toast.error("Failed to load keys");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching keys");
    } finally {
      setLoading(false);
    }
  }

  const filteredKeys = keys.filter((k) => {
    const s = search.toLowerCase();
    return (
      k.key.toLowerCase().includes(s) ||
      k.project_name.toLowerCase().includes(s) ||
      (k.hwid && k.hwid.toLowerCase().includes(s)) ||
      k.status.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">License Keys</h1>
        <p className="page-subtitle">Manage and monitor all license keys for your projects.</p>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All keys ({filteredKeys.length})</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="input-icon-wrap" style={{ width: 240 }}>
                <i className="fa-solid fa-magnifying-glass input-prefix-icon" />
                <input
                  className="input"
                  placeholder="Search key or project..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setLoading(true);
                  fetchKeys();
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
          ) : filteredKeys.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fa-solid fa-key" />
              </div>
              <div className="empty-title">No keys found</div>
              <div className="empty-desc">
                {search ? "No keys match your search criteria." : "Keys will appear here once generated in your projects."}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>License Key</th>
                    <th>Project</th>
                    <th>HWID Binding</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((k) => (
                    <tr key={k.key}>
                      <td style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                        {k.key}
                      </td>
                      <td>{k.project_name}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 12, color: k.hwid ? "var(--text-2)" : "var(--text-3)" }}>
                        {k.hwid ? k.hwid : "Unbound"}
                      </td>
                      <td>{new Date(k.created).toLocaleDateString()}</td>
                      <td>{new Date(k.expires).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${k.status === "used" ? "badge-primary" : "badge-secondary"}`}>
                          {k.status === "used" ? "Used" : "Unused"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(k.key);
                              toast.success("Key copied!");
                            }}
                            style={{ padding: "4px 8px" }}
                          >
                            <i className="fa-solid fa-copy" />
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={async () => {
                              if (!confirm("Are you sure you want to delete this key? This will kick any active user using it and make it unusable.")) return;
                              try {
                                const { getSupabase } = await import("@/lib/supabase/client");
                                const sb = getSupabase();
                                const { data: { session } } = await sb.auth.getSession();
                                const headers: Record<string, string> = {};
                                if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
                                const res = await fetch(`/api/keys?key=${k.key}`, { method: "DELETE", headers });
                                if (res.ok) {
                                  toast.success("Key deleted!");
                                  fetchKeys();
                                } else {
                                  toast.error("Failed to delete key");
                                }
                              } catch {
                                toast.error("Error deleting key");
                              }
                            }}
                            style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171" }}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
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
