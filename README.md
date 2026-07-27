# Sounds go here

The game already tries to play these files by name. Nothing breaks if they're
missing (it just plays silently), so add them whenever you're ready --
matching these exact filenames is all you need to do:

## Background music (one per room, loops automatically)
- `bgm-hub.mp3`
- `bgm-garden.mp3`
- `bgm-letter.mp3`
- `bgm-music.mp3`
- `bgm-comfort.mp3`
- `bgm-giftArea.mp3`

## Sound effects
- `sfx-interact.mp3` — plays when talking to a flower, the radio, a star, etc.
- `sfx-celebrate.mp3` — plays when the final gift is opened

Any standard web-friendly format works (mp3 is safest for broad browser
support). Keep file sizes small/compressed since this all runs directly in
the browser with no build step.
