"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthBackground from "@/components/AuthBackground";

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const COLORS = ["", "#ef4444", "#f59e0b", "#3b82f6", "#00c8e0", "#22c55e"];
const LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = pwStrength(password);
  const match = confirm ? password === confirm : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !confirm) return setError("All fields are required.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (strength < 2) return setError("Password is too weak.");
    if (!agree) return setError("Accept the Terms of Service to continue.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      toast.success("Account created! Check your email.");
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "36px 48px", background: "#0a0a0a",
        borderRight: "1px solid var(--border)", overflow: "hidden",
      }}>
        <AuthBackground />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={30} height={30} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}>SyncAuth</span>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 100,
            background: "rgba(0,200,224,0.1)", border: "1px solid rgba(0,200,224,0.2)",
            fontSize: 11.5, fontWeight: 500, color: "var(--accent)",
            marginBottom: 20, letterSpacing: "0.04em",
          }}>
            <i className="fa-solid fa-user-plus" style={{ fontSize: 10 }} />
            FREE TO GET STARTED
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
            Join SyncAuth.<br />
            Start protecting<br />
            <span style={{ color: "var(--accent)" }}>your scripts.</span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 360 }}>
            Get your scripts protected in minutes. Generate keys, bind HWIDs, and track every auth attempt in real time.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
            {[
              { icon: "fa-check", text: "Free account, no credit card" },
              { icon: "fa-check", text: "Unlimited auth checks" },
              { icon: "fa-check", text: "HWID binding & IP logging" },
              { icon: "fa-check", text: "Real-time user management" },
            ].map(f => (
              <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 11, color: "var(--accent)", width: 14 }} />
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
            <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} />
            Join our Discord community
          </a>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 440, flexShrink: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 40px", background: "var(--bg)", overflowY: "auto",
      }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-2)" }}>
            Already have one?{" "}
            <Link href="/login" style={{ color: "var(--text-1)", fontWeight: 500, textDecoration: "underline" }}>Sign in</Link>
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Username</label>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-user input-prefix-icon" />
              <input id="username" type="text" className="input" placeholder="coolname"
                value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">Email</label>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-envelope input-prefix-icon" />
              <input id="reg-email" type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-pw">Password</label>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-lock input-prefix-icon" />
              <input id="reg-pw" type={showPw ? "text" : "password"} className="input" placeholder="Min. 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
              <button type="button" className="input-suffix-btn" onClick={() => setShowPw(v => !v)}>
                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
            {password && (
              <div>
                <div className="strength-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="strength-bar" style={{ background: i <= strength ? COLORS[strength] : undefined }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: COLORS[strength] }}>{LABELS[strength]}</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirm">Confirm password</label>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-lock input-prefix-icon" />
              <input id="confirm" type="password" className="input" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required
                style={{ borderColor: match === false ? "rgba(239,68,68,0.5)" : match === true ? "rgba(0,200,224,0.4)" : undefined }} />
              {match !== null && (
                <span className="input-suffix-btn" style={{ color: match ? "var(--accent)" : "var(--danger)", cursor: "default" }}>
                  <i className={`fa-solid ${match ? "fa-check" : "fa-xmark"}`} />
                </span>
              )}
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" className="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
              I agree to the{" "}
              <Link href="/tos" style={{ color: "var(--text-1)", textDecoration: "underline" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/tos" style={{ color: "var(--text-1)", textDecoration: "underline" }}>Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><div className="spinner" />Creating account...</> : "Create account →"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 11.5, color: "var(--text-3)", textAlign: "center" }}>
          <Link href="/tos" style={{ color: "var(--text-3)", textDecoration: "underline" }}>Terms</Link>
          {" · "}
          <Link href="/tos" style={{ color: "var(--text-3)", textDecoration: "underline" }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}
