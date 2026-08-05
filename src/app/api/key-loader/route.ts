export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syncauth-eight.vercel.app";
  const code = `-- SyncAuth Key System Loader
-- For Roblox Executors

local SITE = "${siteUrl}"

local HttpService = game:GetService("HttpService")
local player = game:GetService("Players").LocalPlayer

local cached_hwid = nil
local function getHWID()
    if cached_hwid then return cached_hwid end
    pcall(function()
        local c = game:GetService("RbxAnalyticsService"):GetClientId()
        if c and #c > 0 then cached_hwid = c end
    end)
    if cached_hwid then return cached_hwid end
    cached_hwid = HttpService:GenerateGUID(false)
    return cached_hwid
end

local function request(url, body)
    local ok, res = pcall(function()
        return HttpService:JSONDecode(syn.request({
            Url = url, Method = "POST",
            Headers = { ["Content-Type"] = "application/json" },
            Body = HttpService:JSONEncode(body)
        }).Body)
    end)
    if ok and res then return res end
end

local hwid = getHWID()
local authed = false
local scriptId = nil

local gui = Instance.new("ScreenGui", game.CoreGui)
gui.Name = "SyncAuth"

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
title.Text = "SyncAuth Key System"
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 15
title.TextXAlignment = Enum.TextXAlignment.Left

local function mkLabel(parent, text, y)
    local l = Instance.new("TextLabel", parent)
    l.Size = UDim2.new(1, -28, 0, 14)
    l.Position = UDim2.new(0, 14, 0, y)
    l.Text = text
    l.TextColor3 = Color3.fromRGB(150,150,160)
    l.BackgroundTransparency = 1
    l.Font = Enum.Font.Gotham
    l.TextSize = 12
    l.TextXAlignment = Enum.TextXAlignment.Left
    return l
end

local function mkInput(parent, placeholder, y, h)
    local inp = Instance.new("TextBox", parent)
    inp.Size = UDim2.new(1, -28, 0, h or 32)
    inp.Position = UDim2.new(0, 14, 0, y)
    inp.PlaceholderText = placeholder
    inp.BackgroundColor3 = Color3.fromRGB(18,20,30)
    inp.TextColor3 = Color3.fromRGB(255,255,255)
    inp.BorderSizePixel = 0
    inp.Font = Enum.Font.Gotham
    inp.TextSize = 13
    Instance.new("UICorner", inp).CornerRadius = UDim.new(0, 6)
    return inp
end

mkLabel(bg, "Script ID:", 44)
local sidInput = mkInput(bg, "14-char script ID", 60)

mkLabel(bg, "License Key:", 100)
local keyInput = mkInput(bg, "XXXX-XXXX-XXXX-XXXX", 116, 34)
keyInput.TextSize = 14

local status = Instance.new("TextLabel", bg)
status.Size = UDim2.new(1, -28, 0, 20)
status.Position = UDim2.new(0, 14, 0, 158)
status.Text = ""
status.TextColor3 = Color3.fromRGB(150,150,160)
status.BackgroundTransparency = 1
status.Font = Enum.Font.Gotham
status.TextSize = 12

local btn = Instance.new("TextButton", bg)
btn.Size = UDim2.new(1, -28, 0, 38)
btn.Position = UDim2.new(0, 14, 0, 188)
btn.Text = "UNLOCK"
btn.BackgroundColor3 = Color3.fromRGB(0, 200, 224)
btn.TextColor3 = Color3.fromRGB(10,11,16)
btn.BorderSizePixel = 0
btn.Font = Enum.Font.GothamBold
btn.TextSize = 14
Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)

local hint = Instance.new("TextLabel", bg)
hint.Size = UDim2.new(1, -28, 0, 14)
hint.Position = UDim2.new(0, 14, 0, 238)
hint.Text = "Get keys: " .. SITE .. "/key-system"
hint.TextColor3 = Color3.fromRGB(100,100,110)
hint.BackgroundTransparency = 1
hint.Font = Enum.Font.Gotham
hint.TextSize = 10

btn.MouseButton1Click:Connect(function()
    if authed then return end
    local sid = sidInput.Text:gsub("%s+", "")
    if #sid < 5 then status.Text = "Enter a valid Script ID"; return end
    scriptId = sid
    local k = keyInput.Text:gsub("%s+", "")
    if #k < 8 then status.Text = "Enter a valid key"; return end
    status.Text = "Validating..."
    status.TextColor3 = Color3.fromRGB(150,150,160)
    btn.Text = "..."
    local result = request(SITE .. "/api/keys/validate", {
        key = k,
        hwid = hwid,
        username = player.Name,
        display_name = player.DisplayName,
        executor = identifyexecutor and identifyexecutor() or "Unknown"
    })
    if result and result.status == "valid" then
        status.Text = "Authorized! Loading..."
        status.TextColor3 = Color3.fromRGB(0, 200, 224)
        authed = true
        task.wait(1)
        gui:Destroy()
        loadstring(game:HttpGet(SITE .. "/api/scripts/" .. scriptId .. "/raw?hwid=" .. hwid .. "&username=" .. HttpService:UrlEncode(player.Name) .. "&executor=" .. HttpService:UrlEncode(identifyexecutor and identifyexecutor() or "Unknown")))()
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

while not authed do task.wait(0.5) end`;

  return new Response(code, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="syncauth-loader.lua"',
    },
  });
}
