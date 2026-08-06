"use client";

import React, { useState } from "react";
import DarkCyberCanvas from "@/components/DarkCyberCanvas";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("lootlabs");

  const NavButton = ({ id, icon, label }: { id: string, icon: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
        background: activeTab === id ? "var(--accent)" : "transparent",
        color: activeTab === id ? "#fff" : "var(--text-2)",
        border: "none", borderRadius: 8, cursor: "pointer",
        fontSize: 14, fontWeight: activeTab === id ? 600 : 500,
        transition: "all 0.2s ease",
        textAlign: "left"
      }}
      onMouseEnter={e => { if (activeTab !== id) { e.currentTarget.style.background = "var(--bg-2)"; e.currentTarget.style.color = "var(--text-1)"; } }}
      onMouseLeave={e => { if (activeTab !== id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; } }}
    >
      <i className={"fa-solid " + icon} style={{ width: 16, textAlign: "center", opacity: activeTab === id ? 1 : 0.7 }} />
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "var(--text-1)", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.4 }}><DarkCyberCanvas /></div>
      
      {/* Top Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5, 5, 5, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-1)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/syncauthlogo.png" alt="SyncAuth" style={{ height: 28 }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>SyncAuth <span style={{ color: "var(--text-3)", fontWeight: 400 }}>Docs</span></span>
        </div>
        <a href="/" style={{ color: "var(--text-2)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}><i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}/> Back to Dashboard</a>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", display: "flex", minHeight: "calc(100vh - 61px)" }}>
        
        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border-1)", padding: "32px 24px", background: "rgba(10, 10, 12, 0.4)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 16, paddingLeft: 12 }}>Monetization</div>
          <NavButton id="lootlabs" icon="fa-sack-dollar" label="LootLabs Setup" />
          
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginTop: 32, marginBottom: 16, paddingLeft: 12 }}>Development</div>
          <NavButton id="custom_ui" icon="fa-code" label="Custom Key System UI" />
          <NavButton id="raw" icon="fa-lock" label="Secure Execution" />
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "48px 64px", overflowY: "auto", paddingBottom: 100 }}>
          
          {activeTab === "lootlabs" && (
            <div style={{ maxWidth: 800 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Setting up LootLabs</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 40 }}>
                Linkvertise and LootLabs are the easiest way to monetize your free scripts. 
                Follow this guide to securely connect your LootLabs account directly to your SyncAuth projects.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                
                <section>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 12, background: "var(--accent)", color: "#fff", fontSize: 12 }}>1</span>
                    Getting your API Key
                  </h3>
                  <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
                    First, head over to your LootLabs dashboard. You need to grab your API Key so SyncAuth can automatically generate links for your users.
                  </p>
                  <img src="/docs/lootlabsapiplace.png" alt="LootLabs API Key Location" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border-1)" }} />
                </section>

                <section>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 12, background: "var(--accent)", color: "#fff", fontSize: 12 }}>2</span>
                    Creating the Link
                  </h3>
                  <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
                    Create a new link in LootLabs. Make sure you select the correct options so the postback system can properly communicate with our servers.
                  </p>
                  <img src="/docs/howtocreatelink.png" alt="How to create a link" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border-1)", marginBottom: 20 }} />
                  <img src="/docs/whattoselectforpostback.png" alt="What to select for postback" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border-1)" }} />
                </section>

                <section>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 12, background: "var(--accent)", color: "#fff", fontSize: 12 }}>3</span>
                    Redirect URL & Postback
                  </h3>
                  <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
                    For the redirect URL, you can put literally anything (like a Discord server link or a thank you page). 
                    The important part is setting up the postback correctly.
                  </p>
                  <img src="/docs/putanythinghereforredirecturl.png" alt="Redirect URL" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border-1)", marginBottom: 20 }} />
                  <img src="/docs/postbackimage.png" alt="Postback Setup" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border-1)" }} />
                </section>

              </div>
            </div>
          )}

          {activeTab === "custom_ui" && (
            <div style={{ maxWidth: 800 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Custom Key System UI</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 40 }}>
                Want to build your own gorgeous UI instead of using the default SyncAuth loader? 
                No problem. You can easily hook your own UI into our backend validation API.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "var(--text-1)" }}>The Implementation</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                Just grab the user&apos;s input from your custom TextBox, and send a standard HTTP POST request to our validation endpoint. 
                If it returns true, you&apos;re good to execute the main script.
              </p>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>CustomLoader.lua</div>
                <pre style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local HttpService = game:GetService("HttpService")

local PROJECT_ID = "YOUR_PROJECT_ID"
local SCRIPT_ID = "YOUR_SCRIPT_ID"
local API_URL = "https://syncauth-eight.vercel.app"

-- This is where your custom UI logic goes
local keyInput = MyCustomTextBox.Text 

local response = request({
    Url = API_URL .. "/api/keys/validate",
    Method = "POST",
    Headers = { ["Content-Type"] = "application/json" },
    Body = HttpService:JSONEncode({
        key = keyInput,
        hwid = getHWID(), 
        username = game.Players.LocalPlayer.Name,
    })
})

local data = HttpService:JSONDecode(response.Body)

if data.valid then
    print("Authentication successful!")
    
    -- Now that they are authenticated, fetch and run the main script
    local hwidParam = HttpService:UrlEncode(getHWID())
    local userParam = HttpService:UrlEncode(game.Players.LocalPlayer.Name)
    
    local targetUrl = string.format("%s/api/scripts/%s/raw?hwid=%s&username=%s", API_URL, SCRIPT_ID, hwidParam, userParam)
    
    loadstring(game:HttpGet(targetUrl))()
else
    warn("Failed to authenticate: " .. tostring(data.message))
end`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div style={{ maxWidth: 800 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Secure Execution</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 40 }}>
                Understanding how SyncAuth protects your main scripts from being scraped or bypassed.
              </p>
              
              <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ color: "#ef4444", fontSize: 15, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-shield-halved" /> Security Architecture
                </h4>
                <p style={{ color: "#fca5a5", fontSize: 14, lineHeight: 1.6 }}>
                  Our <code>/raw</code> endpoint is heavily fortified. Even if an attacker finds the direct URL to your script, 
                  they cannot download the source code unless their specific HWID currently has an active, authenticated session in our database.
                </p>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "var(--text-1)" }}>Executing Keyless Scripts</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                If you enabled "Keyless Mode" on a script in the dashboard, the security checks are intentionally bypassed so the script can be used freely. 
                You can execute it directly without any prior validation:
              </p>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>ExecuteKeyless.lua</div>
                <pre style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local HttpService = game:GetService("HttpService")
local username = HttpService:UrlEncode(game.Players.LocalPlayer.Name)

-- Just call the raw endpoint directly! No key needed.
loadstring(game:HttpGet("https://syncauth-eight.vercel.app/api/scripts/YOUR_SCRIPT_ID/raw?username=" .. username))()`}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
