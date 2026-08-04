"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Fill in all fields.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo">
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={28} height={28} className="auth-logo-img" priority />
          <span className="auth-logo-name">SyncAuth</span>
        </div>

        <h1 className="auth-heading">Sign in</h1>
        <p className="auth-sub">Enter your credentials to access your dashboard.</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-envelope input-prefix-icon" />
              <input id="email" type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="input-label" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>Forgot password?</Link>
            </div>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-lock input-prefix-icon" />
              <input id="password" type={showPw ? "text" : "password"} className="input"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" required />
              <button type="button" className="input-suffix-btn" onClick={() => setShowPw(v => !v)}>
                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" className="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>Stay signed in for 30 days</span>
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><div className="spinner" /> Signing in...</> : "Sign in"}
          </button>
        </form>

        <div className="divider" style={{ margin: "20px 0" }}>or</div>

        <button type="button" className="btn btn-secondary" style={{ width: "100%", marginBottom: 4 }}
          onClick={() => toast("Discord login coming soon!", { icon: "🔗" })}>
          <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} />
          Continue with Discord
        </button>

        <div className="auth-footer">
          No account?{" "}
          <Link href="/register" className="auth-link">Create one</Link>
          <span style={{ margin: "0 8px", color: "var(--border-2)" }}>·</span>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer" className="auth-link">
            <i className="fa-brands fa-discord" style={{ marginRight: 4 }} />Discord
          </a>
        </div>
      </div>
    </div>
  );
}
