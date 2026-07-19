--!strict
-- SonarClient: the player-facing core loop.
--   * Press E / click / RT to fire a sonar ping from your position.
--   * A neon pulse expands outward; anything it sweeps over lights up
--     ("Revealable" rocks + beacons), then fades back into the dark.
--   * Reveals are applied LOCALLY (per client), so they never fight the
--     server or other players — each diver paints their own map.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer

local Config = require(ReplicatedStorage:WaitForChild("GameConfig"))
local remotes = ReplicatedStorage:WaitForChild("SonarRemotes")
local pingFired = remotes:WaitForChild("PingFired") :: RemoteEvent
local beaconCollected = remotes:WaitForChild("BeaconCollected") :: RemoteEvent
local totalValue = remotes:WaitForChild("TotalBeacons") :: IntValue

local S = Config.Sonar

-- ===== State =====
local energy = S.EnergyMax
local pinging = false

-- ===== Reveal: temporarily light a part, then fade it back =====
local function revealPart(part: BasePart)
	if part:GetAttribute("Revealing") then
		return
	end
	part:SetAttribute("Revealing", true)

	local origMaterial = part.Material
	local origColor = part.Color
	local isBeacon = part.Name == "Beacon"
	local litColor = isBeacon and Config.Beacon.FoundColor or Color3.fromRGB(60, 150, 180)

	part.Material = Enum.Material.Neon
	part.Color = litColor
	local glow = part:FindFirstChild("Glow") :: PointLight?
	if glow then
		glow.Enabled = true
	end

	local hold = S.RevealTime
	task.delay(hold * 0.35, function()
		if not part.Parent then
			return
		end
		local darkColor = isBeacon and Config.Beacon.HiddenColor or origColor
		local tween = TweenService:Create(part, TweenInfo.new(hold * 0.65), { Color = darkColor })
		tween:Play()
		tween.Completed:Once(function()
			if part.Parent then
				part.Material = origMaterial
				part.Color = origColor
				if glow then
					glow.Enabled = false
				end
			end
			part:SetAttribute("Revealing", false)
		end)
	end)
end

-- ===== The ping pulse =====
local overlapParams = OverlapParams.new()
overlapParams.FilterType = Enum.RaycastFilterType.Exclude

local function emitPing(origin: Vector3, isLocal: boolean)
	local pulse = Instance.new("Part")
	pulse.Name = "SonarPulse"
	pulse.Shape = Enum.PartType.Ball
	pulse.Anchored = true
	pulse.CanCollide = false
	pulse.CanQuery = false
	pulse.CanTouch = false
	pulse.Material = Enum.Material.Neon
	pulse.Color = isLocal and Color3.fromRGB(90, 210, 235) or Color3.fromRGB(150, 170, 90)
	pulse.Transparency = 0.55
	pulse.Size = Vector3.new(2, 2, 2)
	pulse.CFrame = CFrame.new(origin)
	pulse.Parent = workspace

	if isLocal then
		local char = player.Character
		overlapParams.FilterDescendantsInstances = char and { char, pulse } or { pulse }
	end

	local revealed: { [BasePart]: boolean } = {}
	local radius = 0
	while radius < S.MaxRange do
		local dt = RunService.Heartbeat:Wait()
		radius = math.min(S.MaxRange, radius + S.Speed * dt)
		pulse.Size = Vector3.new(radius * 2, radius * 2, radius * 2)
		pulse.Transparency = 0.55 + 0.4 * (radius / S.MaxRange)

		if isLocal then
			for _, part in workspace:GetPartBoundsInRadius(origin, radius, overlapParams) do
				if not revealed[part] and (part.Name == "Beacon" or part:GetAttribute("Revealable")) then
					revealed[part] = true
					revealPart(part)
				end
			end
		end
	end
	pulse:Destroy()
end

-- ===== Input =====
local function tryPing()
	if pinging or energy < S.EnergyPerPing then
		return
	end
	local char = player.Character
	local root = char and char:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not root then
		return
	end
	pinging = true
	energy -= S.EnergyPerPing
	local origin = root.Position
	pingFired:FireServer(origin)
	emitPing(origin, true) -- yields until the pulse finishes
	pinging = false
end

UserInputService.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then
		return
	end
	if input.KeyCode == Enum.KeyCode.E
		or input.KeyCode == Enum.KeyCode.ButtonR2
		or input.UserInputType == Enum.UserInputType.MouseButton1
	then
		tryPing()
	end
