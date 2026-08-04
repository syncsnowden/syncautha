"use client";
import { useState } from "react";
import toast from "react-hot-toast";

const LOADER_CODE = `-- ===========================================
--  SyncAuth Key System Loader
--  For Roblox Executors (Synapse, Solara, etc.)
-- ===========================================
-- 
--  HOW TO USE:
--  1. Get a Script ID from your project dashboard
--  2. Get a License Key from /key-system
--  3. Paste this entire script into your executor
--  4. Enter your Script ID + Key when prompted
--  5. Your main script will auto-load after auth
--
--  This file is also available at:
--  YOUR_SITE/api/key-loader
-- ===========================================

local SITE = "YOUR_SITE_URL"  -- <-- CHANGE THIS to your site URL

local HttpService = game:GetService("HttpService")
local player = game:GetService("Players").LocalPlayer

-- Get a unique HWID for this device
local function getHWID()
    pcall(function()
        local c = game:GetService("RbxAnalyticsService"):GetClientId()
        if c and #c > 0 then return c end
    end)
    return HttpService:GenerateGUID(false)
end

-- Make API requests to the auth server
local function request(url, body)
    local ok, res = pcall(function()
        return HttpService:JSONDecode(
            syn.request({
                Url = url,
                Method = "POST",
                Headers = { ["Content-Type"] = "application/json" },
                Body = HttpService:JSONEncode(body)
            }).Body
        )
    end)
    if ok and res then return res end
end

local hwid = getHWID()
local authed = false
local scriptId = nil

-- ===========================================
--  GUI (you can customize colors/styles here)
-- ===========================================
local gui = Instance.new("ScreenGui", game.CoreGui)
gui.Name = "SyncAuth_Loader"

local bg = Instance.new("Frame", gui)
bg.Size = UDim2.new(0, 370, 0, 270)
bg.Position = UDim2.new(0.5, -185, 0.5, -135)
bg.BackgroundColor3 = Color3.fromRGB(10, 11, 16)
bg.BorderSizePixel = 0
Instance.new("UICorner", bg).CornerRadius = UDim.new(0, 10)
Instance.new("UIStroke", bg).Color = Color3.fromRGB(0, 200, 224)

local title = Instance.new("TextLabel", bg)
title.Size = UDim2.new(1, -28, 0, 24)
title.Position = UDim2.new(0, 14, 0, 14)
title.Text = "SyncAuth | Key System"
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 15
title.TextXAlignment = Enum.TextXAlignment.Left

local function makeLabel(parent, text, y)
    local l = Instance.new("TextLabel", parent)
    l.Size = UDim2.new(1, -28, 0, 14)
    l.Position = UDim2.new(0, 14, 0, y)
    l.Text = text
    l.TextColor3 = Color3.fromRGB(150, 150, 160)
    l.BackgroundTransparency = 1
    l.Font = Enum.Font.Gotham
    l.TextSize = 12
    l.TextXAlignment = Enum.TextXAlignment.Left
    return l
end

local function makeInput(parent, placeholder, y, h)
    local inp = Instance.new("TextBox", parent)
    inp.Size = UDim2.new(1, -28, 0, h or 32)
    inp.Position = UDim2.new(0, 14, 0, y)
    inp.PlaceholderText = placeholder
    inp.BackgroundColor3 = Color3.fromRGB(18, 20, 30)
    inp.TextColor3 = Color3.fromRGB(255, 255, 255)
    inp.BorderSizePixel = 0
    inp.Font = Enum.Font.Gotham
    inp.TextSize = 13
    Instance.new("UICorner", inp).CornerRadius = UDim.new(0, 6)
    return inp
end

makeLabel(bg, "Script ID:", 44)
local sidInput = makeInput(bg, "14-char script ID", 60)

makeLabel(bg, "License Key:", 100)
local keyInput = makeInput(bg, "XXXX-XXXX-XXXX-XXXX", 116, 34)
keyInput.TextSize = 14

local status = Instance.new("TextLabel", bg)
status.Size = UDim2.new(1, -28, 0, 20)
status.Position = UDim2.new(0, 14, 0, 158)
status.Text = ""
status.TextColor3 = Color3.fromRGB(150, 150, 160)
status.BackgroundTransparency = 1
status.Font = Enum.Font.Gotham
status.TextSize = 12

local btn = Instance.new("TextButton", bg)
btn.Size = UDim2.new(1, -28, 0, 38)
btn.Position = UDim2.new(0, 14, 0, 188)
btn.Text = "UNLOCK"
btn.BackgroundColor3 = Color3.fromRGB(0, 200, 224)
btn.TextColor3 = Color3.fromRGB(10, 11, 16)
btn.BorderSizePixel = 0
btn.Font = Enum.Font.GothamBold
btn.TextSize = 14
Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)

local hint = Instance.new("TextLabel", bg)
hint.Size = UDim2.new(1, -28, 0, 14)
hint.Position = UDim2.new(0, 14, 0, 238)
hint.Text = "Get keys: " .. SITE .. "/key-system"
hint.TextColor3 = Color3.fromRGB(100, 100, 110)
hint.BackgroundTransparency = 1
hint.Font = Enum.Font.Gotham
hint.TextSize = 10

-- ===========================================
--  Auth Logic
-- ===========================================
btn.MouseButton1Click:Connect(function()
    if authed then return end
    
    local sid = sidInput.Text:gsub("%s+", "")
    if #sid < 5 then
        status.Text = "Enter a valid Script ID"
        return
    end
    scriptId = sid
    
    local k = keyInput.Text:gsub("%s+", "")
    if #k < 8 then
        status.Text = "Enter a valid key"
        return
    end
    
    status.Text = "Validating..."
    status.TextColor3 = Color3.fromRGB(150, 150, 160)
    btn.Text = "..."
    
    local result = request(SITE .. "/api/keys/validate", { key = k, hwid = hwid })
    
    if result and result.status == "valid" then
        status.Text = "Authorized! Loading..."
        status.TextColor3 = Color3.fromRGB(0, 200, 224)
        authed = true
        task.wait(1)
        gui:Destroy()
        -- This loads YOUR script from the server using its Script ID
        loadstring(game:HttpGet(SITE .. "/api/scripts/" .. scriptId .. "/raw"))()
    elseif result then
        status.Text = result.reason or "Invalid key"
        status.TextColor3 = Color3.fromRGB(255, 80, 80)
        btn.Text = "UNLOCK"
    else
        status.Text = "Connection failed"
        status.TextColor3 = Color3.fromRGB(255, 80, 80)
        btn.Text = "UNLOCK"
    end
end)

-- Block execution until authorized
while not authed do task.wait(0.5) end`;

