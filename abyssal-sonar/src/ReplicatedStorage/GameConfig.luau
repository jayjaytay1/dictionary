--!strict
-- GameConfig: every tunable knob for Abyssal Sonar lives here.
-- Tweak these values and re-sync to rebalance the game.

return {
	World = {
		Size = 420,          -- studs; square play area (edge to edge)
		Floor = -50,         -- Y position of the trench floor
		Gravity = 60,        -- lowered for a floaty, submersible feel
		RockCount = 150,     -- terrain/obstacles scattered around
		BeaconCount = 14,    -- collectibles hidden in the dark
	},

	Sonar = {
		MaxRange = 92,       -- how far a single ping reaches (studs)
		Speed = 130,         -- how fast the pulse ring expands (studs/sec)
		EnergyMax = 100,
		EnergyPerPing = 34,  -- cost of one ping
		EnergyRegen = 10,    -- recharge per second (acts as the cooldown)
		RevealTime = 6.5,    -- seconds a pinged object stays lit before fading
	},

	Beacon = {
		FoundColor = Color3.fromRGB(120, 240, 255),  -- glow when revealed
		HiddenColor = Color3.fromRGB(12, 18, 22),     -- near-black when dark
	},
}
