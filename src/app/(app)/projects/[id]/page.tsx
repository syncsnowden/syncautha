"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase/client";

interface Script {
  id: string; project_id: string; name: string;
  silent_mode: boolean; script_code: string; created_at: number;
  webhook_protection: boolean; 
  use_syncauth_gui?: boolean;
  gui_title?: string;
  discord_link?: string;
  get_key_link?: string;
  show_discord_button?: boolean;
  target_script_id?: string;
  logs_webhook_enabled?: boolean;
  logs_webhook?: string;
  log_hwid?: boolean; log_ip?: boolean;
  log_username?: boolean; log_displayname?: boolean; log_time?: boolean;
  log_key?: boolean; log_executor?: boolean; log_jobid?: boolean;
}

interface Project { id: string; name: string; }

const keyLoaderTemplate = (scriptId: string, name: string, site: string) => `local loader_gui_title = "Spirit"
local discord_copy_invite = "https://discord.gg/5zp95qrrmK"
local show_discord_button = true

local site_url = "${site}"
local script_id = "${scriptId}"

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local RbxAnalyticsService = game:GetService("RbxAnalyticsService")
local CoreGui = game:GetService("CoreGui")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

local ASSETS = {
    key = "rbxassetid://10871266112",
    lock = "rbxassetid://15117261700",
    copy = "rbxassetid://103287906385313",
    discord = "rbxassetid://18505728201",
    close = "rbxassetid://10152135063",
}

local function _C(n)
    local c = {}
    for i = 1, #n do c[i] = string.char(n[i]) end
    return table.concat(c)
end

local API = site_url .. "/api/keys/validate"
local SITE = site_url
local CT_HEADER = _C({67,111,110,116,101,110,116,45,84,121,112,101})
local CT_VALUE = _C({97,112,112,108,105,99,97,116,105,111,110,47,106,115,111,110})

local cached_hwid = nil
local function getHWID()
    if cached_hwid then return cached_hwid end
    local ok, id = pcall(RbxAnalyticsService.GetClientId, RbxAnalyticsService)
    if ok and type(id) == "string" and #id > 0 then cached_hwid = id return id end
    ok, id = pcall(HttpService.GenerateGUID, HttpService, false)
    if ok and type(id) == "string" then cached_hwid = id return id end
    cached_hwid = LocalPlayer.UserId .. "-" .. os.time()
    return cached_hwid
end

local REQ_FN = (syn and syn.request) or (http and http.request) or request or function(t) return HttpService:RequestAsync(t) end

local function req(method, url, body)
    local json = body and HttpService:JSONEncode(body) or ""
    local ok, res = pcall(function()
        local opts = { Url = url, Method = method, Headers = { [CT_HEADER] = CT_VALUE } }
        if method == "POST" then opts.Body = json end
        return REQ_FN(opts)
    end)
    if not ok then return nil end
    local s = res.StatusCode or res.Status or 0
    local b = res.Body or res.body or ""
    if s < 200 or s >= 300 then return nil end
    local dec, data = pcall(function() return HttpService:JSONDecode(b) end)
    return dec and data or nil
end

local gui = Instance.new("ScreenGui")
gui.Name = "SpiritKey"
gui.ResetOnSpawn = false
gui.DisplayOrder = 999
gui.Enabled = true
local targetGui = (gethui and gethui()) or (pcall(function() return CoreGui.Name end) and CoreGui) or PlayerGui
gui.Parent = targetGui

local W, H_SIZE = 300, 400
local m = Instance.new("Frame")
m.Size = UDim2.fromOffset(W, H_SIZE)
m.BackgroundColor3 = Color3.fromRGB(5, 5, 5)
m.BorderSizePixel = 0
m.Parent = gui
m.Visible = false
m.ClipsDescendants = true

local mc = Instance.new("UICorner")
mc.CornerRadius = UDim.new(0, 18)
mc.Name = "Corner"
mc.Parent = m

local ms = Instance.new("UIStroke")
ms.Color = Color3.fromRGB(22, 22, 22)
ms.Thickness = 1
ms.Name = "Stroke"
ms.Parent = m

local sh = Instance.new("ImageLabel")
sh.Size = UDim2.new(1, 60, 1, 60)
sh.Position = UDim2.fromOffset(-30, -30)
sh.BackgroundTransparency = 1
sh.Image = "rbxassetid://6015897843"
sh.ImageColor3 = Color3.new(0, 0, 0)
sh.ImageTransparency = 0.75
sh.ScaleType = Enum.ScaleType.Slice
sh.SliceCenter = Rect.new(20, 20, 20, 20)
sh.ZIndex = -1
sh.Parent = m

local tb = Instance.new("Frame")
tb.Size = UDim2.new(1, 0, 0, 40)
tb.BackgroundTransparency = 1
tb.Parent = m

local tl = Instance.new("TextLabel")
tl.Size = UDim2.fromOffset(120, 40)
tl.Position = UDim2.fromOffset(16, 0)
tl.BackgroundTransparency = 1
tl.Text = loader_gui_title
tl.TextColor3 = Color3.new(1, 1, 1)
tl.Font = Enum.Font.GothamBold
tl.TextSize = 15
tl.TextXAlignment = Enum.TextXAlignment.Left
tl.Parent = tb

local cx = Instance.new("ImageButton")
cx.Size = UDim2.fromOffset(24, 24)
cx.Position = UDim2.new(1, -36, 0, 8)
cx.BackgroundTransparency = 1
cx.Image = ASSETS.close
cx.ImageColor3 = Color3.fromRGB(140, 140, 140)
cx.Parent = tb

local drag, dStart, wStart
tb.InputBegan:Connect(function(i)
    if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
        drag = true
        dStart = Vector2.new(i.Position.X, i.Position.Y)
        wStart = Vector2.new(m.Position.X.Offset, m.Position.Y.Offset)
    end
end)
tb.InputEnded:Connect(function(i)
    if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then drag = false end
end)
UserInputService.InputChanged:Connect(function(i)
    if drag and (i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch) then
        local d = Vector2.new(i.Position.X, i.Position.Y) - dStart
        m.Position = UDim2.fromOffset(wStart.X + d.X, wStart.Y + d.Y)
    end
end)

local nb = Instance.new("Frame")
nb.Size = UDim2.new(1, -20, 0, 28)
nb.Position = UDim2.fromOffset(10, 46)
nb.BackgroundColor3 = Color3.fromRGB(12, 12, 12)
nb.BorderSizePixel = 0
nb.Parent = m
nb.Visible = false
local ncr = Instance.new("UICorner")
ncr.CornerRadius = UDim.new(0, 8)
ncr.Parent = nb
local ns = Instance.new("UIStroke")
ns.Color = Color3.fromRGB(26, 26, 26)
ns.Thickness = 1
ns.Parent = nb
local ni = Instance.new("ImageLabel")
ni.Size = UDim2.fromOffset(13, 13)
ni.Position = UDim2.fromOffset(9, 7.5)
ni.BackgroundTransparency = 1
ni.Image = ASSETS.key
ni.Parent = nb
local nt = Instance.new("TextLabel")
nt.Size = UDim2.new(1, -32, 1, 0)
nt.Position = UDim2.fromOffset(28, 0)
nt.BackgroundTransparency = 1
nt.Text = ""
nt.TextColor3 = Color3.fromRGB(170, 170, 170)
nt.Font = Enum.Font.GothamMedium
nt.TextSize = 12
nt.TextXAlignment = Enum.TextXAlignment.Left
nt.Parent = nb

local nTimer
local function notify(msg, isErr)
    if nTimer then task.cancel(nTimer) end
    nb.Visible = true
    nt.Text = msg
    ns.Color = isErr and Color3.fromRGB(48, 16, 16) or Color3.fromRGB(26, 26, 26)
    ni.Image = isErr and ASSETS.lock or ASSETS.key
    ni.ImageColor3 = isErr and Color3.fromRGB(255, 70, 70) or Color3.new(1, 1, 1)
    nTimer = task.delay(3.5, function() nb.Visible = false end)
end

local function makePage()
    local p = Instance.new("Frame")
    p.Size = UDim2.new(1, -20, 1, -82)
    p.Position = UDim2.fromOffset(10, 82)
    p.BackgroundTransparency = 1
    p.Parent = m
    p.Visible = false
    return p
end

local function addIcon(par, sz, yOff, id)
    local i = Instance.new("ImageLabel", par)
    i.Size = UDim2.fromOffset(sz, sz)
    i.Position = UDim2.fromScale(0.5, yOff)
    i.AnchorPoint = Vector2.new(0.5, 0)
    i.BackgroundTransparency = 1
    i.Image = id
    return i
end

local function addLabel(par, yOff, txt, sz, col)
    local l = Instance.new("TextLabel", par)
    l.Size = UDim2.new(1, 0, 0, 24)
    l.Position = UDim2.fromOffset(0, yOff)
    l.BackgroundTransparency = 1
    l.Text = txt
    l.TextColor3 = col or Color3.new(1, 1, 1)
    l.Font = Enum.Font.GothamBold
    l.TextSize = sz or 18
    return l
end

local function addDesc(par, yOff, txt)
    local l = Instance.new("TextLabel", par)
    l.Size = UDim2.new(1, 0, 0, 36)
    l.Position = UDim2.fromOffset(0, yOff)
    l.BackgroundTransparency = 1
    l.Text = txt
    l.TextColor3 = Color3.fromRGB(110, 110, 110)
    l.Font = Enum.Font.GothamMedium
    l.TextSize = 12.5
    l.TextWrapped = true
    l.RichText = true
    return l
end

local function addInput(par, yOff, ph)
    local bx = Instance.new("TextBox", par)
    bx.Size = UDim2.new(1, 0, 0, 40)
    bx.Position = UDim2.fromOffset(0, yOff)
    bx.BackgroundColor3 = Color3.fromRGB(10, 10, 10)
    bx.BorderSizePixel = 0
    bx.Text = ""
    bx.PlaceholderText = ph
    bx.TextColor3 = Color3.new(1, 1, 1)
    bx.PlaceholderColor3 = Color3.fromRGB(42, 42, 42)
    bx.Font = Enum.Font.Code
    bx.TextSize = 16
    bx.TextXAlignment = Enum.TextXAlignment.Center
    bx.ClearTextOnFocus = false
    local c = Instance.new("UICorner", bx)
    c.CornerRadius = UDim.new(0, 10)
    local s = Instance.new("UIStroke", bx)
    s.Color = Color3.fromRGB(22, 22, 22)
    s.Thickness = 1

    bx.Focused:Connect(function() s.Color = Color3.fromRGB(55, 55, 55) end)
    bx.FocusLost:Connect(function() s.Color = Color3.fromRGB(22, 22, 22) end)
    return bx
end

local function addButton(par, yOff, txt, id, primary)
    local b = Instance.new("ImageButton", par)
    b.Size = UDim2.new(1, 0, 0, 38)
    b.Position = UDim2.fromOffset(0, yOff)
    b.BackgroundColor3 = primary and Color3.new(1, 1, 1) or Color3.fromRGB(13, 13, 13)
    b.BorderSizePixel = 0
    local c = Instance.new("UICorner", b)
    c.CornerRadius = UDim.new(0, 10)
    local s = Instance.new("UIStroke", b)
    s.Color = primary and Color3.new(1, 1, 1) or Color3.fromRGB(26, 26, 26)
    s.Thickness = primary and 2 or 1
    local ii = Instance.new("ImageLabel", b)
    ii.Size = UDim2.fromOffset(15, 15)
    ii.Position = UDim2.fromOffset(13, 11.5)
    ii.BackgroundTransparency = 1
    ii.Image = id
    ii.ImageColor3 = primary and Color3.new(0, 0, 0) or Color3.fromRGB(200, 200, 200)
    local tx = Instance.new("TextLabel", b)
    tx.Size = UDim2.new(1, -42, 1, 0)
    tx.Position = UDim2.fromOffset(42, 0)
    tx.BackgroundTransparency = 1
    tx.Text = txt
    tx.TextColor3 = primary and Color3.new(0, 0, 0) or Color3.fromRGB(200, 200, 200)
    tx.Font = primary and Enum.Font.GothamBold or Enum.Font.GothamMedium
    tx.TextSize = 13
    tx.TextXAlignment = Enum.TextXAlignment.Left
    return b
end

local hp = makePage()
addIcon(hp, 40, 0, ASSETS.lock)
addLabel(hp, 48, "Key System", 19)
addDesc(hp, 72, "Enter your key to unlock!\\nGet the key from our site")
local inp = addInput(hp, 116, "XXXXXXXXXXXX")
local btnUnlock = addButton(hp, 164, "Unlock Key", ASSETS.key, true)
local btnGetKey = addButton(hp, 206, "Get Key", ASSETS.copy)
local btnGetKeyLink = SITE .. "/get-key/" .. script_id

local btnDiscord
if show_discord_button then
    btnDiscord = addButton(hp, 248, "Join Discord", ASSETS.discord)
end

local lp = makePage()
addIcon(lp, 36, 0.26, ASSETS.key)
addLabel(lp, 172, "Verifying key...", 14, Color3.fromRGB(140, 140, 140))

local sp = makePage()
addIcon(sp, 40, 0.12, ASSETS.key)
addLabel(sp, 65, "Access Granted", 19)
addDesc(sp, 90, "Key verified successfully.\\nContinuing...")

local ep = makePage()
local ei = addIcon(ep, 40, 0.12, ASSETS.lock)
ei.ImageColor3 = Color3.fromRGB(255, 70, 70)
addLabel(ep, 65, "Access Denied", 19, Color3.fromRGB(255, 70, 70))
local errDesc = addDesc(ep, 90, "")
local btnRetry = addButton(ep, 132, "Try Again", ASSETS.key)

local pages = { hp, lp, sp, ep }
local function showPage(p)
    for _, v in ipairs(pages) do v.Visible = v == p end
end

local function center()
    task.wait()
    local ok, vp = pcall(function() return workspace.CurrentCamera.ViewportSize end)
    if ok and vp then
        m.Position = UDim2.fromOffset((vp.X - W) / 2, (vp.Y - H_SIZE) / 2)
    else
        m.Position = UDim2.fromScale(0.5, 0.5)
        m.AnchorPoint = Vector2.new(0.5, 0.5)
    end
end

local function openGUI()
    center()
    m.Visible = true
    m.Size = UDim2.fromOffset(0, 0)
    TweenService:Create(m, TweenInfo.new(0.35, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
        Size = UDim2.fromOffset(W, H_SIZE)
    }):Play()
    showPage(hp)
end

local function closeGUI()
    local tw = TweenService:Create(m, TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
        Size = UDim2.fromOffset(0, 0)
    })
    tw:Play()
    tw.Completed:Connect(function() m.Visible = false end)
end

local authed = false
local validated_key = ""

local function validate(key)
    key = string.gsub(key, "%s+", "")
    showPage(lp)

    local hwid = getHWID()
    local res = req("POST", API, {
        key = key,
        hwid = hwid,
        username = LocalPlayer.Name,
        display_name = LocalPlayer.DisplayName,
        executor = identifyexecutor and identifyexecutor() or "Unknown"
    })

    if not res then
        errDesc.Text = "Connection failed.\\nCheck your internet."
        showPage(ep)
        return
    end

    if res.valid == true or res.status == "valid" then
        showPage(sp)
        task.wait(1.5)
        closeGUI()
        task.wait(0.3)
        getgenv().loader_key = key
        gui:Destroy()
        validated_key = key
        authed = true
        return
    end

    if res.status == "expired" then
        errDesc.Text = "Key has expired.\\nGet a new one from our site."
    elseif res.status == "hwid_mismatch" then
        errDesc.Text = "Wrong key.\\nThis key is locked to another device."
    else
        errDesc.Text = "Wrong key.\\nCheck your key and try again."
    end
    showPage(ep)
end

btnUnlock.MouseButton1Click:Connect(function()
    local k = inp.Text
    if k == "" then notify("Enter a key first", true) return end
    validate(k)
end)

btnGetKey.MouseButton1Click:Connect(function()
    if setclipboard then
        setclipboard(btnGetKeyLink)
        notify("Site URL copied to clipboard!", false)
    else
        notify("Clipboard not supported", true)
    end
end)

if btnDiscord then
    btnDiscord.MouseButton1Click:Connect(function()
        if setclipboard then
            setclipboard(discord_copy_invite)
            notify("Discord invite copied!", false)
        end
    end)
end

btnRetry.MouseButton1Click:Connect(function()
    showPage(hp)
end)

cx.MouseButton1Click:Connect(closeGUI)

inp.FocusLost:Connect(function(enter)
    if enter then
        local k = inp.Text
        if k ~= "" then validate(k) end
    end
end)

pcall(openGUI)

while not authed do task.wait(0.5) end

-- Start session verification loop (runs every 45 seconds)
task.spawn(function()
    local my_key = validated_key
    local my_hwid = getHWID()
    local my_name = LocalPlayer.Name
    local my_disp = LocalPlayer.DisplayName
    local my_exec = identifyexecutor and identifyexecutor() or "Unknown"
    while task.wait(45) do
        local check = req("POST", API, {
            key = my_key,
            hwid = my_hwid,
            username = my_name,
            display_name = my_disp,
            executor = my_exec
        })
        if not check or (check.status ~= "valid" and check.status ~= "active") then
            LocalPlayer:Kick("Access revoked: Key deleted or user blacklisted.")
            break
        end
    end
end)

local success, err = pcall(function()
    loadstring(game:HttpGet(site_url .. "/api/scripts/" .. script_id .. "/raw?hwid=" .. HttpService:UrlEncode(getHWID()) .. "&username=" .. HttpService:UrlEncode(LocalPlayer.Name) .. "&executor=" .. HttpService:UrlEncode(identifyexecutor and identifyexecutor() or "Unknown")))()
end)
if not success then
    warn("[SyncAuth] Failed to load main script:", err)
end`;

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pid = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSid, setEditSid] = useState("");
  const [form, setForm] = useState({ 
    name: "", silent_mode: false, script_code: "", webhook_protection: false, 
    use_syncauth_gui: true, gui_title: "", discord_link: "", get_key_link: "", show_discord_button: true, target_script_id: "",
    logs_webhook_enabled: false, logs_webhook: "",
    log_hwid: true, log_ip: true, log_username: true, log_displayname: false,
    log_time: true, log_key: true, log_executor: true, log_jobid: false
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"scripts" | "keys">("scripts");
  const [obfUsage, setObfUsage] = useState<{ used: number; limit: number; plan: string }>({ used: 0, limit: 10, plan: "Free" });

  useEffect(() => {
    fetch(`/api/projects/${pid}`).then(r => r.json()).then(setProject);
    loadScripts();

    const fetchUsage = async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        const { data: { session } } = await sb.auth.getSession();
        let token = session?.access_token || "";
        
        if (!token) {
          const raw = localStorage.getItem("syncauth_session");
          if (raw) token = JSON.parse(raw)?.access_token || "";
        }
        
        if (token) {
          const r = await fetch("/api/obf-usage", { headers: { Authorization: `Bearer ${token}` } });
          if (r.ok) {
            const d = await r.json();
            if (d?.used !== undefined) setObfUsage(d);
          }
        }
      } catch (e) {
        console.error("Obf usage fetch failed", e);
      }
    };
    fetchUsage();
  }, [pid]);

  async function loadScripts() {
    const res = await fetch(`/api/projects/${pid}/scripts`);
    setScripts(await res.json());
  }

  function resetForm() { setForm({ name: "", silent_mode: false, script_code: "", webhook_protection: false, use_syncauth_gui: true, gui_title: "", discord_link: "", get_key_link: "", show_discord_button: true, target_script_id: "", logs_webhook_enabled: false, logs_webhook: "", log_hwid: true, log_ip: true, log_username: true, log_displayname: false, log_time: true, log_key: true, log_executor: true, log_jobid: false }); setEditSid(""); setShowForm(false); }
  function editScript(s: Script) { setEditSid(s.id); setForm({ name: s.name, silent_mode: s.silent_mode, script_code: s.script_code, webhook_protection: s.webhook_protection, use_syncauth_gui: s.use_syncauth_gui ?? true, gui_title: s.gui_title || "", discord_link: s.discord_link || "", get_key_link: s.get_key_link || "", show_discord_button: s.show_discord_button ?? true, target_script_id: s.target_script_id || "", logs_webhook_enabled: s.logs_webhook_enabled ?? false, logs_webhook: s.logs_webhook || "", log_hwid: s.log_hwid ?? true, log_ip: s.log_ip ?? true, log_username: s.log_username ?? true, log_displayname: s.log_displayname ?? false, log_time: s.log_time ?? true, log_key: s.log_key ?? true, log_executor: s.log_executor ?? true, log_jobid: s.log_jobid ?? false }); setShowForm(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Script name is required.");
    if (!editSid && !form.use_syncauth_gui && !form.script_code.trim()) return toast.error("Please upload or paste a script file.");
    setSaving(true);
    try {
      const url = editSid ? `/api/scripts/${editSid}` : `/api/projects/${pid}/scripts`;
      const method = editSid ? "PUT" : "POST";
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.status === 429) {
        const data = await res.json();
        toast.error(data.error || "Obfuscation limit reached for your plan.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save.");
      }
      toast.success(editSid ? "Script updated!" : "Script created & obfuscated!");
      resetForm(); loadScripts();
    } catch (e: any) { toast.error(e.message || "Failed to save."); }
    finally { setSaving(false); }
  }

  async function deleteScript(id: string) {
    if (!confirm("Delete this script?")) return;
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    toast.success("Deleted."); loadScripts();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".lua") && !file.name.endsWith(".txt")) { toast.error("Only .lua or .txt files"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, script_code: reader.result as string, name: form.name || file.name.replace(/\.(lua|txt)$/, "") });
      toast.success("File loaded!");
    };
    reader.readAsText(file);
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://syncauth-eight.vercel.app";

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button className="btn btn-ghost" onClick={() => router.push("/projects")} style={{ fontSize: 14 }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} /> Back
          </button>
        </div>
        <h1 className="page-title">{project?.name || "Loading..."}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>Key System URL:</span>
          <code style={{ background: "var(--bg-2)", padding: "4px 10px", borderRadius: 6, fontSize: 12, color: "var(--accent)", fontFamily: "monospace" }}>
            {siteUrl}/get-key/{pid}
          </code>
          <button className="btn btn-secondary btn-sm" style={{ width: "auto", padding: "4px 10px", fontSize: 11 }} onClick={() => {
            navigator.clipboard.writeText(`${siteUrl}/get-key/${pid}`);
            toast.success("Copied!");
          }}>
            <i className="fa-solid fa-copy" />
          </button>
        </div>

        <p className="page-subtitle" style={{ marginTop: 12 }}>Manage scripts and key system for this project.</p>
      </div>

      <div className="page-body">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className={`btn ${tab === "scripts" ? "btn-primary" : "btn-secondary"}`} style={{ width: "auto" }} onClick={() => setTab("scripts")}>
            <i className="fa-solid fa-code" /> Scripts ({scripts.length})
          </button>
          <button className={`btn ${tab === "keys" ? "btn-primary" : "btn-secondary"}`} style={{ width: "auto" }} onClick={() => setTab("keys")}>
            <i className="fa-solid fa-key" /> Keys
          </button>
        </div>

        {tab === "scripts" && (
          <>
            {obfUsage && (
              <div style={{ 
                marginBottom: 24, 
                padding: "20px 24px", 
                background: "var(--bg-2)", 
                border: "1px solid var(--border-2)", 
                borderRadius: 16, 
                display: "flex", 
                flexDirection: "column", 
                gap: 12
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255, 255, 255, 0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-2)" }}>
                      <i className="fa-solid fa-shield-halved" style={{ color: "var(--text-2)", fontSize: 16 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", letterSpacing: "0.02em" }}>Obfuscation Quota</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Monthly limit based on your plan</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: obfUsage.used >= obfUsage.limit ? "#ef4444" : "var(--text-1)" }}>
                      {obfUsage.used} <span style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 600 }}>/ {obfUsage.limit}</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--bg-3)", color: "var(--text-2)", borderRadius: 99, fontWeight: 700, border: "1px solid var(--border-2)" }}>
                        {obfUsage.plan} Plan
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 6, background: "var(--border-2)", borderRadius: 99, overflow: "hidden", marginTop: 4 }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${Math.min(100, (obfUsage.used / obfUsage.limit) * 100)}%`, 
                    background: obfUsage.used >= obfUsage.limit ? "#ef4444" : "var(--text-2)", 
                    borderRadius: 99, 
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                </div>
                {obfUsage.used >= obfUsage.limit && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: 12 }} />
                    <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 500 }}>Monthly limit reached. Upgrade your plan to obfuscate more scripts.</span>
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-primary" style={{ marginBottom: 16, width: "auto" }} onClick={() => { resetForm(); setShowForm(true); }}>
              <i className="fa-solid fa-plus" /> Add Script
            </button>

            {showForm && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <span className="card-title">{editSid ? "Edit Script" : "New Script"}</span>
                  <button className="btn btn-ghost" onClick={resetForm}><i className="fa-solid fa-xmark" /></button>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="input-group">
                      <label className="input-label">Script Name</label>
                      <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Script, Aimbot, ESP" />
                    </div>
                    <Toggle label="Silent Mode (remove F9 logs/prints)" checked={form.silent_mode} onChange={v => setForm({ ...form, silent_mode: v })} />
                    <Toggle label="Webhook Protection" checked={form.webhook_protection} onChange={v => setForm({ ...form, webhook_protection: v })} />
                    <div style={{ padding: "16px", background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                      <Toggle label="Webhook Notification (Log Executions)" checked={form.logs_webhook_enabled} onChange={v => setForm({ ...form, logs_webhook_enabled: v })} />
                      
                      {form.logs_webhook_enabled && (
                        <>
                          <div className="input-group">
                            <label className="input-label">Execution Logs Webhook</label>
                            <input className="input" value={form.logs_webhook} onChange={e => setForm({ ...form, logs_webhook: e.target.value })} placeholder="Discord Webhook URL for script execution logs" />
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <label className="input-label" style={{ marginBottom: -4 }}>Log to Webhook Fields</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <Toggle label="HWID" checked={form.log_hwid} onChange={v => setForm({ ...form, log_hwid: v })} />
                              <Toggle label="IP" checked={form.log_ip} onChange={v => setForm({ ...form, log_ip: v })} />
                              <Toggle label="Username" checked={form.log_username} onChange={v => setForm({ ...form, log_username: v })} />
                              <Toggle label="Display Name" checked={form.log_displayname} onChange={v => setForm({ ...form, log_displayname: v })} />
                              <Toggle label="Time" checked={form.log_time} onChange={v => setForm({ ...form, log_time: v })} />
                              <Toggle label="Key" checked={form.log_key} onChange={v => setForm({ ...form, log_key: v })} />
                              <Toggle label="Executor" checked={form.log_executor} onChange={v => setForm({ ...form, log_executor: v })} />
                              <Toggle label="Job ID" checked={form.log_jobid} onChange={v => setForm({ ...form, log_jobid: v })} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div style={{ padding: "16px", background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                      <Toggle label="Use SyncAuth GUI (Requires Key System)" checked={form.use_syncauth_gui} onChange={v => setForm({ ...form, use_syncauth_gui: v })} />
                      <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: -8 }}>
                        If disabled, your script is completely keyless and accessible to anyone via the loader.
                      </p>
                      
                      {form.use_syncauth_gui && (
                        <>
                          <div className="input-group">
                            <label className="input-label">Target Script ID to Execute (Optional)</label>
                            <input className="input" value={form.target_script_id || ""} onChange={e => setForm({ ...form, target_script_id: e.target.value })} placeholder="Enter the Script ID to load after key is verified" />
                            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                              If left blank, it will execute this script's uploaded code instead.
                            </p>
                          </div>
                          
                          <div className="input-group">
                            <label className="input-label">GUI Title</label>
                            <input className="input" value={form.gui_title} onChange={e => setForm({ ...form, gui_title: e.target.value })} placeholder="Default: Project Name" />
                          </div>
                          
                          <div className="input-group">
                            <label className="input-label">Get Key Link</label>
                            <input className="input" value={form.get_key_link} onChange={e => setForm({ ...form, get_key_link: e.target.value })} placeholder="Default: SyncAuth LootLabs Link" />
                          </div>

                          <Toggle label="Show Discord Button" checked={form.show_discord_button} onChange={v => setForm({ ...form, show_discord_button: v })} />
                          
                          {form.show_discord_button && (
                            <div className="input-group">
                              <label className="input-label">Discord Invite Link</label>
                              <input className="input" value={form.discord_link} onChange={e => setForm({ ...form, discord_link: e.target.value })} placeholder="https://discord.gg/..." />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {(() => {
                      const webhooks = (form.script_code.match(/https:\/\/discord\.com\/api\/webhooks\/[^\s)"'\\]+/g) || []);
                      return webhooks.length > 0 ? (
                        <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, fontSize: 12, color: "#fca5a5" }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                          {webhooks.length} webhook{webhooks.length > 1 ? "s" : ""} detected in code
                        </div>
                      ) : null;
                    })()}
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
                      onDragLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "var(--border-2)";
                        const file = e.dataTransfer.files[0];
                        if (!file) return;
                        if (!file.name.endsWith(".lua") && !file.name.endsWith(".txt")) { toast.error("Only .lua or .txt files"); return; }
                        const reader = new FileReader();
                        reader.onload = () => setForm({ ...form, script_code: reader.result as string, name: form.name || file.name.replace(/\.(lua|txt)$/, "") });
                        reader.readAsText(file);
                      }}
                      style={{
                        border: "2px dashed var(--border-2)",
                        borderRadius: 10,
                        padding: "24px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                        background: "var(--bg-2)",
                      }}
                      onClick={() => document.getElementById("scriptFileInput")?.click()}
                    >
                      <input id="scriptFileInput" type="file" accept=".lua,.txt" onChange={handleFileUpload} style={{ display: "none" }} />
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, color: "var(--text-3)", marginBottom: 8 }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Drop your .lua file here</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>or click to browse</div>
                      {form.script_code && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                          {form.script_code.length.toLocaleString()} characters loaded
                        </div>
                      )}
                    </div>
                    <button className="btn btn-primary" disabled={saving} style={{ width: "auto" }}>
                      {saving ? "Saving..." : editSid ? "Update Script" : "Create Script"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {scripts.map((s) => (
              <div key={s.id} className="card" style={{ marginBottom: 12 }}>
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                        ID: {s.id} | {s.silent_mode ? "Silent" : "Normal"}{s.webhook_protection ? " | Webhook Protected" : ""}{s.use_syncauth_gui === false ? " | Keyless Free" : ""} | {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        const loadStr = s.use_syncauth_gui !== false 
                          ? 'getgenv().script_key = "Enter_Your_Key_Here" -- Optional: Allows for automatic UI-less execution\nloadstring(game:HttpGet("' + siteUrl + '/api/loader/' + s.id + '"))()'
                          : 'loadstring(game:HttpGet("' + siteUrl + '/api/loader/' + s.id + '"))()';
                        navigator.clipboard.writeText(loadStr);
                        toast.success(s.use_syncauth_gui !== false ? "Copied loader with script_key format!" : "Copied keyless loader!");
                      }}>
                        <i className="fa-solid fa-download" /> Loader
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => editScript(s)}>
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteScript(s.id)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {scripts.length === 0 && !showForm && (
              <div className="empty-state">
                <i className="fa-solid fa-code empty-icon" />
                <div className="empty-title">No scripts yet</div>
                <div className="empty-desc">Add a script to start. Upload your main script and use the key loader for your users.</div>
              </div>
            )}
          </>
        )}

        {tab === "keys" && <KeysTab projectId={pid} plan={obfUsage?.plan || "Free"} />}
      </div>
    </>
  );
}

function KeysTab({ projectId, plan }: { projectId: string, plan: string }) {
  const [keys, setKeys] = useState<any[]>([]);
  const [key, setKey] = useState("");
  const [genning, setGenning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, [projectId]);

  async function fetchKeys() {
    setLoading(true);
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (Array.isArray(data)) {
        setKeys(data.filter((k: any) => k.project_id === projectId));
      }
    } catch {
      toast.error("Failed to load keys");
    } finally {
      setLoading(false);
    }
  }

  async function generateKey() {
    setGenning(true);
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: projectId }) });
      const data = await res.json();
      if (data.key) { setKey(data.key); toast.success("Key generated!"); fetchKeys(); }
      else { toast.error(data.error || "Failed"); }
    } catch { toast.error("Failed."); }
    finally { setGenning(false); }
  }

  async function deleteKey(k: string) {
    if (!confirm("Delete this key? Users using it will be kicked.")) return;
    try {
      const res = await fetch(`/api/keys?key=${k}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Key deleted!");
        fetchKeys();
      } else {
        toast.error("Failed to delete key");
      }
    } catch {
      toast.error("Error deleting key");
    }
  }

  const maxKeys = plan === "Pro" ? 2000 : (plan === "Basic" ? 500 : 200);

  return (
    <div>
      <div className="card">
        <div className="card-header"><span className="card-title">Generate Key</span></div>
        <div className="card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={generateKey} disabled={genning || keys.length >= maxKeys} style={{ width: "auto" }}>
              <i className="fa-solid fa-key" /> {genning ? "Generating..." : "Generate Key"}
            </button>
            <div style={{ textAlign: "right", minWidth: 150 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
                {keys.length} Keys
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, marginBottom: 6 }}>
                {keys.length} / {maxKeys} ({plan} Plan)
              </div>
              <div style={{ height: 4, background: "var(--border-2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (keys.length / maxKeys) * 100)}%`, background: keys.length >= maxKeys ? "#f87171" : "var(--accent)", borderRadius: 99, transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>
          {key && (
            <div style={{ marginTop: 12, padding: 12, background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Generated Key:</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--accent)", letterSpacing: 1 }}>{key}</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => { navigator.clipboard.writeText(key); toast.success("Copied!"); }}>
                <i className="fa-solid fa-copy" /> Copy
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span className="card-title">Manage Keys</span></div>
        <div className="card-body">
          {loading ? (
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>Loading keys...</div>
          ) : keys.length === 0 ? (
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>No keys generated yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.key}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{k.key}</td>
                      <td>
                        <span className={`badge ${k.status === 'used' ? 'badge-primary' : 'badge-secondary'}`}>
                          {k.status}
                        </span>
                      </td>
                      <td>{new Date(k.created).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() => deleteKey(k.key)}
                          style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171" }}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: checked ? "var(--accent)" : "var(--border-2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left 0.2s" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
    </div>
  );
}
