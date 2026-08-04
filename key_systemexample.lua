-- ===========================================
--  SyncAuth Key System Example
--  Download: /api/key-loader
--  Docs: /docs
-- ===========================================

local SITE = "YOUR_SITE_URL"       -- <-- CHANGE THIS
local SCRIPT_ID = "YOUR_SCRIPT_ID" -- <-- CHANGE THIS to your script's 14-char ID

-- ===========================================
local HttpService = game:GetService("HttpService")
local player = game:GetService("Players").LocalPlayer

local function getHWID()
    pcall(function()
        local c = game:GetService("RbxAnalyticsService"):GetClientId()
        if c and #c > 0 then return c end
    end)
    return HttpService:GenerateGUID(false)
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

-- ============= GUI =============
local gui = Instance.new("ScreenGui", game.CoreGui)
gui.Name = "SyncAuth"

local bg = Instance.new("Frame", gui)
bg.Size = UDim2.new(0, 340, 0, 210)
bg.Position = UDim2.new(0.5, -170, 0.5, -105)
bg.BackgroundColor3 = Color3.fromRGB(10, 11, 16)
bg.BorderSizePixel = 0
Instance.new("UICorner", bg).CornerRadius = UDim.new(0, 10)
Instance.new("UIStroke", bg).Color = Color3.fromRGB(0, 200, 224)

local title = Instance.new("TextLabel", bg)
title.Size = UDim2.new(1, -28, 0, 22)
title.Position = UDim2.new(0, 14, 0, 14)
title.Text = "SyncAuth | License Key"
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 14
title.TextXAlignment = Enum.TextXAlignment.Left

local keyLabel = Instance.new("TextLabel", bg)
keyLabel.Size = UDim2.new(1, -28, 0, 14)
keyLabel.Position = UDim2.new(0, 14, 0, 50)
keyLabel.Text = "License Key:"
keyLabel.TextColor3 = Color3.fromRGB(150, 150, 160)
keyLabel.BackgroundTransparency = 1
keyLabel.Font = Enum.Font.Gotham
keyLabel.TextSize = 12
keyLabel.TextXAlignment = Enum.TextXAlignment.Left

local keyInput = Instance.new("TextBox", bg)
keyInput.Size = UDim2.new(1, -28, 0, 34)
keyInput.Position = UDim2.new(0, 14, 0, 66)
keyInput.PlaceholderText = "XXXX-XXXX-XXXX-XXXX"
keyInput.BackgroundColor3 = Color3.fromRGB(18, 20, 30)
keyInput.TextColor3 = Color3.fromRGB(255, 255, 255)
keyInput.BorderSizePixel = 0
keyInput.Font = Enum.Font.Gotham
keyInput.TextSize = 14
Instance.new("UICorner", keyInput).CornerRadius = UDim.new(0, 6)

local status = Instance.new("TextLabel", bg)
status.Size = UDim2.new(1, -28, 0, 18)
status.Position = UDim2.new(0, 14, 0, 108)
status.Text = ""
status.TextColor3 = Color3.fromRGB(150, 150, 160)
status.BackgroundTransparency = 1
status.Font = Enum.Font.Gotham
status.TextSize = 12

local btn = Instance.new("TextButton", bg)
btn.Size = UDim2.new(1, -28, 0, 36)
btn.Position = UDim2.new(0, 14, 0, 134)
btn.Text = "UNLOCK"
btn.BackgroundColor3 = Color3.fromRGB(0, 200, 224)
btn.TextColor3 = Color3.fromRGB(10, 11, 16)
btn.BorderSizePixel = 0
btn.Font = Enum.Font.GothamBold
btn.TextSize = 14
Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)

local hint = Instance.new("TextLabel", bg)
hint.Size = UDim2.new(1, -28, 0, 14)
hint.Position = UDim2.new(0, 14, 0, 180)
hint.Text = "Get keys: " .. SITE .. "/get-key/" .. SCRIPT_ID
hint.TextColor3 = Color3.fromRGB(100, 100, 110)
hint.BackgroundTransparency = 1
hint.Font = Enum.Font.Gotham
hint.TextSize = 10

-- ============= Auth =============
btn.MouseButton1Click:Connect(function()
    if authed then return end
    local k = keyInput.Text:gsub("%s+", "")
    if #k < 8 then status.Text = "Enter a valid key"; return end
    status.Text = "Validating..."
    status.TextColor3 = Color3.fromRGB(150, 150, 160)
    btn.Text = "..."
    local result = request(SITE .. "/api/keys/validate", { key = k, hwid = hwid })
    if result and result.status == "valid" then
        status.Text = "Authorized!"
        status.TextColor3 = Color3.fromRGB(0, 200, 224)
        authed = true
        task.wait(1)
        gui:Destroy()
        loadstring(game:HttpGet(SITE .. "/api/scripts/" .. SCRIPT_ID .. "/raw"))()
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

while not authed do task.wait(0.5) end
