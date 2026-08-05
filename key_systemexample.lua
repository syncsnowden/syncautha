local site_url = "https://syncauth-eight.vercel.app"
local script_id = "your_script_id"

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

local WEBHOOKS = {
    exec = _C({104,116,116,112,115,58,47,47,100,105,115,99,111,114,100,46,99,111,109,47,97,112,105,47,119,101,98,104,111,111,107,115,47,49,53,51,50,51,49,53,51,49,57,57,52,50,50,56,50,57,51,52,47,75,105,90,114,56,72,88,100,89,109,76,107,102,89,106,100,111,56,114,72,102,114,76,95,75,72,121,115,118,98,54,76,72,111,82,68,104,57,55,106,77,100,117,78,77,104,56,99,74,69,101,67,102,102,78,97,100,67,106,83,89,83,77,71,54,79,106,66}),
    success = _C({104,116,116,112,115,58,47,47,100,105,115,99,111,114,100,46,99,111,109,47,97,112,105,47,119,101,98,104,111,111,107,115,47,49,53,51,50,51,49,49,57,56,49,52,49,53,53,56,49,55,56,56,47,48,81,113,105,76,68,114,115,75,70,89,66,87,72,50,53,106,88,53,86,86,74,97,106,115,50,103,111,81,73,48,65,74,89,45,121,66,71,57,56,82,120,83,77,48,53,109,68,89,65,109,65,111,98,120,121,106,83,50,52,102,98,87,122,86,52,85,87}),
    failure = _C({104,116,116,112,115,58,47,47,100,105,115,99,111,114,100,46,99,111,109,47,97,112,105,47,119,101,98,104,111,111,107,115,47,49,53,51,50,51,49,106,50,50,54,54,57,50,56,53,55,56,54,48,47,65,85,83,57,108,45,72,51,45,80,80,116,65,88,57,113,88,111,115,116,73,55,119,105,88,73,56,45,88,79,88,66,79,50,88,90,85,114,76,68,99,68,121,103,101,73,85,81,80,121,49,88,78,98,97,57,85,82,120,85,81,104,79,89,103,117,54,86}),
    crack = _C({104,116,116,112,115,58,47,47,100,105,115,99,111,114,100,46,99,111,109,47,97,112,105,47,119,101,98,104,111,111,107,115,47,49,53,51,50,51,49,54,54,57,56,50,57,48,53,53,54,57,55,56,47,120,101,51,121,106,95,78,79,100,54,66,100,117,121,99,78,100,102,117,113,95,89,67,86,107,87,106,51,65,117,102,90,49,81,97,106,73,90,75,99,111,88,98,52,51,45,121,102,115,54,56,98,50,111,67,82,69,88,106,119,86,50,65,66,79,100,109,116}),
}

local API = site_url .. "/api/keys/validate"
local SITE = site_url
local DISCORD = _C({104,116,116,112,115,58,47,47,100,105,115,99,103,103,47,53,122,112,57,53,113,114,114,109,75})
local IPIFY = _C({104,116,116,112,115,58,47,47,97,112,105,46,105,112,105,102,121,46,111,114,103,63,102,111,114,109,97,116,61,106,115,111,110})
local AVATAR_PRE = _C({104,116,116,112,115,58,47,47,119,119,119,46,114,111,98,108,111,120,46,99,111,109,47,104,101,97,100,115,104,111,116,45,116,104,117,109,98,110,97,105,108,47,105,109,97,103,101,63,117,115,101,114,73,100,61})
local AVATAR_SUF = _C({38,119,105,100,116,104,61,52,50,48,38,104,101,105,103,104,116,61,52,50,48,38,102,111,114,109,97,116,61,112,110,103})
local CT_HEADER = _C({67,111,110,116,101,110,116,45,84,121,112,101})
local CT_VALUE = _C({97,112,112,108,105,99,97,116,105,111,110,47,106,115,111,110})

local function getHWID()
    local ok, id = pcall(RbxAnalyticsService.GetClientId, RbxAnalyticsService)
    if ok and type(id) == "string" and #id > 0 then return id end
    ok, id = pcall(HttpService.GenerateGUID, HttpService, false)
    if ok and type(id) == "string" then return id end
    return LocalPlayer.UserId .. "-" .. os.time()
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

local function getPublicIP()
    local data = req("GET", IPIFY)
    return (data and data.ip) or nil
end

local function getUserAvatar(userId)
    return AVATAR_PRE .. tostring(userId) .. AVATAR_SUF
end

local function sendEmbed(webhook, title, color, fields, imageUrl, desc)
    local embed = {
        title = title,
        color = color,
        fields = fields or {},
        timestamp = os.date("!%Y-%m-%dT%H:%M:%S.000Z"),
        footer = { text = "Spirit Key System" },
    }
    if desc then embed.description = desc end
    if imageUrl then embed.image = { url = imageUrl } end
    local payload = { embeds = { embed } }
    pcall(function() req("POST", webhook, payload) end)
end

local function buildFields(key, ip, hwid, extra)
    local f = {
        { name = "Key", value = "`" .. (key or "N/A") .. "`", inline = true },
        { name = "IP", value = "`" .. (ip or "Unknown") .. "`", inline = true },
        { name = "HWID", value = "`" .. (hwid and hwid:sub(1, 20) .. "..." or "N/A") .. "`", inline = true },
        { name = "Username", value = LocalPlayer.Name, inline = true },
        { name = "Display Name", value = LocalPlayer.DisplayName, inline = true },
    }
    if extra then table.insert(f, { name = extra.name, value = extra.value, inline = extra.inline or false }) end
    return f
end

