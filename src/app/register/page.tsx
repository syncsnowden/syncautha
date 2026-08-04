"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DiscordIcon from "@/components/DiscordIcon";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_COLORS = ["", "#ef4444", "#f59e0b", "#3b82f6", "#00c8e0", "#22c55e"];
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
        background: "#05070e",
        position: "relative",
        overflowX: "hidden",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(100px,-80px) scale(1.15)} 66%{transform:translate(-60px,100px) scale(0.9)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-120px,80px) scale(1.2)} 66%{transform:translate(80px,-100px) scale(0.85)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(80px,80px)} }
        @keyframes card-in { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .auth-card-main { animation: card-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Neon Orbs */}
      <div style={{ position: "fixed", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 200, 224, 0.16) 0%, rgba(0, 200, 224, 0) 70%)", top: -250, left: -250, animation: "orb1 20s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "fixed", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(168, 85, 247, 0) 70%)", bottom: -200, right: -150, animation: "orb2 24s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }} />

      {/* Spotlight & Noise */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(650px circle at var(--mx,50%) var(--my,50%), rgba(0,200,224,0.05), transparent 70%)", zIndex: 2 }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "200px 200px", zIndex: 3 }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Navigation */}
        <header style={{ width: "100%", maxWidth: 1120, margin: "0 auto", padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(0, 200, 224, 0.1)", border: "1px solid rgba(0, 200, 224, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(0, 200, 224, 0.2)" }}>
              <Image src="/syncauthlogo.png" alt="SyncAuth" width={24} height={24} style={{ objectFit: "contain" }} priority />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Sync<span style={{ color: "#00c8e0" }}>Auth</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: "rgba(88, 101, 242, 0.12)", border: "1px solid rgba(88, 101, 242, 0.3)", color: "#5865f2", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <DiscordIcon style={{ width: 16, height: 16, fill: "#5865f2" }} />
              Discord
            </a>
            <Link href="/login" style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Auth Card Section */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px 60px" }}>
          <div
            className="auth-card-main"
            style={{
              width: "100%",
              maxWidth: 440,
              background: "linear-gradient(180deg, rgba(16, 24, 42, 0.75) 0%, rgba(9, 14, 26, 0.85) 100%)",
              backdropFilter: "blur(30px) saturate(160%)",
              WebkitBackdropFilter: "blur(30px) saturate(160%)",
              border: "1px solid rgba(0, 200, 224, 0.25)",
              borderRadius: 24,
              padding: "40px 36px",
              boxShadow: "0 0 50px rgba(0, 200, 224, 0.12), 0 30px 80px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(0, 200, 224, 0.1)", border: "1px solid rgba(0, 200, 224, 0.25)", fontSize: 11, fontWeight: 700, color: "#00c8e0", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
                <i className="fa-solid fa-user-plus" style={{ fontSize: 10 }} />
                Get Started Free
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 6 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.45)" }}>
                Start protecting your scripts with SyncAuth
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 18, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Username */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Username</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255, 255, 255, 0.3)", pointerEvents: "none" }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="developer"
                    autoComplete="username"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, color: "#ffffff", fontSize: 14, padding: "12px 14px 12px 40px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255, 255, 255, 0.3)", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, color: "#ffffff", fontSize: 14, padding: "12px 14px 12px 40px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255, 255, 255, 0.3)", pointerEvents: "none" }} />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, color: "#ffffff", fontSize: 14, padding: "12px 40px 12px 40px", outline: "none" }}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255, 255, 255, 0.4)", cursor: "pointer" }}>
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
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255, 255, 255, 0.3)", pointerEvents: "none" }} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    style={{ width: "100%", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, color: "#ffffff", fontSize: 14, padding: "12px 40px 12px 40px", outline: "none", borderColor: match === false ? "#ef4444" : match === true ? "#00c8e0" : "rgba(255, 255, 255, 0.1)" }}
                  />
                  {match !== null && (
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: match ? "#00c8e0" : "#ef4444", fontSize: 13 }}>
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
                  style={{ appearance: "none", width: 16, height: 16, borderRadius: 5, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.2)", cursor: "pointer", flexShrink: 0, marginTop: 2, accentColor: "#00c8e0" }}
                />
                <span style={{ fontSize: 12.5, color: "rgba(255, 255, 255, 0.5)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <Link href="/tos" style={{ color: "#00c8e0", textDecoration: "underline" }}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/tos" style={{ color: "#00c8e0", textDecoration: "underline" }}>Privacy Policy</Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  padding: "13px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: loading ? "rgba(0, 200, 224, 0.5)" : "linear-gradient(135deg, #00c8e0 0%, #0099b5 100%)",
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
              >
                {loading ? "Creating Account…" : "Create Account →"}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "rgba(255, 255, 255, 0.4)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#00c8e0", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </div>
          </div>
        </main>

        <PricingSection />
        <FAQSection />

        <footer style={{ width: "100%", maxWidth: 1120, margin: "0 auto", padding: "30px 20px 40px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 13, color: "rgba(255, 255, 255, 0.4)" }}>
          <div>&copy; 2026 SyncAuth. All rights reserved.</div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/tos" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/tos" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>Privacy Policy</Link>
            <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>Discord</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
