"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tempUpload, setTempUpload] = useState(""); // base64 preview of uploaded file
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setUsername(data.user.user_metadata?.username ?? "");
        setAvatarUrl(data.user.user_metadata?.avatar_url ?? "");
      }
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setTempUpload(reader.result);
        toast.success("Image preview loaded! Click 'Apply Uploaded Image' to confirm.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyImage = () => {
    if (!tempUpload) return;
    setAvatarUrl(tempUpload);
    setTempUpload("");
    toast.success("Image applied! Click 'Save Changes' to update your account.");
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
      toast.success("Profile updated successfully!");
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
        <p className="page-subtitle">Customize your profile picture, display details, and security.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 600 }}>
        {/* Profile Card & Avatar Upload */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Profile Picture</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Image Preview / Current PFP */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              
              {/* Display pending upload preview OR the active avatarUrl */}
              {tempUpload ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px dashed #f59e0b",
                      boxShadow: "0 0 16px rgba(245, 158, 11, 0.2)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={tempUpload}
                      alt="Pending Upload Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>
                    Preview
                  </span>
                </div>
              ) : avatarUrl ? (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--accent)",
                    boxShadow: "0 0 16px rgba(0, 200, 224, 0.2)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt="Current Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#ffffff",
                    flexShrink: 0,
                    boxShadow: "0 0 16px rgba(99, 102, 241, 0.2)",
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  
                  {/* Upload button always available */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <i className="fa-solid fa-upload" />
                    Upload Image
                  </button>

                  {/* Show Apply/Cancel buttons if there's a pending tempUpload */}
                  {tempUpload && (
                    <>
                      <button
                        type="button"
                        onClick={handleApplyImage}
                        className="btn btn-primary btn-sm"
                        style={{ background: "#22c55e", borderColor: "#22c55e", color: "#ffffff" }}
                      >
                        Apply Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempUpload("")}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* Remove button if current avatarUrl is set */}
                  {!tempUpload && avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="btn btn-secondary btn-sm"
                      style={{ color: "var(--danger)" }}
                    >
                      Remove PFP
                    </button>
                  )}
                </div>
              </div>
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
