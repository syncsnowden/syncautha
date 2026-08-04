"use client";
import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas error")); return; }
      ctx.drawImage(img, 0, 0, 150, 150);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const u = data.user.user_metadata?.username || data.user.email?.split("@")[0] || "";
        setEmail(data.user.email ?? "");
        setUsername(u);
        setAvatarUrl(data.user.user_metadata?.avatar_url ?? "");
      }
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setAvatarUrl(compressed);
      toast.success("Photo ready! Click Save Changes.");
    } catch {
      toast.error("Failed to process image.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = getSupabase();
      const meta: Record<string, string> = { username };
      if (avatarUrl && avatarUrl.startsWith("data:")) {
        meta.avatar_url = avatarUrl;
      } else if (avatarUrl) {
        meta.avatar_url = avatarUrl;
      } else {
        meta.avatar_url = "";
      }
      const { error } = await supabase.auth.updateUser({ data: meta });
      if (error) {
        console.error("UpdateUser error:", error.message);
        toast.error(error.message);
        return;
      }
      const { data: fresh } = await supabase.auth.getUser();
      if (fresh.user) {
        setEmail(fresh.user.email ?? "");
        setUsername(fresh.user.user_metadata?.username ?? "");
        setAvatarUrl(fresh.user.user_metadata?.avatar_url ?? "");
      }
      toast.success("Profile updated!");
    } catch (err) {
      console.error("Profile save failed:", err);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : email ? email.slice(0, 2).toUpperCase() : "??";

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Customize your profile picture, display details, and security.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Profile Picture</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {avatarUrl ? (
                <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent)", flexShrink: 0 }}>
                  <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent) 0%, #0098b0 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {initials}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#ffffff" }}>{username || email?.split("@")[0] || "Developer"}</div>
                  <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{email}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-sm">Change Picture</button>
                  {avatarUrl && (
                    <button type="button" onClick={() => setAvatarUrl("")} className="btn btn-secondary btn-sm">Remove</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Account details</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" value={email} disabled style={{ opacity: 0.5 }} />
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>Email cannot be changed here.</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "auto", alignSelf: "flex-start" }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        <div className="card" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
          <div className="card-header">
            <span className="card-title" style={{ color: "var(--danger)" }}>Danger zone</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
              Permanently delete your account and all associated keys.
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
