--!strict
-- WorldGen: procedurally builds the pitch-black trench, its rocks,
-- the collectible beacons, and a glowing home base. Returns the world
-- folder plus the list of beacon parts so the server can wire up scoring.

local WorldGen = {}

local function makePart(props: { [string]: any }): Part
	local p = Instance.new("Part")
	p.Anchored = true
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	for k, v in props do
		(p :: any)[k] = v
	end
	return p
end

function WorldGen.generate(Config: any): (Folder, { Part })
	local W = Config.World
	local folder = Instance.new("Folder")
	folder.Name = "AbyssWorld"

	local size = W.Size
	local floorY = W.Floor
	local half = size / 2
	local rng = Random.new()

	-- Trench floor
	makePart({
		Name = "TrenchFloor",
		Size = Vector3.new(size, 4, size),
		Position = Vector3.new(0, floorY, 0),
		Color = Color3.fromRGB(14, 16, 22),
		Material = Enum.Material.Slate,
		Parent = folder,
	})

	-- Boundary walls so players stay inside the trench
	local wallH = 140
	local walls = {
		{ Vector3.new(size, wallH, 4), Vector3.new(0, floorY + wallH / 2, half) },
		{ Vector3.new(size, wallH, 4), Vector3.new(0, floorY + wallH / 2, -half) },
		{ Vector3.new(4, wallH, size), Vector3.new(half, floorY + wallH / 2, 0) },
		{ Vector3.new(4, wallH, size), Vector3.new(-half, floorY + wallH / 2, 0) },
	}
	for _, def in walls do
		makePart({
			Name = "Wall",
			Size = def[1],
			Position = def[2],
			Color = Color3.fromRGB(9, 11, 15),
			Material = Enum.Material.Rock,
			Parent = folder,
		})
	end

	-- Home base (also the spawn point) — the one thing that's always lit
	local base = Instance.new("SpawnLocation")
	base.Name = "SonarBase"
	base.Anchored = true
	base.Neutral = true
	base.Size = Vector3.new(18, 1, 18)
	base.Position = Vector3.new(0, floorY + 2.5, 0)
	base.Color = Color3.fromRGB(30, 90, 110)
	base.Material = Enum.Material.Neon
	base.Transparency = 0.1
	base.Parent = folder
	local baseLight = Instance.new("PointLight")
	baseLight.Range = 30
	baseLight.Brightness = 2.2
	baseLight.Color = Color3.fromRGB(90, 200, 220)
	baseLight.Parent = base

	-- Rocks: the "terrain" your sonar paints. Kept clear of the spawn pad.
	local rocks = Instance.new("Folder")
	rocks.Name = "Rocks"
	rocks.Parent = folder
	for _ = 1, W.RockCount do
		local px = rng:NextNumber(-half + 12, half - 12)
		local pz = rng:NextNumber(-half + 12, half - 12)
		if math.abs(px) < 20 and math.abs(pz) < 20 then
			continue -- keep the base area open
		end
		local h = rng:NextInteger(10, 48)
		local rock = makePart({
			Name = "Rock",
			Size = Vector3.new(rng:NextInteger(6, 22), h, rng:NextInteger(6, 22)),
			Position = Vector3.new(px, floorY + 2 + h / 2, pz),
			Color = Color3.fromRGB(22, 24, 30),
			Material = Enum.Material.Rock,
			Parent = rocks,
		})
		rock.Orientation = Vector3.new(0, rng:NextInteger(0, 360), 0)
		rock:SetAttribute("Revealable", true)
	end

	-- Beacons: dark and invisible until a ping lights them up.
	local beaconsFolder = Instance.new("Folder")
	beaconsFolder.Name = "Beacons"
	beaconsFolder.Parent = folder
	local beaconList: { Part } = {}
	for _ = 1, W.BeaconCount do
		local px = rng:NextNumber(-half + 24, half - 24)
		local pz = rng:NextNumber(-half + 24, half - 24)
		if math.abs(px) < 34 and math.abs(pz) < 34 then
			px += 44 * (px >= 0 and 1 or -1)
			pz += 44 * (pz >= 0 and 1 or -1)
		end
		local beacon = makePart({
			Name = "Beacon",
			Shape = Enum.PartType.Ball,
			Size = Vector3.new(4, 4, 4),
			Position = Vector3.new(px, floorY + 5, pz),
			Color = Config.Beacon.HiddenColor,
			Material = Enum.Material.SmoothPlastic,
			CanCollide = false, -- pass through; Touched still fires for pickup
		})
		beacon:SetAttribute("Revealable", true)
		local glow = Instance.new("PointLight")
		glow.Name = "Glow"
		glow.Range = 20
		glow.Brightness = 4
		glow.Color = Config.Beacon.FoundColor
		glow.Enabled = false
		glow.Parent = beacon
		beacon.Parent = beaconsFolder
		table.insert(beaconList, beacon)
	end

	return folder, beaconList
end

return WorldGen
