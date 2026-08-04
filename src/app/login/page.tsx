"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
        method: "POST", headers: { "Content-Type": "application/json" },
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
    <div ref={pageRef} style={{
      minHeight: "100vh",
      background: "#07080f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        /* Animated orbs */
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(80px,-60px) scale(1.1); }
          66% { transform: translate(-40px,80px) scale(0.9); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-100px,60px) scale(1.15); }
          66% { transform: translate(60px,-80px) scale(0.9); }
        }
        @keyframes orb3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(60px,60px) scale(1.1); }
        }
        @keyframes card-in {
          from { opacity:0; transform: translateY(24px) scale(0.98); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .auth-card-main {
          animation: card-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      {/* Orb 1 — cyan top left */}
      <div style={{
        position:"absolute", width:700, height:700, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,200,224,0.13) 0%, transparent 70%)",
        top:-200, left:-200, animation:"orb1 18s ease-in-out infinite", pointerEvents:"none",
      }}/>
      {/* Orb 2 — indigo bottom right */}
      <div style={{
        position:"absolute", width:600, height:600, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        bottom:-200, right:-100, animation:"orb2 22s ease-in-out infinite", pointerEvents:"none",
      }}/>
      {/* Orb 3 — subtle center */}
      <div style={{
        position:"absolute", width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,180,200,0.06) 0%, transparent 70%)",
        top:"30%", left:"50%", transform:"translateX(-50%)",
        animation:"orb3 14s ease-in-out infinite", pointerEvents:"none",
      }}/>

      {/* Mouse spotlight */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none",
        background:"radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(0,200,224,0.04), transparent 70%)",
        transition:"background 0.1s",
      }}/>

      {/* Noise overlay */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", opacity:0.025,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat", backgroundSize:"200px 200px",
      }}/>

      {/* Card */}
      <div className="auth-card-main" style={{
        position:"relative", zIndex:10,
        width:"100%", maxWidth:400,
        background:"rgba(255,255,255,0.03)",
        backdropFilter:"blur(40px) saturate(150%)",
        WebkitBackdropFilter:"blur(40px) saturate(150%)",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:20,
        padding:"36px 32px",
        boxShadow:"0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,200,224,0.04)",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"rgba(0,200,224,0.08)",
            border:"1px solid rgba(0,200,224,0.15)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:5,
          }}>
            <Image src="/syncauthlogo.png" alt="SyncAuth" width={22} height={22} style={{ objectFit:"contain" }} priority />
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:"#fff", letterSpacing:"-0.01em" }}>SyncAuth</span>
        </div>

        <h1 style={{ fontSize:22, fontWeight:700, color:"#fff", letterSpacing:"-0.02em", marginBottom:5 }}>
          Welcome back
        </h1>
        <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.4)", marginBottom:24 }}>
          Sign in to your dashboard
        </p>

        {error && (
          <div style={{
            padding:"10px 14px", borderRadius:10, marginBottom:18,
            background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
            color:"#fca5a5", fontSize:13, display:"flex", gap:9, alignItems:"flex-start",
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginTop:1, flexShrink:0 }}/>
            {error}
          </div>
        )}

        <form onSubmit={submit} noValidate style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Email */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.4)", letterSpacing:"0.04em", textTransform:"uppercase" }}>
              Email
            </label>
            <div style={{ position:"relative" }}>
              <i className="fa-solid fa-envelope" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"rgba(255,255,255,0.2)", pointerEvents:"none" }}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" required
                style={{
                  width:"100%", background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)", borderRadius:10,
                  color:"#fff", fontSize:13.5, padding:"10px 12px 10px 36px",
                  outline:"none", fontFamily:"Inter,sans-serif", transition:"border-color 0.15s",
                }}
                onFocus={e=>e.target.style.borderColor="rgba(0,200,224,0.4)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <label style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.4)", letterSpacing:"0.04em", textTransform:"uppercase" }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ fontSize:12, color:"rgba(255,255,255,0.3)", textDecoration:"none", transition:"color 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.7)")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.3)")}>
                Forgot?
              </Link>
            </div>
            <div style={{ position:"relative" }}>
              <i className="fa-solid fa-lock" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"rgba(255,255,255,0.2)", pointerEvents:"none" }}/>
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" required
                style={{
                  width:"100%", background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)", borderRadius:10,
                  color:"#fff", fontSize:13.5, padding:"10px 36px 10px 36px",
                  outline:"none", fontFamily:"Inter,sans-serif", transition:"border-color 0.15s",
                }}
                onFocus={e=>e.target.style.borderColor="rgba(0,200,224,0.4)"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}
              />
              <button type="button" onClick={()=>setShowPw(v=>!v)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.25)", cursor:"pointer", fontSize:12, padding:2, transition:"color 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.25)")}>
                <i className={`fa-solid ${showPw?"fa-eye-slash":"fa-eye"}`}/>
              </button>
            </div>
          </div>

          {/* Remember */}
          <label style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
              style={{ appearance:"none", width:15, height:15, borderRadius:4, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", flexShrink:0, transition:"all 0.15s", accentColor:"#00c8e0" }}/>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Stay signed in for 30 days</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              marginTop:4, padding:"11px 20px", borderRadius:10, border:"none",
              background: loading ? "rgba(0,200,224,0.5)" : "linear-gradient(135deg, #00c8e0 0%, #0099b5 100%)",
              color:"#07080f", fontFamily:"Inter,sans-serif", fontWeight:700,
              fontSize:14, cursor: loading?"not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.2s", boxShadow: loading?"none":"0 4px 24px rgba(0,200,224,0.25)",
            }}
            onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(0,200,224,0.4)"; }}}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,200,224,0.25)"; }}>
            {loading ? <><div style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#07080f",borderRadius:"50%",animation:"spin 0.65s linear infinite" }}/> Signing in…</> : "Sign in →"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0", color:"rgba(255,255,255,0.15)", fontSize:12 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>or<div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
        </div>

        {/* Discord */}
        <button onClick={()=>toast("Discord login coming soon!")} type="button"
          style={{
            width:"100%", padding:"10px 20px", borderRadius:10,
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            color:"rgba(255,255,255,0.6)", fontFamily:"Inter,sans-serif", fontWeight:500,
            fontSize:13.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            gap:9, transition:"all 0.15s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}>
          <i className="fa-brands fa-discord" style={{ color:"#5865f2", fontSize:15 }}/>
          Continue with Discord
        </button>

        {/* Footer links */}
        <div style={{ marginTop:22, display:"flex", justifyContent:"center", gap:20, fontSize:12, color:"rgba(255,255,255,0.2)" }}>
          <Link href="/register" style={{ color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
            Create account
          </Link>
          <span>·</span>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer"
            style={{ color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
            Discord
          </a>
          <span>·</span>
          <Link href="/tos" style={{ color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
