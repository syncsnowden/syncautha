"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [registeredAt, setRegisteredAt] = useState("Loading...");
  const [inviteCode, setInviteCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

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
        return;
      }
      const cached = localStorage.getItem("syncauth_user");
      if (cached) {
        try {
          const u = JSON.parse(cached);
          setEmail(u.email ?? "");
          setUsername((u.email ?? "").split("@")[0] || "User");
          setRegisteredAt("Unknown");
          return;
        } catch {}
      }
      setRegisteredAt("Not logged in");
    }).catch(() => {
      const cached = localStorage.getItem("syncauth_user");
      if (cached) {
        try {
          const u = JSON.parse(cached);
          setEmail(u.email ?? "");
          setUsername((u.email ?? "").split("@")[0] || "User");
        } catch {}
      }
      setRegisteredAt("Unknown");
    });
  }, []);

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
        <p className="page-subtitle">Your account details and invite redemption.</p>
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
                <i
                  className="fa-solid fa-gift"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-3)",
                    fontSize: 14,
                    zIndex: 1,
                  }}
                />
                <input
                  className="input"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code..."
                  style={{ paddingLeft: 36 }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRedeem}
                disabled={redeeming}
                style={{ width: "auto", gap: 6 }}
              >
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
              <div style={{
                padding: "9px 12px",
                background: "var(--bg-2)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--radius)",
                color: "var(--text-1)",
                fontSize: 14,
              }}>
                {email || "Not available"}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">
                <i className="fa-solid fa-calendar-plus" style={{ marginRight: 6, fontSize: 11 }} />
                Registered At
              </label>
              <div style={{
                padding: "9px 12px",
                background: "var(--bg-2)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--radius)",
                color: "var(--text-1)",
                fontSize: 14,
              }}>
                {registeredAt}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <i className="fa-solid fa-circle-user" style={{ fontSize: 36, color: "var(--accent)" }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
              {username || "User"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              SyncAuth Account
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
