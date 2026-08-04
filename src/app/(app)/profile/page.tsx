"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setUsername(data.user.user_metadata?.username ?? "");
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { username } });
      if (error) throw error;
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const initials = username.slice(0, 2).toUpperCase() || "??";

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account details.</p>
      </div>
      <div className="page-body" style={{ maxWidth: 520 }}>
        {/* Avatar */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#000", flexShrink: 0
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{username || "—"}</div>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>{email}</div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">Account details</span></div>
          <div className="card-body">
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" value={email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>Email cannot be changed here.</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "auto", alignSelf: "flex-start" }}>
                {loading ? <><div className="spinner" /> Saving...</> : "Save changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="card-header">
            <span className="card-title" style={{ color: "var(--danger)" }}>Danger zone</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
              Permanently delete your account and all associated keys. This cannot be undone.
            </p>
            <button className="btn btn-danger btn-sm" style={{ width: "auto" }}>
              <i className="fa-solid fa-trash" />
              Delete account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
