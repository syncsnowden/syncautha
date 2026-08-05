-- ============================================================
--  SyncAuth Loader  ·  File 1 of 2: Key System
--  Paste this file into your executor to start the auth flow.
--  File 2 (main_script.lua) is loaded automatically after auth.
-- ============================================================

local SITE      = "https://syncauth-eight.vercel.app"   -- ← your SyncAuth deployment URL
local SCRIPT_ID = "YOUR_SCRIPT_ID_HERE"                 -- ← 14-char ID from your Scripts tab

-- ============================================================
-- DO NOT EDIT BELOW THIS LINE
-- ============================================================

local HS  = game:GetService("HttpService")
local P   = game:GetService("Players")
local TS  = game:GetService("TweenService")
local UIS = game:GetService("UserInputService")
local CG  = game:GetService("CoreGui")
local LP  = P.LocalPlayer

-- ──────────────────────────────────────────────────────────
-- HWID
-- ──────────────────────────────────────────────────────────
local function getHWID()
    local ok, id = pcall(function()
        return game:GetService("RbxAnalyticsService"):GetClientId()
    end)
    if ok and type(id) == "string" and #id > 0 then return id end
    return HS:GenerateGUID(false)
end

-- ──────────────────────────────────────────────────────────
-- HTTP
-- ──────────────────────────────────────────────────────────
local REQ = (syn and syn.request) or (http and http.request) or request
    or function(t) return game:HttpGetAsync(t.Url) end

local function post(url, body)
    local ok, res = pcall(function()
        return REQ({
            Url = url, Method = "POST",
            Headers = { ["Content-Type"] = "application/json" },
            Body = HS:JSONEncode(body),
        })
    end)
    if not ok then return nil end
    local _, data = pcall(HS.JSONDecode, HS, res.Body or "")
    return data
end

-- ──────────────────────────────────────────────────────────
-- GUI
-- ──────────────────────────────────────────────────────────
local BLACK  = Color3.fromRGB(8,  9,  14)
local PANEL  = Color3.fromRGB(13, 14, 21)
local ACCENT = Color3.fromRGB(0,  200, 224)
local BORDER = Color3.fromRGB(30, 32, 48)
local WHITE  = Color3.new(1, 1, 1)
local GREY   = Color3.fromRGB(100, 105, 130)
local RED    = Color3.fromRGB(255, 70,  70)
local GREEN  = Color3.fromRGB(50,  200, 100)

local W, H = 340, 240

local gui = Instance.new("ScreenGui")
gui.Name = "SyncAuthLoader"
gui.ResetOnSpawn = false
gui.DisplayOrder = 999
gui.IgnoreGuiInset = true
gui.Parent = CG

-- Backdrop blur
local bg = Instance.new("Frame", gui)
bg.Size = UDim2.fromScale(1, 1)
bg.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
bg.BackgroundTransparency = 0.45
bg.BorderSizePixel = 0
bg.ZIndex = 0

-- Card
local card = Instance.new("Frame", gui)
card.Size = UDim2.fromOffset(W, H)
card.BackgroundColor3 = PANEL
card.BorderSizePixel = 0
card.ZIndex = 1
card.ClipsDescendants = true
Instance.new("UICorner", card).CornerRadius = UDim.new(0, 14)

local stroke = Instance.new("UIStroke", card)
stroke.Color = BORDER
stroke.Thickness = 1

-- Center card
local function centerCard()
    local vp = workspace.CurrentCamera.ViewportSize
    card.Position = UDim2.fromOffset((vp.X - W) / 2, (vp.Y - H) / 2)
end
pcall(centerCard)

-- Drag
local dragging, dragStart, posStart
card.InputBegan:Connect(function(i)
    if i.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = true
        dragStart = Vector2.new(i.Position.X, i.Position.Y)
        posStart  = Vector2.new(card.Position.X.Offset, card.Position.Y.Offset)
    end
end)
card.InputEnded:Connect(function(i)
    if i.UserInputType == Enum.UserInputType.MouseButton1 then dragging = false end
end)
UIS.InputChanged:Connect(function(i)
    if dragging and i.UserInputType == Enum.UserInputType.MouseMovement then
        local d = Vector2.new(i.Position.X, i.Position.Y) - dragStart
        card.Position = UDim2.fromOffset(posStart.X + d.X, posStart.Y + d.Y)
    end
end)

-- ── Helpers ──
local function label(parent, text, size, color, yOff, bold)
    local l = Instance.new("TextLabel", parent)
    l.Size = UDim2.new(1, -28, 0, 24)
    l.Position = UDim2.fromOffset(14, yOff)
    l.BackgroundTransparency = 1
    l.Text = text
    l.TextColor3 = color or WHITE
    l.Font = bold and Enum.Font.GothamBold or Enum.Font.Gotham
    l.TextSize = size or 13
    l.TextXAlignment = Enum.TextXAlignment.Left
    l.ZIndex = 2
    return l
end

-- ── Header ──
local header = Instance.new("Frame", card)
header.Size = UDim2.new(1, 0, 0, 44)
header.BackgroundColor3 = BLACK
header.BorderSizePixel = 0
header.ZIndex = 2

label(header, "⬡  SyncAuth", 13, WHITE, 12, true)

local sub = label(header, "License verification", 11, GREY, 30, false)
sub.TextSize = 11