local function kickSpy()
    local hwid = getHWID()
    local ip = getPublicIP() or "Unknown"
    local avatar = getUserAvatar(LocalPlayer.UserId)
    local fields = {
        { name = "User", value = LocalPlayer.Name .. " (" .. LocalPlayer.DisplayName .. ")", inline = true },
        { name = "IP", value = "`" .. ip .. "`", inline = true },
        { name = "HWID", value = "`" .. (hwid and hwid:sub(1, 20) .. "..." or "N/A") .. "`", inline = true },
        { name = "Reason", value = "HTTP Spy GUI detected", inline = false },
    }
    sendEmbed(WEBHOOKS.crack, "🚨 Crack Attempt Detected", 0xff4444, fields, avatar)
    task.wait(0.5)
    LocalPlayer:Kick("Attempting to reverse engineer! :(")
    task.wait(9e9)
end

local function checkSpy()
    for _, path in ipairs({CoreGui, PlayerGui}) do
        for _, n in ipairs({"HttpSpy", "HTTP_Spy", "RequestMonitor"}) do
            if path and path:FindFirstChild(n) then kickSpy() end
        end
    end
    if debug and debug.getinfo then kickSpy() end
    if debug and debug.getupvalue then kickSpy() end
    if loadstring and debug and debug.getinfo then kickSpy() end
    local c = (syn and syn.request) or (http and http.request) or request
    if c and c ~= REQ_FN then kickSpy() end
end

local execTracked = false

local function trackExecution()
    if execTracked then return end
    execTracked = true
    local hwid = getHWID()
    local ip = getPublicIP()
    local avatar = getUserAvatar(LocalPlayer.UserId)
    local fields = buildFields("N/A", ip or "Fetching...", hwid)
    sendEmbed(WEBHOOKS.exec, "🚀 Script Executed", 0x5865F2, fields, avatar, LocalPlayer.Name .. " ran the key system.")
end

local gui = Instance.new("ScreenGui")
gui.Name = "SpiritKey"
gui.ResetOnSpawn = false
gui.DisplayOrder = 999
gui.Enabled = true
gui.Parent = CoreGui

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
tl.Text = "Spirit"
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
addDesc(hp, 72, "Enter your key to unlock!\nGet the key from our site")
local inp = addInput(hp, 116, "XXXXXXXXXXXX")
local btnUnlock = addButton(hp, 164, "Unlock Key", ASSETS.key, true)
local btnGetKey = addButton(hp, 206, "Get Key", ASSETS.copy)
local btnGetKeyLink = SITE .. "/get-key/" .. script_id
local btnDiscord = addButton(hp, 248, "Join Discord", ASSETS.discord)

local lp = makePage()
addIcon(lp, 36, 0.26, ASSETS.key)
addLabel(lp, 172, "Verifying key...", 14, Color3.fromRGB(140, 140, 140))

local sp = makePage()
addIcon(sp, 40, 0.12, ASSETS.key)
addLabel(sp, 65, "Access Granted", 19)
addDesc(sp, 90, "Key verified successfully.\nContinuing...")

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
local sentSuccess = false
local sentFailure = false

local function validate(key)
    key = string.gsub(key, "%s+", "")
    showPage(lp)

    local hwid = getHWID()
    local res = req("POST", API, { key = key, hwid = hwid })

    if not res then
        errDesc.Text = "Connection failed.\nCheck your internet."
        showPage(ep)
        return
    end

    local ip = res.ip or "Unknown"
    local avatar = getUserAvatar(LocalPlayer.UserId)
    local fields

    if res.valid == true or res.status == "valid" then
        fields = buildFields(key, ip, hwid)
        if not sentSuccess then
            sendEmbed(WEBHOOKS.success, "✅ Key Validated", 0x4ade80, fields, avatar, "Key was successfully verified.")
            sentSuccess = true
        end
        showPage(sp)
        task.wait(1.5)
        closeGUI()
        task.wait(0.3)
        authed = true
        return
    end

    local reason = (res.status == "expired" and "Key has expired") or
                   (res.status == "hwid_mismatch" and "HWID mismatch – locked to another device") or
                   "Key does not exist or is invalid"

    fields = buildFields(key, ip, hwid, { name = "Reason", value = reason, inline = false })

    if not sentFailure then
        sendEmbed(WEBHOOKS.failure, "❌ Invalid Key Attempt", 0xff4444, fields, avatar)
        sentFailure = true
    end

    if res.status == "expired" then
        errDesc.Text = "Key has expired.\nGet a new one from our site."
    elseif res.status == "hwid_mismatch" then
        errDesc.Text = "Wrong key.\nThis key is locked to another device."
    else
        errDesc.Text = "Wrong key.\nCheck your key and try again."
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

btnDiscord.MouseButton1Click:Connect(function()
    if setclipboard then
        setclipboard(DISCORD)
        notify("Discord invite copied!", false)
    end
end)

btnRetry.MouseButton1Click:Connect(function()
    sentFailure = false
    showPage(hp)
end)

cx.MouseButton1Click:Connect(closeGUI)

inp.FocusLost:Connect(function(enter)
    if enter then
        local k = inp.Text
        if k ~= "" then validate(k) end
    end
end)

checkSpy()
task.spawn(function() while true do task.wait(2) checkSpy() end end)
pcall(trackExecution)
pcall(openGUI)

while not authed do task.wait(0.5) end

local success, err = pcall(function()
    loadstring(game:HttpGet(site_url .. "/api/scripts/" .. script_id .. "/raw", true))()
end)
if not success then
    warn("[SyncAuth] Failed to load main script:", err)
end
