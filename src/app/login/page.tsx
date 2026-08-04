"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DiscordIcon from "@/components/DiscordIcon";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const submit = async (e: React.FormEvent) => {
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
    <div
      ref={pageRef}
      style={{
        minHeight: "100vh",
        background: "#030305",
        position: "relative",
        overflowX: "hidden",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes ambient-glow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.4; }
          50% { transform: scale(1.15) translate(30px, -20px); opacity: 0.7; }
        }
        @keyframes card-entry {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-card-stealth {
          animation: card-entry 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Deep Subtle Midnight Ambient Glowing Auras */}
      <div
        style={{
          position: "fixed",
          width: 750,
          height: 750,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          animation: "ambient-glow 18s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(0, 0, 0, 0) 70%)",
          bottom: -150,
          right: -100,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Subtle Mouse Spotlight */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.03), transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* Ultra Subtle Noise Grain */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          zIndex: 3,
        }}
      />

      {/* Main Container */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* Navigation Bar */}
        <header
          style={{
            width: "100%",
            maxWidth: 1120,
            margin: "0 auto",
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image src="/syncauthlogo.png" alt="SyncAuth" width={22} height={22} style={{ objectFit: "contain" }} priority />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#ffffff", letterSpacing: "-0.02em" }}>
              SyncAuth
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href="https://discord.gg/sM8ukpuzVE"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#cbd5e1",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              <DiscordIcon style={{ width: 15, height: 15, fill: "#5865f2" }} />
              Discord
            </a>
            <Link
              href="/register"
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: "#ffffff",
                color: "#08080a",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Form Card Section */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px 60px",
          }}
        >
          <div
            className="auth-card-stealth"
            style={{
              width: "100%",
              maxWidth: 400,
              background: "#0a0b0e",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 22,
              padding: "38px 32px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Title */}
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 6 }}>
                Sign in to SyncAuth
              </h1>
              <p style={{ fontSize: 13.5, color: "#94a3b8" }}>
                Manage license keys &amp; script authorization
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  marginBottom: 20,
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#fca5a5",
                  fontSize: 13,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 10,
                      color: "#ffffff",
                      fontSize: 14,
                      padding: "11px 14px 11px 40px",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}
                  >
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 10,
                      color: "#ffffff",
                      fontSize: 14,
                      padding: "11px 40px 11px 40px",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 13,
                      padding: 2,
                    }}
                  >
                    <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", margin: "2px 0" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{
                    appearance: "none",
                    width: 15,
                    height: 15,
                    borderRadius: 4,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    cursor: "pointer",
                    flexShrink: 0,
                    accentColor: "#6366f1",
                  }}
                />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Keep me signed in for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: loading ? "rgba(255, 255, 255, 0.5)" : "#ffffff",
                  color: "#08080a",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = "#ffffff";
                }}
              >
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "#475569", fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.06)" }} />
              OR
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.06)" }} />
            </div>

            {/* Discord OAuth Button */}
            <button
              onClick={() => toast("Discord login coming soon!", { icon: "🔗" })}
              type="button"
              style={{
                width: "100%",
                padding: "11px 20px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#cbd5e1",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              <DiscordIcon style={{ width: 17, height: 17, fill: "#5865f2" }} />
              Continue with Discord
            </button>

            {/* Switch link */}
            <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#64748b" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#ffffff", fontWeight: 600, textDecoration: "underline" }}>
                Create one
              </Link>
            </div>
          </div>

          {/* Scroll Prompt */}
          <div
            style={{
              marginTop: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "#64748b",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <span>Scroll down for plans &amp; FAQs</span>
            <i className="fa-solid fa-chevron-down" />
          </div>
        </main>

        <PricingSection />
        <FAQSection />

        {/* Footer */}
        <footer
          style={{
            width: "100%",
            maxWidth: 1120,
            margin: "0 auto",
            padding: "30px 20px 40px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          <div>&copy; 2026 SyncAuth. All rights reserved.</div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/tos" style={{ color: "#94a3b8", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/tos" style={{ color: "#94a3b8", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <a
              href="https://discord.gg/sM8ukpuzVE"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#94a3b8", textDecoration: "none" }}
            >
              Discord
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
