/* =========================================================================
   CONFIG
   Everything personal and easy-to-customize lives here. Add messages,
   swap song info, or change the letter without touching any logic below.
========================================================================= */
const CONFIG = {
  // Shown if the player leaves the name box empty.
  nameFallback: "friend",

  // The name signed at the bottom of the letter -- also used as the label
  // for the NPC you meet in the hub.
  senderName: "Anji",

  // The Letter Room's desk. Blank lines are preserved (white-space: pre-wrap).
  letter: `Dear Eli,

Happy birthday, Eli. 🤍

I hope you have a really wonderful day today. I hope you get to rest, smile, and feel celebrated because you deserve it.

It's kind of funny because it's only been a month since we started talking, but I'm really glad that I got the chance to meet you. I didn't expect to find someone who was so easy to talk to and someone I genuinely enjoy getting to know.

I love hearing about your little stories, your thoughts, your dreams, and the things that make you happy. I admire how passionate and hardworking you are, and how much you care about the people around you. You have such a warm heart, and I hope you know that it's something really special.

I know I might not always be the most showy person when it comes to expressing how I feel. Sometimes I struggle with saying things out loud, but I hope you know that I appreciate you more than I probably show. The truth is, I always miss you. I miss talking to you, hearing about your day, and sharing little moments with you. Even the simplest messages from you can make me smile.

Thank you for the conversations, the random stories, the laughs, the late-night talks, and the little moments that made this past month special. Thank you for letting me get to know you.

For this new chapter of your life, I hope you continue to grow, achieve the things you dream of, and find happiness in the little moments too. I hope you remember to take care of yourself the same way you take care of everyone else.

I'm really happy that I met you, Eli. I'm excited to keep knowing you more and to see all the amazing things you're going to do.

Happy birthday again. I hope your day is as lovely as you are. 🤍

Oh, and one more thing. This is the little project I was secretly working on whenever we weren't talking and I had some free time. I'd work on it little by little whenever I could, and now I'm really happy I finally get to share it with you. I hope it makes you smile. 🤍


With love,
Anji`,

  // The Flower Garden. Walking up to any flower reveals one of these, in a
  // shuffled order that never repeats one twice before all the others have
  // had a turn.
  reasons: [
    "Because I love how you can turn a simple conversation into something I don't want to end.",
    "Because your little quirks make you even more adorable.",
    "Because I admire the way you care so deeply about the people you love.",
    "Because you have this quiet strength that I hope you see in yourself too.",
    "Because I love the way you share pieces of yourself with me.",
    "Because you make me look forward to checking my messages.",
    "Because you make me want to slow down and enjoy getting to know someone.",
    "Because I love seeing the passion you have for your dreams.",
    "Because you make me feel lucky that our paths crossed.",
    "Because you're Eli -- and there's no one else quite like you.",
  ],

  // The Music Room's radio. Leave a url as "#" and it shows as a
  // placeholder instead of a dead link.
  songs: [
    {
      title: "Song Title Here",
      artist: "Anji (cover)",
      note: "A short line about why this one's for her.",
      url: "#",
    },
    {
      title: "Another Song Title",
      artist: "Anji (cover)",
      note: "A short line about why this one's for her.",
      url: "#",
    },
  ],

  // Short "mission" text shown in a banner when the player first steps
  // into a room -- a little nudge toward what there is to do there.
  roomIntros: {
    garden: "Some flowers hide little messages. Find the reasons why you are special. 🌸",
    letter: "A special letter is waiting somewhere in this room. Maybe it has something I want to tell you. 💌",
    music: "Songs I dedicated for you are waiting here. Hurry and find them. 🎧",
    giftArea: "One last surprise, made just for you. 🎁",
  },

  // What the NPC version of the sender says in the hub.
  npcDialogue: [
    "Hey, you made it here.",
    "I wanted to make something that felt like a little place just for you.",
    "There are a few little rooms around here. Take your time exploring them -- there's no rush.",
  ],

  // What the locked gate says before all three rooms are visited.
  gateLockedMessage: "The gate won't budge yet. Maybe there's a little more to see first. 🌷",

  // Shown when the gift in the Final Gift Area is opened. {name} is
  // replaced with whatever the player typed in at the start.
  finaleMessage: `Happy birthday, {name}.

Thank you for making it all the way here.

Every little room in this world was made with you in mind.

I hope today, and every day after, feels this soft and this loved.`,

  // A second, smaller note shown right after the finale message.
  secretMessage: "Thank you for existing. I'm grateful I met you. 🤍",

  // Player character options. Colors are used to tint the placeholder
  // pixel sprite until you swap in real spritesheets.
  buddies: {
    flower: { label: "Flower Girl", icon: "🌸", color: "#FF97B4" },
    book:   { label: "Book Lover",  icon: "📚", color: "#8FB3D9" },
    camera: { label: "Photographer", icon: "📷", color: "#C9A6E0" },
    baker:  { label: "Baker",       icon: "🧁", color: "#F5C77E" },
  },
};

/* =========================================================================
   CONSTANTS
========================================================================= */
const GAME_W = 400;
const GAME_H = 240;
const TILE = 20;
const PLAYER_W = 14;
const PLAYER_H = 18;
const PLAYER_SPEED = 78; // px per second
const PLAYER_ACCEL = 16; // how quickly velocity eases toward the input direction
const INTERACT_RADIUS = 30;
const DOOR_HOLD_TIME = 0.12; // seconds a door must be overlapped before it fires
const SAVE_KEY = "birthdayGameSave";

