import { getScript, getProject } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

const DENIED = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SyncAuth</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',-apple-system,sans-serif;background:#06080d;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center}.card{text-align:center;padding:48px 32px;max-width:420px}.icon-wrap{width:64px;height:64px;border-radius:50%;background:rgba(0,200,224,.06);border:1px solid rgba(0,200,224,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}.icon-wrap i{font-size:26px;color:#00c8e0}h1{font-size:22px;font-weight:700;letter-spacing:-.01em;margin-bottom:8px}p{font-size:14px;color:#64748b;line-height:1.7}.footer{margin-top:32px;padding:14px 20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:10px;font-size:12px;font-weight:500;color:#334155;letter-spacing:.02em}</style></head><body><div class="card"><div class="icon-wrap"><i class="fa-solid fa-shield-halved"></i></div><h1>Access Denied</h1><p>This loader is protected by <strong style="color:#00c8e0">SyncAuth</strong>. Direct access is blocked. Please execute this loadstring within your Roblox executor.</p><div class="footer">SYNCAUTH · LOADER PROTECTION</div></div></body></html>`;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const ua = req.headers.get("user-agent") || "";
  const isRoblox = ua.includes("Roblox") || req.headers.get("roblox-id") || ua.toLowerCase().includes("axios");
  
  if (!isRoblox) {
    return new Response(DENIED, { status: 403, headers: { "content-type": "text/html" } });
  }
  
  // Validate script exists
  const script = await getScript(id);
  if (!script) {
    return new Response('error("SyncAuth: Script not found or invalid.")', { status: 404, headers: { "content-type": "text/plain" } });
  }

  // Validate project exists
  const project = await getProject(script.project_id);
  if (!project) {
    return new Response('error("SyncAuth: Project not found.")', { status: 404, headers: { "content-type": "text/plain" } });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => {
    const host = req.headers.get("host") || "syncauth-eight.vercel.app";
    return `https://${host}`;
  })();

  const code = `local loader_gui_title = "${project.name.replace(/"/g, '\\"')}"
local discord_copy_invite = "https://discord.gg/5zp95qrrmK"
local show_discord_button = true

local site_url = "${siteUrl}"
local script_id = "${id}"
local project_id = "${project.id}"

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
    local ok, hw = pcall(RbxAnalyticsService.GetClientId, RbxAnalyticsService)
    if ok and type(hw) == "string" and #hw > 0 then cached_hwid = hw return hw end
    ok, hw = pcall(HttpService.GenerateGUID, HttpService, false)
    if ok and type(hw) == "string" then cached_hwid = hw return hw end
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
local btnGetKeyLink = SITE .. "/get-key/" .. project_id
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
    print("[SyncAuth] Loading gui.....")
    center()
    m.Visible = true
    m.Size = UDim2.fromOffset(0, 0)
    TweenService:Create(m, TweenInfo.new(0.35, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
        Size = UDim2.fromOffset(W, H_SIZE)
    }):Play()
    showPage(hp)
    print("[SyncAuth] GUI loaded! waiting for user to enter key....")
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
        print("[SyncAuth] Right key was entered! Granting the user acces...")
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

-- Execute the authenticated script
local success, req_res = pcall(function()
    local hwidParam = HttpService:UrlEncode(getHWID())
    local userParam = HttpService:UrlEncode(LocalPlayer.Name)
    local execParam = HttpService:UrlEncode(identifyexecutor and identifyexecutor() or "Unknown")
    
    -- SyncAuth Auto-Safety: Prevent bad loadstrings from crashing user scripts
    if getgenv then
        local original_loadstring = getgenv().loadstring or loadstring
        getgenv().loadstring = function(source, chunkname)
            if not source or type(source) ~= "string" or source == "" then
                return function() warn("[SyncAuth Auto-Fix] Prevented crash: Script attempted to load and execute an empty or missing remote file.") end
            end
            local func, err = original_loadstring(source, chunkname)
            if not func then
                return function() warn("[SyncAuth Auto-Fix] Prevented crash: Syntax error in loaded code ->", err) end
            end
            return func
        end
    end
    
    local s_ok, err = pcall(function()
        loadstring(game:HttpGet(site_url .. "/api/scripts/" .. script_id .. "/raw?hwid=" .. hwidParam .. "&username=" .. userParam .. "&executor=" .. execParam))()
    end)
    if not s_ok then 
        warn("[SyncAuth] Failed to load main script:", err) 
    else
        print("[SyncAuth] Acces granted! Script loaded succesfully.")
    end
end)
`;

  return new Response(code, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