end)

-- Other players' pings arrive here (isLocal = false → visual only)
pingFired.OnClientEvent:Connect(function(origin, isLocal)
	if typeof(origin) == "Vector3" then
		task.spawn(emitPing, origin, isLocal == true)
	end
end)

-- Energy recharge
RunService.Heartbeat:Connect(function(dt)
	if not pinging then
		energy = math.min(S.EnergyMax, energy + S.EnergyRegen * dt)
	end
end)

-- =====================================================================
-- HUD
-- =====================================================================
local gui = Instance.new("ScreenGui")
gui.Name = "SonarHUD"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local ACCENT = Color3.fromRGB(120, 240, 255)

-- Energy panel (bottom-left)
local panel = Instance.new("Frame")
panel.Size = UDim2.fromOffset(260, 64)
panel.Position = UDim2.new(0, 24, 1, -88)
panel.BackgroundColor3 = Color3.fromRGB(8, 14, 20)
panel.BackgroundTransparency = 0.25
panel.BorderSizePixel = 0
panel.Parent = gui
Instance.new("UICorner", panel).CornerRadius = UDim.new(0, 8)

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, -20, 0, 20)
title.Position = UDim2.fromOffset(12, 8)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 13
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = ACCENT
title.Text = "SONAR ENERGY"
title.Parent = panel

local barBg = Instance.new("Frame")
barBg.Size = UDim2.new(1, -24, 0, 14)
barBg.Position = UDim2.fromOffset(12, 34)
barBg.BackgroundColor3 = Color3.fromRGB(20, 30, 40)
barBg.BorderSizePixel = 0
barBg.Parent = panel
Instance.new("UICorner", barBg).CornerRadius = UDim.new(1, 0)

local barFill = Instance.new("Frame")
barFill.Size = UDim2.fromScale(1, 1)
barFill.BackgroundColor3 = ACCENT
barFill.BorderSizePixel = 0
barFill.Parent = barBg
Instance.new("UICorner", barFill).CornerRadius = UDim.new(1, 0)

-- Score readout (top-center)
local score = Instance.new("TextLabel")
score.Size = UDim2.fromOffset(420, 30)
score.Position = UDim2.new(0.5, -210, 0, 18)
score.BackgroundTransparency = 1
score.Font = Enum.Font.GothamBold
score.TextSize = 20
score.TextColor3 = Color3.fromRGB(235, 250, 255)
score.TextStrokeTransparency = 0.5
score.Text = "Beacons recovered: 0 / " .. totalValue.Value
score.Parent = gui

-- Fading hint (bottom-center, first few seconds)
local hint = Instance.new("TextLabel")
hint.Size = UDim2.fromOffset(560, 26)
hint.Position = UDim2.new(0.5, -280, 1, -40)
hint.BackgroundTransparency = 1
hint.Font = Enum.Font.Gotham
hint.TextSize = 15
hint.TextColor3 = Color3.fromRGB(150, 200, 220)
hint.Text = "Press  E  or  Click  to ping.  Reach a lit beacon before it fades back into the dark."
hint.Parent = gui
task.delay(11, function()
	TweenService:Create(hint, TweenInfo.new(2), { TextTransparency = 1 }):Play()
end)

local function found(): number
	local stats = player:FindFirstChild("leaderstats")
	local b = stats and stats:FindFirstChild("Beacons") :: IntValue?
	return b and b.Value or 0
end

beaconCollected.OnClientEvent:Connect(function(_, playerName, remaining)
	score.Text = ("Beacons recovered: %d / %d"):format(found(), totalValue.Value)
	if remaining == 0 then
		hint.TextTransparency = 0
		hint.TextColor3 = ACCENT
		hint.Text = "The trench is fully charted. Every beacon recovered."
	end
end)

RunService.RenderStepped:Connect(function()
	local ratio = energy / S.EnergyMax
	barFill.Size = UDim2.fromScale(ratio, 1)
	local ready = energy >= S.EnergyPerPing
	barFill.BackgroundColor3 = ready and ACCENT or Color3.fromRGB(90, 110, 120)
	title.Text = ready and "SONAR ENERGY  •  READY" or "SONAR ENERGY  •  charging…"
	score.Text = ("Beacons recovered: %d / %d"):format(found(), totalValue.Value)
end)