/* =========================================================================
   DOM REFERENCES
========================================================================= */
const screens = {
  title: document.getElementById("screen-title"),
  name: document.getElementById("screen-name"),
  buddy: document.getElementById("screen-buddy"),
  welcome: document.getElementById("screen-welcome"),
  game: document.getElementById("screen-game"),
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const hudRoomEl = document.getElementById("hud-room");
const roomIntroEl = document.getElementById("room-intro");
const interactPromptEl = document.getElementById("interact-prompt");
const dialogueBoxEl = document.getElementById("dialogue-box");
const dialogueNameEl = document.getElementById("dialogue-name");
const dialogueTextEl = document.getElementById("dialogue-text");

const joystickBase = document.getElementById("joystick-base");
const joystickThumb = document.getElementById("joystick-thumb");
const btnInteract = document.getElementById("btn-interact");

/* =========================================================================
   GAME STATE
========================================================================= */
const state = {
  name: "",
  buddy: "flower",
  room: "hub",
  player: { x: 200, y: 190, vx: 0, vy: 0, facing: "down", moving: false },
  visited: { garden: false, letter: false, music: false, giftArea: false },
  muted: false,
  volume: 0.6,
  letterOpenedOnce: false,
};

function playerName() {
  return state.name && state.name.trim() ? state.name.trim() : CONFIG.nameFallback;
}

function fillTemplate(text) {
  return text.replace(/\{name\}/g, playerName());
}

/* =========================================================================
   SAVE / LOAD
========================================================================= */
function saveGame() {
  try {
    const payload = {
      name: state.name,
      buddy: state.buddy,
      room: state.room,
      player: { x: state.player.x, y: state.player.y },
      visited: state.visited,
      muted: state.muted,
      volume: state.volume,
      letterOpenedOnce: state.letterOpenedOnce,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    // localStorage may be unavailable (private browsing etc.) -- fail quietly
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    /* ignore */
  }
}

/* =========================================================================
   SCREEN SWITCHING (title / name / buddy / welcome / game)
========================================================================= */
function showOverlayScreen(id) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[id].classList.add("active");
}

/* =========================================================================
   AUDIO MANAGER
   Wired up to expected file paths under assets/sounds/. If a file isn't
   there yet, playback just fails quietly -- nothing breaks.
========================================================================= */
const AudioManager = {
  bgm: new Audio(),       // the single ambient track, playing everywhere
  altTrack: new Audio(),  // one-off tracks that override it (e.g. the finale)
  ducked: false,          // true while in the Music Room
  fadeInterval: null,

  init() {
    this.bgm.loop = true;
    this.bgm.src = "assets/sounds/bgm-main.mp3";
  },

  // Makes sure the single ambient track is actually running. Browsers block
  // autoplay before a user gesture, so this quietly no-ops until the first
  // room change after Start/Continue is clicked.
  ensurePlaying() {
    if (this.bgm.paused) {
      this.bgm.volume = 0;
      this.bgm.play().catch(() => {
        /* still no user gesture yet -- fine, next room change retries */
      });
    }
  },

  // Called on every room change. The track keeps playing everywhere; it
  // only fades down while she's in the Music Room (which has its own
  // radio/song list) and fades back up in every other room.
  setRoom(roomId) {
    this.ensurePlaying();
    this.ducked = roomId === "music";
    const target = state.muted ? 0 : this.ducked ? 0 : state.volume;
    this.fadeBgmTo(target);
  },

  fadeBgmTo(target, duration = 900) {
    clearInterval(this.fadeInterval);
    const start = this.bgm.volume;
    const t0 = performance.now();
    this.fadeInterval = setInterval(() => {
      const p = Math.min((performance.now() - t0) / duration, 1);
      this.bgm.volume = start + (target - start) * p;
      if (p >= 1) clearInterval(this.fadeInterval);
    }, 40);
  },

  // Applies the current volume/mute state immediately, no fade -- used
  // right after loading a save, before playback has started.
  applyVolume() {
    const target = state.muted ? 0 : this.ducked ? 0 : state.volume;
    this.bgm.volume = target;
    if (!this.altTrack.paused) this.altTrack.volume = state.muted ? 0 : state.volume;
  },

  // Plays a one-off track on its own channel (e.g. the finale's piano
  // cover), ducking the main ambient track out from under it.
  playTrack(name) {
    clearInterval(this.fadeInterval);
    this.bgm.volume = 0;
    this.altTrack.pause();
    this.altTrack.currentTime = 0;
    this.altTrack.loop = true;
    this.altTrack.src = `assets/sounds/bgm-${name}.mp3`;
    this.altTrack.volume = state.muted ? 0 : state.volume;
    this.altTrack.play().catch(() => {});
  },

  // Stops everything -- used when returning to the title screen.
  stopAll() {
    clearInterval(this.fadeInterval);
    this.bgm.pause();
    this.altTrack.pause();
  },

  sfx(name) {
    if (state.muted) return;
    const audio = new Audio(`assets/sounds/sfx-${name}.mp3`);
    audio.volume = state.volume;
    audio.play().catch(() => {});
  },

  setMuted(muted) {
    state.muted = muted;
    this.applyVolume();
    saveGame();
  },

  setVolume(v) {
    state.volume = v;
    this.applyVolume();
    saveGame();
  },
};

/* =========================================================================
   AMBIENT FLOATING HEARTS (same touch as the original site)
========================================================================= */
const heartsContainer = document.getElementById("floating-hearts");
const heartSymbols = ["🤍", "💗", "✨"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function spawnHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 14}px`;
  const duration = 9 + Math.random() * 7;
  heart.style.animationDuration = `${duration}s`;
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

if (!prefersReducedMotion) {
  setInterval(spawnHeart, 2200);
}

/* =========================================================================
   GENERIC TYPEWRITER HELPER
   Shared by the dialogue box, the letter, and the finale message.
========================================================================= */
function runTypewriter(el, text, { speed = 24, cursor = true, onDone } = {}) {
  el.textContent = "";
  if (cursor) el.classList.add("typing");

  if (prefersReducedMotion) {
    el.textContent = text;
    el.classList.remove("typing");
    if (onDone) onDone();
    return { cancel() {} };
  }

  let i = 0;
  let cancelled = false;

  function step() {
    if (cancelled) return;
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(step, speed);
    } else {
      el.classList.remove("typing");
      if (onDone) onDone();
    }
  }
  step();

  return {
    cancel() {
      cancelled = true;
    },
  };
}

/* =========================================================================
   DIALOGUE BOX (in-game)
========================================================================= */
const dialogue = {
  queue: [],
  active: false,
  typer: null,
  currentLine: "",

  show(name, lines) {
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.active = true;
    inputState.frozen = true;
    dialogueBoxEl.classList.remove("hidden");
    dialogueNameEl.textContent = name || "";
    this.next();
  },

  next() {
    if (this.queue.length === 0) {
      this.close();
      return;
    }
    this.currentLine = this.queue.shift();
    if (this.typer) this.typer.cancel();
    this.typer = runTypewriter(dialogueTextEl, this.currentLine, { speed: 20 });
  },

  advance() {
    if (!this.active) return;
    // if still typing, finish the line instantly on this tap rather than
    // skipping it -- the next tap moves on to the following line
    if (dialogueTextEl.classList.contains("typing")) {
      if (this.typer) this.typer.cancel();
      dialogueTextEl.textContent = this.currentLine;
      dialogueTextEl.classList.remove("typing");
      return;
    }
    this.next();
  },

  close() {
    this.active = false;
    inputState.frozen = false;
    dialogueBoxEl.classList.add("hidden");
  },
};

/* =========================================================================
   ROOMS
   Each room is a single (non-scrolling) 400x240 screen. Doors are
   walk-into triggers; interactables need an explicit interact press.
========================================================================= */
const HUB_SPAWN = { x: 200, y: 190 };
const ROOM_SPAWN = { x: 200, y: 50 };

function exitDoor(target) {
  return { x: 180, y: 224, w: 40, h: 16, label: "🚪", target, spawn: HUB_SPAWN, auto: true };
}

const rooms = {
  hub: {
    label: "The Hub",
    theme: { a: "#DDEFCB", b: "#CFE6B8", floor: "grass" },
    obstacles: [
      // Building walls (visuals handled by drawBuildingFacade, not drawObstacle)
      // -- Gift Area, top --
      { x: 150, y: 0, w: 30, h: 46, hidden: true },
      { x: 220, y: 0, w: 30, h: 46, hidden: true },
      // -- Music Room, left --
      { x: 0, y: 70, w: 50, h: 30, hidden: true },
      { x: 0, y: 140, w: 50, h: 30, hidden: true },
      // -- Letter Room, right --
      { x: 350, y: 70, w: 50, h: 30, hidden: true },
      { x: 350, y: 140, w: 50, h: 30, hidden: true },
      // -- Flower Garden, bottom --
      { x: 150, y: 194, w: 30, h: 46, hidden: true },
      { x: 220, y: 194, w: 30, h: 46, hidden: true },
      { x: 182, y: 106, w: 36, h: 30, round: true }, // little fountain
    ],
    // Building facades -- purely visual, drawn depth-sorted with decor.
    buildings: [
      { x: 150, y: 0, w: 100, h: 46, doorX: 180, doorW: 40, roof: "#E3B873", roofAccent: "#F5C77E", wall: "#FFF7E9", label: "🎁", side: "top", gate: true, kind: "party" },
      { x: 0, y: 70, w: 50, h: 100, doorY: 100, doorH: 40, roof: "#8FB3D9", roofAccent: "#6E93BE", wall: "#EEF5FC", label: "🎵", side: "left", kind: "studio" },
      { x: 350, y: 70, w: 50, h: 100, doorY: 100, doorH: 40, roof: "#c155c9", roofAccent: "#A87B3B", wall: "#f0e6ee", label: "💌", side: "right", kind: "library" },
      { x: 150, y: 194, w: 100, h: 46, doorX: 180, doorW: 40, roof: "#E39BB0", roofAccent: "#F2C2D2", wall: "#FFF3F7", label: "🌸", side: "bottom", kind: "greenhouse" },
    ],
    // Decorative, non-collidable environmental details -- scattered with
    // natural, irregular spacing rather than a symmetrical grid. Each item
    // carries enough of its own footprint that depth-sorting against the
    // buildings gives correct in-front/behind layering.
    decor: [
      // corner + edge trees, offset unevenly so nothing lines up
      { type: "tree", x: 6, y: 40 },
      { type: "tree", x: 24, y: 18 },
      { type: "tree", x: 112, y: 34 },
      { type: "tree", x: 288, y: 30 },
      { type: "tree", x: 372, y: 42, flip: true },
      { type: "tree", x: 392, y: 18, flip: true },
      { type: "tree", x: 396, y: 152, flip: true },
      { type: "tree", x: 370, y: 190, flip: true },
      { type: "tree", x: 4, y: 150 },
      { type: "tree", x: 26, y: 196 },
      { type: "bush", x: 50, y: 156 },
      { type: "bush", x: 90, y: 60 },
      { type: "bush", x: 306, y: 62 },
      { type: "bush", x: 344, y: 158 },
      { type: "bush", x: 130, y: 210 },
      { type: "bush", x: 280, y: 214 },
      { type: "rock", x: 64, y: 52 },
      { type: "rock", x: 330, y: 54 },
      { type: "rock", x: 20, y: 110 },
      { type: "rock", x: 378, y: 100 },
      { type: "plant", x: 128, y: 176 },
      { type: "plant", x: 264, y: 178 },
      { type: "plant", x: 68, y: 130 },
      { type: "plant", x: 340, y: 128 },
      { type: "leafPatch", x: 44, y: 202 },
      { type: "leafPatch", x: 312, y: 208 },
      { type: "leafPatch", x: 100, y: 92 },
      { type: "leafPatch", x: 250, y: 96 },
      { type: "leafPatch", x: 200, y: 170 },
      { type: "gardenFlower", x: 116, y: 152, color: "#FFD3E0" },
      { type: "gardenFlower", x: 296, y: 150, color: "#F5C77E" },
      { type: "gardenFlower", x: 76, y: 176 },
      { type: "gardenFlower", x: 322, y: 174, color: "#C9A6E0" },
    ],
    doors: [
      { x: 180, y: 0, w: 40, h: 14, label: "", target: "giftArea", spawn: ROOM_SPAWN, auto: true, gate: true },
      { x: 0, y: 100, w: 14, h: 40, label: "", target: "music", spawn: ROOM_SPAWN, auto: true },
      { x: 325, y: 100, w: 14, h: 40, label: "", target: "letter", spawn: ROOM_SPAWN, auto: true },
      { x: 180, y: 226, w: 40, h: 14, label: "", target: "garden", spawn: ROOM_SPAWN, auto: true },
    ],
    interactables: [
      { x: 92, y: 150, w: 16, h: 20, type: "npc", label: "" },
    ],
  },

  garden: {
    label: "Flower Garden",
    theme: { a: "#EAF6D8", b: "#DDEFC0", floor: "grass" },
    obstacles: [
      { x: 30, y: 30, w: 24, h: 20, hidden: true },
      { x: 340, y: 190, w: 24, h: 20, hidden: true },
    ],
    decor: [
      // backdrop: a climbing trellis, a rock cluster and a birdbath give
      // the room some structure instead of being an open field of grass
      { type: "trellis", x: 176, y: 0 },
      { type: "trellis", x: 126, y: 0 },
      { type: "rockCluster", x: 30, y: 26 },
      { type: "rockCluster", x: 350, y: 220 },
      { type: "birdbath", x: 336, y: 186 },

      { type: "tree", x: 5, y: 35 },
      { type: "tree", x: 394, y: 10, flip: true },
      { type: "cherryTree", x: 95, y: 15 },
      { type: "cherryTree", x: 310, y: 18, flip: true },
      { type: "cherryTree", x: 145, y: 213 },
      { type: "cherryTree", x: 250, y: 215, flip: true },
      { type: "cherryTree", x: 22, y: 118 },
      { type: "cherryTree", x: 380, y: 115, flip: true },
      { type: "bush", x: 20, y: 190 },
      { type: "bush", x: 366, y: 60 },
      { type: "bush", x: 238, y: 26 },
      { type: "bush", x: 60, y: 214 },
      { type: "plant", x: 100, y: 200 },
      { type: "plant", x: 200, y: 120 },
      { type: "plant", x: 350, y: 150 },
      { type: "leafPatch", x: 40, y: 135 },
      { type: "leafPatch", x: 260, y: 40 },
      { type: "leafPatch", x: 220, y: 150 },
      { type: "gardenFlower", x: 110, y: 120 },
      { type: "gardenFlower", x: 190, y: 200, color: "#F5C77E" },
      { type: "gardenFlower", x: 260, y: 150, color: "#C9A6E0" },
      { type: "gardenFlower", x: 340, y: 110, color: "#8FB3D9" },

      // a stepping-stone path leading from the door up into the garden
      { type: "steppingStone", x: 187, y: 214 },
      { type: "steppingStone", x: 208, y: 198 },
      { type: "steppingStone", x: 190, y: 180 },
      { type: "steppingStone", x: 207, y: 163 },
      { type: "steppingStone", x: 195, y: 146 },
      { type: "steppingStone", x: 105, y: 100 },
      { type: "steppingStone", x: 135, y: 125 },

      // soil beds grounding each interactable flower, drawn just beneath it
      { type: "flowerbed", x: 68, y: 84 },
      { type: "flowerbed", x: 158, y: 74 },
      { type: "flowerbed", x: 248, y: 104 },
      { type: "flowerbed", x: 328, y: 84 },
      { type: "flowerbed", x: 98, y: 174 },
      { type: "flowerbed", x: 288, y: 184 },

      // drifting butterflies, drawn last so they read as being in front
      { type: "butterfly", x: 130, y: 50, seed: 0 },
      { type: "butterfly", x: 300, y: 130, seed: 1 },
      { type: "butterfly", x: 70, y: 140, seed: 2 },
      { type: "butterfly", x: 30, y: 175, seed: 3 },
    ],
    doors: [exitDoor("hub")],
    interactables: [
      { x: 60, y: 70, w: 16, h: 16, type: "flower", label: "🌸" },
      { x: 150, y: 60, w: 16, h: 16, type: "flower", label: "🌷" },
      { x: 240, y: 90, w: 16, h: 16, type: "flower", label: "🌼" },
      { x: 320, y: 70, w: 16, h: 16, type: "flower", label: "🌸" },
      { x: 90, y: 160, w: 16, h: 16, type: "flower", label: "🌷" },
      { x: 280, y: 170, w: 16, h: 16, type: "flower", label: "🌼" },
    ],
  },

  letter: {
    label: "Letter Room",
    theme: { a: "#F7EAD8", b: "#EFDCC1", floor: "wood" },
    obstacles: [
      { x: 0, y: 40, w: 24, h: 130, hidden: true },
      { x: 376, y: 40, w: 24, h: 130, hidden: true },
    ],
    decor: [
      // back wall, dressed with a window, framed keepsakes and a clock
      { type: "wallBand", x: 0, y: 0, w: 400, h: 40, color: "#E8D3B0" },
      { type: "window", x: 176, y: 2 },
      { type: "frame", x: 92, y: 8 },
      { type: "frame", x: 298, y: 8 },
      { type: "wallClock", x: 138, y: 18 },

      { type: "bookshelf", x: 2, y: 10 },
      { type: "bookshelf", x: 350, y: 10 },
      { type: "bookshelf", x: 10, y: 130 },
      { type: "bookshelf", x: 340, y: 130 },
      { type: "lamp", x: 300, y: 40 },
      { type: "lamp", x: 72, y: 40 },

      // little reading corner, tucked against the wall so the room feels lived-in
      { type: "pottedPlant", x: 80, y: 140 },
      { type: "pottedPlant", x: 290, y: 140 },

      // the writing desk itself, facing the window, with a chair pulled in
      { type: "chair", x: 187, y: 42 },
      { type: "writingDesk", x: 158, y: 62, w: 84, h: 44 },

      { type: "rug", x: 128, y: 128, w: 144, h: 74 },
      { type: "papers", x: 215, y: 80 },
      { type: "papers", x: 252, y: 162 },
    ],
    doors: [exitDoor("hub")],
    interactables: [
      { x: 168, y: 66, w: 64, h: 38, type: "desk", label: "✍️" },
    ],
  },

  music: {
    label: "Music Room",
    theme: { a: "#FBE6ED", b: "#F6D2E0", floor: "wood" },
    obstacles: [
      { x: 0, y: 40, w: 24, h: 130, hidden: true },
      { x: 376, y: 40, w: 24, h: 130, hidden: true },
      { x: 155, y: 132, w: 90, h: 24, hidden: true },
    ],
    decor: [
      // back wall, dressed like the other indoor rooms so it reads as a
      // real wall instead of open floor -- a window, framed vinyl
      // keepsakes, and warm sconce lamps
      { type: "wallBand", x: 0, y: 0, w: 400, h: 40, color: "#F6D2E0" },
      { type: "window", x: 176, y: 2 },
      { type: "recordFrame", x: 88, y: 8 },
      { type: "recordFrame", x: 300, y: 8 },
      { type: "foamPanel", x: 118, y: 16 },
      { type: "foamPanel", x: 252, y: 16 },
      { type: "fairyLights", x: 28, y: 1, w: 142 },
      { type: "fairyLights", x: 230, y: 1, w: 142 },
      { type: "lamp", x: 300, y: 42 },
      { type: "lamp", x: 62, y: 42 },

      // a little mirrorball catching the window light in the middle of the room
      { type: "discoBall", x: 200, y: 50 },

      { type: "guitar", x: 20, y: 20 },
      { type: "electricGuitar", x: 356, y: 20 },

      // a rug grounding the hangout area, with the piano, records and a
      // mic stand set up around it like an actual little studio corner
      { type: "rug", x: 100, y: 170, w: 200, h: 58 },
      { type: "piano", x: 20, y: 120 },
      { type: "vinylCrate", x: 40, y: 185 },
      { type: "micStand", x: 305, y: 145 },
      { type: "stool", x: 335, y: 185 },
      { type: "stool", x: 86, y: 65 },
      { type: "amp", x: 340, y: 150 },
      { type: "neonSign", x: 315, y: 92 },

      // a pair of studio monitors flanking the radio table, like an
      // actual little mixing station instead of one lone speaker
      { type: "studioMonitor", x: 122, y: 128 },
      { type: "studioMonitor", x: 256, y: 128 },

      // the radio itself, sitting properly on its table rather than
      // floating as a bare icon
      { type: "table", x: 155, y: 110, w: 90, h: 46 },
      { type: "radioBox", x: 171, y: 70 },

      { type: "notesWallpaper", x: 0, y: 0 },
    ],
    doors: [exitDoor("hub")],
    interactables: [
      { x: 180, y: 105, w: 40, h: 40, type: "radio", label: "📻" },
    ],
  },

  giftArea: {
    label: "Final Gift Area",
    theme: { a: "#FFEAF1", b: "#FFD9E6", floor: "party" },
    obstacles: [
      { x: 158, y: 152, w: 84, h: 18, hidden: true },
    ],
    decor: [
      { type: "spotlight", x: 200, y: 120, r: 70 },
      { type: "giftTable", x: 158, y: 130, w: 84, h: 40 },
      { type: "giftBox", x: 174, y: 126, size: 16, color: "#8FB3D9" },
      { type: "giftBox", x: 226, y: 128, size: 14, color: "#F5C77E" },
      { type: "fairyLights", x: 150, y: 56, w: 100 },
      { type: "balloon", x: 30, y: 10, color: "#FF97B4" },
      { type: "balloon", x: 60, y: 30, color: "#FFD3E0" },
      { type: "balloon", x: 340, y: 10, color: "#8FB3D9" },
      { type: "balloon", x: 365, y: 34, color: "#C9A6E0" },
      { type: "balloon", x: 200, y: 6, color: "#F5C77E" },
      { type: "bunting", x: 0, y: 0 },
    ],
    doors: [exitDoor("hub")],
    interactables: [
      { x: 178, y: 90, w: 44, h: 50, type: "gift", label: "🎁" },
    ],
  },
};

/* =========================================================================
   INPUT
========================================================================= */
const inputState = {
  keys: new Set(),
  joyX: 0,
  joyY: 0,
  frozen: false, // true while a dialogue/modal has control
};

window.addEventListener("keydown", (e) => {
  const isGameActive = screens.game.classList.contains("active");
  const focusedTag = document.activeElement && document.activeElement.tagName;
  const typingInField = focusedTag === "INPUT" || focusedTag === "TEXTAREA";
  const k = e.key.toLowerCase();

  if (k === "escape") {
    closeTopModal();
    return;
  }

  if (!isGameActive || typingInField) return;

  if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
    inputState.keys.add(k);
    e.preventDefault();
  }
  if (k === "enter" || k === " " || k === "e") {
    handleInteractPress();
  }
});

window.addEventListener("keyup", (e) => {
  inputState.keys.delete(e.key.toLowerCase());
});

function readKeyboardVector() {
  let x = 0, y = 0;
  if (inputState.keys.has("w") || inputState.keys.has("arrowup")) y -= 1;
  if (inputState.keys.has("s") || inputState.keys.has("arrowdown")) y += 1;
  if (inputState.keys.has("a") || inputState.keys.has("arrowleft")) x -= 1;
  if (inputState.keys.has("d") || inputState.keys.has("arrowright")) x += 1;
  return { x, y };
}

/* --- touch joystick --- */
let joystickTouchId = null;
const JOY_RADIUS = 40;

function joystickStart(clientX, clientY, id) {
  joystickTouchId = id;
  // Anchor to the base's real center (not the touch-down point) so the
  // thumb always represents an actual direction from a fixed origin,
  // rather than drifting depending on where the finger first lands.
  const rect = joystickBase.getBoundingClientRect();
  joystickBase.dataset.originX = rect.left + rect.width / 2;
  joystickBase.dataset.originY = rect.top + rect.height / 2;
  joystickMove(clientX, clientY);
}

function joystickMove(clientX, clientY) {
  const originX = parseFloat(joystickBase.dataset.originX || "0");
  const originY = parseFloat(joystickBase.dataset.originY || "0");
  let dx = clientX - originX;
  let dy = clientY - originY;
  const dist = Math.min(Math.hypot(dx, dy), JOY_RADIUS);
  const angle = Math.atan2(dy, dx);
  dx = Math.cos(angle) * dist;
  dy = Math.sin(angle) * dist;
  joystickThumb.style.transform = `translate(${dx - 21}px, ${dy - 21}px)`;
  inputState.joyX = dx / JOY_RADIUS;
  inputState.joyY = dy / JOY_RADIUS;
}

function joystickEnd() {
  joystickTouchId = null;
  joystickThumb.style.transform = "translate(-50%, -50%)";
  inputState.joyX = 0;
  inputState.joyY = 0;
}

joystickBase.addEventListener("touchstart", (e) => {
  const t = e.changedTouches[0];
  joystickStart(t.clientX, t.clientY, t.identifier);
  e.preventDefault();
}, { passive: false });

joystickBase.addEventListener("touchmove", (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joystickTouchId) joystickMove(t.clientX, t.clientY);
  }
  e.preventDefault();
}, { passive: false });

window.addEventListener("touchend", (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joystickTouchId) joystickEnd();
  }
});

// mouse fallback for the joystick, handy when testing on desktop
let joystickMouseDown = false;
joystickBase.addEventListener("mousedown", (e) => {
  joystickMouseDown = true;
  joystickStart(e.clientX, e.clientY, "mouse");
});
window.addEventListener("mousemove", (e) => {
  if (joystickMouseDown) joystickMove(e.clientX, e.clientY);
});
window.addEventListener("mouseup", () => {
  if (joystickMouseDown) {
    joystickMouseDown = false;
    joystickEnd();
  }
});

btnInteract.addEventListener("click", () => handleInteractPress());

// detect touch devices to reveal the on-screen controls
if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
  document.body.classList.add("touch-enabled");
}

/* =========================================================================
   INTERACTION HANDLING
========================================================================= */
let nearestInteractable = null;

function handleInteractPress() {
  if (dialogue.active) {
    dialogue.advance();
    return;
  }
  if (anyModalOpen()) return;
  if (!nearestInteractable) return;

  const obj = nearestInteractable;

  switch (obj.type) {
    case "npc":
      dialogue.show(CONFIG.senderName, CONFIG.npcDialogue);
      break;

    case "flower":
      obj.poppedAt = performance.now();
      showNextReason();
      break;

    case "desk":
      openLetterModal();
      break;

    case "radio":
      openModal("modal-music");
      AudioManager.sfx("interact");
      break;

    case "gift":
      triggerFinale();
      break;
  }
}

/* --- flower garden: shuffled reason bag, same logic as the original site --- */
let reasonBag = [];
function showNextReason() {
  if (reasonBag.length === 0) {
    reasonBag = [...CONFIG.reasons];
    for (let i = reasonBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reasonBag[i], reasonBag[j]] = [reasonBag[j], reasonBag[i]];
    }
  }
  const reason = reasonBag.pop();
  AudioManager.sfx("flower-reveal");
  dialogue.show("", [reason]);
}

/* =========================================================================
   MODALS (letter / music / settings)
========================================================================= */
function anyModalOpen() {
  return document.querySelector(".modal:not(.hidden)") !== null;
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
  inputState.frozen = true;
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  inputState.frozen = false;
}

function closeTopModal() {
  const open = document.querySelector(".modal:not(.hidden)");
  if (open) closeModal(open.id);
}

document.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", () => closeModal(el.dataset.closeModal));
});

/* --- letter modal: envelope + growing paper --- */
const envelopeEl = document.getElementById("envelope");
const envelopePaperEl = document.getElementById("envelope-paper");
const letterTextEl = document.getElementById("letter-text");
const btnOpenLetter = document.getElementById("btn-open-letter");
const btnReplayLetter = document.getElementById("btn-replay-letter");
let letterTyper = null; // active typewriter handle, so replays cancel any run still in progress

function openLetterModal() {
  openModal("modal-letter");

  if (letterTyper) {
    letterTyper.cancel();
    letterTyper = null;
  }

  if (state.letterOpenedOnce) {
    // already read before -- show it fully open, no need to replay the wait
    envelopeEl.classList.add("open");
    letterTextEl.classList.remove("typing");
    letterTextEl.textContent = CONFIG.letter;
    btnOpenLetter.classList.add("hidden");
    btnReplayLetter.classList.remove("hidden");
    return;
  }

  envelopeEl.classList.remove("open");
  letterTextEl.textContent = "";
  btnOpenLetter.classList.remove("hidden");
  btnOpenLetter.disabled = false;
  btnOpenLetter.style.opacity = "1";
  btnReplayLetter.classList.add("hidden");
}

btnOpenLetter.addEventListener("click", () => {
  if (envelopeEl.classList.contains("open")) return;
  envelopeEl.classList.add("open");
  AudioManager.sfx("letter-open");
  btnOpenLetter.disabled = true;
  btnOpenLetter.style.opacity = "0.5";

  setTimeout(() => {
    typeLetter();
  }, prefersReducedMotion ? 0 : 500);
});

btnReplayLetter.addEventListener("click", () => typeLetter());

function typeLetter() {
  const text = CONFIG.letter;
  const speed = 22;

  btnReplayLetter.classList.add("hidden");

  if (letterTyper) {
    letterTyper.cancel();
    letterTyper = null;
  }

  if (prefersReducedMotion) {
    letterTextEl.textContent = text;
    btnOpenLetter.classList.add("hidden");
    btnReplayLetter.classList.remove("hidden");
    state.letterOpenedOnce = true;
    saveGame();
    return;
  }

  letterTextEl.classList.add("typing");

  letterTyper = runTypewriter(letterTextEl, text, {
    speed,
    onDone: () => {
      btnOpenLetter.classList.add("hidden");
      btnReplayLetter.classList.remove("hidden");
      state.letterOpenedOnce = true;
      saveGame();
    },
  });
}

/* --- music modal: build song cards once from CONFIG.songs --- */
const songListEl = document.getElementById("song-list");

CONFIG.songs.forEach((song) => {
  const card = document.createElement("div");
  card.className = "song-card";

  const hasUrl = song.url && song.url !== "#";

  const icon = document.createElement("div");
  icon.className = "song-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "🎵";

  const body = document.createElement("div");
  body.className = "song-body";

  const h3 = document.createElement("h3");
  h3.textContent = song.title;

  const artist = document.createElement("p");
  artist.className = "song-artist";
  artist.textContent = song.artist || "";

  const note = document.createElement("p");
  note.className = "song-note";
  note.textContent = song.note || "";

  const link = document.createElement("a");
  link.className = "listen-btn";
  link.target = "_blank";
  link.rel = "noopener";
  if (hasUrl) {
    link.href = song.url;
    link.textContent = "Listen ▸";
  } else {
    link.href = "#";
    link.classList.add("is-placeholder");
    link.textContent = "Add a link ▸";
    link.addEventListener("click", (e) => e.preventDefault());
  }

  body.append(h3, artist, note, link);
  card.append(icon, body);
  songListEl.appendChild(card);
});

/* --- settings modal --- */
const volumeSlider = document.getElementById("volume-slider");
const muteCheckbox = document.getElementById("mute-checkbox");
const btnResetSave = document.getElementById("btn-reset-save");

volumeSlider.addEventListener("input", (e) => {
  AudioManager.setVolume(Number(e.target.value) / 100);
});

muteCheckbox.addEventListener("change", (e) => {
  AudioManager.setMuted(e.target.checked);
  updateMuteButton();
});

btnResetSave.addEventListener("click", () => {
  const sure = window.confirm("This clears your saved progress and returns to the title screen. Continue?");
  if (!sure) return;
  clearSave();
  window.location.reload();
});

/* =========================================================================
   HUD BUTTONS
========================================================================= */
const btnMute = document.getElementById("btn-mute");
const btnFullscreen = document.getElementById("btn-fullscreen");
const btnGear = document.getElementById("btn-gear");

function updateMuteButton() {
  btnMute.textContent = state.muted ? "🔇" : "🔊";
}

btnMute.addEventListener("click", () => {
  AudioManager.setMuted(!state.muted);
  muteCheckbox.checked = state.muted;
  updateMuteButton();
});

const supportsFullscreen = !!(
  document.documentElement.requestFullscreen ||
  document.documentElement.webkitRequestFullscreen
);

if (!supportsFullscreen) {
  // iOS Safari (and a few other mobile browsers) don't support the
  // Fullscreen API at all -- hide the button rather than show one that
  // silently does nothing when tapped.
  btnFullscreen.classList.add("hidden");
} else {
  btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)
        .call(document.documentElement)
        ?.catch?.(() => {});
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
    }
  });
}

btnGear.addEventListener("click", () => openModal("modal-settings"));
document.getElementById("btn-settings").addEventListener("click", () => openModal("modal-settings"));

/* =========================================================================
   ROOM TRANSITIONS
========================================================================= */
let roomIntroTimer = null;
function showRoomIntro(roomId) {
  const text = CONFIG.roomIntros[roomId];
  if (!text) return;
  clearTimeout(roomIntroTimer);
  roomIntroEl.textContent = text;
  requestAnimationFrame(() => roomIntroEl.classList.add("visible"));
  roomIntroTimer = setTimeout(() => {
    roomIntroEl.classList.remove("visible");
  }, 4200);
}

function goToRoom(roomId, spawn) {
  state.room = roomId;
  state.player.x = spawn.x;
  state.player.y = spawn.y;
  state.player.vx = 0;
  state.player.vy = 0;
  hudRoomEl.textContent = rooms[roomId].label;
  AudioManager.setRoom(roomId);
  showRoomIntro(roomId);

  if (roomId !== "hub" && state.visited[roomId] !== undefined) {
    state.visited[roomId] = true;
  }
  saveGame();
}

/* Wraps goToRoom with a quick fade-through so walking through a door feels
   like an intentional cut to a new place rather than an instant snap. */
const roomFadeEl = document.getElementById("room-fade");
const ROOM_FADE_MS = 220;

function goToRoomWithFade(roomId, spawn) {
  if (roomId === state.room) return;

  if (prefersReducedMotion) {
    goToRoom(roomId, spawn);
    return;
  }

  inputState.frozen = true;
  roomFadeEl.classList.add("active");
  setTimeout(() => {
    goToRoom(roomId, spawn);
    requestAnimationFrame(() => {
      roomFadeEl.classList.remove("active");
      inputState.frozen = false;
    });
  }, ROOM_FADE_MS);
}

function allRoomsVisited() {
  return state.visited.garden && state.visited.letter && state.visited.music;
}

/* =========================================================================
   AMBIENT ROOM PARTICLES
   Small floating details that match each room's mood -- petals drifting
   in the garden, notes rising in the music room, soft dust motes in the
   letter room. Purely decorative, capped per-room so they stay subtle.
========================================================================= */
const PARTICLE_STYLES = {
  garden: { symbol: "🌸", count: 6, speedY: 9, sway: 12, size: [8, 12], spawnEvery: 0.7 },
  music: { symbol: "♪", count: 5, speedY: -9, sway: 9, size: [9, 13], spawnEvery: 0.8 },
  letter: { symbol: "·", count: 10, speedY: 4, sway: 5, size: [3, 5], spawnEvery: 0.4 },
  // rising party sparkles in a few colors, so the gift room feels a little
  // more alive than the single-symbol particles used elsewhere
  giftArea: {
    symbols: ["✦", "✧", "●"],
    colors: ["#FF97B4", "#F5C77E", "#8FB3D9", "#C9A6E0", "#FFFFFF"],
    count: 12,
    speedY: -11,
    sway: 15,
    size: [4, 9],
    spawnEvery: 0.3,
  },
};

let roomParticles = [];
let particleSpawnAccum = 0;

function spawnRoomParticle(roomId, style) {
  const symbol = style.symbols
    ? style.symbols[Math.floor(Math.random() * style.symbols.length)]
    : style.symbol;
  const color = style.colors
    ? style.colors[Math.floor(Math.random() * style.colors.length)]
    : "#5C3A47";
  roomParticles.push({
    room: roomId,
    x: Math.random() * GAME_W,
    y: style.speedY >= 0 ? -12 : GAME_H + 12,
    speedY: style.speedY * (0.7 + Math.random() * 0.6),
    sway: style.sway,
    phase: Math.random() * Math.PI * 2,
    size: style.size[0] + Math.random() * (style.size[1] - style.size[0]),
    symbol,
    color,
    opacity: 0.3 + Math.random() * 0.3,
  });
}

function updateParticles(dt) {
  const style = PARTICLE_STYLES[state.room];

  if (style && !prefersReducedMotion) {
    particleSpawnAccum += dt;
    if (particleSpawnAccum > style.spawnEvery) {
      particleSpawnAccum = 0;
      const aliveHere = roomParticles.reduce((n, p) => n + (p.room === state.room ? 1 : 0), 0);
      if (aliveHere < style.count) spawnRoomParticle(state.room, style);
    }
  }

  for (let i = roomParticles.length - 1; i >= 0; i--) {
    const p = roomParticles[i];
    if (p.room !== state.room) {
      roomParticles.splice(i, 1);
      continue;
    }
    p.y += p.speedY * dt;
    p.phase += dt;
    if (p.y < -24 || p.y > GAME_H + 24) roomParticles.splice(i, 1);
  }
}

function drawParticles() {
  if (roomParticles.length === 0) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const p of roomParticles) {
    const x = p.x + Math.sin(p.phase * 1.3) * p.sway;
    ctx.globalAlpha = p.opacity;
    ctx.font = `${p.size}px sans-serif`;
    ctx.fillStyle = p.color || "#5C3A47";
    ctx.fillText(p.symbol, x, p.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* =========================================================================
   COLLISION
========================================================================= */
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function moveWithCollision(player, dx, dy, obstacles) {
  const box = { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };

  // move on X, revert if it collides
  box.x += dx;
  for (const o of obstacles) {
    if (rectsOverlap(box, o)) {
      box.x -= dx;
      break;
    }
  }

  // move on Y, revert if it collides
  box.y += dy;
  for (const o of obstacles) {
    if (rectsOverlap(box, o)) {
      box.y -= dy;
      break;
    }
  }

  player.x = Math.max(0, Math.min(GAME_W - PLAYER_W, box.x));
  player.y = Math.max(0, Math.min(GAME_H - PLAYER_H, box.y));
}

/* =========================================================================
   UPDATE LOOP
========================================================================= */
let lastGateWarningAt = 0;
let gateShakeUntil = 0;
let doorHoldTarget = null;
let doorHoldTimer = 0;

function update(dt) {
  const room = rooms[state.room];
  const player = state.player;

  if (!inputState.frozen) {
    const kb = readKeyboardVector();
    let tx = kb.x !== 0 ? kb.x : inputState.joyX;
    let ty = kb.y !== 0 ? kb.y : inputState.joyY;

    const inputMag = Math.hypot(tx, ty);
    if (inputMag > 0.15) {
      tx /= inputMag || 1;
      ty /= inputMag || 1;
    } else {
      tx = 0;
      ty = 0;
    }

    // Ease current velocity toward the target direction instead of
    // snapping instantly -- gives movement a small, natural sense of
    // weight on start/stop rather than feeling perfectly rigid.
    const lerp = 1 - Math.pow(0.0001, dt * PLAYER_ACCEL);
    player.vx += (tx - player.vx) * lerp;
    player.vy += (ty - player.vy) * lerp;
    if (Math.abs(player.vx) < 0.01) player.vx = 0;
    if (Math.abs(player.vy) < 0.01) player.vy = 0;

    const speedMag = Math.hypot(player.vx, player.vy);
    player.moving = speedMag > 0.08;

    if (player.moving) {
      if (Math.abs(player.vx) > Math.abs(player.vy)) {
        player.facing = player.vx > 0 ? "right" : "left";
      } else {
        player.facing = player.vy > 0 ? "down" : "up";
      }
      moveWithCollision(player, player.vx * PLAYER_SPEED * dt, player.vy * PLAYER_SPEED * dt, room.obstacles);
    }

    // doors (walk-into transitions) -- held briefly before firing so a
    // quick pass along an edge doesn't read as an accidental teleport
    const box = { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
    let overlappedDoor = null;

    for (const door of room.doors) {
      if (rectsOverlap(box, door)) {
        if (door.gate && !allRoomsVisited()) {
          const now = performance.now();
          if (now - lastGateWarningAt > 2500) {
            lastGateWarningAt = now;
            gateShakeUntil = now + 420;
            dialogue.show("", [CONFIG.gateLockedMessage]);
          }
          continue;
        }
        overlappedDoor = door;
        break;
      }
    }

    if (overlappedDoor) {
      if (doorHoldTarget !== overlappedDoor) {
        doorHoldTarget = overlappedDoor;
        doorHoldTimer = 0;
      }
      doorHoldTimer += dt;
      if (doorHoldTimer >= DOOR_HOLD_TIME) {
        doorHoldTarget = null;
        doorHoldTimer = 0;
        goToRoomWithFade(overlappedDoor.target, overlappedDoor.spawn);
      }
    } else {
      doorHoldTarget = null;
      doorHoldTimer = 0;
    }
  }

  updateParticles(dt);

  // find nearest non-door interactable within range
  nearestInteractable = null;
  let bestDist = INTERACT_RADIUS;
  const cx = player.x + PLAYER_W / 2;
  const cy = player.y + PLAYER_H / 2;
  for (const obj of room.interactables) {
    const ox = obj.x + obj.w / 2;
    const oy = obj.y + obj.h / 2;
    const d = Math.hypot(cx - ox, cy - oy);
    if (d < bestDist) {
      bestDist = d;
      nearestInteractable = obj;
    }
  }

  if (nearestInteractable && !dialogue.active && !anyModalOpen()) {
    interactPromptEl.classList.remove("hidden");
    // fades in smoothly the closer the player gets, rather than a hard cutoff
    const proximity = 1 - bestDist / INTERACT_RADIUS;
    interactPromptEl.style.opacity = String(Math.max(0.25, Math.min(1, proximity + 0.25)));
  } else {
    interactPromptEl.classList.add("hidden");
  }
}

/* =========================================================================
   RENDERING
========================================================================= */
/* Natural pixel-tile floors, one style per room mood, instead of a flat
   checkerboard -- grass for the outdoor areas, cozy wood planks for the
   library and studio, and a soft party tile for the gift area. */
function drawFloor(theme) {
  const cols = Math.ceil(GAME_W / TILE);
  const rows = Math.ceil(GAME_H / TILE);
  const kind = theme.floor || "grass";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * TILE;
      const y = row * TILE;
      // a gentle irregular blend instead of a strict alternating pattern
      const n = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
      const shade = n > 0.55 ? theme.b : theme.a;
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, TILE, TILE);

      if (kind === "grass") {
        // little tufts of grass, sparse and irregular
        if (n > 0.82) {
          ctx.fillStyle = "rgba(92,58,71,0.10)";
          ctx.fillRect(x + 4, y + TILE - 6, 2, 4);
          ctx.fillRect(x + 11, y + TILE - 7, 2, 5);
        }
      } else if (kind === "wood") {
        // horizontal plank seams
        ctx.strokeStyle = "rgba(92,58,71,0.14)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + TILE - 1);
        ctx.lineTo(x + TILE, y + TILE - 1);
        ctx.stroke();
        if (col % 4 === (row % 2 === 0 ? 0 : 2)) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + TILE);
          ctx.stroke();
        }
      } else if (kind === "party") {
        // soft pastel diamond fleck, like confetti pressed into the tile
        if (n > 0.6) {
          ctx.fillStyle = ["#FFFFFF", "#FFD3E0", "#F5C77E"][Math.floor(n * 7) % 3];
          ctx.globalAlpha = 0.5;
          ctx.save();
          ctx.translate(x + TILE / 2, y + TILE / 2);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-2, -2, 4, 4);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }
    }
  }
}

function drawObstacle(o) {
  if (o.hidden) return; // its visual is drawn separately (building/decor)
  ctx.save();
  ctx.fillStyle = "rgba(92,58,71,0.18)";
  if (o.round) {
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }
  ctx.restore();
}

function drawDoor(door) {
  if (!door.label) return; // hub doors are drawn as part of their building facade
  ctx.save();
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  let ox = door.x + door.w / 2;
  if (door.gate && !allRoomsVisited()) {
    ctx.globalAlpha = 0.45;
    const now = performance.now();
    if (now < gateShakeUntil && !prefersReducedMotion) {
      const remaining = (gateShakeUntil - now) / 420;
      ox += Math.sin(now / 28) * remaining * 4;
    }
  }
  ctx.fillText(door.label, ox, door.y + door.h / 2);
  ctx.restore();
}

/* =========================================================================
   HUB BUILDING FACADES
   Small pixel building fronts standing in for each room's entrance --
   just enough wall, roof, door and windows to read as a building, not a
   full structure. Doors are cut directly at the walk-in trigger zone.
========================================================================= */
function drawBuildingFacade(b, t) {
  const unlocked = b.gate ? allRoomsVisited() : true;
  const locked = b.gate && !unlocked;

  ctx.save();

  if (b.side === "left") {
    // vertical facade hugging the left wall (mirrors "right"), styled
    // with a peaked roof, trim accents, framed windows, and a small
    // music-note accent for the music room.
    const wallX = b.x + 14;
    const wallW = b.w - 14;

    // soft ground shadow for a touch of depth
    ctx.fillStyle = "rgba(92,58,71,0.10)";
    ctx.fillRect(wallX, b.y + b.h - 3, wallW - 2, 3);

    // peaked roof
    ctx.fillStyle = b.roof;
    ctx.beginPath();
    ctx.moveTo(wallX - 2, b.y + 9);
    ctx.lineTo(wallX + wallW / 2, b.y - 3);
    ctx.lineTo(wallX + wallW + 2, b.y + 9);
    ctx.closePath();
    ctx.fill();
    // eave trim accent
    ctx.fillStyle = b.roofAccent;
    ctx.fillRect(wallX - 2, b.y + 8, wallW + 4, 3);

    // wall body
    ctx.fillStyle = b.wall;
    ctx.fillRect(wallX, b.y + 11, wallW, b.h - 11);

    // subtle vertical siding seams
    ctx.strokeStyle = "rgba(92,58,71,0.10)";
    ctx.lineWidth = 1;
    for (let sx = wallX + 5; sx < wallX + wallW - 6; sx += 11) {
      ctx.beginPath();
      ctx.moveTo(sx + 0.5, b.y + 13);
      ctx.lineTo(sx + 0.5, b.y + b.h - 2);
      ctx.stroke();
    }

    // framed windows with sills, set near the inner (right) edge of the wall
    [b.y + 22, b.y + b.h - 30].forEach((wy) => {
      ctx.fillStyle = b.roofAccent;
      ctx.fillRect(wallX + wallW - 18, wy - 2, 12, 13);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(wallX + wallW - 17, wy - 1, 10, 11);
      ctx.fillStyle = "rgba(92,58,71,0.22)";
      ctx.fillRect(wallX + wallW - 16, wy, 8, 9);
      ctx.strokeStyle = "rgba(92,58,71,0.3)";
      ctx.beginPath();
      ctx.moveTo(wallX + wallW - 12, wy);
      ctx.lineTo(wallX + wallW - 12, wy + 9);
      ctx.stroke();
      ctx.fillStyle = b.roofAccent;
      ctx.fillRect(wallX + wallW - 19, wy + 11, 14, 2); // sill
    });

    // little music note, like a shop sign, near the base of the wall
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = b.roofAccent;
    ctx.fillText("♪", wallX + wallW / 2, b.y + b.h - 8);

    // small awning over the door
    ctx.fillStyle = b.roofAccent;
    ctx.beginPath();
    ctx.moveTo(wallX + 6, b.doorY - 6);
    ctx.lineTo(wallX - 10, b.doorY - 2);
    ctx.lineTo(wallX + 6, b.doorY);
    ctx.closePath();
    ctx.fill();

    // door frame + opening
    ctx.fillStyle = b.roofAccent;
    ctx.fillRect(b.x - 2, b.doorY - 2, 16, b.doorH + 4);
    ctx.fillStyle = "#5C3A47";
    ctx.fillRect(b.x, b.doorY, 14, b.doorH);

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(b.label, b.x + 7, b.doorY + b.doorH / 2);
  } else if (b.side === "right") {
    // vertical facade hugging the right wall (mirror of "left"), styled
    // with a peaked roof, trim accents, framed windows, and a small
    // awning over the door instead of flat rectangles.
    const wallX = b.x;
    const wallW = b.w - 14;

    // soft ground shadow for a touch of depth
    ctx.fillStyle = "rgba(92,58,71,0.10)";
    ctx.fillRect(wallX + 2, b.y + b.h - 3, wallW - 2, 3);

    // peaked roof
    ctx.fillStyle = b.roof;
    ctx.beginPath();
    ctx.moveTo(wallX - 2, b.y + 9);
    ctx.lineTo(wallX + wallW / 2, b.y - 3);
    ctx.lineTo(wallX + wallW + 2, b.y + 9);
    ctx.closePath();
    ctx.fill();
    // eave trim accent
    ctx.fillStyle = b.roofAccent;
    ctx.fillRect(wallX - 2, b.y + 8, wallW + 4, 3);

    // wall body
    ctx.fillStyle = b.wall;
    ctx.fillRect(wallX, b.y + 11, wallW, b.h - 11);

    // subtle vertical siding seams
    ctx.strokeStyle = "rgba(92,58,71,0.10)";
    ctx.lineWidth = 1;
    for (let sx = wallX + 9; sx < wallX + wallW - 3; sx += 11) {
      ctx.beginPath();
      ctx.moveTo(sx + 0.5, b.y + 13);
      ctx.lineTo(sx + 0.5, b.y + b.h - 2);
      ctx.stroke();
    }

    // framed windows with sills
    [b.y + 22, b.y + b.h - 30].forEach((wy) => {
      ctx.fillStyle = b.roofAccent;
      ctx.fillRect(wallX + 6, wy - 2, 12, 13);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(wallX + 7, wy - 1, 10, 11);
      ctx.fillStyle = "rgba(92,58,71,0.22)";
      ctx.fillRect(wallX + 8, wy, 8, 9);
      ctx.strokeStyle = "rgba(92,58,71,0.3)";
      ctx.beginPath();
      ctx.moveTo(wallX + 12, wy);
      ctx.lineTo(wallX + 12, wy + 9);
      ctx.stroke();
      ctx.fillStyle = b.roofAccent;
      ctx.fillRect(wallX + 5, wy + 11, 14, 2); // sill
    });

    // small awning over the door
    ctx.fillStyle = b.roofAccent;
    ctx.beginPath();
    ctx.moveTo(wallX + wallW - 6, b.doorY - 6);
    ctx.lineTo(wallX + wallW + 10, b.doorY - 2);
    ctx.lineTo(wallX + wallW - 6, b.doorY);
    ctx.closePath();
    ctx.fill();

    // door frame + opening
    ctx.fillStyle = b.roofAccent;
    ctx.fillRect(wallX + wallW - 2, b.doorY - 2, 16, b.doorH + 4);
    ctx.fillStyle = "#5C3A47";
    ctx.fillRect(wallX + wallW, b.doorY, 14, b.doorH);

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(b.label, wallX + wallW + 7, b.doorY + b.doorH / 2);
  } else {
    // facade opening upward off the top edge (gift / greenhouse)
    let dx = b.doorX + b.doorW / 2;
    if (locked && performance.now() < gateShakeUntil && !prefersReducedMotion) {
      const remaining = (gateShakeUntil - performance.now()) / 420;
      dx += Math.sin(performance.now() / 28) * remaining * 4;
    }

    if (b.kind === "party") {
      // festive birthday facade: scalloped bunting eave, round balloon
      // windows with strings, confetti-colored door trim.
      ctx.fillStyle = "rgba(92,58,71,0.10)";
      ctx.fillRect(b.x + 3, b.y + b.h - 3, b.w - 6, 3);

      // wall body
      ctx.fillStyle = b.wall;
      ctx.fillRect(b.x, b.y + 22, b.w, b.h - 22);

      // scalloped bunting eave instead of a flat strip
      const scallopW = 10;
      for (let sx = b.x; sx < b.x + b.w; sx += scallopW) {
        ctx.fillStyle = Math.floor((sx - b.x) / scallopW) % 2 === 0 ? b.roof : b.roofAccent;
        ctx.beginPath();
        ctx.moveTo(sx, b.y + 14);
        ctx.lineTo(sx + scallopW, b.y + 14);
        ctx.lineTo(sx + scallopW / 2, b.y + 22);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = b.roof;
      ctx.fillRect(b.x, b.y + 14, b.w, 4);

      // round balloon windows either side of the door, with strings
      ctx.fillStyle = b.roofAccent;
      ctx.beginPath();
      ctx.arc(b.x + 18, b.y + 34, 7, 0, Math.PI * 2);
      ctx.arc(b.x + b.w - 18, b.y + 34, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(b.x + 16, b.y + 32, 2.5, 0, Math.PI * 2);
      ctx.arc(b.x + b.w - 20, b.y + 32, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(92,58,71,0.3)";
      ctx.beginPath();
      ctx.moveTo(b.x + 18, b.y + 41);
      ctx.lineTo(b.x + 18, b.y + 46);
      ctx.moveTo(b.x + b.w - 18, b.y + 41);
      ctx.lineTo(b.x + b.w - 18, b.y + 46);
      ctx.stroke();

      // door opening framed with confetti-colored trim
      ctx.fillStyle = b.roofAccent;
      ctx.fillRect(b.doorX - 2, b.y - 2, b.doorW + 4, 16);
      ctx.fillStyle = "#5C3A47";
      ctx.fillRect(b.doorX, b.y, b.doorW, 14);
    } else if (b.kind === "greenhouse") {
      // garden greenhouse facade: arched glass roof, plant boxes under
      // the windows, a trellis-trimmed door.
      // wall body
      ctx.fillStyle = b.wall;
      ctx.fillRect(b.x, b.y + 22, b.w, b.h - 22);

      // arched glass roof instead of a flat lintel
      ctx.fillStyle = b.roof;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + 22);
      ctx.quadraticCurveTo(b.x + b.w / 2, b.y + 2, b.x + b.w, b.y + 22);
      ctx.lineTo(b.x + b.w, b.y + 14);
      ctx.quadraticCurveTo(b.x + b.w / 2, b.y - 6, b.x, b.y + 14);
      ctx.closePath();
      ctx.fill();
      // glass pane seams on the dome
      ctx.strokeStyle = b.roofAccent;
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(b.x + b.w / 2 + i * 16, b.y + 20);
        ctx.quadraticCurveTo(b.x + b.w / 2 + i * 8, b.y + 4, b.x + b.w / 2, b.y + 2);
        ctx.stroke();
      }

      // little plant boxes with sprouting leaves beneath the windows
      [b.x + 10, b.x + b.w - 24].forEach((wx) => {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(wx, b.y + 30, 14, 10);
        ctx.strokeStyle = "rgba(92,58,71,0.25)";
        ctx.strokeRect(wx, b.y + 30, 14, 10);
        ctx.fillStyle = b.roofAccent;
        ctx.fillRect(wx, b.y + 40, 14, 4); // planter box
        ctx.fillStyle = "#8FBF6E";
        ctx.beginPath();
        ctx.arc(wx + 4, b.y + 38, 3, 0, Math.PI * 2);
        ctx.arc(wx + 10, b.y + 36, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // door opening with a trellis-colored frame
      ctx.fillStyle = b.roofAccent;
      ctx.fillRect(b.doorX - 2, b.y - 2, b.doorW + 4, 16);
      ctx.fillStyle = "#5C3A47";
      ctx.fillRect(b.doorX, b.y, b.doorW, 14);
    } else {
      // fallback: original flat-box style for any other top/bottom kind
      ctx.fillStyle = "#5C3A47";
      ctx.fillRect(b.doorX, b.y, b.doorW, 14);
      ctx.fillStyle = b.roof;
      ctx.fillRect(b.x, b.y + 14, b.w, 8);
      ctx.fillStyle = b.wall;
      ctx.fillRect(b.x, b.y + 22, b.w, b.h - 22);
      ctx.fillStyle = "rgba(92,58,71,0.16)";
      ctx.fillRect(b.x + 10, b.y + 30, 10, 10);
      ctx.fillRect(b.x + b.w - 20, b.y + 30, 10, 10);
    }

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(b.label, dx, b.y + 7);

    if (b.gate) {
      if (locked) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#000000";
        ctx.fillRect(b.doorX, b.y, b.doorW, 14);
        ctx.globalAlpha = 1;
        ctx.font = "10px sans-serif";
        ctx.fillText("🔒", dx, b.y + 7);
      } else {
        // gentle golden glow + a couple of sparkles once the gate opens
        const pulse = prefersReducedMotion ? 0.7 : 0.55 + 0.45 * Math.sin(t * 3);
        const grad = ctx.createRadialGradient(dx, b.y + 7, 2, dx, b.y + 7, 26);
        grad.addColorStop(0, `rgba(227,184,115,${0.55 * pulse})`);
        grad.addColorStop(1, "rgba(227,184,115,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dx, b.y + 7, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "10px sans-serif";
        ctx.globalAlpha = pulse;
        ctx.fillText("✨", dx - 20, b.y - 2 + Math.sin(t * 2) * 2);
        ctx.fillText("✨", dx + 20, b.y - 2 + Math.cos(t * 2) * 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  ctx.restore();
}

/* =========================================================================
   ENVIRONMENT / ROOM DECOR
   Purely decorative pixel props -- trees, bushes, library and studio
   furnishings, party details -- with a soft wind sway where it helps
   the space feel alive rather than static.
========================================================================= */
function sway(t, x, amount = 1) {
  return prefersReducedMotion ? 0 : Math.sin(t * 1.4 + x * 0.06) * amount;
}

function drawTree(x, y, t, flip) {
  const s = sway(t, x, 2.5) * (flip ? -1 : 1);
  ctx.save();
  ctx.translate(x, y);
  // trunk
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(-3, 0, 6, 14);
  // canopy, three soft overlapping blobs that sway together
  ctx.translate(0, -2);
  ctx.rotate((s * Math.PI) / 180);
  ctx.fillStyle = "#9FD08A";
  ctx.beginPath();
  ctx.ellipse(0, -14, 15, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(-11, -6, 10, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(11, -6, 10, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#B8E3A6";
  ctx.beginPath();
  ctx.ellipse(-4, -18, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCherryTree(x, y, t, flip) {
  const s = sway(t, x, 2.2) * (flip ? -1 : 1);
  ctx.save();
  ctx.translate(x, y);

  // a scatter of fallen petals resting in the grass at the base
  ctx.fillStyle = "rgba(255,196,214,0.6)";
  const petalSpots = [[-10, 15], [6, 18], [-3, 20], [12, 14], [-14, 12]];
  petalSpots.forEach(([px, py]) => {
    ctx.beginPath();
    ctx.ellipse(px, py, 2.2, 1.3, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // trunk with a small forking branch
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(-3, 0, 6, 15);
  ctx.strokeStyle = "#8A6470";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(flip ? -8 : 8, -8);
  ctx.stroke();

  ctx.translate(0, -3);
  ctx.rotate((s * Math.PI) / 180);

  // full, soft blossom-pink canopy
  ctx.fillStyle = "#FFC4D6";
  ctx.beginPath();
  ctx.ellipse(0, -16, 17, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(-13, -8, 11, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(13, -8, 11, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(0, -26, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // lighter highlight cluster
  ctx.fillStyle = "#FFE1EC";
  ctx.beginPath();
  ctx.ellipse(-5, -21, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // deeper shaded clusters for a little depth
  ctx.fillStyle = "#F79FBF";
  ctx.beginPath();
  ctx.ellipse(9, -6, 6, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(-10, -4, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // tiny blossom-fleck texture across the canopy
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 12, -16 + Math.sin(a) * 10, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // one petal actively drifting down and away from the canopy, looping
  const drift = prefersReducedMotion ? 0 : (t * 14 + x) % 30;
  ctx.fillStyle = "rgba(255,196,214,0.85)";
  ctx.save();
  ctx.translate((flip ? -1 : 1) * (16 + drift * 0.6), -4 + drift);
  ctx.rotate(drift * 0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, 2.4, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawBush(x, y, t) {
  const s = sway(t, x, 1.2);
  ctx.save();
  ctx.translate(x + s, y);
  ctx.fillStyle = "#8FC97D";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(-10, 2, 8, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 2, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FF97B4";
  ctx.beginPath();
  ctx.arc(-6, -2, 1.6, 0, Math.PI * 2);
  ctx.arc(5, -3, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlant(x, y, t) {
  const s = sway(t, x, 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#7BAA63";
  for (let i = -1; i <= 1; i++) {
    ctx.save();
    ctx.translate(i * 4, 0);
    ctx.rotate(((s * i) * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, -8, 3, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawLeafPatch(x, y, t) {
  ctx.save();
  ctx.font = "10px sans-serif";
  ctx.globalAlpha = 0.8;
  ctx.fillText("🍃", x + sway(t, x, 3), y);
  ctx.fillText("🍃", x + 10 + sway(t, x + 10, 3), y + 4);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawGardenFlower(x, y, t, color) {
  const s = sway(t, x, 4);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((s * Math.PI) / 180);
  ctx.strokeStyle = "#7BAA63";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(0, -6);
  ctx.stroke();
  ctx.fillStyle = color || "#FFD3E0";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 4, -6 + Math.sin(a) * 4, 2.6, 1.8, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#F5C77E";
  ctx.beginPath();
  ctx.arc(0, -6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* =========================================================================
   FLOWER GARDEN DRESSING
   A mossy rock cluster and a stone birdbath give the two obstacle spots an
   actual identity, flowerbeds ground the interactable flowers in real soil,
   a stepping-stone path and a climbing trellis add structure, and a few
   drifting butterflies keep the whole scene gently alive.
========================================================================= */
function drawRockCluster(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(14, 23, 17, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#AFA898";
  ctx.beginPath();
  ctx.ellipse(20, 12, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.ellipse(16, 8, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#948C7C";
  ctx.beginPath();
  ctx.ellipse(9, 17, 13, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.ellipse(4, 12, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // moss tufts and a couple of tiny flowers tucked at the base
  ctx.fillStyle = "#7BAA63";
  ctx.beginPath();
  ctx.ellipse(1, 9, 3, 2, 0.3, 0, Math.PI * 2);
  ctx.ellipse(19, 4, 3, 2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFD3E0";
  ctx.beginPath();
  ctx.arc(-2, 21, 1.4, 0, Math.PI * 2);
  ctx.arc(25, 20, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBirdbath(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(12, 25, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // pedestal
  ctx.fillStyle = "#C7C0B2";
  ctx.fillRect(9, 10, 6, 14);
  ctx.beginPath();
  ctx.ellipse(12, 24, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // basin + water
  ctx.fillStyle = "#B7AFA0";
  ctx.beginPath();
  ctx.ellipse(12, 8, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#BFE0F0";
  ctx.beginPath();
  ctx.ellipse(12, 7, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // a soft glint that drifts across the water
  const glint = prefersReducedMotion ? 0.6 : 0.5 + 0.5 * Math.sin(t * 2 + x);
  ctx.fillStyle = `rgba(255,255,255,${0.55 * glint})`;
  ctx.beginPath();
  ctx.ellipse(8 + Math.sin(t * 0.6) * 2, 6, 2.4, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFlowerbed(cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(139,110,80,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(92,58,71,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#7BAA63";
  ctx.beginPath();
  ctx.ellipse(-9, -2, 3, 1.6, -0.4, 0, Math.PI * 2);
  ctx.ellipse(10, -1.5, 3, 1.6, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSteppingStone(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 2.5, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C7BFAE";
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.ellipse(-2.5, -1.5, 3, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTrellis(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.1)";
  ctx.beginPath();
  ctx.ellipse(20, 47, 20, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#C99A55";
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 4, 36, 40);
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(2 + i * 9, 4);
    ctx.lineTo(2 + i * 9, 44);
    ctx.stroke();
  }
  for (let j = 1; j < 4; j++) {
    ctx.beginPath();
    ctx.moveTo(2, 4 + j * 10);
    ctx.lineTo(38, 4 + j * 10);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(2, 4);
  ctx.quadraticCurveTo(20, -10, 38, 4);
  ctx.stroke();

  // climbing vine dotted with little flowers
  const petalColors = ["#FF97B4", "#FFD3E0", "#C9A6E0"];
  for (let i = 0; i < 10; i++) {
    const along = i / 10;
    const px = 2 + along * 36 + Math.sin(t + i) * 1.4;
    const py = 6 + Math.sin(along * Math.PI) * -8 + (i % 2 === 0 ? 6 : 20);
    ctx.fillStyle = "#7BAA63";
    ctx.beginPath();
    ctx.ellipse(px, py, 2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = petalColors[i % petalColors.length];
    ctx.beginPath();
    ctx.arc(px + 2, py - 1, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawButterfly(x, y, t, seed = 0) {
  const driftX = prefersReducedMotion ? 0 : Math.sin(t * 0.9 + seed) * 16;
  const driftY = prefersReducedMotion ? 0 : Math.cos(t * 1.3 + seed * 1.7) * 8 - 4;
  const flap = prefersReducedMotion ? 0.8 : 0.5 + 0.5 * Math.sin(t * 12 + seed * 3);
  const colors = ["#FF97B4", "#C9A6E0", "#F5C77E"];
  ctx.save();
  ctx.translate(x + driftX, y + driftY);
  ctx.fillStyle = colors[seed % colors.length];

  ctx.save();
  ctx.translate(-0.5, 0);
  ctx.scale(0.5 + flap * 0.5, 1);
  ctx.beginPath();
  ctx.ellipse(-3, -2.5, 3.4, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(-2.6, 2, 2.6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(0.5, 0);
  ctx.scale(0.5 + flap * 0.5, 1);
  ctx.beginPath();
  ctx.ellipse(3, -2.5, 3.4, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(2.6, 2, 2.6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#5C3A47";
  ctx.fillRect(-0.6, -3, 1.2, 6);
  ctx.restore();
}

function drawBookshelf(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // soft ground shadow so it reads as standing on the floor, not floating
  ctx.fillStyle = "rgba(92,58,71,0.16)";
  ctx.beginPath();
  ctx.ellipse(24, 102, 26, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8A6470";
  ctx.fillRect(0, 0, 48, 100);
  // left-edge shading for a touch of depth
  ctx.fillStyle = "rgba(92,58,71,0.28)";
  ctx.fillRect(0, 0, 5, 100);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(43, 0, 5, 100);

  const colors = ["#FF97B4", "#8FB3D9", "#C9A6E0", "#F5C77E", "#9FD08A"];
  for (let row = 0; row < 4; row++) {
    ctx.fillStyle = "#F7EAD8";
    ctx.fillRect(4, 6 + row * 24, 40, 18);
    // shelf-plank shadow line
    ctx.fillStyle = "rgba(92,58,71,0.22)";
    ctx.fillRect(4, 6 + row * 24 + 17, 40, 2);
    let bx = 6;
    for (let i = 0; i < 7; i++) {
      const leanAngle = ((row + i) % 3 === 0) ? -0.06 : 0;
      ctx.save();
      ctx.translate(bx + 2, 8 + row * 24 + 14);
      ctx.rotate(leanAngle);
      ctx.fillStyle = colors[(row + i) % colors.length];
      ctx.fillRect(-2, -14, 4, 14);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(-2, -14, 1, 14);
      ctx.restore();
      bx += 5;
    }
  }

  // little top ledge with a small trinket, so the shelf doesn't end flatly
  ctx.fillStyle = "#5C3A47";
  ctx.fillRect(-2, -4, 52, 4);
  ctx.fillStyle = "#7BAA63";
  ctx.beginPath();
  ctx.ellipse(38, -8, 5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C99A55";
  ctx.fillRect(35, -6, 6, 4);
  ctx.restore();
}

function drawRug(x, y, w, h) {
  ctx.save();
  // faint shadow underneath so it sits on the floor rather than floating on it
  ctx.fillStyle = "rgba(92,58,71,0.08)";
  roundRectFill(ctx, x + 3, y + 4, w, h, 12);

  ctx.fillStyle = "rgba(255,151,180,0.24)";
  roundRectFill(ctx, x, y, w, h, 10);
  ctx.strokeStyle = "rgba(255,151,180,0.45)";
  ctx.lineWidth = 3;
  roundRectStroke(ctx, x + 5, y + 5, w - 10, h - 10, 8);
  ctx.strokeStyle = "rgba(255,151,180,0.3)";
  ctx.lineWidth = 1;
  roundRectStroke(ctx, x + 10, y + 10, w - 20, h - 20, 6);

  // woven diamond motif down the centre, like a real patterned rug
  ctx.strokeStyle = "rgba(199,122,151,0.35)";
  ctx.lineWidth = 1.4;
  const cx = x + w / 2;
  const cy = y + h / 2;
  for (let i = -1; i <= 1; i++) {
    const dx = cx + i * 30;
    ctx.beginPath();
    ctx.moveTo(dx, cy - 14);
    ctx.lineTo(dx + 10, cy);
    ctx.lineTo(dx, cy + 14);
    ctx.lineTo(dx - 10, cy);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function roundRectStroke(targetCtx, x, y, w, h, r) {
  targetCtx.beginPath();
  if (targetCtx.roundRect) {
    targetCtx.roundRect(x, y, w, h, r);
  } else {
    targetCtx.moveTo(x + r, y);
    targetCtx.arcTo(x + w, y, x + w, y + h, r);
    targetCtx.arcTo(x + w, y + h, x, y + h, r);
    targetCtx.arcTo(x, y + h, x, y, r);
    targetCtx.arcTo(x, y, x + w, y, r);
  }
  targetCtx.stroke();
}

function drawPapers(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#FFFDF7";
  ctx.save(); ctx.rotate(-0.08); ctx.fillRect(0, 0, 16, 12); ctx.restore();
  ctx.save(); ctx.translate(8, 3); ctx.rotate(0.12); ctx.fillRect(0, 0, 16, 12); ctx.restore();
  ctx.restore();
}

function drawLamp(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(6, 10, 4, 20);
  const glow = prefersReducedMotion ? 0.7 : 0.6 + 0.4 * Math.sin(t * 2 + x);
  ctx.fillStyle = "#E3B873";
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(16, 10);
  ctx.lineTo(12, 0);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();
  const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 16);
  grad.addColorStop(0, `rgba(255,224,150,${0.5 * glow})`);
  grad.addColorStop(1, "rgba(255,224,150,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(8, 8, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* =========================================================================
   LETTER ROOM DRESSING
   A back wall with a window, framed keepsakes and a clock, plus a proper
   writing desk and chair -- so the room reads as a real, lived-in study
   instead of an open floor with two bookshelves on it.
========================================================================= */
function drawWallBand(x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color || "#E8D3B0";
  ctx.fillRect(x, y, w, h);
  // faint vertical wallpaper stripes
  ctx.strokeStyle = "rgba(92,58,71,0.06)";
  ctx.lineWidth = 1;
  for (let sx = x + 6; sx < x + w; sx += 14) {
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx, y + h);
    ctx.stroke();
  }
  // wainscoting trim where the wall meets the floor
  ctx.fillStyle = "#C99A55";
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.fillStyle = "rgba(92,58,71,0.3)";
  ctx.fillRect(x, y + h - 4, w, 1);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.restore();
}

function drawWindow(x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  // soft daylight spilling onto the floor below the window
  const glow = ctx.createRadialGradient(24, 55, 4, 24, 55, 60);
  glow.addColorStop(0, "rgba(255,247,224,0.32)");
  glow.addColorStop(1, "rgba(255,247,224,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(24, 58, 60, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // frame
  ctx.fillStyle = "#C99A55";
  ctx.fillRect(-3, -3, 54, 40);
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 34);
  sky.addColorStop(0, "#BFE0F0");
  sky.addColorStop(1, "#EAF6FB");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 48, 34);
  // little clouds
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(13, 10, 7, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(30, 19, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // mullions
  ctx.strokeStyle = "#C99A55";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(24, 34);
  ctx.moveTo(0, 17);
  ctx.lineTo(48, 17);
  ctx.stroke();
  // sill
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(-5, 34, 58, 4);

  // curtain rod
  ctx.strokeStyle = "#8A6470";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-9, -6);
  ctx.lineTo(57, -6);
  ctx.stroke();

  // softly swaying curtains
  const sway = prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 1.6;
  ctx.fillStyle = "rgba(255,151,180,0.55)";
  ctx.beginPath();
  ctx.moveTo(-4, -5);
  ctx.quadraticCurveTo(-11 + sway, 18, -4, 38);
  ctx.lineTo(2, 38);
  ctx.quadraticCurveTo(-1, 18, 2, -5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(46, -5);
  ctx.quadraticCurveTo(53 - sway, 18, 46, 38);
  ctx.lineTo(52, 38);
  ctx.quadraticCurveTo(55, 18, 52, -5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawFrame(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.fillRect(2, 2, 22, 26);
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(0, 0, 22, 26);
  ctx.fillStyle = "#FFFDF7";
  ctx.fillRect(3, 3, 16, 20);
  // a small hand-drawn keepsake inside -- a heart, kept simple and warm
  ctx.strokeStyle = "rgba(255,125,160,0.6)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(11, 18);
  ctx.bezierCurveTo(4, 11, 6, 6, 11, 10);
  ctx.bezierCurveTo(16, 6, 18, 11, 11, 18);
  ctx.stroke();
  ctx.restore();
}

function drawWallClock(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.arc(1, 1, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8A6470";
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFDF7";
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(92,58,71,0.4)";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 7.5, Math.sin(a) * 7.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#5C3A47";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  const hourAngle = t * 0.05;
  const minAngle = t * 0.3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hourAngle) * 4, Math.sin(hourAngle) * 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(minAngle) * 6.5, Math.sin(minAngle) * 6.5);
  ctx.stroke();
  ctx.fillStyle = "#5C3A47";
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawChair(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.14)";
  ctx.beginPath();
  ctx.ellipse(13, 32, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // backrest
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(4, 0, 18, 6);
  ctx.fillRect(4, 0, 4, 20);
  ctx.fillRect(18, 0, 4, 20);
  // seat cushion
  ctx.fillStyle = "#FF97B4";
  roundRectFill(ctx, 2, 16, 22, 6, 2);
  // legs
  ctx.fillStyle = "#5C3A47";
  ctx.fillRect(4, 22, 3, 10);
  ctx.fillRect(21, 22, 3, 10);
  ctx.restore();
}

function drawWritingDesk(x, y, w, h, t) {
  ctx.save();
  // ground shadow
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(x + 5, y + h - 4, 5, 16);
  ctx.fillRect(x + w - 10, y + h - 4, 5, 16);

  // desktop
  ctx.fillStyle = "#C99A55";
  roundRectFill(ctx, x, y, w, h, 4);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + 2, y + 2, w - 4, 3);
  ctx.fillStyle = "rgba(92,58,71,0.25)";
  ctx.fillRect(x, y + h - 6, w, 6);

  // drawer with a little pull
  ctx.strokeStyle = "rgba(92,58,71,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + w / 2 - 15, y + h - 16, 30, 9);
  ctx.fillStyle = "#5C3A47";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h - 11.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // a small tidy stack of letters on the desk
  ctx.fillStyle = "#FFFDF7";
  ctx.save();
  ctx.translate(x + 10, y + 6);
  ctx.rotate(-0.08);
  ctx.fillRect(0, 0, 18, 13);
  ctx.restore();
  ctx.save();
  ctx.translate(x + 15, y + 9);
  ctx.rotate(0.1);
  ctx.fillRect(0, 0, 18, 13);
  ctx.restore();
  ctx.strokeStyle = "rgba(92,58,71,0.2)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 15, y + 9, 18, 13);

  // inkwell and quill
  ctx.fillStyle = "#3A2E4D";
  ctx.beginPath();
  ctx.ellipse(x + w - 18, y + 12, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#E3B873";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + w - 18, y + 10);
  ctx.lineTo(x + w - 11, y - 6);
  ctx.stroke();

  // a small flickering candle
  const flick = prefersReducedMotion ? 0.7 : 0.6 + 0.4 * Math.sin(t * 6 + x);
  const candleX = x + w - 30;
  const candleY = y - 2;
  const glowGrad = ctx.createRadialGradient(candleX + 2.5, candleY - 2, 1, candleX + 2.5, candleY - 2, 16);
  glowGrad.addColorStop(0, `rgba(255,224,150,${0.42 * flick})`);
  glowGrad.addColorStop(1, "rgba(255,224,150,0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(candleX + 2.5, candleY - 2, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFDF7";
  ctx.fillRect(candleX, candleY, 5, 10);
  ctx.fillStyle = "#E3B873";
  ctx.beginPath();
  ctx.ellipse(candleX + 2.5, candleY - 3, 2 * flick, 3 * flick, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPottedPlant(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.14)";
  ctx.beginPath();
  ctx.ellipse(10, 33, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // pot
  ctx.fillStyle = "#C99A55";
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(20, 20);
  ctx.lineTo(17, 32);
  ctx.lineTo(3, 32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(92,58,71,0.2)";
  ctx.fillRect(0, 19, 20, 3);
  // leaves
  ctx.fillStyle = "#7BAA63";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(10 + Math.cos(a) * 6, 10 + Math.sin(a) * 6, 5, 3, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#9FD08A";
  ctx.beginPath();
  ctx.ellipse(10, 6, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAcousticGuitar(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.15);

  // neck
  ctx.strokeStyle = "#8A6470";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6, 40);
  ctx.lineTo(6, 4);
  ctx.stroke();

  // headstock with little tuning pegs
  ctx.fillStyle = "#8A6470";
  ctx.beginPath();
  ctx.ellipse(6, 1, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C99A55";
  ctx.beginPath();
  ctx.arc(2, -2, 1, 0, Math.PI * 2);
  ctx.arc(10, -2, 1, 0, Math.PI * 2);
  ctx.arc(2, 3, 1, 0, Math.PI * 2);
  ctx.arc(10, 3, 1, 0, Math.PI * 2);
  ctx.fill();

  // warm wood-toned figure-8 body
  ctx.fillStyle = "#C99A55";
  ctx.beginPath();
  ctx.ellipse(6, 44, 9, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(6, 60, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(92,58,71,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(6, 44, 9, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(6, 60, 11, 13, 0, 0, Math.PI * 2);
  ctx.stroke();

  // sound hole
  ctx.fillStyle = "#5C3A47";
  ctx.beginPath();
  ctx.arc(6, 50, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // bridge
  ctx.fillStyle = "#3A2E4D";
  ctx.fillRect(2, 66, 8, 2);

  // strings running the length of the neck and body
  ctx.strokeStyle = "rgba(255,253,247,0.5)";
  ctx.lineWidth = 0.6;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(6 + i * 1.4, 4);
    ctx.lineTo(6 + i * 1.4, 66);
    ctx.stroke();
  }

  ctx.restore();
}

function addRoundRectPath(path, x, y, w, h, r) {
  path.moveTo(x + r, y);
  path.arcTo(x + w, y, x + w, y + h, r);
  path.arcTo(x + w, y + h, x, y + h, r);
  path.arcTo(x, y + h, x, y, r);
  path.arcTo(x, y, x + w, y, r);
  path.closePath();
}

function drawElectricGuitar(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.15);

  // slim neck -- width matches the narrow base of the headstock (4 to 9)
  ctx.fillStyle = "#3A2E4D";
  ctx.fillRect(4, 2, 5, 44);

  // headstock now tapers FROM the neck width, flaring out toward the tip,
  // with all 6 tuning pegs inline along one edge -- true Strat-style
  ctx.fillStyle = "#3A2E4D";
  ctx.beginPath();
  ctx.moveTo(4, 2);
  ctx.lineTo(9, 2);
  ctx.lineTo(14, -12);
  ctx.lineTo(1, -12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#C99A55";
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const px = 9 + 5 * t + 1.2;   // walk the flared edge, offset outward
    const py = 2 - 14 * t;
    ctx.beginPath();
    ctx.arc(px, py, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // solid double-cutaway body: outer rounded shape with TWO horn cutouts
  // (one each side of the neck), built as a single path so the compositing
  // bug from `destination-out` can't touch the neck/headstock pixels
  const bodyPath = new Path2D();
  addRoundRectPath(bodyPath, -8, 42, 30, 34, 7);
  bodyPath.arc(-5, 42, 9, 0, Math.PI * 2);  // bass-side horn
  bodyPath.arc(16, 40, 7, 0, Math.PI * 2);  // treble-side horn

  ctx.fillStyle = "#9f242c";
  ctx.fill(bodyPath, "evenodd");

  // highlight, clipped to the body so it can't spill into the cutaway gaps
  ctx.save();
  ctx.clip(bodyPath, "evenodd");
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(-8, 43, 30, 2);
  ctx.restore();

  // pickups
  ctx.fillStyle = "#1E1730";
  ctx.fillRect(-2, 54, 12, 3);
  ctx.fillRect(-2, 62, 12, 3);

  // volume + tone knobs
  ctx.fillStyle = "#C99A55";
  ctx.beginPath();
  ctx.arc(14, 68, 2.2, 0, Math.PI * 2);
  ctx.arc(14, 74, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // strings, drawn last so they sit on top of everything, running the full
  // length from the nut down over the pickups to the bridge
  ctx.strokeStyle = "rgba(255,253,247,0.6)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const sx = 5 + i * 0.9;
    ctx.beginPath();
    ctx.moveTo(sx, -10);
    ctx.lineTo(sx, 72);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPiano(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#5C3A47";
  ctx.fillRect(0, 0, 60, 26);
  ctx.fillStyle = "#FFFDF7";
  for (let i = 0; i < 8; i++) ctx.fillRect(4 + i * 7, 2, 5, 14);
  ctx.fillStyle = "#3A2E4D";
  for (let i = 0; i < 7; i++) ctx.fillRect(7 + i * 7, 2, 3, 9);
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(0, 16, 60, 10);
  ctx.restore();
}

function drawAmp(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#5C3A47";
  ctx.fillRect(0, 0, 34, 30);
  ctx.fillStyle = "#3A2E4D";
  ctx.beginPath();
  ctx.arc(11, 15, 8, 0, Math.PI * 2);
  ctx.arc(25, 15, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNotesWallpaper(t) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#FF7DA0";
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 60;
    const y = 20 + Math.sin(t + i) * 4;
    ctx.fillText("♪", x, y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* =========================================================================
   MUSIC ROOM DRESSING
   A proper vintage radio set on its table, a mirrorball hanging from the
   ceiling, a mic stand and a crate of records -- so the room reads like an
   actual little studio hangout instead of a couple of instruments on an
   open floor.
========================================================================= */
function drawRadioBox(x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  // contact shadow on the table below
  ctx.fillStyle = "rgba(92,58,71,0.18)";
  ctx.beginPath();
  ctx.ellipse(29, 42, 30, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // telescoping antenna, gently swaying like it's picking up a signal
  const sway = prefersReducedMotion ? 0 : Math.sin(t * 1.6) * 2;
  ctx.strokeStyle = "#8A6470";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(48, 4);
  ctx.lineTo(48, -16);
  ctx.lineTo(48 + sway, -28);
  ctx.stroke();

  // body + inset panel
  ctx.fillStyle = "#8A6470";
  roundRectFill(ctx, 0, 4, 58, 36, 6);
  ctx.fillStyle = "#5C3A47";
  roundRectFill(ctx, 2, 6, 54, 32, 5);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(3, 7, 52, 3);

  // left speaker grille, concentric rings
  ctx.fillStyle = "#3A2E4D";
  ctx.beginPath();
  ctx.arc(16, 23, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,253,247,0.3)";
  ctx.lineWidth = 0.8;
  for (let ring = 3; ring <= 9; ring += 3) {
    ctx.beginPath();
    ctx.arc(16, 23, ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  // right panel: a little glowing tuner dial + two knobs
  const pulse = prefersReducedMotion ? 0.75 : 0.55 + 0.45 * Math.sin(t * 3);
  ctx.fillStyle = "#FFFDF7";
  roundRectFill(ctx, 32, 11, 22, 9, 2);
  ctx.fillStyle = `rgba(255,125,160,${pulse})`;
  ctx.fillRect(32 + 8 + Math.sin(t * 0.7) * 5, 12.5, 2, 6);
  ctx.fillStyle = "#C99A55";
  ctx.beginPath();
  ctx.arc(38, 28, 3.6, 0, Math.PI * 2);
  ctx.arc(51, 28, 3.6, 0, Math.PI * 2);
  ctx.fill();

  // warm "powered on" glow spilling from the speaker
  const grad = ctx.createRadialGradient(16, 23, 1, 16, 23, 22);
  grad.addColorStop(0, `rgba(255,224,150,${0.35 * pulse})`);
  grad.addColorStop(1, "rgba(255,224,150,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(16, 23, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDiscoBall(x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  // wire down from the ceiling
  ctx.strokeStyle = "rgba(92,58,71,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -46);
  ctx.lineTo(0, -6);
  ctx.stroke();

  // soft light spill beneath it
  const glow = ctx.createRadialGradient(0, 8, 2, 0, 8, 28);
  glow.addColorStop(0, "rgba(255,255,255,0.2)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 8, 28, 0, Math.PI * 2);
  ctx.fill();

  // mirrored ball body
  ctx.fillStyle = "#C7D2DB";
  ctx.beginPath();
  ctx.arc(0, 8, 10, 0, Math.PI * 2);
  ctx.fill();

  // facet grid
  ctx.strokeStyle = "rgba(92,58,71,0.25)";
  ctx.lineWidth = 0.6;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-9.5, 8 + i * 3.6);
    ctx.lineTo(9.5, 8 + i * 3.6);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(0, 18);
  ctx.moveTo(-6, 1);
  ctx.lineTo(-6, 15);
  ctx.moveTo(6, 1);
  ctx.lineTo(6, 15);
  ctx.stroke();

  // rotating sparkle glints
  const spin = prefersReducedMotion ? 0 : t * 0.6;
  for (let i = 0; i < 4; i++) {
    const a = spin + (i / 4) * Math.PI * 2;
    const gx = Math.cos(a) * 8;
    const gy = 8 + Math.sin(a) * 3;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(gx, gy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawMicStand(x, y) {
  ctx.save();
  ctx.translate(x, y);

  // ground shadow
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(10, 55, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#5C3A47";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  // tripod legs
  ctx.beginPath();
  ctx.moveTo(10, 50);
  ctx.lineTo(-4, 57);
  ctx.moveTo(10, 50);
  ctx.lineTo(10, 58);
  ctx.moveTo(10, 50);
  ctx.lineTo(24, 57);
  ctx.stroke();

  // pole
  ctx.beginPath();
  ctx.moveTo(10, 50);
  ctx.lineTo(10, 6);
  ctx.stroke();

  // angled boom arm
  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.lineTo(23, 1);
  ctx.stroke();

  // mic head with a soft pop-filter mesh
  ctx.fillStyle = "#3A2E4D";
  ctx.beginPath();
  ctx.ellipse(26, -1, 7, 5, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,253,247,0.35)";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(23 + i * 2, -2 + (i % 2), 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // cable trailing and curling on the floor
  ctx.strokeStyle = "rgba(92,58,71,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(10, 50);
  ctx.quadraticCurveTo(-6, 54, 0, 61);
  ctx.quadraticCurveTo(8, 66, 4, 58);
  ctx.stroke();

  ctx.restore();
}

function drawVinylCrate(x, y) {
  ctx.save();
  ctx.translate(x, y);

  // shadow
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(22, 48, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // records fanned out, peeking above the crate rim
  const colors = ["#FF97B4", "#8FB3D9", "#F5C77E", "#C9A6E0"];
  colors.forEach((c, i) => {
    ctx.save();
    ctx.translate(11 + i * 8, 22);
    ctx.rotate(-0.24 + i * 0.16);
    ctx.fillStyle = c;
    ctx.fillRect(-9, -24, 18, 26);
    ctx.fillStyle = "#3A2E4D";
    ctx.beginPath();
    ctx.arc(0, -24, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#5C3A47";
    ctx.beginPath();
    ctx.arc(0, -24, 2, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  });

  // crate
  ctx.fillStyle = "#C99A55";
  roundRectFill(ctx, 0, 22, 44, 26, 3);
  ctx.strokeStyle = "rgba(92,58,71,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 24, 40, 22);
  ctx.beginPath();
  ctx.moveTo(15, 24);
  ctx.lineTo(15, 46);
  ctx.moveTo(29, 24);
  ctx.lineTo(29, 46);
  ctx.stroke();

  ctx.restore();
}

function drawRecordFrame(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // shadow + frame, matching the keepsake frames used elsewhere
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.fillRect(2, 2, 22, 26);
  ctx.fillStyle = "#8A6470";
  ctx.fillRect(0, 0, 22, 26);
  ctx.fillStyle = "#FFFDF7";
  ctx.fillRect(3, 3, 16, 20);
  // a little vinyl record keepsake instead of a heart
  ctx.fillStyle = "#3A2E4D";
  ctx.beginPath();
  ctx.arc(11, 13, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,253,247,0.45)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(11, 13, 4.5, 0, Math.PI * 2);
  ctx.arc(11, 13, 2.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#FF7DA0";
  ctx.beginPath();
  ctx.arc(11, 13, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* --- extra studio dressing: acoustic foam, a neon sign, string lights,
   monitor speakers and a stool, layered on to push the room from "has
   instruments in it" toward "an actual little recording studio" --- */
function drawFoamPanel(x, y) {
  ctx.save();
  ctx.translate(x, y);
  const cols = 3, rows = 2, cell = 8, gap = 1;
  const palette = ["#8A6470", "#5C3A47", "#C9A6E0"];
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.fillRect(-1, -1, cols * (cell + gap) + 1, rows * (cell + gap) + 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * (cell + gap);
      const py = r * (cell + gap);
      ctx.fillStyle = palette[(r + c) % palette.length];
      ctx.fillRect(px, py, cell, cell);
      // beveled pyramid highlight, the classic foam-tile look
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.moveTo(px + cell / 2, py + 1);
      ctx.lineTo(px + cell - 1, py + cell / 2);
      ctx.lineTo(px + cell / 2, py + cell - 1);
      ctx.lineTo(px + 1, py + cell / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawNeonSign(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  const pulse = prefersReducedMotion ? 0.85 : 0.65 + 0.35 * Math.sin(t * 2.4);

  // dark backing plate
  ctx.fillStyle = "rgba(58,46,77,0.85)";
  roundRectFill(ctx, -4, -4, 42, 32, 4);

  // glow behind the tubes
  const glow = ctx.createRadialGradient(17, 12, 2, 17, 12, 26);
  glow.addColorStop(0, `rgba(255,151,180,${0.5 * pulse})`);
  glow.addColorStop(1, "rgba(255,151,180,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(17, 12, 26, 0, Math.PI * 2);
  ctx.fill();

  // neon-tube double note glyph
  ctx.strokeStyle = `rgba(255,151,180,${0.7 + 0.3 * pulse})`;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255,151,180,0.9)";
  ctx.shadowBlur = 6 * pulse;
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.lineTo(10, 4);
  ctx.lineTo(26, 2);
  ctx.lineTo(26, 17);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(7, 22, 4, 3, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(23, 19, 4, 3, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawFairyLights(x, y, w, t) {
  ctx.save();
  ctx.translate(x, y);

  // sagging wire
  ctx.strokeStyle = "rgba(92,58,71,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w / 2, 9, w, 0);
  ctx.stroke();

  const colors = ["#FF97B4", "#F5C77E", "#8FB3D9", "#C9A6E0", "#FFD3E0"];
  const bulbCount = Math.max(3, Math.round(w / 20));
  for (let i = 0; i <= bulbCount; i++) {
    const f = i / bulbCount;
    const bx = f * w;
    const by = Math.sin(f * Math.PI) * 9; // follows the wire's curve
    const twinkle = prefersReducedMotion ? 0.75 : 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
    const c = colors[i % colors.length];

    ctx.globalAlpha = twinkle;
    const bulbGlow = ctx.createRadialGradient(bx, by + 2, 0.5, bx, by + 2, 6);
    bulbGlow.addColorStop(0, c);
    bulbGlow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bulbGlow;
    ctx.beginPath();
    ctx.arc(bx, by + 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(bx, by + 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawStudioMonitor(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(11, 34, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // cabinet
  ctx.fillStyle = "#3A2E4D";
  roundRectFill(ctx, 0, 0, 22, 32, 3);
  // woofer
  ctx.fillStyle = "#1E1730";
  ctx.beginPath();
  ctx.arc(11, 21, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(11, 21, 4.5, 0, Math.PI * 2);
  ctx.stroke();
  // tweeter
  ctx.fillStyle = "#1E1730";
  ctx.beginPath();
  ctx.arc(11, 8, 3, 0, Math.PI * 2);
  ctx.fill();
  // brand accent strip
  ctx.fillStyle = "rgba(255,151,180,0.7)";
  ctx.fillRect(4, 29, 14, 1.4);
  ctx.restore();
}

function drawStool(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(92,58,71,0.15)";
  ctx.beginPath();
  ctx.ellipse(11, 26, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // legs, splayed tripod-style
  ctx.strokeStyle = "#8A6470";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(4, 8);
  ctx.lineTo(-2, 24);
  ctx.moveTo(11, 9);
  ctx.lineTo(11, 26);
  ctx.moveTo(18, 8);
  ctx.lineTo(24, 24);
  ctx.moveTo(0, 18);
  ctx.lineTo(22, 18);
  ctx.stroke();
  // round cushioned seat
  ctx.fillStyle = "rgba(92,58,71,0.2)";
  ctx.beginPath();
  ctx.ellipse(11, 7.5, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C99A55";
  ctx.beginPath();
  ctx.ellipse(11, 6, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTable(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#C99A55";
  roundRectFill(ctx, x, y, w, h, 6);
  ctx.fillStyle = "rgba(92,58,71,0.25)";
  ctx.fillRect(x, y + h - 6, w, 6);
  ctx.strokeStyle = "rgba(92,58,71,0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 14);
  ctx.restore();
}

function drawBalloon(x, y, color, t) {
  const bob = sway(t, x, 4);
  ctx.save();
  ctx.translate(x, y + bob);

  // string with a little curled ribbon tail instead of a bare line
  ctx.strokeStyle = "rgba(92,58,71,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(0, 34);
  ctx.quadraticCurveTo(3, 38, 0, 41);
  ctx.quadraticCurveTo(-3, 44, 0, 47);
  ctx.stroke();

  // balloon body with a richer gradient instead of a flat fill
  const grad = ctx.createRadialGradient(-3, -4, 1, 0, 0, 14);
  grad.addColorStop(0, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, shadeColor(color, -12));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // little knot where the string ties on
  ctx.fillStyle = shadeColor(color, -18);
  ctx.beginPath();
  ctx.moveTo(-2, 12);
  ctx.lineTo(2, 12);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(-3, -4, 2.4, 3.4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBunting(t) {
  ctx.save();
  const colors = ["#FF97B4", "#F5C77E", "#8FB3D9", "#C9A6E0"];
  ctx.strokeStyle = "rgba(92,58,71,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, 2);
  for (let i = 0; i < 10; i++) {
    const midX = i * 44 + 18;
    ctx.quadraticCurveTo(midX, 8, midX + 22, 2);
  }
  ctx.stroke();

  for (let i = 0; i < 10; i++) {
    const x = i * 44 + 10;
    const y = 4 + Math.sin(t * 1.2 + i) * 2;
    const c = colors[i % colors.length];

    ctx.fillStyle = "rgba(92,58,71,0.14)";
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 1);
    ctx.lineTo(x + 17, y + 1);
    ctx.lineTo(x + 9, y + 15);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 16, y);
    ctx.lineTo(x + 8, y + 14);
    ctx.closePath();
    ctx.fill();

    // scalloped trim along the bottom edge
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(x + 8, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();

    // little dot detail near the point
    ctx.fillStyle = shadeColor(c, -20);
    ctx.beginPath();
    ctx.arc(x + 8, y + 11, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* --- gift-room-only extras: a dressed party table, a soft spotlight
       pooling under the presents, and small wrapped boxes flanking
       the main bouquet --- */
function drawSpotlight(x, y, r) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, "rgba(255, 232, 214, 0.55)");
  grad.addColorStop(0.6, "rgba(255, 211, 224, 0.22)");
  grad.addColorStop(1, "rgba(255, 211, 224, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGiftTable(x, y, w, h) {
  ctx.save();

  // tablecloth skirt with a scalloped hem, instead of a plain wood table
  ctx.fillStyle = "#FFFFFF";
  roundRectFill(ctx, x, y, w, h, 6);

  ctx.fillStyle = "#FFD3E0";
  ctx.fillRect(x, y, w, h * 0.4);

  ctx.fillStyle = "#FFD3E0";
  const scallops = Math.round(w / 12);
  for (let i = 0; i < scallops; i++) {
    const cx = x + (i + 0.5) * (w / scallops);
    ctx.beginPath();
    ctx.arc(cx, y + h - 4, 6, 0, Math.PI);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(92,58,71,0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 4, w - 8, h * 0.4 - 6);

  // gold ribbon band across the front, tying the cloth together
  ctx.fillStyle = "#E3B873";
  ctx.fillRect(x, y + h * 0.4 - 2, w, 3);

  ctx.restore();
}

function drawGiftBox(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);

  const ribbon = "#FFFFFF";

  // box body with a soft top highlight
  ctx.fillStyle = color;
  roundRectFill(ctx, -size / 2, -size / 2, size, size, 3);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(-size / 2, -size / 2, size, size * 0.3);

  // ribbon cross
  ctx.fillStyle = ribbon;
  ctx.fillRect(-size / 2, -1.5, size, 3);
  ctx.fillRect(-1.5, -size / 2, 3, size);

  // little bow on top
  ctx.fillStyle = ribbon;
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.quadraticCurveTo(-7, -size / 2 - 7, -1, -size / 2 - 2);
  ctx.quadraticCurveTo(-3, -size / 2 + 2, 0, -size / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.quadraticCurveTo(7, -size / 2 - 7, 1, -size / 2 - 2);
  ctx.quadraticCurveTo(3, -size / 2 + 2, 0, -size / 2);
  ctx.fill();

  ctx.restore();
}

function drawBouquet(x, y, t) {
  const s = sway(t, x, 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((s * Math.PI) / 180);
  ctx.fillStyle = "#7BAA63";
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.lineTo(-6, 6);
  ctx.lineTo(6, 6);
  ctx.closePath();
  ctx.fill();
  const petalColors = ["#FF97B4", "#FFD3E0", "#F5C77E", "#C9A6E0"];
  const positions = [[-10, -2], [10, -2], [0, -12], [-6, 4], [6, 4]];
  positions.forEach(([px, py], i) => {
    ctx.fillStyle = petalColors[i % petalColors.length];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(a) * 4, py + Math.sin(a) * 4, 2.4, 1.6, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#F5C77E";
    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawDecorItem(item, t) {
  switch (item.type) {
    case "tree": drawTree(item.x, item.y, t, item.flip); break;
    case "cherryTree": drawCherryTree(item.x, item.y, t, item.flip); break;
    case "bush": drawBush(item.x, item.y, t); break;
    case "plant": drawPlant(item.x, item.y, t); break;
    case "leafPatch": drawLeafPatch(item.x, item.y, t); break;
    case "gardenFlower": drawGardenFlower(item.x, item.y, t, item.color); break;
    case "rockCluster": drawRockCluster(item.x, item.y); break;
    case "birdbath": drawBirdbath(item.x, item.y, t); break;
    case "flowerbed": drawFlowerbed(item.x, item.y); break;
    case "steppingStone": drawSteppingStone(item.x, item.y); break;
    case "trellis": drawTrellis(item.x, item.y, t); break;
    case "butterfly": drawButterfly(item.x, item.y, t, item.seed || 0); break;
    case "bookshelf": drawBookshelf(item.x, item.y); break;
    case "rug": drawRug(item.x, item.y, item.w, item.h); break;
    case "papers": drawPapers(item.x, item.y); break;
    case "lamp": drawLamp(item.x, item.y, t); break;
    case "wallBand": drawWallBand(item.x, item.y, item.w, item.h, item.color); break;
    case "window": drawWindow(item.x, item.y, t); break;
    case "frame": drawFrame(item.x, item.y); break;
    case "wallClock": drawWallClock(item.x, item.y, t); break;
    case "chair": drawChair(item.x, item.y); break;
    case "writingDesk": drawWritingDesk(item.x, item.y, item.w, item.h, t); break;
    case "pottedPlant": drawPottedPlant(item.x, item.y); break;
    case "guitar": drawAcousticGuitar(item.x, item.y); break;
    case "electricGuitar": drawElectricGuitar(item.x, item.y); break;
    case "piano": drawPiano(item.x, item.y); break;
    case "amp": drawAmp(item.x, item.y); break;
    case "notesWallpaper": drawNotesWallpaper(t); break;
    case "table": drawTable(item.x, item.y, item.w, item.h); break;
    case "radioBox": drawRadioBox(item.x, item.y, t); break;
    case "discoBall": drawDiscoBall(item.x, item.y, t); break;
    case "micStand": drawMicStand(item.x, item.y); break;
    case "vinylCrate": drawVinylCrate(item.x, item.y); break;
    case "recordFrame": drawRecordFrame(item.x, item.y); break;
    case "foamPanel": drawFoamPanel(item.x, item.y); break;
    case "neonSign": drawNeonSign(item.x, item.y, t); break;
    case "fairyLights": drawFairyLights(item.x, item.y, item.w, t); break;
    case "studioMonitor": drawStudioMonitor(item.x, item.y); break;
    case "stool": drawStool(item.x, item.y); break;
    case "balloon": drawBalloon(item.x, item.y, item.color, t); break;
    case "bunting": drawBunting(t); break;
    case "bouquet": drawBouquet(item.x, item.y, t); break;
    case "spotlight": drawSpotlight(item.x, item.y, item.r); break;
    case "giftTable": drawGiftTable(item.x, item.y, item.w, item.h); break;
    case "giftBox": drawGiftBox(item.x, item.y, item.size, item.color); break;
  }
}

const POP_DURATION = 380; // ms, matches the little bounce when an interactable is triggered

function drawInteractable(obj, t) {
  if (obj.type === "npc") return; // drawn separately as a character
  const bob = Math.sin(t * 3 + obj.x) * 2;

  let scale = 1;
  if (obj.poppedAt) {
    const elapsed = performance.now() - obj.poppedAt;
    if (elapsed < POP_DURATION) {
      scale = 1 + Math.sin((elapsed / POP_DURATION) * Math.PI) * 0.35;
    } else {
      obj.poppedAt = null;
    }
  }

  if (obj.type === "gift") {
    // the main gift is a little pixel bouquet, not a plain box
    drawBouquet(obj.x + obj.w / 2, obj.y + obj.h - 6 + bob, t);
    return;
  }

  ctx.save();
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.translate(obj.x + obj.w / 2, obj.y + obj.h / 2 + bob);
  ctx.scale(scale, scale);
  ctx.fillText(obj.label, 0, 0);
  ctx.restore();
}

/* soft glow ring drawn under whichever interactable is currently in range,
   so "you can interact with this" reads visually, not just via the prompt */
function drawInteractGlow(obj, t) {
  const cx = obj.x + obj.w / 2;
  const cy = obj.y + obj.h / 2;
  const pulse = prefersReducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(t * 4);
  const r = 15 + pulse * 3;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, "rgba(255,151,180,0.32)");
  grad.addColorStop(1, "rgba(255,151,180,0)");
  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRectFill(targetCtx, x, y, w, h, r) {
  targetCtx.beginPath();
  if (targetCtx.roundRect) {
    targetCtx.roundRect(x, y, w, h, r);
  } else {
    // manual fallback for older browsers without roundRect support
    targetCtx.moveTo(x + r, y);
    targetCtx.arcTo(x + w, y, x + w, y + h, r);
    targetCtx.arcTo(x + w, y + h, x, y + h, r);
    targetCtx.arcTo(x, y + h, x, y, r);
    targetCtx.arcTo(x, y, x + w, y, r);
  }
  targetCtx.fill();
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * percent);
  let b = (num & 0xff) + Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

function drawChibi(targetCtx, x, y, color, facing, moving, t) {
  const bodyW = PLAYER_W;
  const bodyH = 12;
  const headSize = 13;
  const legOffset = moving && !prefersReducedMotion ? Math.sin(t * 10) * 2 : 0;
  const walkBounce = moving && !prefersReducedMotion ? Math.abs(Math.sin(t * 10)) * 1.4 : 0;
  const by = y - walkBounce; // the character lifts slightly on each step
  const hairColor = shadeColor(color, -30);
  const hx = x + (bodyW - headSize) / 2;

  // soft ground shadow, anchored to the true ground position rather than
  // the bounce, so it reads as contact with the floor
  targetCtx.save();
  targetCtx.fillStyle = "rgba(92,58,71,0.22)";
  targetCtx.beginPath();
  targetCtx.ellipse(x + bodyW / 2, y + bodyH + headSize + 3, bodyW / 2 - 1, 2.4, 0, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.restore();

  // feet
  targetCtx.fillStyle = "#5C3A47";
  roundRectFill(targetCtx, x + 1, by + bodyH + headSize - 3 + Math.max(0, legOffset), 5, 5, 1.5);
  roundRectFill(targetCtx, x + bodyW - 6, by + bodyH + headSize - 3 + Math.max(0, -legOffset), 5, 5, 1.5);

  // body, softly rounded rather than a hard block
  targetCtx.fillStyle = color;
  roundRectFill(targetCtx, x, by + headSize - 2, bodyW, bodyH, 3);

  // head
  targetCtx.fillStyle = "#FFE3D2";
  roundRectFill(targetCtx, hx, by, headSize, headSize, 4);

  // simple hair cap, tinted from the buddy's own color so each buddy
  // reads as a distinct little silhouette at a glance
  targetCtx.fillStyle = hairColor;
  targetCtx.beginPath();
  targetCtx.moveTo(hx - 0.5, by + headSize * 0.45);
  targetCtx.quadraticCurveTo(hx + headSize / 2, by - 3, hx + headSize + 0.5, by + headSize * 0.45);
  targetCtx.quadraticCurveTo(hx + headSize / 2, by + 2, hx - 0.5, by + headSize * 0.45);
  targetCtx.fill();

  // eyes, positioned by facing direction -- with a soft blink while idle
  // so standing still doesn't read as frozen
  const idlePhase = t % 4;
  const blinking = !moving && idlePhase > 3.82 && !prefersReducedMotion;
  const eyeH = blinking ? 0.4 : 1.6;
  const cx = x + bodyW / 2;
  const cy = by + headSize / 2 + 1;

  // blush
  targetCtx.fillStyle = "rgba(255,151,180,0.55)";
  targetCtx.beginPath();
  targetCtx.ellipse(cx - headSize * 0.34, cy + 1.6, 1.4, 1, 0, 0, Math.PI * 2);
  targetCtx.ellipse(cx + headSize * 0.34, cy + 1.6, 1.4, 1, 0, 0, Math.PI * 2);
  targetCtx.fill();

  targetCtx.fillStyle = "#5C3A47";
  if (facing === "down") {
    targetCtx.fillRect(cx - 3, cy, 1.6, eyeH);
    targetCtx.fillRect(cx + 1.4, cy, 1.6, eyeH);
  } else if (facing === "up") {
    targetCtx.fillRect(cx - 3, cy - 2, 1.6, eyeH);
    targetCtx.fillRect(cx + 1.4, cy - 2, 1.6, eyeH);
  } else if (facing === "left") {
    targetCtx.fillRect(cx - 3, cy, 1.6, eyeH);
  } else {
    targetCtx.fillRect(cx + 1.4, cy, 1.6, eyeH);
  }
}

function drawNPC(t) {
  const obj = rooms.hub.interactables.find((o) => o.type === "npc");
  if (!obj || state.room !== "hub") return;
  const bob = Math.sin(t * 2) * 1.5;
  drawChibi(ctx, obj.x, obj.y + bob, "#8FB3D9", "down", false, t);
  ctx.save();
  ctx.font = "9px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#5C3A47";
  ctx.fillText(CONFIG.senderName, obj.x + PLAYER_W / 2, obj.y - 6);
  ctx.restore();
}

function render(t) {
  const room = rooms[state.room];
  ctx.clearRect(0, 0, GAME_W, GAME_H);
  drawFloor(room.theme);

  if (room.decor) room.decor.forEach((item) => drawDecorItem(item, t));
  room.obstacles.forEach(drawObstacle);
  drawParticles();
  room.doors.forEach(drawDoor);
  if (room.buildings) room.buildings.forEach((b) => drawBuildingFacade(b, t));

  if (nearestInteractable && !dialogue.active && !anyModalOpen()) {
    drawInteractGlow(nearestInteractable, t);
  }
  room.interactables.forEach((o) => drawInteractable(o, t));

  drawNPC(t);

  const buddy = CONFIG.buddies[state.buddy] || CONFIG.buddies.flower;
  drawChibi(ctx, state.player.x, state.player.y, buddy.color, state.player.facing, state.player.moving, t);

  const iconBob = Math.sin(t * 3) * 1.5;
  ctx.save();
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.fillText(buddy.icon, state.player.x + PLAYER_W / 2, state.player.y - 8 + iconBob);
  ctx.restore();

  // interact prompt position (DOM element, so it stays crisp at any scale)
  if (nearestInteractable) {
    const scaleX = canvas.clientWidth / GAME_W;
    const scaleY = canvas.clientHeight / GAME_H;
    const ox = (nearestInteractable.x + nearestInteractable.w / 2) * scaleX;
    const oy = nearestInteractable.y * scaleY;
    interactPromptEl.style.left = `${ox}px`;
    interactPromptEl.style.top = `${oy}px`;
  }
}

/* =========================================================================
   BUDDY SELECT: LIVE SPRITE PREVIEWS
   Draws the same chibi sprite used in-game onto each buddy card's little
   canvas, so picking a buddy shows exactly what she'll look like walking
   around -- not just a plain emoji standing in for it.
========================================================================= */
const buddyPreviews = Array.from(document.querySelectorAll(".buddy-preview")).map((canvas) => ({
  canvas,
  pctx: canvas.getContext("2d"),
  buddyId: canvas.closest(".buddy-card").dataset.buddy,
}));

function renderBuddyPreviews(t) {
  buddyPreviews.forEach(({ canvas, pctx, buddyId }) => {
    const buddy = CONFIG.buddies[buddyId];
    if (!buddy) return;
    pctx.clearRect(0, 0, canvas.width, canvas.height);
    const px = canvas.width / 2 - PLAYER_W / 2;
    const py = canvas.height - 32;
    drawChibi(pctx, px, py, buddy.color, "down", false, t);
  });
}

let buddyPreviewLoopRunning = false;
function startBuddyPreviewLoop() {
  if (buddyPreviewLoopRunning || buddyPreviews.length === 0) return;
  buddyPreviewLoopRunning = true;
  function step(now) {
    renderBuddyPreviews(now / 1000);
    if (screens.buddy.classList.contains("active")) {
      requestAnimationFrame(step);
    } else {
      buddyPreviewLoopRunning = false;
    }
  }
  requestAnimationFrame(step);
}

/* =========================================================================
   MAIN LOOP
========================================================================= */
let lastFrame = performance.now();

function loop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  update(dt);
  render(now / 1000);
  requestAnimationFrame(loop);
}

/* =========================================================================
   FINALE SEQUENCE
========================================================================= */
const finaleOverlay = document.getElementById("finale-overlay");
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");
const finaleTextEl = document.getElementById("finale-text");
const btnFinaleClose = document.getElementById("btn-finale-close");

let confettiParticles = [];
let confettiRunning = false;

function spawnConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const colors = ["#FF97B4", "#FFD3E0", "#E3B873", "#FFFFFF", "#FF7DA0", "#C9A6E0", "#8FB3D9"];
  const shapes = ["square", "ribbon", "dot"];
  confettiParticles = [];
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.5,
      vy: 40 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 40,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 4,
    });
  }
}

let lastConfettiFrame = performance.now();
function confettiLoop(now) {
  if (!confettiRunning) return;
  const dt = Math.min((now - lastConfettiFrame) / 1000, 0.05);
  lastConfettiFrame = now;

  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    p.y += p.vy * dt;
    p.x += p.vx * dt;
    p.rotation += p.spin * dt;
    if (p.y > confettiCanvas.height + 20) p.y = -20;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rotation);
    confettiCtx.fillStyle = p.color;

    if (p.shape === "ribbon") {
      confettiCtx.fillRect(-p.size * 0.25, -p.size * 0.9, p.size * 0.5, p.size * 1.8);
    } else if (p.shape === "dot") {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
      confettiCtx.fill();
    } else {
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }

    confettiCtx.restore();
  });

  requestAnimationFrame(confettiLoop);
}

function triggerFinale() {
  inputState.frozen = true;
  state.visited.giftArea = true;
  saveGame();
  AudioManager.sfx("gift-open");
  AudioManager.playTrack("birthday"); // a cute piano Happy Birthday cover, see assets/sounds/README.md

  finaleOverlay.classList.remove("hidden");
  if (!prefersReducedMotion) {
    spawnConfetti();
    confettiRunning = true;
    lastConfettiFrame = performance.now();
    requestAnimationFrame(confettiLoop);
  }

  // Tracks which message is on screen so the close button knows what to do
  // next -- checking the button's own label against a moving target text
  // was the bug that made "Close" silently do nothing.
  let finaleStage = "message";

  runTypewriter(finaleTextEl, fillTemplate(CONFIG.finaleMessage), {
    speed: 26,
    onDone: () => {
      btnFinaleClose.textContent = "🤍 One more thing...";
    },
  });

  btnFinaleClose.onclick = () => {
    if (finaleTextEl.classList.contains("typing")) {
      // still typing -- let it finish rather than jumping ahead
      return;
    }
    if (finaleStage === "message") {
      finaleStage = "secret";
      runTypewriter(finaleTextEl, CONFIG.secretMessage, {
        speed: 26,
        onDone: () => {
          btnFinaleClose.textContent = "Close";
        },
      });
    } else {
      confettiRunning = false;
      finaleOverlay.classList.add("hidden");
      inputState.frozen = false;
      AudioManager.stopAll();
      showOverlayScreen("title");
      btnContinue.classList.remove("hidden");
    }
  };
}

window.addEventListener("resize", () => {
  if (!finaleOverlay.classList.contains("hidden")) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

/* =========================================================================
   BOOTSTRAP
========================================================================= */
const btnStart = document.getElementById("btn-start");
const btnContinue = document.getElementById("btn-continue");
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const buddyGrid = document.getElementById("buddy-grid");
const welcomeHeading = document.getElementById("welcome-heading");

function startFreshAdventure() {
  clearSave();
  state.name = "";
  state.buddy = "flower";
  state.room = "hub";
  state.player = { x: HUB_SPAWN.x, y: HUB_SPAWN.y, vx: 0, vy: 0, facing: "down", moving: false };
  state.visited = { garden: false, letter: false, music: false, giftArea: false };
  state.letterOpenedOnce = false;
  showOverlayScreen("name");
  nameInput.value = "";
  nameInput.focus();
}

function continueAdventure(save) {
  state.name = save.name || "";
  state.buddy = save.buddy || "flower";
  state.room = save.room || "hub";
  state.player = { x: save.player?.x ?? HUB_SPAWN.x, y: save.player?.y ?? HUB_SPAWN.y, vx: 0, vy: 0, facing: "down", moving: false };
  state.visited = { ...state.visited, ...(save.visited || {}) };
  state.muted = !!save.muted;
  state.volume = typeof save.volume === "number" ? save.volume : 0.6;
  state.letterOpenedOnce = !!save.letterOpenedOnce;

  volumeSlider.value = String(Math.round(state.volume * 100));
  muteCheckbox.checked = state.muted;
  updateMuteButton();
  AudioManager.applyVolume();

  enterGameWorld({ skipWelcome: true });
}

function enterGameWorld({ skipWelcome = false } = {}) {
  function begin() {
    showOverlayScreen("game");
    hudRoomEl.textContent = rooms[state.room].label;
    AudioManager.setRoom(state.room);
    lastFrame = performance.now();
    requestAnimationFrame(loop);
  }

  if (skipWelcome) {
    begin();
    return;
  }

  welcomeHeading.textContent = `Welcome, ${playerName()} 💗`;
  showOverlayScreen("welcome");
  saveGame();
  setTimeout(begin, 1800);
}

btnStart.addEventListener("click", startFreshAdventure);

btnContinue.addEventListener("click", () => {
  const save = loadGame();
  if (save) continueAdventure(save);
});

nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.name = nameInput.value.trim();
  showOverlayScreen("buddy");
  startBuddyPreviewLoop();
});

buddyGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".buddy-card");
  if (!card) return;
  state.buddy = card.dataset.buddy;
  document.querySelectorAll(".buddy-card").forEach((c) => c.classList.toggle("selected", c === card));
  setTimeout(() => enterGameWorld(), 250);
});

// tapping/clicking the game canvas also advances dialogue, handy on desktop
canvas.addEventListener("click", () => {
  if (dialogue.active) dialogue.advance();
});

/* --- initial boot: show Continue button if a save exists --- */
(function boot() {
  AudioManager.init();
  const save = loadGame();
  if (save) {
    btnContinue.classList.remove("hidden");
  }
  showOverlayScreen("title");
})();
