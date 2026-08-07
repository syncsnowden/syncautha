"use client";

import React, { useState } from "react";
import DarkCyberCanvas from "@/components/DarkCyberCanvas";
export const runtime = "edge";

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
          <NavButton id="luraph" icon="fa-bolt" label="Obfuscator Macros" />
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

              <div style={{ padding: "20px", background: "rgba(0, 200, 224, 0.05)", border: "1px solid rgba(0, 200, 224, 0.15)", borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ color: "var(--accent)", fontSize: 15, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-magnifying-glass" /> Finding your Script ID
                </h4>
                <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                  You can find your <code>SCRIPT_ID</code> directly in the SyncAuth dashboard under the Scripts table of your project.
                </p>
                <img src="/docs/wheretofindscriptid.png" alt="Where to find Script ID" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border-1)" }} />
              </div>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>CustomLoader.lua</div>
                <pre style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local HttpService = game:GetService("HttpService")

local SCRIPT_ID = "YOUR_SCRIPT_ID"
local API_URL = "https://syncauth-eight.vercel.app"

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
                A quick breakdown on how SyncAuth keeps your scripts safe from skids and scrapers.
              </p>
              
              <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ color: "#ef4444", fontSize: 15, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-shield-halved" /> Security Architecture
                </h4>
                <p style={{ color: "#fca5a5", fontSize: 14, lineHeight: 1.6 }}>
                  Our <code>/raw</code> endpoint is heavily fortified. Even if an attacker finds the direct URL to your script, 
                  they can't access the script unless their exact HWID currently has an active, authenticated session in our database.
                </p>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "var(--text-1)" }}>Executing Keyless Scripts</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                If you enabled "Keyless Mode" for a script in the dashboard, the security checks are dropped so it can be used freely by anyone. 
                You can execute it directly without any validation:
              </p>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>ExecuteKeyless.lua</div>
                <pre style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local HttpService = game:GetService("HttpService")
local username = HttpService:UrlEncode(game.Players.LocalPlayer.Name)

loadstring(game:HttpGet("https://syncauth-eight.vercel.app/api/scripts/YOUR_SCRIPT_ID/raw?username=" .. username))()`}
                </pre>
              </div>
            </div>
          )}



          {activeTab === "luraph" && (
            <div style={{ maxWidth: 800 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Obfuscator Macros</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 40 }}>
                Understanding how Luraph works and how to prevent massive FPS drops and lag spikes when obfuscating high-frequency code blocks.
              </p>

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-1)" }}>Why does VM obfuscation kill performance?</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                Many high-end obfuscators (like Luraph or custom implementations) are VM-based. Instead of letting Roblox run your code natively, they translate your script into a completely custom, randomized instruction set that only their internal Virtual Machine can understand.
              </p>
              <p style={{ color: "var(--text-3)", marginBottom: 24, lineHeight: 1.6 }}>
                What does this mean for you? A basic <code>print(&quot;Hello&quot;)</code> statement might take just 4 instruction cycles natively. Under a VM, that same print statement is fractured into dozens or hundreds of custom cycles. The overhead grows exponentially.
              </p>
              
              <div style={{ padding: "20px", background: "rgba(234, 179, 8, 0.05)", border: "1px solid rgba(234, 179, 8, 0.15)", borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ color: "#eab308", fontSize: 15, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-triangle-exclamation" /> The Danger Zone
                </h4>
                <p style={{ color: "#fde047", fontSize: 14, lineHeight: 1.6 }}>
                  Normally, Lua is so fast that you won&apos;t feel the obfuscation penalty. But if your obfuscated code runs hundreds of times per second (e.g., inside <code>RenderStepped</code>), Lua will be forced to process hundreds of thousands of VM instructions every second. This will instantly tank your FPS and freeze the game.
                </p>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-1)" }}>When to optimize?</h3>
              <ul style={{ color: "var(--text-3)", marginBottom: 32, paddingLeft: 24, lineHeight: 1.8 }}>
                <li><strong>RenderStepped & Heartbeat:</strong> (e.g., ESP, Aimbot loops, UI updaters)</li>
                <li><strong>Metamethod Hooks:</strong> (e.g., <code>__index</code> or <code>__namecall</code> hooks that fire constantly)</li>
                <li><strong>Infinite Loops:</strong> (e.g., <code>while true do</code> loops with no wait/delay)</li>
                <li><strong>Garbage Collection Scans:</strong> (e.g., looping through <code>getgc()</code>)</li>
              </ul>

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-1)" }}>1. The Solution: LPH_NO_VIRTUALIZE</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                You must explicitly tell the obfuscator to exclude high-frequency functions from virtualization. You can do this by wrapping those specific functions in the <code>LPH_NO_VIRTUALIZE</code> macro.
              </p>
              
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6, fontWeight: 600 }}>
                First, add this fallback at the very top of your script so you can still test it before obfuscating:
              </p>
              
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 32 }}>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`loadstring([[
    function LPH_NO_VIRTUALIZE(f) return f end;
    function LPH_ENCFUNC(f) return f end;
    function LPH_NO_UPVALUES(f) return f end;
    LPH_LINE = 0;
]])();`}
                </pre>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-check" style={{ color: "#22c55e" }} /> Correct Implementations
              </h3>
              
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>Example 1: RenderStepped</div>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`RunService.RenderStepped:Connect(LPH_NO_VIRTUALIZE(function(delta)
    
end))`}</pre>
              </div>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>Example 2: Metamethod Hooks</div>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`oldIndex = hookmetamethod(game, "__index", LPH_NO_VIRTUALIZE(function(t, k)
    return oldIndex(t, k)
end))`}</pre>
              </div>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 32 }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>Example 3: Standalone Functions</div>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local calculateMath = LPH_NO_VIRTUALIZE(function(x, y)
    return x * y
end)

RunService.Heartbeat:Connect(calculateMath)`}</pre>
              </div>


              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-xmark" style={{ color: "#ef4444" }} /> Invalid Implementations
              </h3>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>Bad Example: Passing References</div>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local function heavyMath() end

