"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&q=80",
];

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setUsername(data.user.user_metadata?.username ?? "");
        setAvatarUrl(data.user.user_metadata?.avatar_url ?? "");
        setCustomInput(data.user.user_metadata?.avatar_url ?? "");
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const finalAvatar = customInput.trim() || avatarUrl;
      const { error } = await supabase.auth.updateUser({
        data: { username, avatar_url: finalAvatar },
      });
      if (error) throw error;
      setAvatarUrl(finalAvatar);
      toast.success("Profile updated! Refresh to see sidebar changes.");
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
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Customize your avatar, display details, and security.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 580 }}>
        {/* Profile Card & Avatar Preview */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Profile Picture</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {avatarUrl || customInput ? (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--accent)",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <img
                    src={customInput || avatarUrl}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => toast.error("Failed to load avatar image URL.")}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#ffffff",
                    flexShrink: 0,
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  {initials}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#ffffff" }}>{username || "Developer"}</div>
                <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{email}</div>
                <div style={{ fontSize: 11.5, color: "var(--accent)", marginTop: 4 }}>
                  Choose a preset or paste an image URL below
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase" }}>
                Select Preset Avatar
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCustomInput(url);
                      setAvatarUrl(url);
                    }}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: (customInput === url || avatarUrl === url) ? "2px solid #818cf8" : "2px solid transparent",
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <img src={url} alt={`Preset ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="input-group">
              <label className="input-label">Custom Avatar Image URL</label>
              <input
                className="input"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setAvatarUrl(e.target.value);
                }}
                placeholder="https://example.com/my-avatar.png"
              />
            </div>
          </div>
        </div>

        {/* Account Details Form */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Account details</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" value={email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>Email cannot be changed here.</span>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "auto", alignSelf: "flex-start" }}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
          <div className="card-header">
            <span className="card-title" style={{ color: "var(--danger)" }}>Danger zone</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
              Permanently delete your account and all associated keys. This cannot be undone.
            </p>
            <button className="btn btn-danger btn-sm" style={{ width: "auto" }}>
              <i className="fa-solid fa-trash" /> Delete account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