local divider = Instance.new("Frame", card)
divider.Size = UDim2.new(1, 0, 0, 1)
divider.Position = UDim2.fromOffset(0, 44)
divider.BackgroundColor3 = BORDER
divider.BorderSizePixel = 0
divider.ZIndex = 2

-- ── Status label ──
local statusLbl = label(card, "", 12, GREY, 54, false)
statusLbl.Text = "Enter your license key below"

-- ── Input ──
local inputBox = Instance.new("TextBox", card)
inputBox.Size = UDim2.new(1, -28, 0, 36)
inputBox.Position = UDim2.fromOffset(14, 78)
inputBox.BackgroundColor3 = BLACK
inputBox.BorderSizePixel = 0
inputBox.Text = ""
inputBox.PlaceholderText = "XXXX-XXXX-XXXX-XXXX"
inputBox.TextColor3 = WHITE
inputBox.PlaceholderColor3 = GREY
inputBox.Font = Enum.Font.Code
inputBox.TextSize = 14
inputBox.TextXAlignment = Enum.TextXAlignment.Center
inputBox.ClearTextOnFocus = false
inputBox.ZIndex = 3
Instance.new("UICorner", inputBox).CornerRadius = UDim.new(0, 8)
local inputStroke = Instance.new("UIStroke", inputBox)
inputStroke.Color = BORDER
inputStroke.Thickness = 1
inputBox.Focused:Connect(function() inputStroke.Color = ACCENT end)
inputBox.FocusLost:Connect(function()  inputStroke.Color = BORDER end)

-- ── Unlock button ──
local unlockBtn = Instance.new("TextButton", card)
unlockBtn.Size = UDim2.new(1, -28, 0, 36)
unlockBtn.Position = UDim2.fromOffset(14, 124)
unlockBtn.BackgroundColor3 = ACCENT
unlockBtn.TextColor3 = BLACK
unlockBtn.Text = "Unlock"
unlockBtn.Font = Enum.Font.GothamBold
unlockBtn.TextSize = 13
unlockBtn.BorderSizePixel = 0
unlockBtn.ZIndex = 3
Instance.new("UICorner", unlockBtn).CornerRadius = UDim.new(0, 8)

-- ── Get Key link ──
local getKeyBtn = Instance.new("TextButton", card)
getKeyBtn.Size = UDim2.new(1, -28, 0, 28)
getKeyBtn.Position = UDim2.fromOffset(14, 170)
getKeyBtn.BackgroundColor3 = BORDER
getKeyBtn.TextColor3 = GREY
getKeyBtn.Text = "Get a key  →  " .. SITE .. "/get-key/" .. SCRIPT_ID
getKeyBtn.Font = Enum.Font.Gotham
getKeyBtn.TextSize = 11
getKeyBtn.BorderSizePixel = 0
getKeyBtn.ZIndex = 3
getKeyBtn.TextTruncate = Enum.TextTruncate.AtEnd
Instance.new("UICorner", getKeyBtn).CornerRadius = UDim.new(0, 8)

-- Powered by
local powered = label(card, "Powered by SyncAuth", 10, Color3.fromRGB(40, 42, 58), 210, false)
powered.TextXAlignment = Enum.TextXAlignment.Center

-- ──────────────────────────────────────────────────────────
-- VALIDATION LOGIC
-- ──────────────────────────────────────────────────────────
local authed = false

local function setStatus(msg, color)
    statusLbl.Text = msg
    statusLbl.TextColor3 = color or GREY
end

local function onUnlock()
    if authed then return end
    local key = inputBox.Text:gsub("%s+", "")
    if #key < 8 then setStatus("Enter a valid key", RED); return end

    unlockBtn.Text = "Verifying..."
    unlockBtn.Active = false
    setStatus("Contacting server...", GREY)

    local hwid = getHWID()
    local result = post(SITE .. "/api/keys/validate", { key = key, hwid = hwid })

    if not result then
        setStatus("Connection failed. Try again.", RED)
        unlockBtn.Text = "Unlock"
        unlockBtn.Active = true
        return
    end

    if result.status == "valid" or result.valid == true then
        setStatus("✔  Authorized! Loading script...", GREEN)
        unlockBtn.BackgroundColor3 = GREEN
        unlockBtn.Text = "✔  Authorized"
        task.wait(1)
        gui:Destroy()
        authed = true
        -- Load the main script by Script ID
        local ok, err = pcall(function()
            loadstring(game:HttpGet(SITE .. "/api/scripts/" .. SCRIPT_ID .. "/raw", true))()
        end)
        if not ok then
            warn("[SyncAuth] Failed to load main script:", err)
        end
        return
    end

    -- Handle errors
    local reason = result.reason or result.error or "Invalid key"
    if result.status == "expired"       then reason = "Key has expired. Get a new one." end
    if result.status == "hwid_mismatch" then reason = "Key is locked to a different device." end
    if result.status == "used"          then reason = "Key already used on another device." end

    setStatus("✖  " .. reason, RED)
    unlockBtn.Text = "Unlock"
    unlockBtn.Active = true
end

unlockBtn.MouseButton1Click:Connect(onUnlock)
inputBox.FocusLost:Connect(function(enter) if enter then onUnlock() end end)
getKeyBtn.MouseButton1Click:Connect(function()
    if setclipboard then
        setclipboard(SITE .. "/get-key/" .. SCRIPT_ID)
        setStatus("Link copied to clipboard!", ACCENT)
    end
end)

while not authed do task.wait(0.5) end
