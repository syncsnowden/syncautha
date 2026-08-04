"use client";
import { useEffect, useRef, useState } from "react";
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
const STR_COLORS = ["","#ef4444","#f59e0b","#3b82f6","#00c8e0","#22c55e"];
const STR_LABELS = ["","Weak","Fair","Good","Strong","Very strong"];

const INPUT_STYLE = {
  width:"100%", background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(255,255,255,0.08)", borderRadius:10,
  color:"#fff", fontSize:13.5, padding:"10px 12px 10px 36px",
  outline:"none", fontFamily:"Inter,sans-serif", transition:"border-color 0.15s",
};

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
    if (!username||!email||!password||!confirm) return setError("All fields are required.");
    if (password!==confirm) return setError("Passwords do not match.");
    if (strength<2) return setError("Password is too weak.");
    if (!agree) return setError("Accept the Terms of Service to continue.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({username,email,password}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Registration failed.");
      toast.success("Account created! Check your email.");
      router.push("/login");
    } catch(err:unknown){
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor="rgba(0,200,224,0.4)";
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor="rgba(255,255,255,0.08)";

  return (
    <div ref={pageRef} style={{
      minHeight:"100vh", background:"#07080f",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(80px,-60px) scale(1.1)}66%{transform:translate(-40px,80px) scale(0.9)}}
        @keyframes orb2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-100px,60px) scale(1.15)}66%{transform:translate(60px,-80px) scale(0.9)}}
        @keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,60px)}}
        @keyframes reg-in{from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        .reg-card{animation:reg-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards}
      `}</style>

      <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,200,224,0.13) 0%,transparent 70%)",top:-200,left:-200,animation:"orb1 18s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",bottom:-200,right:-100,animation:"orb2 22s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,180,200,0.06) 0%,transparent 70%)",top:"30%",left:"50%",transform:"translateX(-50%)",animation:"orb3 14s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",background:"radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(0,200,224,0.04),transparent 70%)"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.025,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,backgroundRepeat:"repeat",backgroundSize:"200px 200px"}}/>

      <div className="reg-card" style={{
        position:"relative",zIndex:10,
        width:"100%",maxWidth:420,
        background:"rgba(255,255,255,0.03)",
        backdropFilter:"blur(40px) saturate(150%)",
        WebkitBackdropFilter:"blur(40px) saturate(150%)",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:20, padding:"36px 32px",
        boxShadow:"0 0 0 1px rgba(255,255,255,0.03),0 32px 80px rgba(0,0,0,0.6),0 0 60px rgba(0,200,224,0.04)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(0,200,224,0.08)",border:"1px solid rgba(0,200,224,0.15)",display:"flex",alignItems:"center",justifyContent:"center",padding:5}}>
            <Image src="/syncauthlogo.png" alt="SyncAuth" width={22} height={22} style={{objectFit:"contain"}} priority/>
          </div>
          <span style={{fontWeight:700,fontSize:15,color:"#fff",letterSpacing:"-0.01em"}}>SyncAuth</span>
        </div>

        <h1 style={{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"-0.02em",marginBottom:5}}>Create account</h1>
        <p style={{fontSize:13.5,color:"rgba(255,255,255,0.4)",marginBottom:24}}>
          Already have one?{" "}
          <Link href="/login" style={{color:"rgba(0,200,224,0.8)",textDecoration:"none",fontWeight:500}}>Sign in</Link>
        </p>

        {error && (
          <div style={{padding:"10px 14px",borderRadius:10,marginBottom:16,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",fontSize:13,display:"flex",gap:9,alignItems:"flex-start"}}>
            <i className="fa-solid fa-circle-exclamation" style={{marginTop:1,flexShrink:0}}/>{error}
          </div>
        )}

        <form onSubmit={submit} noValidate style={{display:"flex",flexDirection:"column",gap:13}}>
          {/* Username */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.4)",letterSpacing:"0.04em",textTransform:"uppercase"}}>Username</label>
            <div style={{position:"relative"}}>
              <i className="fa-solid fa-user" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,0.2)",pointerEvents:"none"}}/>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="coolname" autoComplete="username" required style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder}/>
            </div>
          </div>

          {/* Email */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.4)",letterSpacing:"0.04em",textTransform:"uppercase"}}>Email</label>
            <div style={{position:"relative"}}>
              <i className="fa-solid fa-envelope" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,0.2)",pointerEvents:"none"}}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder}/>
            </div>
          </div>

          {/* Password */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.4)",letterSpacing:"0.04em",textTransform:"uppercase"}}>Password</label>
            <div style={{position:"relative"}}>
              <i className="fa-solid fa-lock" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,0.2)",pointerEvents:"none"}}/>
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" required style={{...INPUT_STYLE,paddingRight:36}} onFocus={focusBorder} onBlur={blurBorder}/>
              <button type="button" onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:12,padding:2}}>
                <i className={`fa-solid ${showPw?"fa-eye-slash":"fa-eye"}`}/>
              </button>
            </div>
            {password && (
              <div>
                <div style={{display:"flex",gap:3,marginBottom:4}}>
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} style={{flex:1,height:2,borderRadius:2,background:i<=strength?STR_COLORS[strength]:"rgba(255,255,255,0.08)",transition:"background 0.2s"}}/>
                  ))}
                </div>
                <span style={{fontSize:11,color:STR_COLORS[strength]}}>{STR_LABELS[strength]}</span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.4)",letterSpacing:"0.04em",textTransform:"uppercase"}}>Confirm password</label>
            <div style={{position:"relative"}}>
              <i className="fa-solid fa-lock" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,0.2)",pointerEvents:"none"}}/>
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" required
                style={{...INPUT_STYLE,paddingRight:36,borderColor:match===false?"rgba(239,68,68,0.4)":match===true?"rgba(0,200,224,0.35)":"rgba(255,255,255,0.08)"}}
                onFocus={focusBorder} onBlur={blurBorder}/>
              {match!==null&&(
                <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:match?"#00c8e0":"#ef4444",fontSize:12}}>
                  <i className={`fa-solid ${match?"fa-check":"fa-xmark"}`}/>
                </span>
              )}
            </div>
          </div>

          {/* Terms */}
          <label style={{display:"flex",alignItems:"flex-start",gap:9,cursor:"pointer"}}>
            <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}
              style={{appearance:"none",width:15,height:15,borderRadius:4,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",flexShrink:0,marginTop:1}}/>
            <span style={{fontSize:12.5,color:"rgba(255,255,255,0.4)",lineHeight:1.5}}>
              I agree to the{" "}
              <Link href="/tos" style={{color:"rgba(255,255,255,0.7)",textDecoration:"underline"}}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/tos" style={{color:"rgba(255,255,255,0.7)",textDecoration:"underline"}}>Privacy Policy</Link>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              marginTop:4,padding:"11px 20px",borderRadius:10,border:"none",
              background:loading?"rgba(0,200,224,0.5)":"linear-gradient(135deg,#00c8e0 0%,#0099b5 100%)",
              color:"#07080f",fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:14,
              cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",
              justifyContent:"center",gap:8,transition:"all 0.2s",
              boxShadow:loading?"none":"0 4px 24px rgba(0,200,224,0.25)",
            }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,200,224,0.4)";}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 24px rgba(0,200,224,0.25)";}}>
            {loading?<><div style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#07080f",borderRadius:"50%",animation:"spin 0.65s linear infinite"}}/>Creating…</>:"Create account →"}
          </button>
        </form>

        <div style={{marginTop:20,display:"flex",justifyContent:"center",gap:20,fontSize:12,color:"rgba(255,255,255,0.2)"}}>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer" style={{color:"rgba(255,255,255,0.35)",textDecoration:"none"}}
            onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
            Discord
          </a>
          <span>·</span>
          <Link href="/tos" style={{color:"rgba(255,255,255,0.35)",textDecoration:"none"}}
            onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
