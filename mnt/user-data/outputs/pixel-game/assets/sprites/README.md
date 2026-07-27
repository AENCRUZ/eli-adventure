# Sprites go here (optional -- placeholders work fine for now)

Right now the player, the NPC, and every interactable object are drawn
directly in code (see `drawChibi()`, `drawNPC()`, and `drawInteractable()`
in `game.js`) using simple pixel-style shapes and emoji rather than image
files. This means the game works immediately with zero assets.

When you're ready to add real spritesheets:

1. Drop your sprite images in this folder (e.g. `player-walk.png`).
2. In `game.js`, create an `Image()` for each one and wait for it to load:
   ```js
   const playerSprite = new Image();
   playerSprite.src = "assets/sprites/player-walk.png";
   ```
3. Replace the body of `drawChibi()` with `ctx.drawImage(...)`, using the
   player's `facing` and `moving` state to pick which frame/row of your
   spritesheet to draw.

The rest of the game (movement, collision, rooms, save system) doesn't
need to change at all -- only the drawing functions do.
