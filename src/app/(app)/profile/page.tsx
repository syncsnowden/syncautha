"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [registeredAt, setRegisteredAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        const createdAt = data.user.created_at
          ? new Date(data.user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : "Unknown";
        setRegisteredAt(createdAt);
        setEndsAt(data.user.user_metadata?.ends_at || "N/A");
      }
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
      const { data, error } = await supabase.auth.updateUser({
        data: { redeemed_code: inviteCode.trim() },
      });
      if (error) throw error;
      toast.success("Invite code redeemed!");
      setInviteCode("");
      if (data.user?.user_metadata?.ends_at) {
        setEndsAt(data.user.user_metadata.ends_at);
      }
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
            <span className="card-title">Redeem Invite Code</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="input"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code..."
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleRedeem} disabled={redeeming} style={{ width: "auto" }}>
                {redeeming ? "Redeeming..." : "Redeem"}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Info</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" value={email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Registered At</label>
                <div style={{ padding: "9px 0", fontSize: 14, color: "var(--text-1)", fontWeight: 500 }}>{registeredAt}</div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Ends At</label>
                <div style={{ padding: "9px 0", fontSize: 14, color: "var(--text-1)", fontWeight: 500 }}>{endsAt}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
