"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DiscordIcon from "@/components/DiscordIcon";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import DarkCyberCanvas from "@/components/DarkCyberCanvas";
import SuggestionModal from "@/components/SuggestionModal";
import { getSupabase } from "@/lib/supabase/client";
export const runtime = "edge";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) return setError("Fill in all fields.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, remember }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      if (data.session) {
        const supabase = getSupabase();
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        localStorage.setItem("syncauth_user", JSON.stringify({
          email: data.user.email,
          created_at: data.user.created_at,
        }));
        document.cookie = "syncauth_logged_in=1; path=/; max-age=2592000; SameSite=Lax";
      }
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
        @keyframes card-entry {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-card-stealth {
          animation: card-entry 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Upgraded Cyber Canvas Mesh Effect */}
      <DarkCyberCanvas />

      {/* Noise Grain Overlay */}
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

      {/* Suggestion Modal */}
      <SuggestionModal isOpen={isSuggestionOpen} onClose={() => setIsSuggestionOpen(false)} />

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
            <button
              onClick={() => setIsSuggestionOpen(true)}
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                color: "#818cf8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <i className="fa-solid fa-lightbulb" style={{ fontSize: 12 }} />
              Suggestions
            </button>
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
              }}
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Form Card */}
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
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="email@example.com"
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

              {/* Remember Me Custom Stylish Toggle Checkbox */}
              <div
                onClick={() => setRemember(!remember)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  margin: "4px 0",
                  userSelect: "none",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: remember ? "#6366f1" : "rgba(255, 255, 255, 0.05)",
                    border: remember ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {remember && <i className="fa-solid fa-check" style={{ color: "#ffffff", fontSize: 11 }} />}
                </div>
                <span style={{ fontSize: 13, color: remember ? "#ffffff" : "#94a3b8", transition: "color 0.2s" }}>
                  Keep me signed in for 30 days
                </span>
              </div>

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

            {/* Discord Button */}
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
              }}
            >
              <DiscordIcon style={{ width: 17, height: 17, fill: "#5865f2" }} />
              Continue with Discord
            </button>

            <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#64748b" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#ffffff", fontWeight: 600, textDecoration: "underline" }}>
                Create one
              </Link>
            </div>
          </div>

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

        {/* Footer with Suggestions Link */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button
              onClick={() => setIsSuggestionOpen(true)}
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#818cf8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-lightbulb" style={{ fontSize: 11 }} />
              Suggestions
            </button>
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
