# BattleLayer

An offline, physical-tabletop-first effects app for a TV or overhead projector. Original implementation inspired by the general tabletop-overlay concept; no third-party assets or code.

## Run

Open `index.html` in a modern desktop browser. No install, account, network, or build required. Alternatively serve this directory with `python3 -m http.server 8080` and open http://localhost:8080.

Docker: `docker build -t battlelayer .` then `docker run --rm -p 8080:80 battlelayer`. Open http://localhost:8080.

## Controls

- Right-click: Action Wheel, visible on the battlefield.
- Left-click: select an object. Left-drag: temporary distance measurement.
- Hold Shift **before starting** a left-drag: retain measurement after release.
- Click a retained measurement, then Delete: remove it.
- Environment → Water/Lava/Fog: click polygon corners, Enter to finish, Escape to cancel. Regions are locked against ordinary battlefield selection; select them through Layers to delete.
- Templates / Animated spells: place at the original right-click location. Scroll to resize, Shift-scroll to rotate, Alt-drag to move.
- Weather: rain, snow, wind, clear. Dice use Web Crypto with rejection sampling.
- Ctrl/Cmd+Z: undo, including scene edits and deletion.
- Save/Open scene: JSON containing the embedded map and all effects/settings. Keep the file somewhere safe; refresh does not autosave.

## Projection

Choose effects-only projection to hide the map and use a black background. Adjust grid pixels until one projected square measures one inch on the physical board (default: 5 feet). Disable the grid once aligned. Hide Controls and use fullscreen. Keep browser zoom, output resolution and projector geometry fixed after calibration. Scene coordinates use viewport CSS pixels; changing the display size does not reposition artwork. Maps currently render at native pixel size, anchored top-left.

## Included in v0.1

Map upload (PNG/JPEG/WebP, 25 MB maximum), manually masked procedural water/lava/fog overlays, rain/snow/wind, circle/cone/line/square templates, persistent animated fireball/lightning/portal effects, dice, measurements with straight-line/5-foot diagonal/alternating diagonal rules, layer selection/deletion, undo, pause, scene export/import, grid scale calibration and fullscreen.

## Current limits / next milestones

This is a working prototype, not a finished MythLayer-equivalent application. Fireball is currently persistent until deleted. Environmental effects are animated overlays, not shader distortion of the original map pixels. No automatic region detection is planned. No perspective correction, map pan/zoom, endpoint editing, redo, brush selection, remote display synchronization, audio, or scene autosave yet. Grid measurements round axis distances to squares and do not snap endpoints; templates are geometric indicators, not a rules adjudicator. Physical terrain can cast shadows; software cannot remove these.

Future renderer work should add GPU masked map distortion while preserving the scene format and input model. Optional self-hosted synchronization can follow the local tabletop workflow.

## Verification

`node --check app.js` checks syntax. Logic checks passed for distance rules, scene validation, and add/undo. Browser smoke verification is outstanding: the development environment has Playwright but no Chromium executable. Manually verify Action Wheel placement, polygon creation, Shift-at-start measurements, removal/undo, pause, projection mode, and scene save/open before live play.

## Windows transparent desktop overlay (v0.2)

This adds a desktop wrapper; opening index.html in a browser still runs the browser version.

### Run from source
Install Node.js LTS, open a terminal in this repository, then:
```
npm install
npm start
```
BattleLayer opens as a transparent always-on-top window covering the primary display. Open your map in Photos behind it; the desktop version starts in Transparent desktop overlay mode. No map import is needed.

- Ctrl+Shift+Space switches between drawing and click-through.
- In click-through, controls hide and mouse input reaches Photos. Effects and grid stay visible.
- Press the same shortcut again to restore controls. Ctrl+Shift+Escape quits; the tray menu also restores drawing or quits.
- Select a projector/monitor in Desktop overlay controls to move the overlay.
- Effects-only projection still uses black for projecting onto a physical board.
- Imported digital-map mode remains available.
- Photos and BattleLayer are independent apps: moving/zooming Photos does not automatically move BattleLayer's effects. Arrange Photos first, calibrate the grid, and leave it fixed during play.
- Orientation/pan/zoom controls affect the overlay only when displaying another app underneath.
- Desktop mode is saved in scenes; browsers show a dark fallback because browsers cannot reveal desktop windows.

### Portable Windows build
After merge, open GitHub Actions → Build Windows desktop → latest successful run → download BattleLayer-Windows artifact, extract it and run the portable EXE. Alternatively run `npm run dist:win` on Windows. The executable is unsigned.

Direct build dependencies are pinned. Keep package-lock.json with the project for reproducible dependency resolution.

### Desktop verification
Windows transparency, global shortcuts, monitor switching and click-through need an actual Windows test. This change has not been run on Windows in the authoring environment.
