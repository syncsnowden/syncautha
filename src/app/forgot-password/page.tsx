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
    if (!email) return setError("Enter your email address.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      toast.success("Reset email sent!");
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

        <h1 className="auth-heading">Reset password</h1>
        <p className="auth-sub">
          {sent ? "Check your inbox for a reset link." : "Enter your email and we'll send you a link."}
        </p>

        {!sent ? (
          <>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label className="input-label" htmlFor="forgot-email">Email</label>
                <div className="input-icon-wrap">
                  <i className="fa-solid fa-envelope input-prefix-icon" />
                  <input id="forgot-email" type="email" className="input" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" /> Sending...</> : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div className="alert alert-success">
            <i className="fa-solid fa-circle-check" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Reset link sent. Check your spam folder if you don&apos;t see it.</span>
          </div>
        )}

        <div className="auth-footer">
          <Link href="/login" className="auth-link">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 11, marginRight: 5 }} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