const DOCS = [
  { title: "Overview", content: "SyncAuth lets you protect your Roblox scripts with license keys. Your users complete a checkpoint, get a key, and enter it into the loader to access your script." },
  { title: "Step 1: Create a Project", content: "Go to the Projects tab and click 'Create Project'. Fill in the settings (key duration, max keys, webhooks, etc). Each project gets its own set of scripts and keys." },
  { title: "Step 2: Upload Your Script", content: "Open your project, go to the Scripts tab, and click 'Add Script'. Paste your Lua code or upload a .lua file. Each script gets a unique 14-character ID. Copy the Raw URL for your loader." },
  { title: "Step 3: Get the Key Loader", content: "The key loader is the Lua code below. Give this file to your users. They paste it into their executor (Synapse, Solara, etc.), enter your Script ID and their License Key, and your main script loads automatically." },
  { title: "Step 4: Generate Keys", content: "Users visit YOUR_SITE/key-system?project=YOUR_PROJECT_ID. They complete a LootLabs checkpoint and receive a license key. You can also generate keys manually from the Keys tab in your project." },
  { title: "Step 5: Validate Keys in Your Script", content: "Your main script is hosted on SyncAuth. When a user enters a valid key + script ID into the loader, the server validates the key and checks HWID binding before serving your script. This means your script code is never exposed to users — they only see the loader." },
];

export default function DocsPage() {
  const [copied, setCopied] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const code = LOADER_CODE.replace("YOUR_SITE_URL", siteUrl);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Documentation</h1>
        <p className="page-subtitle">How to set up and use the SyncAuth key system.</p>
      </div>
      <div className="page-body" style={{ maxWidth: 800 }}>
        {DOCS.map((d, i) => (
          <div key={i} className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">{i + 1}. {d.title}</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6 }}>{d.content}</p>
            </div>
          </div>
        ))}

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">Key System Loader (Lua)</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                navigator.clipboard.writeText(code);
                setCopied(true);
                toast.success("Code copied!");
                setTimeout(() => setCopied(false), 2000);
              }}>
                <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} /> {copied ? "Copied!" : "Copy"}
              </button>
              <a href="/api/key-loader" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }} download>
                <i className="fa-solid fa-download" /> Download .lua
              </a>
            </div>
          </div>
          <div className="card-body">
            <pre style={{
              background: "#06080f",
              color: "#cbd5e1",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              overflowX: "auto",
              maxHeight: 500,
              overflowY: "auto",
              lineHeight: 1.4,
              margin: 0,
              border: "1px solid var(--border)",
            }}><code>{code}</code></pre>
          </div>
        </div>
      </div>
    </>
  );
}
