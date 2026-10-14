# BattleLayer 0.3.0 — spell effects preview

Download BattleLayer-0.3.0-portable.exe from Assets. No Node.js installation is required. SHA256SUMS.txt provides the checksum.

- Fireball: charge-up, expanding blast ring, glowing sparks and fading smoke.
- Lightning: branching multi-layer bolts, flicker and travelling particles.
- Portal: rotating rings, rune marks and spiralling particles.
- Low / Balanced / High detail; 30 / 60 FPS. Balanced at 30 FPS is the laptop default.
- A shared particle budget limits detail as more effects run, and offscreen spells are skipped.
- Repeat spell animations retains the existing looping behaviour. Untick it for one-shot Fireball/Lightning; portals remain until removed.
- Existing scenes load with laptop-friendly defaults; animation phases restart on scene load and undo.

Uses the existing Canvas2D renderer with cached glow sprites, no additional runtime dependencies or dedicated GPU requirement. Exact EliteBook performance depends on model, resolution and effect count. The executable remains unsigned and native Windows/projector verification is required.
