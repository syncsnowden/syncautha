"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const THEMES = [
  { name: "Cyan", value: "#00c8e0", icon: "fa-droplet" },
  { name: "Purple", value: "#8b5cf6", icon: "fa-moon" },
  { name: "Pink", value: "#ec4899", icon: "fa-heart" },
  { name: "Green", value: "#22c55e", icon: "fa-leaf" },
  { name: "Amber", value: "#f59e0b", icon: "fa-sun" },
  { name: "Red", value: "#ef4444", icon: "fa-fire" },
  { name: "Noir", value: "#6b7280", icon: "fa-circle" },
];

function applyTheme(color: string) {
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-dim", color + "1f");
  document.documentElement.style.setProperty("--accent-border", color + "40");
  localStorage.setItem("syncauth_theme", color);
}

function getSavedTheme(): string {
  if (typeof window === "undefined") return "#00c8e0";
  return localStorage.getItem("syncauth_theme") || "#00c8e0";
}

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [registeredAt, setRegisteredAt] = useState("Loading...");
  const [inviteCode, setInviteCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [theme, setTheme] = useState(getSavedTheme);
  const [plan, setPlan] = useState("Free");

  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setEmail(user.email ?? "");
        const name = user.user_metadata?.username || (user.email ? user.email.split("@")[0] : "User");
        setUsername(name);
        const created = user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : "Unknown";
        setRegisteredAt(created);
        setPlan(user.user_metadata?.redeemed_code || "Free");
        return;
      }
      loadFromCache();
    }).catch(loadFromCache);
  }, []);

  function loadFromCache() {
    const cached = localStorage.getItem("syncauth_user");
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setEmail(u.email ?? "");
        setUsername((u.email ?? "").split("@")[0] || "User");
        setRegisteredAt(u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : "Unknown");
      } catch {}
    } else {
      setRegisteredAt("Not logged in");
    }
  }

  const handleTheme = (color: string) => {
    setTheme(color);
    applyTheme(color);
    toast.success(`Theme set to ${THEMES.find(t => t.value === color)?.name}`);
  };

  const handleRedeem = async () => {
    if (!inviteCode.trim()) {
      toast.error("Enter an invite code.");
      return;
    }
    setRedeeming(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({
        data: { redeemed_code: inviteCode.trim() },
      });
      if (error) throw error;
      toast.success("Invite code redeemed!");
      setPlan(inviteCode.trim());
      setInviteCode("");
    } catch {
      toast.error("Failed to redeem code.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details, theme, and invite redemption.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 520 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">
              <i className="fa-solid fa-ticket" style={{ marginRight: 8, color: "var(--accent)" }} />
              Redeem Invite Code
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <i className="fa-solid fa-gift" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 14, zIndex: 1 }} />
                <input className="input" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Enter invite code..." style={{ paddingLeft: 36 }} />
              </div>
              <button className="btn btn-primary" onClick={handleRedeem} disabled={redeeming} style={{ width: "auto", gap: 6 }}>
                <i className="fa-solid fa-check" />
                {redeeming ? "Redeeming..." : "Redeem"}
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">
              <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: "var(--accent)" }} />
              Account Info
            </span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">
                <i className="fa-solid fa-envelope" style={{ marginRight: 6, fontSize: 11 }} />
                Email
              </label>
              <div style={{ padding: "9px 12px", background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", color: "var(--text-1)", fontSize: 14 }}>
                {email || "Not available"}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">
                <i className="fa-solid fa-calendar-plus" style={{ marginRight: 6, fontSize: 11 }} />
                Registered At
              </label>
              <div style={{ padding: "9px 12px", background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", color: "var(--text-1)", fontSize: 14 }}>
                {registeredAt}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">
                <i className="fa-solid fa-crown" style={{ marginRight: 6, fontSize: 11 }} />
                Your Plan
              </label>
              <div style={{ padding: "9px 12px", background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", color: plan === "Free" ? "var(--text-2)" : "var(--accent)", fontSize: 14, fontWeight: 600 }}>
                {plan}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">
              <i className="fa-solid fa-palette" style={{ marginRight: 8, color: "var(--accent)" }} />
              Theme
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTheme(t.value)}
                  title={t.name}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: t.value,
                    border: theme === t.value ? "3px solid #fff" : "3px solid transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    outline: "none",
                  }}
                >
                  <i className={`fa-solid ${t.icon}`} style={{ color: "#fff", fontSize: 14 }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
          <i className="fa-solid fa-circle-user" style={{ fontSize: 36, color: "var(--accent)" }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{username || "User"}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>SyncAuth Account</div>
          </div>
            </div>
            <div className="input-group">
              <label className="input-label">
                <i className="fa-solid fa-crown" style={{ marginRight: 6, fontSize: 11 }} />
                Your Plan
              </label>
              <div style={{ padding: "9px 12px", background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius)", color: plan === "Free" ? "var(--text-2)" : "var(--accent)", fontSize: 14, fontWeight: 600 }}>
                {plan}
              </div>
            </div>
          </div>
    </>
  );
}

