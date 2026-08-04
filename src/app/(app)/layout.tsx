"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", icon: "fa-gauge", label: "Dashboard" },
  { href: "/keys",      icon: "fa-key",    label: "Keys" },
  { href: "/users",     icon: "fa-users",  label: "Users" },
  { href: "/profile",   icon: "fa-user",   label: "Profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = localStorage.getItem("syncauth_theme") || "#00c8e0";
    document.documentElement.style.setProperty("--accent", c);
    document.documentElement.style.setProperty("--accent-dim", c + "1f");
    document.documentElement.style.setProperty("--accent-border", c + "40");
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const u = user.user_metadata?.username || user.email?.split("@")[0] || "User";
        setEmail(user.email ?? "");
        setUsername(u);
        return;
      }
      const cached = localStorage.getItem("syncauth_user");
      if (cached) {
        try {
          const u = JSON.parse(cached);
          setEmail(u.email ?? "");
          setUsername((u.email ?? "").split("@")[0] || "User");
        } catch {}
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    localStorage.removeItem("syncauth_user");
    toast.success("Signed out.");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={30} height={30} className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">SyncAuth</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className={`nav-item${active ? " active" : ""}`}>
                <i className={`fa-solid ${item.icon} nav-icon`} />
                {item.label}
              </Link>
            );
          })}

          {/* Discord */}
          <a
            href="https://discord.gg/sM8ukpuzVE"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
            style={{ marginTop: 8 }}
          >
            <i className="fa-brands fa-discord nav-icon" style={{ color: "#5865f2" }} />
            Discord
          </a>

          {/* Logout */}
          <button className="nav-item danger" onClick={handleLogout} style={{ marginTop: 4 }}>
            <i className="fa-solid fa-arrow-right-from-bracket nav-icon" />
            Log out
          </button>

          {/* User info */}
          <div className="sidebar-user" style={{ marginTop: 12, padding: "8px 10px" }}>
            <i className="fa-solid fa-circle-user" style={{ fontSize: 28, color: "var(--accent)", flexShrink: 0 }} />
            <div className="sidebar-user-info">
              <div className="sidebar-username">{username}</div>
              <div className="sidebar-email">{email}</div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Page */}
      <main className="main-content">{children}</main>
    </div>
  );
}
