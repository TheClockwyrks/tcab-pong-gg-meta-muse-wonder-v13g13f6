// Carom — a top-down paddle duel with spin and bank-shot obstacles.

import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MATCHOVER_ITEMS,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_HH,
  OBSTACLE_HW,
  OBSTACLE_SPIN_RATE,
  OBSTACLE_SWAY_AMP,
  OBSTACLE_SWAY_PERIOD,
  OBSTACLE_W,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_H,
  PADDLE_HALF,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";

export type Mode = "solo" | "versus";

export type Side = "left" | "right";

export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}

export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}

export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}

export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
  readonly theta: number;
}

export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";

  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;

  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;

  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;

  readonly simTime: number;
  readonly muted: boolean;
}

export interface MenuItemRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface CaromSnapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly muted: boolean;
  readonly paddles: {
    readonly left: PaddleState;
    readonly right: PaddleState;
  };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: {
    readonly x: number;
    readonly y: number;
    readonly vx: number;
    readonly vy: number;
    readonly speed: number;
    readonly spin: number;
    readonly held: boolean;
    readonly holdTimer: number;
    readonly serveSign: 1 | -1;
    readonly trail: readonly TrailSample[];
  } | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;
  readonly simTime: number;
}

export interface CaromDebugApi {
  readonly version: number;
  clearWorld(state: DeepReadonly<CaromState>): CaromState;
  spawnBall(state: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(state: DeepReadonly<CaromState>, index: number): CaromState;
  reset(state: DeepReadonly<CaromState>): CaromState;
  reconcile(state: DeepReadonly<CaromState>): CaromState;
  setScreen(state: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(state: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    state: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(state: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(state: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(state: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(
    state: DeepReadonly<CaromState>,
    side: Side,
    cy: number,
  ): CaromState;
  setPaddleVy(
    state: DeepReadonly<CaromState>,
    side: Side,
    vy: number,
  ): CaromState;
  setPaddleDriven(
    state: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    state: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    state: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(state: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(state: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(
    state: DeepReadonly<CaromState>,
    seconds: number,
  ): CaromState;
  setBallServeSign(state: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(state: DeepReadonly<CaromState>): CaromState;
  setAiTracking(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(state: DeepReadonly<CaromState>, muted: boolean): CaromState;
  setObstacleClock(state: DeepReadonly<CaromState>, t: number): CaromState;
  setObstacleClockRunning(
    state: DeepReadonly<CaromState>,
    running: boolean,
  ): CaromState;
  snapshot(state: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    state: DeepReadonly<CaromState>,
    index: number,
  ): MenuItemRect | null;
}

export const BACKGROUND = "#0a0e1a";

const HOWTO_ITEMS = ["BACK"] as const;

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

function drawServeSign(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function obstaclePose(index: number, t: number): ObstacleState {
  const base = OBSTACLE_CENTERS[index];
  if (!base) throw new Error(`Carom: no obstacle with index ${index}`);
  const sway =
    OBSTACLE_SWAY_AMP * Math.sin((2 * Math.PI * t) / OBSTACLE_SWAY_PERIOD);
  return {
    index,
    cx: base.x,
    cy: index === 0 ? base.y + sway : base.y - sway,
    theta: OBSTACLE_SPIN_RATE * t,
  };
}

function posesAt(t: number): ObstacleState[] {
  return OBSTACLE_CENTERS.map((_, i) => obstaclePose(i, t));
}

function parkedBall(): BallState {
  return {
    x: FIELD_CX,
    y: FIELD_CY,
    vx: 0,
    vy: 0,
    spin: 0,
    held: true,
    holdTimer: HOLD_TIME,
    serveSign: drawServeSign(),
    trail: [],
  };
}

function titleState(
  muted: boolean,
  simTime: number,
  titleIndex: number,
): CaromState {
  return {
    screen: "title",
    mode: "solo",
    menuIndex: titleIndex,
    titleIndex,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    paddles: {
      left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
      right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    },
    ai: { tracking: true, movement: true },
    receiver: "left",
    ball: parkedBall(),
    obstacles: posesAt(0),
    obstacleClock: 0,
    obstacleClockRunning: true,
    simTime,
    muted,
  };
}

function refreshedObstacles(state: DeepReadonly<CaromState>): ObstacleState[] {
  return state.obstacles.map((o) => obstaclePose(o.index, state.obstacleClock));
}

function menuItems(screen: Screen): readonly string[] | null {
  switch (screen) {
    case "title":
      return TITLE_ITEMS;
    case "howto":
      return HOWTO_ITEMS;
    case "paused":
      return PAUSE_ITEMS;
    case "matchover":
      return MATCHOVER_ITEMS;
    default:
      return null;
  }
}

function menuRect(screen: Screen, index: number): MenuItemRect | null {
  const items = menuItems(screen);
  if (!items || !Number.isInteger(index) || index < 0 || index >= items.length)
    return null;
  const w = 400;
  const x = FIELD_CX - w / 2;
  const h = 54;
  let y0 = 330;
  if (screen === "howto") y0 = 570;
  else if (screen === "paused") y0 = 300;
  else if (screen === "matchover") y0 = 400;
  return { x, y: y0 + index * 70, w, h };
}

function itemAt(screen: Screen, x: number, y: number): number | null {
  const items = menuItems(screen);
  if (!items) return null;
  for (let i = 0; i < items.length; i++) {
    const r = menuRect(screen, i);
    if (r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
  }
  return null;
}

function startMatch(state: DeepReadonly<CaromState>, mode: Mode): CaromState {
  return {
    ...state,
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    ball: parkedBall(),
    paddles: {
      left: { ...state.paddles.left, cy: FIELD_CY, vy: 0 },
      right: { ...state.paddles.right, cy: FIELD_CY, vy: 0 },
    },
    obstacles: posesAt(0),
    obstacleClock: 0,
    obstacleClockRunning: true,
  };
}

function returnToTitle(state: DeepReadonly<CaromState>): CaromState {
  const fresh = titleState(state.muted, state.simTime, state.titleIndex);
  return { ...fresh, menuIndex: state.titleIndex };
}

function requireBall(state: DeepReadonly<CaromState>): DeepReadonly<BallState> {
  if (!state.ball) throw new Error("Carom: no ball on the field");
  return state.ball;
}

function withBall(
  state: DeepReadonly<CaromState>,
  ball: BallState,
): CaromState {
  return { ...state, ball };
}

function patchPaddle(
  state: DeepReadonly<CaromState>,
  side: Side,
  patch: Partial<PaddleState>,
): CaromState {
  return {
    ...state,
    paddles: {
      ...state.paddles,
      [side]: { ...state.paddles[side], ...patch },
    },
  };
}

const debugApi: CaromDebugApi = {
  version: CAROM_DEBUG_VERSION,
  clearWorld: (state) => ({ ...state, ball: null, obstacles: [] }),
  spawnBall: (state) => ({ ...state, ball: parkedBall() }),
  spawnObstacle: (state, index) => {
    if (index !== 0 && index !== 1)
      throw new Error(`Carom: no obstacle with index ${index}`);
    const rest = state.obstacles.filter((o) => o.index !== index);
    return {
      ...state,
      obstacles: [...rest, obstaclePose(index, state.obstacleClock)].sort(
        (a, b) => a.index - b.index,
      ),
    };
  },
  reset: (state) => titleState(state.muted, 0, 0),
  reconcile: (state) => ({ ...state, obstacles: refreshedObstacles(state) }),
  setScreen: (state, screen) => ({ ...state, screen }),
  setMode: (state, mode) => ({ ...state, mode }),
  setMenuIndex: (state, index) => ({ ...state, menuIndex: index }),
  setTitleIndex: (state, index) => ({ ...state, titleIndex: index }),
  setResumeScreen: (state, screen) => ({ ...state, resumeScreen: screen }),
  setScore: (state, p1, p2) => ({ ...state, score: { p1, p2 } }),
  setWinner: (state, side) => ({ ...state, winner: side }),
  setReceiver: (state, side) => ({ ...state, receiver: side }),
  setPaddleCy: (state, side, cy) => patchPaddle(state, side, { cy }),
  setPaddleVy: (state, side, vy) => patchPaddle(state, side, { drivenVy: vy }),
  setPaddleDriven: (state, side, driven) =>
    patchPaddle(state, side, { driven }),
  setBallPosition: (state, x, y) => {
    const b = requireBall(state);
    return withBall(state, { ...b, x, y });
  },
  setBallVelocity: (state, vx, vy) => {
    const b = requireBall(state);
    return withBall(state, { ...b, vx, vy });
  },
  setBallSpin: (state, spin) => {
    const b = requireBall(state);
    return withBall(state, { ...b, spin });
  },
  setBallHeld: (state, held) => {
    const b = requireBall(state);
    return withBall(state, { ...b, held });
  },
  setBallHoldTimer: (state, seconds) => {
    const b = requireBall(state);
    return withBall(state, { ...b, holdTimer: seconds });
  },
  setBallServeSign: (state, sign) => {
    const b = requireBall(state);
    return withBall(state, { ...b, serveSign: sign });
  },
  drawBallServeSign: (state) => {
    const b = requireBall(state);
    return withBall(state, { ...b, serveSign: drawServeSign() });
  },
  setAiTracking: (state, enabled) => ({
    ...state,
    ai: { ...state.ai, tracking: enabled },
  }),
  setAiMovement: (state, enabled) => ({
    ...state,
    ai: { ...state.ai, movement: enabled },
  }),
  setMuted: (state, muted) => ({ ...state, muted }),
  setObstacleClock: (state, t) => {
    const next = { ...state, obstacleClock: t };
    return { ...next, obstacles: refreshedObstacles(next) };
  },
  setObstacleClockRunning: (state, running) => ({
    ...state,
    obstacleClockRunning: running,
  }),
  snapshot: (state) => ({
    version: CAROM_DEBUG_VERSION,
    screen: state.screen,
    mode: state.mode,
    menuIndex: state.menuIndex,
    titleIndex: state.titleIndex,
    resumeScreen: state.resumeScreen,
    score: { p1: state.score.p1, p2: state.score.p2 },
    winner: state.winner,
    muted: state.muted,
    paddles: {
      left: { ...state.paddles.left },
      right: { ...state.paddles.right },
    },
    ai: { ...state.ai },
    receiver: state.receiver,
    ball: state.ball
      ? {
          x: state.ball.x,
          y: state.ball.y,
          vx: state.ball.vx,
          vy: state.ball.vy,
          speed: Math.hypot(state.ball.vx, state.ball.vy),
          spin: state.ball.spin,
          held: state.ball.held,
          holdTimer: state.ball.holdTimer,
          serveSign: state.ball.serveSign,
          trail: state.ball.trail.map((s) => ({ ...s })),
        }
      : null,
    obstacles: state.obstacles.map((o) => ({ ...o })),
    obstacleClock: state.obstacleClock,
    obstacleClockRunning: state.obstacleClockRunning,
    simTime: state.simTime,
  }),
  menuItemRect: (state, index) => menuRect(state.screen, index),
};

function integratePaddle(
  paddle: DeepReadonly<PaddleState>,
  rawVy: number,
  dt: number,
): PaddleState {
  const unclamped = paddle.cy + rawVy * dt;
  const next = clamp(unclamped, PADDLE_MIN_CY, PADDLE_MAX_CY);
  let vy = rawVy;
  if (next !== unclamped && dt > 0) vy = (next - paddle.cy) / dt;
  return { ...paddle, cy: next, vy };
}

// ---- Rendering helpers ----------------------------------------------------

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function drawField(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
  dim: boolean,
): void {
  ctx.save();
  if (dim) ctx.globalAlpha = 0.45;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  // Subtle grid dots.
  ctx.fillStyle = "rgba(120,160,255,0.07)";
  for (let gx = 80; gx < FIELD_W; gx += 80) {
    for (let gy = 80; gy < FIELD_H; gy += 80) {
      ctx.beginPath();
      ctx.arc(gx, gy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Goal glows.
  ctx.fillStyle = "rgba(34,211,238,0.10)";
  ctx.fillRect(0, 0, 36, FIELD_H);
  ctx.fillStyle = "rgba(251,113,133,0.10)";
  ctx.fillRect(FIELD_W - 36, 0, 36, FIELD_H);
  // Net.
  ctx.strokeStyle = "rgba(226,232,240,0.35)";
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 16]);
  ctx.beginPath();
  ctx.moveTo(NET_X, 12);
  ctx.lineTo(NET_X, FIELD_H - 12);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(FIELD_CX, FIELD_CY, 70, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(226,232,240,0.14)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Obstacles.
  for (const o of state.obstacles) {
    ctx.save();
    ctx.translate(o.cx, o.cy);
    ctx.rotate(o.theta);
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#8b5cf6";
    roundRect(ctx, -OBSTACLE_W / 2, -OBSTACLE_H / 2, OBSTACLE_W, OBSTACLE_H, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#c4b5fd";
    roundRect(ctx, -3, -OBSTACLE_H / 2 + 10, 6, OBSTACLE_H - 20, 3);
    ctx.fill();
    ctx.restore();
  }

  // Ball trail.
  const ball = state.ball;
  if (ball && ball.trail.length > 1) {
    ctx.lineCap = "round";
    for (let i = 1; i < ball.trail.length; i++) {
      const a = ball.trail[i - 1];
      const b = ball.trail[i];
      if (!a || !b) continue;
      const f = i / ball.trail.length;
      ctx.strokeStyle = `rgba(250,204,21,${(0.12 + 0.5 * f).toFixed(3)})`;
      ctx.lineWidth = 2 + 7 * f;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // Paddles.
  const drawPaddle = (
    x0: number,
    cy: number,
    color: string,
    glow: string,
  ): void => {
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 16;
    ctx.fillStyle = color;
    roundRect(ctx, x0, cy - PADDLE_HALF, PADDLE_W, PADDLE_H, 8);
    ctx.fill();
    ctx.restore();
  };
  drawPaddle(P1_X0, state.paddles.left.cy, "#22d3ee", "#22d3ee");
  drawPaddle(P2_X0, state.paddles.right.cy, "#fb7185", "#fb7185");

  // Ball.
  if (ball) {
    ctx.save();
    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawScoreAndMode(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = "700 64px system-ui, sans-serif";
  ctx.fillStyle = "#22d3ee";
  ctx.fillText(String(state.score.p1), FIELD_CX - 50, 58);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fb7185";
  ctx.fillText(String(state.score.p2), FIELD_CX + 50, 58);
  ctx.textAlign = "center";
  ctx.font = "600 19px system-ui, sans-serif";
  ctx.fillStyle = "rgba(226,232,240,0.75)";
  ctx.fillText(
    state.mode === "solo" ? "SOLO — YOU vs THE MACHINE" : "VERSUS — LOCAL DUEL",
    FIELD_CX,
    692,
  );
  ctx.restore();
}

function drawMenuItems(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
  items: readonly string[],
): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  items.forEach((label, i) => {
    const r = menuRect(state.screen, i);
    if (!r) return;
    const selected = i === state.menuIndex;
    ctx.fillStyle = selected ? "rgba(250,204,21,0.92)" : "rgba(30,41,59,0.88)";
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = selected ? "#fef08a" : "rgba(148,163,184,0.5)";
    ctx.lineWidth = selected ? 3 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.stroke();
    ctx.fillStyle = selected ? "#111827" : "#e2e8f0";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
  });
  ctx.restore();
}

function overlay(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "rgba(2,6,23,0.62)";
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    for (const name of ACTIONS) {
      api.input.register(name, { keys: [...BINDINGS[name]] });
    }
    api.audio.define(CUES.paddleHit, {
      wave: "square",
      freq: 540,
      freqTo: 260,
      durationMs: 70,
      gain: 0.18,
    });
    api.audio.define(CUES.wallBounce, {
      wave: "triangle",
      freq: 330,
      freqTo: 190,
      durationMs: 60,
      gain: 0.16,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "sawtooth",
      freq: 230,
      freqTo: 390,
      durationMs: 85,
      gain: 0.14,
    });
    api.audio.define(CUES.score, {
      wave: "sine",
      freq: 620,
      freqTo: 990,
      durationMs: 180,
      gain: 0.22,
    });

    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("mode", (s) => s.mode);
    api.diagnostics.register("score-p1", (s) => s.score.p1);
    api.diagnostics.register("score-p2", (s) => s.score.p2);
    api.diagnostics.register("ball-x", (s) =>
      s.ball ? Number(s.ball.x.toFixed(1)) : "-",
    );
    api.diagnostics.register("ball-y", (s) =>
      s.ball ? Number(s.ball.y.toFixed(1)) : "-",
    );
    api.diagnostics.register("ball-vx", (s) =>
      s.ball ? Number(s.ball.vx.toFixed(1)) : "-",
    );
    api.diagnostics.register("ball-vy", (s) =>
      s.ball ? Number(s.ball.vy.toFixed(1)) : "-",
    );
    api.diagnostics.register("ball-speed", (s) =>
      s.ball ? Number(Math.hypot(s.ball.vx, s.ball.vy).toFixed(1)) : "-",
    );
    api.diagnostics.register("ball-spin", (s) =>
      s.ball ? Number(s.ball.spin.toFixed(1)) : "-",
    );
    api.diagnostics.register("paddle-left-cy", (s) =>
      Number(s.paddles.left.cy.toFixed(1)),
    );
    api.diagnostics.register("paddle-left-vy", (s) =>
      Number(s.paddles.left.vy.toFixed(1)),
    );
    api.diagnostics.register("paddle-right-cy", (s) =>
      Number(s.paddles.right.cy.toFixed(1)),
    );
    api.diagnostics.register("paddle-right-vy", (s) =>
      Number(s.paddles.right.vy.toFixed(1)),
    );

    return [titleState(false, 0, 0), debugApi];
  },

  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    const simTime = state.simTime + dt;

    // Mute: toggled on every screen; otherwise mirror / honour a posed bit.
    let muted = state.muted;
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!api.audio.muted());
      muted = api.audio.muted();
    } else if (api.audio.muted() !== state.muted) {
      // Divergence only arises from the debug surface posing the bit.
      api.audio.setMuted(state.muted);
      muted = state.muted;
    }

    let cur: CaromState = { ...state, simTime, muted };
    const beginScreen = state.screen;

    const playFlags = {
      paddle: false,
      wall: false,
      obstacle: false,
      score: false,
    };

    // ---- Menu / screen input (for the screen this update began on) ----
    const confirmMenuItem = (base: CaromState, index: number): CaromState => {
      switch (base.screen) {
        case "title": {
          const withTitle = { ...base, titleIndex: index };
          if (index === 0) return startMatch(withTitle, "solo");
          if (index === 1) return startMatch(withTitle, "versus");
          return { ...withTitle, screen: "howto", menuIndex: 0 };
        }
        case "howto":
          return returnToTitle(base);
        case "paused":
          if (index === 0) return { ...base, screen: base.resumeScreen };
          if (index === 1) return startMatch(base, base.mode);
          return returnToTitle(base);
        case "matchover":
          if (index === 0) return startMatch(base, base.mode);
          return returnToTitle(base);
        default:
          return base;
      }
    };

    if (
      beginScreen === "title" ||
      beginScreen === "howto" ||
      beginScreen === "paused" ||
      beginScreen === "matchover"
    ) {
      // On paused, pause/back resume before any menu edge and alone.
      if (beginScreen === "paused") {
        const pauseEdge = api.input.pressed("pause");
        const backEdge = api.input.pressed("back");
        if (pauseEdge || backEdge) {
          return { ...cur, screen: cur.resumeScreen };
        }
      }

      const upEdge = api.input.pressed("p1-up") || api.input.pressed("p2-up");
      const downEdge =
        api.input.pressed("p1-down") || api.input.pressed("p2-down");
      const confirmEdge = api.input.pressed("confirm");
      let backEdge = false;
      if (
        beginScreen === "howto" ||
        beginScreen === "matchover" ||
        beginScreen === "title"
      ) {
        backEdge = api.input.pressed("back");
      }

      // Back handling that is not a menu confirm.
      if (beginScreen === "howto" && (confirmEdge || backEdge)) {
        return returnToTitle(cur);
      }
      if (beginScreen === "matchover" && backEdge && !confirmEdge) {
        return returnToTitle(cur);
      }
      // Title back does nothing.

      const items = menuItems(beginScreen);
      const count = items ? items.length : 0;

      // Pointer / touch intent from this frame's samples.
      let pointerSelected: number | null = null;
      let pointerConfirm: number | null = null;
      {
        const samples = api.input.pointerSamples();
        const origins = new Map<number, number | null>();
        for (const s of samples) {
          const idx = itemAt(beginScreen, s.x, s.y);
          if (s.type === "move") {
            if (idx !== null) pointerSelected = idx;
          } else if (s.type === "down") {
            origins.set(s.id, idx);
            if (idx !== null) pointerSelected = idx;
          } else {
            // up
            if (idx !== null) {
              const origin = origins.get(s.id);
              if (origin !== undefined) {
                if (origin === idx) pointerConfirm = idx;
              } else if (idx === (pointerSelected ?? cur.menuIndex)) {
                pointerConfirm = idx;
              }
              if (origins.has(s.id)) pointerSelected = idx;
            }
          }
        }
        if (samples.length === 0) {
          const snap = api.input.pointer();
          const idx = itemAt(beginScreen, snap.x, snap.y);
          if (idx !== null && snap.device !== "touch") pointerSelected = idx;
          for (const c of api.input.pointerContacts()) {
            const ci = itemAt(beginScreen, c.x, c.y);
            if (ci !== null) pointerSelected = ci;
          }
        }
      }

      const moveDelta = upEdge ? -1 : downEdge ? 1 : 0;

      if (confirmEdge && moveDelta === 0) {
        // Keyboard confirm wins over any pointer confirm this frame.
        if (beginScreen === "howto") return returnToTitle(cur);
        return confirmMenuItem(cur, cur.menuIndex);
      }

      let next = cur;
      if (moveDelta !== 0 && count > 0) {
        const idx = (((cur.menuIndex + moveDelta) % count) + count) % count;
        next = { ...next, menuIndex: idx };
      }
      if (pointerSelected !== null) {
        next = { ...next, menuIndex: pointerSelected };
      }
      if (pointerConfirm !== null) {
        next = { ...next, menuIndex: pointerConfirm };
        return confirmMenuItem(next, pointerConfirm);
      }
      if (confirmEdge && moveDelta !== 0) {
        // Movement before confirm: the confirm is swallowed.
        return next;
      }
      return next;
    }

    if (beginScreen === "countdown" || beginScreen === "playing") {
      if (api.input.pressed("pause")) {
        return {
          ...cur,
          resumeScreen: beginScreen,
          screen: "paused",
          menuIndex: 0,
        };
      }
    } else {
      // paused: input handled above in the menu branch.
      return cur;
    }

    // ---- Live play (countdown / playing) ----
    // Paddles first: their integrated vy is what spin reads.
    const held = (name: string): number => (api.input.value(name) > 0 ? 1 : 0);

    const moveOne = (
      side: Side,
      paddle: DeepReadonly<PaddleState>,
    ): PaddleState => {
      if (paddle.driven) return integratePaddle(paddle, paddle.drivenVy, dt);
      if (cur.mode === "solo" && side === "right") {
        if (!cur.ai.movement) return integratePaddle(paddle, 0, dt);
        let target = AI_HOME_Y;
        let deadzone = AI_HOME_DEADZONE;
        if (
          cur.ai.tracking &&
          beginScreen === "playing" &&
          cur.ball &&
          cur.ball.vx > 0
        ) {
          target = cur.ball.y - cur.ball.vy * AI_REACT;
          deadzone = AI_DEADZONE;
        }
        const diff = target - paddle.cy;
        let raw = 0;
        if (Math.abs(diff) > deadzone) {
          const cap = dt > 0 ? Math.abs(diff) / dt : AI_SPEED;
          raw = Math.sign(diff) * Math.min(AI_SPEED, cap);
        }
        return integratePaddle(paddle, raw, dt);
      }
      let up: number;
      let down: number;
      if (cur.mode === "solo") {
        // Left paddle in solo: all four movement actions.
        up = held("p1-up") || held("p2-up") ? 1 : 0;
        down = held("p1-down") || held("p2-down") ? 1 : 0;
      } else if (side === "left") {
        up = held("p1-up");
        down = held("p1-down");
      } else {
        up = held("p2-up");
        down = held("p2-down");
      }
      return integratePaddle(paddle, (down - up) * PADDLE_SPEED, dt);
    };

    const leftPaddle = moveOne("left", cur.paddles.left);
    const rightPaddle = moveOne("right", cur.paddles.right);
    cur = {
      ...cur,
      paddles: { left: leftPaddle, right: rightPaddle },
    };

    // Obstacle pose at the start of the frame (one pose for all sub-steps).
    const frameObstacles = cur.obstacles;

    if (beginScreen === "countdown") {
      let next = cur;
      if (cur.ball) {
        const holdTimer = cur.ball.holdTimer - dt;
        if (holdTimer <= 0) {
          const dir = cur.receiver === "left" ? -1 : 1;
          const ball: BallState = {
            ...cur.ball,
            holdTimer: 0,
            held: false,
            trail: [],
            vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
            vy: cur.ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
          };
          next = { ...next, ball, screen: "playing" };
        } else {
          const trail = [
            ...cur.ball.trail,
            { x: cur.ball.x, y: cur.ball.y, t: simTime },
          ].filter((s) => simTime - s.t <= TRAIL_TIME);
          next = {
            ...next,
            ball: { ...cur.ball, holdTimer, trail },
          };
        }
      }
      // Advance obstacle clock once, after the ball.
      if (next.obstacleClockRunning) {
        const clock = next.obstacleClock + dt;
        const advanced = { ...next, obstacleClock: clock };
        next = {
          ...advanced,
          obstacles: advanced.obstacles.map((o) =>
            obstaclePose(o.index, clock),
          ),
        };
      }
      return next;
    }

    // playing
    let next = cur;
    if (cur.ball) {
      let { x, y, vx, vy, spin } = cur.ball;
      const startSpeed = Math.hypot(vx, vy);
      const n = Math.max(1, Math.ceil((startSpeed * dt) / MAX_SUBSTEP));
      const h = dt / n;

      const resolvePaddle = (
        side: Side,
        paddle: PaddleState,
        x0: number,
        x1: number,
      ): void => {
        const y0 = paddle.cy - PADDLE_HALF;
        const y1 = paddle.cy + PADDLE_HALF;
        if (!(
          x > x0 - BALL_R &&
          x < x1 + BALL_R &&
          y > y0 - BALL_R &&
          y < y1 + BALL_R
        ))
          return;
        const depths = [
          { face: "left", d: x - (x0 - BALL_R) },
          { face: "right", d: x1 + BALL_R - x },
          { face: "top", d: y - (y0 - BALL_R) },
          { face: "bottom", d: y1 + BALL_R - y },
        ];
        let struck = depths[0] as { face: string; d: number };
        for (const cand of depths) if (cand.d < struck.d) struck = cand;

        if (struck.face === "left" || struck.face === "right") {
          playFlags.paddle = true;
          const offset = clamp((y - paddle.cy) / PADDLE_HALF, -1, 1);
          const theta = offset * MAX_BOUNCE_ANGLE;
          const speed = Math.min(Math.hypot(vx, vy) * SPEED_MULT, SPEED_CAP);
          const dir = side === "left" ? 1 : -1;
          vx = dir * speed * Math.cos(theta);
          vy = speed * Math.sin(theta);
          spin = clamp(
            spin + paddle.vy * SPIN_FROM_PADDLE,
            -SPIN_CLAMP,
            SPIN_CLAMP,
          );
          x = side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R;
        } else if (struck.face === "top") {
          y = y0 - BALL_R;
          if (vy > 0) {
            vy = -vy;
            playFlags.wall = true;
          }
        } else {
          y = y1 + BALL_R;
          if (vy < 0) {
            vy = -vy;
            playFlags.wall = true;
          }
        }
      };

      for (let step = 0; step < n; step++) {
        const speed = Math.hypot(vx, vy);
        if (speed > 0 && h !== 0) {
          const angle = (spin / speed) * h;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const nvx = vx * cos - vy * sin;
          const nvy = vx * sin + vy * cos;
          vx = nvx;
          vy = nvy;
        }
        spin *= Math.pow(0.5, h / SPIN_HALFLIFE);
        x += vx * h;
        y += vy * h;

        // Walls.
        if (y - BALL_R < 0 && vy < 0) {
          y = BALL_R;
          vy = -vy;
          playFlags.wall = true;
        } else if (y + BALL_R > FIELD_H && vy > 0) {
          y = FIELD_H - BALL_R;
          vy = -vy;
          playFlags.wall = true;
        }

        resolvePaddle("left", leftPaddle, P1_X0, P1_X1);
        resolvePaddle("right", rightPaddle, P2_X0, P2_X1);

        // Obstacles, in order.
        for (const o of frameObstacles) {
          const cos = Math.cos(o.theta);
          const sin = Math.sin(o.theta);
          const dx = x - o.cx;
          const dy = y - o.cy;
          const lx = dx * cos + dy * sin;
          const ly = -dx * sin + dy * cos;
          const qx = clamp(lx, -OBSTACLE_HW, OBSTACLE_HW);
          const qy = clamp(ly, -OBSTACLE_HH, OBSTACLE_HH);
          const inside =
            lx >= -OBSTACLE_HW &&
            lx <= OBSTACLE_HW &&
            ly >= -OBSTACLE_HH &&
            ly <= OBSTACLE_HH;
          let nlx: number;
          let nly: number;
          let newLx: number;
          let newLy: number;
          if (inside) {
            const toRight = OBSTACLE_HW - lx;
            const toLeft = lx + OBSTACLE_HW;
            const toBottom = OBSTACLE_HH - ly;
            const toTop = ly + OBSTACLE_HH;
            const minPen = Math.min(toRight, toLeft, toBottom, toTop);
            if (minPen === toRight) {
              nlx = 1;
              nly = 0;
              newLx = OBSTACLE_HW + BALL_R;
              newLy = ly;
            } else if (minPen === toLeft) {
              nlx = -1;
              nly = 0;
              newLx = -OBSTACLE_HW - BALL_R;
              newLy = ly;
            } else if (minPen === toBottom) {
              nlx = 0;
              nly = 1;
              newLx = lx;
              newLy = OBSTACLE_HH + BALL_R;
            } else {
              nlx = 0;
              nly = -1;
              newLx = lx;
              newLy = -OBSTACLE_HH - BALL_R;
            }
          } else {
            const ddx = lx - qx;
            const ddy = ly - qy;
            const dist = Math.hypot(ddx, ddy);
            if (dist >= BALL_R || dist === 0) continue;
            nlx = ddx / dist;
            nly = ddy / dist;
            newLx = qx + nlx * BALL_R;
            newLy = qy + nly * BALL_R;
          }
          const nx = nlx * cos - nly * sin;
          const ny = nlx * sin + nly * cos;
          const dot = vx * nx + vy * ny;
          if (dot < 0) {
            vx = vx - 2 * dot * nx;
            vy = vy - 2 * dot * ny;
            playFlags.obstacle = true;
          }
          x = o.cx + (newLx * cos - newLy * sin);
          y = o.cy + (newLx * sin + newLy * cos);
        }
      }

      const trail = [...cur.ball.trail, { x, y, t: simTime }].filter(
        (s) => simTime - s.t <= TRAIL_TIME,
      );

      const ball: BallState = { ...cur.ball, x, y, vx, vy, spin, trail };
      next = { ...next, ball };

      // Scoring.
      let scorer: Side | null = null;
      if (x - BALL_R > FIELD_W) scorer = "left";
      else if (x + BALL_R < 0) scorer = "right";

      if (scorer) {
        playFlags.score = true;
        const p1 = cur.score.p1 + (scorer === "left" ? 1 : 0);
        const p2 = cur.score.p2 + (scorer === "right" ? 1 : 0);
        const p1Wins = p1 >= WIN_SCORE && p1 - p2 >= WIN_LEAD;
        const p2Wins = p2 >= WIN_SCORE && p2 - p1 >= WIN_LEAD;
        if (p1Wins || p2Wins) {
          next = {
            ...next,
            score: { p1, p2 },
            winner: p1Wins ? "left" : "right",
            screen: "matchover",
            menuIndex: 0,
          };
        } else {
          next = {
            ...next,
            score: { p1, p2 },
            receiver: scorer === "left" ? "right" : "left",
            ball: parkedBall(),
            screen: "countdown",
          };
        }
      }
    }

    if (next.obstacleClockRunning) {
      const clock = next.obstacleClock + dt;
      const advanced = { ...next, obstacleClock: clock };
      next = {
        ...advanced,
        obstacles: advanced.obstacles.map((o) => obstaclePose(o.index, clock)),
      };
    }

    if (playFlags.paddle) api.audio.play(CUES.paddleHit);
    if (playFlags.wall) api.audio.play(CUES.wallBounce);
    if (playFlags.obstacle) api.audio.play(CUES.obstacleBounce);
    if (playFlags.score) api.audio.play(CUES.score);
    return next;
  },

  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    const ctx = api.ctx;
    const screen = state.screen;

    if (screen === "title") {
      drawField(state, ctx, true);
      overlay(ctx);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 28;
      ctx.fillStyle = "#fef08a";
      ctx.font = "900 92px system-ui, sans-serif";
      ctx.fillText(TITLE_TEXT, FIELD_CX, 150);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(226,232,240,0.85)";
      ctx.font = "500 22px system-ui, sans-serif";
      ctx.fillText(
        "Spin the ball. Bank it off the spinning bars. First to 11, by 2.",
        FIELD_CX,
        215,
      );
      ctx.fillStyle = "rgba(148,163,184,0.9)";
      ctx.font = "500 17px system-ui, sans-serif";
      ctx.fillText(
        "W/S or ↑/↓ to choose · Enter to select · M to mute",
        FIELD_CX,
        258,
      );
      ctx.restore();
      drawMenuItems(state, ctx, TITLE_ITEMS);
      return;
    }

    if (screen === "howto") {
      drawField(state, ctx, true);
      overlay(ctx);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fef08a";
      ctx.font = "900 52px system-ui, sans-serif";
      ctx.fillText("HOW TO PLAY", FIELD_CX, 92);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "500 22px system-ui, sans-serif";
      const lines = [
        "Solo: move with W/S (or ↑/↓). Versus: P1 W/S, P2 ↑/↓.",
        "Score by sending the ball past your opponent's edge.",
        "First to 11 points, leading by at least 2, wins the match.",
        "",
        "Strike while your paddle is moving to add spin: the ball",
        "curves in flight, fading as the spin decays away.",
        "The violet bars in mid-field sway and rotate — bank shots",
        "off their tilted faces, or thread the gap between them.",
        "",
        "P pauses · M mutes · Escape backs out",
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, FIELD_CX, 160 + i * 34);
      });
      ctx.restore();
      drawMenuItems(state, ctx, HOWTO_ITEMS);
      return;
    }

    if (screen === "countdown" || screen === "playing") {
      drawField(state, ctx, false);
      drawScoreAndMode(state, ctx);
      if (screen === "countdown") {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(254,240,138,0.95)";
        ctx.font = "800 44px system-ui, sans-serif";
        ctx.fillText("GET READY", FIELD_CX, 250);
        ctx.font = "600 22px system-ui, sans-serif";
        ctx.fillStyle = "rgba(226,232,240,0.9)";
        ctx.fillText(
          state.receiver === "left"
            ? "Serve to the left"
            : "Serve to the right",
          FIELD_CX,
          292,
        );
        ctx.restore();
      }
      return;
    }

    if (screen === "paused") {
      drawField(state, ctx, false);
      drawScoreAndMode(state, ctx);
      overlay(ctx);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fef08a";
      ctx.font = "900 56px system-ui, sans-serif";
      ctx.fillText("PAUSED", FIELD_CX, 210);
      ctx.restore();
      drawMenuItems(state, ctx, PAUSE_ITEMS);
      return;
    }

    // matchover
    drawField(state, ctx, true);
    drawScoreAndMode(state, ctx);
    overlay(ctx);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = state.winner === "left" ? "#22d3ee" : "#fb7185";
    ctx.font = "900 58px system-ui, sans-serif";
    const winnerText =
      state.mode === "solo"
        ? state.winner === "left"
          ? "YOU WIN!"
          : "MACHINE WINS"
        : state.winner === "left"
          ? "PLAYER 1 WINS!"
          : "PLAYER 2 WINS!";
    ctx.fillText(winnerText, FIELD_CX, 190);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "700 40px system-ui, sans-serif";
    ctx.fillText(`${state.score.p1}  —  ${state.score.p2}`, FIELD_CX, 265);
    ctx.fillStyle = "rgba(226,232,240,0.8)";
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillText("Final score", FIELD_CX, 315);
    ctx.restore();
    drawMenuItems(state, ctx, MATCHOVER_ITEMS);
  },
};
