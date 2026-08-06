"use client";

import React, { useState } from "react";
import DarkCyberCanvas from "@/components/DarkCyberCanvas";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "#06080d", color: "var(--text-1)", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}><DarkCyberCanvas /></div>
      
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1000, margin: "0 auto", padding: "60px 20px" }}>
        
        <header style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 12 }}>SyncAuth API Documentation</h1>
          <p style={{ color: "var(--text-3)", fontSize: 16 }}>Build custom Key Systems, integrations, and secure headless loaders.</p>
        </header>

        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
          
          {/* Sidebar Nav */}
          <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, background: "var(--bg-1)", border: "1px solid var(--border-1)", padding: 16, borderRadius: 16, backdropFilter: "blur(12px)" }}>
            <button className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("overview")} style={{ justifyContent: "flex-start" }}>
              <i className="fa-solid fa-book" style={{ width: 20 }} /> Overview
            </button>
            <button className={`btn ${activeTab === "validate" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("validate")} style={{ justifyContent: "flex-start" }}>
              <i className="fa-solid fa-key" style={{ width: 20 }} /> Validate Key API
            </button>
            <button className={`btn ${activeTab === "raw" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("raw")} style={{ justifyContent: "flex-start" }}>
              <i className="fa-solid fa-file-code" style={{ width: 20 }} /> Fetch Raw Script
            </button>
            <button className={`btn ${activeTab === "custom_ui" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("custom_ui")} style={{ justifyContent: "flex-start" }}>
              <i className="fa-solid fa-palette" style={{ width: 20 }} /> Custom Key System UI
            </button>
            <a href="/" className="btn btn-secondary" style={{ marginTop: 20, justifyContent: "center" }}>
              <i className="fa-solid fa-arrow-left" /> Back to Home
            </a>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, background: "var(--bg-1)", border: "1px solid var(--border-1)", padding: 32, borderRadius: 16, backdropFilter: "blur(12px)" }}>
            
            {activeTab === "overview" && (
              <div className="prose">
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--text-1)" }}>Welcome to SyncAuth API</h2>
                <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: 20 }}>
                  SyncAuth provides a powerful suite of endpoints allowing you to build completely custom key system GUIs, 
                  implement headless integrations, or host free Keyless scripts securely.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>Concepts</h3>
                <ul style={{ color: "var(--text-2)", lineHeight: 1.8, marginBottom: 20, paddingLeft: 20 }}>
                  <li><strong>Project ID:</strong> Used for generating keys and validating users.</li>
                  <li><strong>Script ID:</strong> Identifies the specific script code to be injected securely.</li>
                  <li><strong>HWID:</strong> Hardware ID binding to prevent key sharing.</li>
                </ul>
              </div>
            )}

            {activeTab === "validate" && (
              <div className="prose">
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--text-1)" }}>Validate Key Endpoint</h2>
                <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: 20 }}>
                  Use this endpoint inside your custom Lua Key System to verify if a user's key is valid for your project.
                </p>
                <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: "12px 16px", borderRadius: 8, marginBottom: 20 }}>
                  <code style={{ color: "var(--accent)", fontWeight: 600 }}>POST /api/keys/validate</code>
                </div>
                
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Request Body (JSON)</h3>
                <pre style={{ background: "#000", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13, color: "#a5b4fc", marginBottom: 20 }}>
{`{
  "key": "USER_KEY_HERE",
  "hwid": "USER_HARDWARE_ID",
  "username": "RobloxPlayer",
  "display_name": "Display Name",
  "executor": "Solara"
}`}
                </pre>

                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Response (JSON)</h3>
                <pre style={{ background: "#000", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13, color: "#86efac", marginBottom: 20 }}>
{`{
  "valid": true,
  "status": "valid",
  "message": "Key is valid and active"
}`}
                </pre>
              </div>
            )}

            {activeTab === "raw" && (
              <div className="prose">
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--text-1)" }}>Fetch Raw Script</h2>
                <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: 20 }}>
                  After successfully validating a key via the API, your script must fetch the Raw Script code and execute it.
                  This endpoint is highly protected and will <strong>block</strong> requests from unregistered HWIDs.
                </p>
                
                <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: "12px 16px", borderRadius: 8, marginBottom: 20 }}>
                  <code style={{ color: "var(--accent)", fontWeight: 600 }}>GET /api/scripts/[script_id]/raw?hwid=[HWID]&username=[USER]&executor=[EXEC]</code>
                </div>

                <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: 8, marginBottom: 20 }}>
                  <h4 style={{ color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Security Notice</h4>
                  <p style={{ color: "#fca5a5", fontSize: 13, lineHeight: 1.5 }}>
                    For paid scripts, you CANNOT fetch the raw code without first validating the key via <code>/api/keys/validate</code> using the exact same HWID.
                  </p>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Example Lua Execution</h3>
                <pre style={{ background: "#000", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13, color: "#a5b4fc", marginBottom: 20 }}>
{`-- Assuming key was already validated via API
local hwidParam = game:GetService("HttpService"):UrlEncode(getHWID())
local url = "https://syncauth-eight.vercel.app/api/scripts/YOUR_SCRIPT_ID/raw?hwid=" .. hwidParam

loadstring(game:HttpGet(url))()`}
                </pre>
              </div>
            )}

            {activeTab === "custom_ui" && (
              <div className="prose">
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--text-1)" }}>Building a Custom Key System UI</h2>
                <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: 20 }}>
                  You can completely bypass the default SyncAuth GUI and implement your own Key System logic in your Roblox script.
                </p>

                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Complete Example</h3>
                <pre style={{ background: "#000", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13, color: "#a5b4fc", marginBottom: 20 }}>
{`local SCRIPT_ID = "YOUR_SCRIPT_ID"
local API_URL = "https://syncauth-eight.vercel.app"

-- Build your custom GUI here...
local user_key = "input_from_custom_gui"

local res = request({
    Url = API_URL .. "/api/keys/validate",
    Method = "POST",
    Headers = { ["Content-Type"] = "application/json" },
    Body = game:GetService("HttpService"):JSONEncode({
        key = user_key,
        hwid = getHWID(), -- Ensure you use a valid HWID function
        username = game.Players.LocalPlayer.Name,
    })
})

local data = game:GetService("HttpService"):JSONDecode(res.Body)

if data.valid then
    print("Success! Loading Script...")
    
    local hwidParam = game:GetService("HttpService"):UrlEncode(getHWID())
    local rawUrl = API_URL .. "/api/scripts/" .. SCRIPT_ID .. "/raw?hwid=" .. hwidParam
    
    loadstring(game:HttpGet(rawUrl))()
else
    warn("Invalid Key!")
end`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