LPH_NO_VIRTUALIZE(heavyMath)`}</pre>
              </div>

              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 32 }}>
                <div style={{ background: "#161b22", padding: "8px 16px", borderBottom: "1px solid #30363d", fontSize: 12, color: "#8b949e", fontFamily: "monospace" }}>Bad Example: Wrapping syntax</div>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`LPH_NO_VIRTUALIZE(
    local old = hookmetamethod(game, "__namecall", function(...) end)
)`}</pre>
              </div>

              <div style={{ width: "100%", height: 1, background: "var(--border-1)", margin: "48px 0" }} />

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-1)" }}>2. Data Protection: LPH_ENCFUNC</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                <code>LPH_ENCFUNC</code> ensures that the constants (strings, numbers, etc.) inside a function block are securely encrypted and are never revealed in the main script's constant pool. This is perfect for protecting sensitive Game IDs, Webhook URLs, or authentication logic.
              </p>
              
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", marginBottom: 32 }}>
                <pre style={{ padding: 16, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: 1.5, color: "#e6edf3" }}>
{`local verifyGame = LPH_ENCFUNC(function(placeId)
    if placeId == 12345678 then
        return true
    end
end)`}</pre>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-1)" }}>3. Optimization: LPH_NO_UPVALUES</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                <code>LPH_NO_UPVALUES</code> tells the obfuscator that the function does not rely on any external local variables (upvalues). This allows the compiler to aggressively optimize or inline the function, significantly boosting execution speed for heavy mathematical calculations.
              </p>

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text-1)" }}>4. Debugging: LPH_LINE</h3>
              <p style={{ color: "var(--text-3)", marginBottom: 32, lineHeight: 1.6 }}>
                <code>LPH_LINE</code> is a variable that is automatically replaced with the current line number of the original source code during the compilation process. This is extremely useful for error tracking and debugging inside heavily obfuscated scripts.
              </p>

              <div style={{ padding: "24px", background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 12, marginBottom: 40 }}>
                <h4 style={{ color: "#818cf8", fontSize: 16, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-robot" /> The AI Assistant Prompt
                </h4>
                <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                  If you use ChatGPT, Claude, or other AI tools to write your scripts, simply copy and paste this prompt to them. It perfectly explains how to optimize your script for Luraph without you needing to do it manually.
                </p>
                
                <div style={{ position: "relative" }}>
                  <pre style={{ background: "#06080d", padding: "16px", borderRadius: 8, color: "#a5b4fc", fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6, border: "1px solid rgba(99, 102, 241, 0.15)" }}>
                    "Please optimize the following Luau script for Luraph obfuscation. Since Luraph translates code into an expensive VM instruction set, I need you to identify all high-frequency blocks (like RenderStepped loops, Heartbeat loops, getgc() scans, and metamethod hooks like __index). Wrap these specific functions inside the LPH_NO_VIRTUALIZE() macro so they are excluded from virtualization. Ensure you provide the macro argument as an inline anonymous function, as Luraph does not allow passing variable references to it. Finally, include this polyfill at the top of the script so it can run outside of the obfuscator: loadstring([[ function LPH_NO_VIRTUALIZE(f) return f end; ]])()"
                  </pre>
                  <button 
                    onClick={(e) => {
                      navigator.clipboard.writeText("Please optimize the following Luau script for Luraph obfuscation. Since Luraph translates code into an expensive VM instruction set, I need you to identify all high-frequency blocks (like RenderStepped loops, Heartbeat loops, getgc() scans, and metamethod hooks like __index). Wrap these specific functions inside the LPH_NO_VIRTUALIZE() macro so they are excluded from virtualization. Ensure you provide the macro argument as an inline anonymous function, as Luraph does not allow passing variable references to it. Finally, include this polyfill at the top of the script so it can run outside of the obfuscator: loadstring([[ function LPH_NO_VIRTUALIZE(f) return f end; ]])()");
                      const btn = e.currentTarget as HTMLButtonElement;
                      const old = btn.innerHTML;
                      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                      setTimeout(() => btn.innerHTML = old, 2000);
                    }}
                    style={{ position: "absolute", top: 12, right: 12, background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "#818cf8", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <i className="fa-regular fa-copy" style={{ marginRight: 6 }}/> Copy Prompt
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
