--!strict
-- GameServer: the authoritative side of Abyssal Sonar.
--   * builds the dark world + atmosphere
--   * tracks each player's recovered-beacon score (leaderstats)
--   * relays pings between players so co-op sonar is shared
--   * hands out a faint personal light and floaty movement on spawn

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Lighting = game:GetService("Lighting")

local Config = require(ReplicatedStorage:WaitForChild("GameConfig"))
local WorldGen = require(ServerScriptService:WaitForChild("WorldGen"))

-- ===== Remotes =====
local remotes = Instance.new("Folder")
remotes.Name = "SonarRemotes"
remotes.Parent = ReplicatedStorage

local pingFired = Instance.new("RemoteEvent")
pingFired.Name = "PingFired"
pingFired.Parent = remotes

local beaconCollected = Instance.new("RemoteEvent")
beaconCollected.Name = "BeaconCollected"
beaconCollected.Parent = remotes

-- Relay a player's ping to everyone else (they render it faintly).
pingFired.OnServerEvent:Connect(function(player, origin)
	if typeof(origin) ~= "Vector3" then
		return
	end
	for _, other in Players:GetPlayers() do
		if other ~= player then
			pingFired:FireClient(other, origin, false)
		end
	end
end)

-- ===== Atmosphere: make it genuinely dark =====
local function setupLighting()
	Lighting.Brightness = 0
	Lighting.Ambient = Color3.fromRGB(4, 6, 10)
	Lighting.OutdoorAmbient = Color3.fromRGB(4, 6, 10)
	Lighting.ClockTime = 0
	Lighting.GlobalShadows = true
	Lighting.EnvironmentDiffuseScale = 0
	Lighting.EnvironmentSpecularScale = 0
	Lighting.FogColor = Color3.fromRGB(3, 8, 14)
	Lighting.FogStart = 6
	Lighting.FogEnd = 58

	local atmos = Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere")
	atmos.Density = 0.55
	atmos.Offset = 0.1
	atmos.Color = Color3.fromRGB(20, 40, 55)
	atmos.Decay = Color3.fromRGB(10, 20, 30)
	atmos.Glare = 0
	atmos.Haze = 2
	atmos.Parent = Lighting
end

-- ===== Build the world =====
workspace.Gravity = Config.World.Gravity
setupLighting()

local world, beacons = WorldGen.generate(Config)
world.Parent = workspace

local totalBeacons = #beacons
local remaining = totalBeacons

local totalValue = Instance.new("IntValue")
totalValue.Name = "TotalBeacons"
totalValue.Value = totalBeacons
totalValue.Parent = remotes

-- ===== Beacon pickup (authoritative) =====
local function onBeaconTouched(beacon: Part, hit: BasePart)
	if beacon:GetAttribute("Collected") then
		return
	end
	local char = hit.Parent
	local humanoid = char and char:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then
		return
	end
	local player = char and Players:GetPlayerFromCharacter(char)
	if not player then
		return
	end

	beacon:SetAttribute("Collected", true)

	local stats = player:FindFirstChild("leaderstats")
	local count = stats and stats:FindFirstChild("Beacons") :: IntValue?
	if count then
		count.Value += 1
	end

	remaining -= 1
	beaconCollected:FireAllClients(beacon.Position, player.Name, remaining)
	beacon:Destroy()
end

for _, beacon in beacons do
	beacon.Touched:Connect(function(hit)
		onBeaconTouched(beacon, hit)
	end)
end

-- ===== Players =====
local function setupCharacter(character: Model)
	local humanoid = character:WaitForChild("Humanoid", 5) :: Humanoid?
	if humanoid then
		humanoid.WalkSpeed = 22
		humanoid.JumpPower = 48
		humanoid.UseJumpPower = true
	end
	local head = character:WaitForChild("Head", 5)
	if head then
		local light = Instance.new("PointLight")
		light.Name = "SubLight"
		light.Range = 16
		light.Brightness = 1.2
		light.Color = Color3.fromRGB(150, 200, 230)
		light.Parent = head
	end
end

Players.PlayerAdded:Connect(function(player)
	local stats = Instance.new("Folder")
	stats.Name = "leaderstats"
	local beaconsFound = Instance.new("IntValue")
	beaconsFound.Name = "Beacons"
	beaconsFound.Parent = stats
	stats.Parent = player

	player.CharacterAdded:Connect(setupCharacter)
	if player.Character then
		setupCharacter(player.Character)
	end
end)
