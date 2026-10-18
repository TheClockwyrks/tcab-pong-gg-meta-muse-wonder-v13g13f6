import { createEngine, ConstantClock } from "@clockwyrks/simple-2d";
import { createCanvas } from "@napi-rs/canvas";
import { describe, expect, it } from "vitest";
import { game } from "./game";
import type { CaromState, CaromDebugApi } from "./game";

async function setup(stepMs = 1000 / 60) {
  const canvas = createCanvas(1280, 720);
  const engine = createEngine<CaromState, CaromDebugApi>({
    canvas: canvas as unknown as HTMLCanvasElement,
    width: 1280,
    height: 720,
    game,
    background: "#0a0e1a",
    layout: "dual-vertical",
    clock: new ConstantClock(stepMs),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => new EventTarget(),
    },
  });
  await engine.initialize();
  return engine;
}

const snap = (e: Awaited<ReturnType<typeof setup>>) =>
  e.debug.snapshot(e.state);

describe("Carom", () => {
  it("opens on the title screen with a parked ball and both obstacles", async () => {
    const e = await setup();
    const s = snap(e);
    expect(s.version).toBe(1);
    expect(s.screen).toBe("title");
    expect(s.mode).toBe("solo");
    expect(s.menuIndex).toBe(0);
    expect(s.ball).not.toBeNull();
    expect(s.ball?.held).toBe(true);
    expect(s.ball?.x).toBe(640);
    expect(s.ball?.y).toBe(360);
    expect(s.obstacles).toHaveLength(2);
    expect(s.obstacles[0]?.cx).toBe(490);
    e.destroy();
  });

  it("counts down and serves toward player one at serve speed", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "countdown"));
    await e.advance(70);
    const s = snap(e);
    expect(s.screen).toBe("playing");
    expect(s.ball?.held).toBe(false);
    expect(s.ball?.speed).toBeCloseTo(520, 0);
    expect(s.ball?.vx).toBeLessThan(0);
    e.destroy();
  });

  it("scores for player one when the ball exits right, then parks", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallPosition(s, 1270, 360));
    e.apply((s) => e.debug.setBallVelocity(s, 600, 0));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(10);
    const s = snap(e);
    expect(s.score.p1).toBe(1);
    expect(s.screen).toBe("countdown");
    expect(s.receiver).toBe("right");
    expect(s.ball?.held).toBe(true);
    e.destroy();
  });

  it("wins the match at 11 with a two-point lead", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScore(s, 10, 4));
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallPosition(s, 1270, 360));
    e.apply((s) => e.debug.setBallVelocity(s, 600, 0));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(10);
    const s = snap(e);
    expect(s.screen).toBe("matchover");
    expect(s.winner).toBe("left");
    expect(s.score.p1).toBe(11);
    e.destroy();
  });

  it("does not end the match at 11-10", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScore(s, 10, 10));
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallPosition(s, 1270, 360));
    e.apply((s) => e.debug.setBallVelocity(s, 600, 0));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(10);
    const s = snap(e);
    expect(s.screen).toBe("countdown");
    expect(s.score).toEqual({ p1: 11, p2: 10 });
    e.destroy();
  });

  it("bounces off a paddle, gains speed, and gains spin from paddle motion", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setPaddleDriven(s, "left", true));
    e.apply((s) => e.debug.setPaddleVy(s, "left", 300));
    e.apply((s) => e.debug.setBallPosition(s, 100, 360));
    e.apply((s) => e.debug.setBallVelocity(s, -400, 0));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(12);
    const s = snap(e);
    expect(s.ball?.vx).toBeGreaterThan(0);
    expect(s.ball?.speed).toBeCloseTo(400 * 1.04, 0);
    expect(s.ball?.spin).toBeGreaterThan(200);
    e.destroy();
  });

  it("reflects off the top wall without changing speed", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallPosition(s, 640, 30));
    e.apply((s) => e.debug.setBallVelocity(s, 0, -400));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(6);
    const s = snap(e);
    expect(s.ball?.vy).toBeGreaterThan(0);
    expect(s.ball?.speed).toBeCloseTo(400, 1);
    e.destroy();
  });

  it("bounces off an upright obstacle face", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setObstacleClock(s, 0));
    e.apply((s) => e.debug.setObstacleClockRunning(s, false));
    e.apply((s) => e.debug.setBallPosition(s, 430, 220));
    e.apply((s) => e.debug.setBallVelocity(s, 400, 0));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(12);
    const s = snap(e);
    expect(s.ball?.vx).toBeLessThan(0);
    e.destroy();
  });

  it("driven paddles move at drivenVy and clamp", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setPaddleDriven(s, "right", true));
    e.apply((s) => e.debug.setPaddleVy(s, "right", 720));
    await e.advance(60);
    const s = snap(e);
    expect(s.paddles.right.cy).toBeGreaterThan(600);
    expect(s.paddles.right.vy).toBe(0);
    e.destroy();
  });

  it("AI tracks an incoming ball in solo", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallPosition(s, 800, 200));
    e.apply((s) => e.debug.setBallVelocity(s, 400, 0));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(30);
    const s = snap(e);
    expect(s.paddles.right.cy).toBeLessThan(300);
    e.destroy();
  });

  it("clearWorld, spawn, reconcile, reset, and missing-ball errors", async () => {
    const e = await setup();
    e.apply((s) => e.debug.clearWorld(s));
    let s = snap(e);
    expect(s.ball).toBeNull();
    expect(s.obstacles).toHaveLength(0);
    expect(() => e.apply((st) => e.debug.setBallPosition(st, 1, 2))).toThrow();
    expect(() => e.apply((st) => e.debug.spawnObstacle(st, 7))).toThrow();
    e.apply((st) => e.debug.spawnObstacle(st, 1));
    e.apply((st) => e.debug.spawnBall(st));
    s = snap(e);
    expect(s.ball).not.toBeNull();
    expect(s.obstacles).toHaveLength(1);
    e.apply((st) => e.debug.setObstacleClock(st, 0.9));
    e.apply((st) => e.debug.reconcile(st));
    s = snap(e);
    expect(s.obstacles[0]?.theta).toBeCloseTo((Math.PI / 3) * 0.9, 5);
    e.apply((st) => e.debug.reset(st));
    s = snap(e);
    expect(s.screen).toBe("title");
    expect(s.simTime).toBe(0);
    expect(e.debug.menuItemRect(e.state, 0)).not.toBeNull();
    e.apply((st) => e.debug.setScreen(st, "playing"));
    expect(e.debug.menuItemRect(e.state, 0)).toBeNull();
    e.destroy();
  });

  it("simTime accumulates and spin curves the ball", async () => {
    const e = await setup(8);
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallPosition(s, 640, 360));
    e.apply((s) => e.debug.setBallVelocity(s, 500, 0));
    e.apply((s) => e.debug.setBallSpin(s, 600));
    e.apply((s) => e.debug.setBallHeld(s, false));
    await e.advance(20);
    const s = snap(e);
    expect(s.simTime).toBeCloseTo(0.16, 5);
    expect(s.ball?.vy).toBeGreaterThan(10);
    expect(s.ball?.trail.length).toBeGreaterThan(0);
    e.destroy();
  });
});
