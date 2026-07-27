# Images go here (optional)

Room backgrounds are currently drawn as simple pastel tile patterns in
`drawFloor()` inside `game.js` -- no image files needed.

If you'd rather use a drawn/painted background for a room, drop the image
here and swap the relevant `drawFloor(room.theme)` call for something like:

```js
const gardenBg = new Image();
gardenBg.src = "assets/images/garden-bg.png";
// later, in render():
ctx.drawImage(gardenBg, 0, 0, GAME_W, GAME_H);
```

Keep images sized to (or a clean multiple of) 400x240 -- that's the game's
internal resolution -- so they stay crisp at the pixelated scaling the
game already uses.
