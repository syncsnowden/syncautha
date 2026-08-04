"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#00c8e0", "#22c55e"];

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

  const strength = getStrength(password);
  const pwMatch = confirm ? password === confirm : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !confirm) return setError("All fields are required.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (strength < 2) return setError("Password is too weak.");
    if (!agree) return setError("You must accept the Terms of Service.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      toast.success("Account created! Check your email to verify.");
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-grid bg-radial-cyan"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "24px 16px" }}
    >
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Top nav */}
      <div style={{ position: "fixed", top: 20, right: 24, display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Already have an account?</span>
        <Link href="/login" className="btn-secondary" style={{ padding: "8px 16px" }}>
          <i className="fa-solid fa-right-to-bracket" style={{ fontSize: "0.75rem" }} />
          Sign In
        </Link>
      </div>

      <div className="glass-card animate-fade-up" style={{ width: "100%", maxWidth: 460, padding: "40px 36px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div
              style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(0,200,224,0.08)", border: "1px solid rgba(0,200,224,0.2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}
              className="animate-pulse-glow"
            >
              <Image src="/syncauthlogo.png" alt="SyncAuth" width={44} height={44} style={{ objectFit: "contain" }} priority />
            </div>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }} className="text-gradient">
            Create account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Join <span style={{ color: "var(--cyan)", fontWeight: 600 }}>SyncAuth</span> and protect your scripts
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in" style={{ marginBottom: 20 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Username */}
          <div>
            <label htmlFor="username" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Username
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-user input-icon" />
              <input id="username" type="text" className="input-field" placeholder="cooldevname" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Email Address
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-envelope input-icon" />
              <input id="reg-email" type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Password
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon" />
              <input id="reg-password" type={showPw ? "text" : "password"} className="input-field" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
              <button type="button" className="input-action" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password">
                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
            {/* Strength bars */}
            {password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="strength-bar" style={{ flex: 1, background: i <= strength ? strengthColors[strength] : "var(--border)", transition: "background 0.3s" }} />
                  ))}
                </div>
                <span style={{ fontSize: "0.75rem", color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="confirm" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Confirm Password
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-shield input-icon" />
              <input
                id="confirm"
                type="password"
                className="input-field"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                style={{ borderColor: pwMatch === false ? "rgba(239,68,68,0.5)" : pwMatch === true ? "rgba(0,200,224,0.5)" : undefined }}
              />
              {pwMatch !== null && (
                <span className="input-action" style={{ color: pwMatch ? "var(--cyan)" : "#ef4444", cursor: "default" }}>
                  <i className={`fa-solid ${pwMatch ? "fa-check" : "fa-xmark"}`} />
                </span>
              )}
            </div>
          </div>

          {/* Terms */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" className="custom-checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} id="terms" style={{ marginTop: 2 }} />
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              I agree to the{" "}
              <a href="#" style={{ color: "var(--cyan)", textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
              {" "}and{" "}
              <a href="#" style={{ color: "var(--cyan)", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
            </span>
          </label>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? (
              <><div className="spinner" /> Creating account...</>
            ) : (
              <><i className="fa-solid fa-user-plus" /> Create Account</>
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="btn-ghost">Sign in</Link>
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <div className="badge badge-cyan">
            <i className="fa-solid fa-shield-halved" />
            256-bit encrypted &amp; secure
          </div>
        </div>
      </div>
    </div>
  );
}
