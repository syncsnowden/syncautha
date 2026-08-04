"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
      resolve(canvas.toDataURL("image/jpeg", 0.7));
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setUsername(data.user.user_metadata?.username ?? data.user.email?.split("@")[0] ?? "");
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

    setUploading(true);
    try {
      const supabase = createClient();

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadErr) {
        const compressed = await compressImage(file);
        setAvatarUrl(compressed);
        toast.success("Image ready! Click 'Save Changes' to apply.");
      } else {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        setAvatarUrl(urlData.publicUrl);
        toast.success("Image uploaded! Click 'Save Changes' to apply.");
      }
    } catch {
      try {
        const compressed = await compressImage(file);
        setAvatarUrl(compressed);
        toast.success("Image ready! Click 'Save Changes' to apply.");
      } catch {
        toast.error("Failed to process image.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { username, avatar_url: avatarUrl },
      });
      if (error) throw error;

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setEmail(userData.user.email ?? "");
        setUsername(userData.user.user_metadata?.username ?? "");
        setAvatarUrl(userData.user.user_metadata?.avatar_url ?? "");
      }

      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

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
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--accent)",
                    boxShadow: "0 0 16px rgba(0, 200, 224, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00c8e0 0%, #0098b0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#ffffff",
                    flexShrink: 0,
                    boxShadow: "0 0 16px rgba(0, 200, 224, 0.3)",
                  }}
                >
                  {initials}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#ffffff" }}>{username || "Developer"}</div>
                  <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{email}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-sm" disabled={uploading}>
                    {uploading ? "Uploading..." : "Change Picture"}
                  </button>
                  {avatarUrl && (
                    <button type="button" onClick={() => setAvatarUrl("")} className="btn btn-secondary btn-sm">
                      Remove
                    </button>
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
                <input className="input" value={email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
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
