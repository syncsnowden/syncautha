"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={28} height={28} className="auth-logo-img" priority />
          <span className="auth-logo-name">SyncAuth</span>
        </div>

        <h1 className="auth-heading">Create account</h1>
        <p className="auth-sub">Get started with SyncAuth for free.</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
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
              <>
                <div className="strength-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="strength-bar" style={{ background: i <= strength ? COLORS[strength] : undefined }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: COLORS[strength] }}>
                  {["","Weak","Fair","Good","Strong","Very strong"][strength]}
                </span>
              </>
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
            {loading ? <><div className="spinner" /> Creating account...</> : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
