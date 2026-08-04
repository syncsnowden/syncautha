"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthBackground from "@/components/AuthBackground";

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
        method: "POST", headers: { "Content-Type": "application/json" },
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "36px 48px",
        background: "#0a0a0a",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Animated network background */}
        <AuthBackground />

        {/* Gradient overlay so text stays readable */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 100%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={30} height={30} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}>SyncAuth</span>
        </div>

        {/* Center copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 100,
            background: "rgba(0,200,224,0.1)", border: "1px solid rgba(0,200,224,0.2)",
            fontSize: 11.5, fontWeight: 500, color: "var(--accent)",
            marginBottom: 20, letterSpacing: "0.04em",
          }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: 10 }} />
            SECURE · FAST · RELIABLE
          </div>
          <h2 style={{
            fontSize: 36, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16,
          }}>
            Protect your scripts.<br />
            <span style={{ color: "var(--accent)" }}>Authenticate</span> with<br />
            confidence.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 360 }}>
            License key authentication, HWID binding, and real-time user management — built for Roblox script developers.
          </p>

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
            {[
              { icon: "fa-key", text: "License keys" },
              { icon: "fa-fingerprint", text: "HWID binding" },
              { icon: "fa-chart-line", text: "Auth analytics" },
              { icon: "fa-ban", text: "User blacklist" },
            ].map(f => (
              <div key={f.text} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 12, color: "rgba(255,255,255,0.6)",
              }}>
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 10, color: "var(--accent)" }} />
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
            <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} />
            Join our Discord community
          </a>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 420,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px 40px",
        background: "var(--bg)",
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-2)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--text-1)", fontWeight: 500, textDecoration: "underline" }}>
              Sign up free
            </Link>
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <div className="input-icon-wrap">
              <i className="fa-solid fa-envelope input-prefix-icon" />
              <input id="email" type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="input-label" htmlFor="password">Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--text-1)")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--text-3)")}>
                Forgot password?
              </Link>
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
            {loading ? <><div className="spinner" />Signing in...</> : "Sign in →"}
          </button>
        </form>

        <div className="divider" style={{ margin: "20px 0" }}>or</div>

        <button type="button" className="btn btn-secondary" style={{ width: "100%" }}
          onClick={() => toast("Discord login coming soon!", { icon: "🔗" })}>
          <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} />
          Continue with Discord
        </button>

        <p style={{ marginTop: "auto", paddingTop: 32, fontSize: 11.5, color: "var(--text-3)", textAlign: "center" }}>
          <Link href="/tos" style={{ color: "var(--text-3)", textDecoration: "underline" }}>Terms</Link>
          {" · "}
          <Link href="/tos" style={{ color: "var(--text-3)", textDecoration: "underline" }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}
