"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email address.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setSent(true);
      toast.success("Reset email sent!");
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

      <div className="glass-card animate-fade-up" style={{ width: "100%", maxWidth: 420, padding: "40px 36px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(0,200,224,0.08)", border: "1px solid rgba(0,200,224,0.2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
              <Image src="/syncauthlogo.png" alt="SyncAuth" width={44} height={44} style={{ objectFit: "contain" }} priority />
            </div>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }} className="text-gradient">
            Reset password
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {sent ? "Check your inbox for a reset link." : "Enter your email and we'll send you a link."}
          </p>
        </div>

        {!sent ? (
          <>
            {error && (
              <div className="alert alert-error animate-fade-in" style={{ marginBottom: 20 }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label htmlFor="forgot-email" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-envelope input-icon" />
                  <input id="forgot-email" type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" /> Sending...</> : <><i className="fa-solid fa-paper-plane" /> Send Reset Link</>}
              </button>
            </form>
          </>
        ) : (
          <div className="alert alert-success animate-fade-in">
            <i className="fa-solid fa-circle-check" style={{ fontSize: "1.1rem" }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Email sent!</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.8 }}>Didn&apos;t receive it? Check your spam folder or try again.</div>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link href="/login" className="btn-ghost">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem", marginRight: 4 }} />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
