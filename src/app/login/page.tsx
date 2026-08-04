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

  // Mouse spotlight
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
        background: "#05070e",
        position: "relative",
        overflowX: "hidden",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, -80px) scale(1.15); }
          66% { transform: translate(-60px, 100px) scale(0.9); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-120px, 80px) scale(1.2); }
          66% { transform: translate(80px, -100px) scale(0.85); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(80px, 80px) scale(1.1); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-card-main {
          animation: card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Background Neon Orbs */}
      <div
        style={{
          position: "fixed",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 200, 224, 0.16) 0%, rgba(0, 200, 224, 0) 70%)",
          top: -250,
          left: -250,
          animation: "orb1 20s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(168, 85, 247, 0) 70%)",
          bottom: -200,
          right: -150,
          animation: "orb2 24s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 200, 224, 0.08) 0%, rgba(0, 200, 224, 0) 70%)",
          top: "40%",
          left: "50%",
          transform: "translateX(-50%)",
          animation: "orb3 16s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Interactive Mouse Spotlight */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(650px circle at var(--mx, 50%) var(--my, 50%), rgba(0, 200, 224, 0.05), transparent 70%)",
          transition: "background 0.1s ease",
          zIndex: 2,
        }}
      />

      {/* Cyber Noise Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
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
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(0, 200, 224, 0.1)",
                border: "1px solid rgba(0, 200, 224, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(0, 200, 224, 0.2)",
              }}
            >
              <Image src="/syncauthlogo.png" alt="SyncAuth" width={24} height={24} style={{ objectFit: "contain" }} priority />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Sync<span style={{ color: "#00c8e0" }}>Auth</span>
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
                background: "rgba(88, 101, 242, 0.12)",
                border: "1px solid rgba(88, 101, 242, 0.3)",
                color: "#5865f2",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(88, 101, 242, 0.25)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(88, 101, 242, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(88, 101, 242, 0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <DiscordIcon style={{ width: 16, height: 16, fill: "#5865f2" }} />
              Discord
            </a>
            <Link
              href="/register"
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Auth Card Section */}
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
            className="auth-card-main"
            style={{
              width: "100%",
              maxWidth: 420,
              background: "linear-gradient(180deg, rgba(16, 24, 42, 0.75) 0%, rgba(9, 14, 26, 0.85) 100%)",
              backdropFilter: "blur(30px) saturate(160%)",
              WebkitBackdropFilter: "blur(30px) saturate(160%)",
              border: "1px solid rgba(0, 200, 224, 0.25)",
              borderRadius: 24,
              padding: "40px 36px",
              boxShadow: "0 0 50px rgba(0, 200, 224, 0.12), 0 30px 80px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: "rgba(0, 200, 224, 0.1)",
                  border: "1px solid rgba(0, 200, 224, 0.25)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#00c8e0",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                <i className="fa-solid fa-lock" style={{ fontSize: 10 }} />
                Secure Portal
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 6 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.45)" }}>
                Sign in to manage your keys &amp; script hub
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  marginBottom: 20,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
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

            <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255, 255, 255, 0.3)", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 12,
                      color: "#ffffff",
                      fontSize: 14,
                      padding: "12px 14px 12px 40px",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#00c8e0";
                      e.target.style.boxShadow = "0 0 15px rgba(0, 200, 224, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{ fontSize: 12, color: "rgba(0, 200, 224, 0.8)", textDecoration: "none", fontWeight: 500 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255, 255, 255, 0.3)", pointerEvents: "none" }} />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 12,
                      color: "#ffffff",
                      fontSize: 14,
                      padding: "12px 40px 12px 40px",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#00c8e0";
                      e.target.style.boxShadow = "0 0 15px rgba(0, 200, 224, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
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
                      color: "rgba(255, 255, 255, 0.4)",
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
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", margin: "2px 0" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{
                    appearance: "none",
                    width: 16,
                    height: 16,
                    borderRadius: 5,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    cursor: "pointer",
                    flexShrink: 0,
                    accentColor: "#00c8e0",
                  }}
                />
                <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.5)" }}>Stay signed in for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  padding: "13px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: loading
                    ? "rgba(0, 200, 224, 0.5)"
                    : "linear-gradient(135deg, #00c8e0 0%, #0099b5 100%)",
                  color: "#07080f",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.25s ease",
                  boxShadow: loading ? "none" : "0 4px 25px rgba(0, 200, 224, 0.35)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 35px rgba(0, 200, 224, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 25px rgba(0, 200, 224, 0.35)";
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(0,0,0,0.2)",
                        borderTopColor: "#07080f",
                        borderRadius: "50%",
                        animation: "spin 0.65s linear infinite",
                      }}
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", color: "rgba(255, 255, 255, 0.2)", fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.08)" }} />
              OR
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.08)" }} />
            </div>

            {/* Discord OAuth Button */}
            <button
              onClick={() => toast("Discord login coming soon!", { icon: "🔗" })}
              type="button"
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 12,
                background: "rgba(88, 101, 242, 0.1)",
                border: "1px solid rgba(88, 101, 242, 0.25)",
                color: "#ffffff",
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
                e.currentTarget.style.background = "rgba(88, 101, 242, 0.2)";
                e.currentTarget.style.borderColor = "rgba(88, 101, 242, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(88, 101, 242, 0.1)";
                e.currentTarget.style.borderColor = "rgba(88, 101, 242, 0.25)";
              }}
            >
              <DiscordIcon style={{ width: 18, height: 18, fill: "#5865f2" }} />
              Continue with Discord
            </button>

            {/* Switch to Register */}
            <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "rgba(255, 255, 255, 0.4)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#00c8e0", fontWeight: 600, textDecoration: "none" }}>
                Create one
              </Link>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "rgba(255, 255, 255, 0.35)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <span>Scroll down for pricing &amp; FAQs</span>
            <i className="fa-solid fa-chevron-down" style={{ animation: "orb3 2s infinite ease-in-out" }} />
          </div>
        </main>

        {/* Scrollable Pricing & FAQ Sections */}
        <PricingSection />
        <FAQSection />

        {/* Footer */}
        <footer
          style={{
            width: "100%",
            maxWidth: 1120,
            margin: "0 auto",
            padding: "30px 20px 40px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <div>&copy; 2026 SyncAuth. All rights reserved.</div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/tos" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/tos" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <a
              href="https://discord.gg/sM8ukpuzVE"
              target="_blank"
              rel="noreferrer"
              style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}
            >
              Discord
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
