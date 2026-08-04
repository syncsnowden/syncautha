"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ---------- particle canvas ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,224,${p.a})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
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
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-grid bg-radial-cyan"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "24px 16px",
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />

      {/* Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Top-right nav */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          Don&apos;t have an account?
        </span>
        <Link href="/register" className="btn-secondary" style={{ padding: "8px 16px" }}>
          <i className="fa-solid fa-user-plus" style={{ fontSize: "0.75rem" }} />
          Sign Up
        </Link>
      </div>

      {/* Card */}
      <div
        className="glass-card animate-fade-up"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "40px 36px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo + Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "16px",
                background: "rgba(0,200,224,0.08)",
                border: "1px solid rgba(0,200,224,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
              className="animate-pulse-glow"
            >
              <Image
                src="/syncauthlogo.png"
                alt="SyncAuth Logo"
                width={44}
                height={44}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
          <h1
            style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}
            className="text-gradient"
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Sign in to your{" "}
            <span style={{ color: "var(--cyan)", fontWeight: 600 }}>SyncAuth</span> dashboard
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="alert alert-error animate-fade-in" style={{ marginBottom: 20 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              Email Address
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-envelope input-icon" />
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label
                htmlFor="password"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}
              >
                Password
              </label>
              <Link href="/forgot-password" className="btn-ghost" style={{ fontSize: "0.78rem" }}>
                Forgot password?
              </Link>
            </div>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              id="remember"
            />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Keep me signed in for 30 days
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider" style={{ margin: "24px 0" }}>
          or
        </div>

        {/* Social / Discord */}
        <button
          type="button"
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "center", gap: 10, padding: "12px 24px" }}
          onClick={() => toast("Discord login coming soon!", { icon: "🔗" })}
        >
          <i className="fa-brands fa-discord" style={{ color: "#5865f2", fontSize: "1rem" }} />
          Continue with Discord
        </button>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          New to SyncAuth?{" "}
          <Link href="/register" className="btn-ghost">
            Create a free account
          </Link>
        </p>

        {/* Security badge */}
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
