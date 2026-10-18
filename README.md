# Carom

Carom is a top-down paddle duel that runs entirely in the browser. Two paddles
face each other across a dark field while a ball ricochets between them, off the
top and bottom walls, and off a pair of swaying, spinning obstacles in mid-field.
Score by sending the ball past the far edge behind your opponent's paddle. The
first player to 11 points, leading by at least 2, wins the match.

Carom's signature mechanic is **spin**: striking the ball while your paddle is
moving curves the ball's flight afterwards, and that spin fades over time. The
two violet obstacles sway in anti-phase and rotate continuously, turning the
open field into a bank-shot puzzle — thread the gap, or carom off a tilted face.

Play **Solo** against an AI that reads the incoming ball's flight, or **Versus**
against a second player on the same keyboard.

## Install

```sh
npm ci
```

## Run in development

```sh
npm run dev
```

Then open the URL Vite prints in your browser.

## Production build

```sh
npm run build
```

This type-checks the project and emits the complete static site into `dist/`,
with `dist/index.html` as the entry point. Serve that directory as-is from any
static file server (for example `npm run preview`).

Other commands: `npm test` (unit tests with coverage), `npm run typecheck`,
`npm run lint`, and `npm run format`.

## Controls

| Input | Action |
| --- | --- |
| `W` / `S` | Player one (left paddle) up / down |
| `↑` / `↓` | Player two (right paddle) up / down — in Solo these also move player one |
| `Enter` / `Space` | Confirm the highlighted menu item |
| `Escape` | Back / pause — resume |
| `P` | Pause |
| `M` | Mute |

Menus can also be driven with the mouse or by touch: hover or touch an item to
highlight it, and press-and-release (or tap) inside an item to choose it. On
touchscreens the engine shows on-screen sliders for the two paddles.

Tip: move your paddle as it meets the ball to add spin. Downward motion bends
the ball downward, upward motion bends it upward.
