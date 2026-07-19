# 🌑 Abyssal Sonar

A niche Roblox game: **echo-location cartography in a pitch-black deep-sea trench.**

The whole world is dark. You can't see where you're going — you fire a **sonar
ping** that expands outward as a pulse and briefly lights up whatever it sweeps
over. Rocks paint the terrain; hidden **beacons** flare to life. Then the light
fades and the darkness takes it all back. Race to reach each beacon before it
disappears again, and chart the trench one ping at a time.

No simulators, no tycoons, no obbies. Just you, the dark, and the ping.

---

## Why it's shipped as code (and not a `.rbxl` file)

Roblox games are built in **Roblox Studio**, a desktop app — it can't run in a
cloud container. So this game is delivered the professional, code-first way:
real Luau scripts + a [Rojo](https://rojo.space) project manifest that syncs
straight into Studio. Everything here is genuine, complete game code. You just
need Studio to press Play.

> Heads up: I couldn't launch Studio to playtest it myself, so treat the tuning
> values as a solid starting point — expect to tweak `GameConfig.luau` to taste.

---

## Getting it running

1. **Install [Roblox Studio](https://create.roblox.com/)** (free).
2. **Install Rojo** — easiest via the [Aftman](https://github.com/LPGhatguy/aftman)
   toolchain manager, or grab a release from the
   [Rojo repo](https://github.com/rojo-rbx/rojo/releases):
   ```bash
   # with aftman
   aftman add rojo-rbx/rojo
   ```
3. **Install the Rojo Studio plugin** (Studio → Toolbox → search "Rojo", or
   `rojo plugin install`).
4. From this folder, start the server:
   ```bash
   rojo serve
   ```
5. In Studio: open a new **Baseplate**, open the **Rojo** plugin panel, click
   **Connect**. The whole game tree syncs in.
6. Press **Play** (F5). You'll drop into the dark on the glowing base pad.

### Controls
| Action | Input |
| --- | --- |
| Fire sonar ping | **E**, left **Click**, or gamepad **RT** |
| Move / jump | WASD + Space (standard) |

**Goal:** recover all the beacons scattered through the trench. Ping to find
them, then walk into a lit one to collect it. Your energy bar (bottom-left)
limits how often you can ping — it's your real cooldown.

---

## How it's built

```
abyssal-sonar/
├── default.project.json                # Rojo manifest → maps files into Studio services
└── src/
    ├── ReplicatedStorage/
    │   └── GameConfig.luau              # every tunable knob (world size, sonar range, energy…)
    ├── ServerScriptService/
    │   ├── GameServer.server.luau       # world build, dark atmosphere, scoring, ping relay
    │   └── WorldGen.luau                # procedural trench: floor, rocks, beacons, base
    └── StarterPlayer/StarterPlayerScripts/
        └── SonarClient.client.luau      # the ping, the reveal, and the HUD
```

**Design notes**
- **Server is authoritative** for what matters: beacon pickups + your
  `leaderstats` score. It also relays each ping to other players so, in
  multiplayer, you see your teammates' pulses light up the dark too.
- **Reveals are client-local.** When a ping paints a rock or beacon, the client
  swaps that part to glowing Neon and tweens it back to black — locally only, so
  it never fights the server or another diver's view. Every player charts their
  own map.
- **Pitch-black by design.** Lighting brightness is zeroed with dense fog and a
  murky atmosphere; the only persistent light is your faint sub-lamp and the
  home base. That's what makes the ping matter.

## Tuning

Open `src/ReplicatedStorage/GameConfig.luau`. Want a bigger trench? Longer ping
range? More beacons? Faster recharge? It's all there — change a number, re-sync,
Play again. A few to start with:
- `Sonar.MaxRange` / `Sonar.Speed` — how far and fast the pulse reaches.
- `Sonar.RevealTime` — how long you have to reach a beacon before it fades.
- `World.BeaconCount` / `World.RockCount` — density of goals and terrain.

## Where to take it next
- Add an **oxygen meter** that drains, refilled only at the home base — forces
  risk/reward runs into the dark.
- **Hazards**: anglerfish that only appear mid-ping, currents that push you.
- Persist charted maps with `DataStoreService` so progress carries between
  sessions.
- A **map fragment** that slowly fills in as you reveal more of the trench.
