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

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_COLORS = ["", "#ef4444", "#f59e0b", "#3b82f6", "#6366f1", "#22c55e"];
const STR_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];

export default function RegisterPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const strength = pwStrength(password);
  const match = confirm ? password === confirm : null;

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
    if (!username || !email || !password || !confirm) return setError("All fields are required.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (strength < 2) return setError("Password is too weak.");
    if (!agree) return setError("Accept the Terms of Service to continue.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      {/* Upgraded Canvas Particle Mesh Effect */}
      <DarkCyberCanvas />

      {/* Ambient Glowing Aura */}
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

      {/* Mouse Spotlight */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.03), transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* Noise Overlay */}
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

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* Header */}
        <header style={{ width: "100%", maxWidth: 1120, margin: "0 auto", padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              }}
            >
              <i className="fa-solid fa-lightbulb" style={{ fontSize: 12 }} />
              Suggestions
            </button>
            <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#cbd5e1", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <DiscordIcon style={{ width: 15, height: 15, fill: "#5865f2" }} />
              Discord
            </a>
            <Link href="/login" style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </header>

        {/* Form Card */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px 60px" }}>
          <div
            className="auth-card-stealth"
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#0a0b0e",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 22,
              padding: "38px 32px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 6 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 13.5, color: "#94a3b8" }}>
                Start protecting your Roblox scripts with SyncAuth
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 18, background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#fca5a5", fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Username */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>Username</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="developer"
                    autoComplete="username"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, color: "#ffffff", fontSize: 14, padding: "11px 14px 11px 40px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, color: "#ffffff", fontSize: 14, padding: "11px 14px 11px 40px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, color: "#ffffff", fontSize: 14, padding: "11px 40px 11px 40px", outline: "none" }}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
                {password && (
                  <div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? STR_COLORS[strength] : "rgba(255, 255, 255, 0.08)", transition: "background 0.2s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: STR_COLORS[strength] }}>{STR_LABELS[strength]}</span>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, color: "#ffffff", fontSize: 14, padding: "11px 40px 11px 40px", outline: "none", borderColor: match === false ? "#ef4444" : match === true ? "#6366f1" : "rgba(255, 255, 255, 0.08)" }}
                  />
                  {match !== null && (
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: match ? "#6366f1" : "#ef4444", fontSize: 13 }}>
                      <i className={`fa-solid ${match ? "fa-check" : "fa-xmark"}`} />
                    </span>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", margin: "4px 0" }}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  style={{ appearance: "none", width: 15, height: 15, borderRadius: 4, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.15)", cursor: "pointer", flexShrink: 0, marginTop: 2, accentColor: "#6366f1" }}
                />
                <span style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <Link href="/tos" style={{ color: "#ffffff", textDecoration: "underline" }}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/tos" style={{ color: "#ffffff", textDecoration: "underline" }}>Privacy Policy</Link>
                </span>
              </label>

              {/* Submit Button */}
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
                }}
              >
                {loading ? "Creating Account…" : "Create Account →"}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#64748b" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#ffffff", fontWeight: 600, textDecoration: "underline" }}>
                Sign in
              </Link>
            </div>
          </div>
        </main>

        <PricingSection />
        <FAQSection />

        {/* Footer */}
        <footer style={{ width: "100%", maxWidth: 1120, margin: "0 auto", padding: "30px 20px 40px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#64748b" }}>
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
            <Link href="/tos" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/tos" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>
            <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer" style={{ color: "#94a3b8", textDecoration: "none" }}>Discord</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
