import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GameProps } from "./types";

const L = (f: () => Promise<{ default: ComponentType<GameProps> }>) => dynamic(f, { ssr: false, loading: () => null });
export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  "pick-place": L(() => import("./PickPlace")),
  "lag-lab": L(() => import("./LagLab")),
  "claw-club": L(() => import("./ClawClub")),
  "prism-bender": L(() => import("./PrismBender")),
  "servo": L(() => import("./Servo")),
  "tabletop-tower": L(() => import("./TabletopTower")),
  "calibrate": L(() => import("./Calibrate")),
  "intent-check": L(() => import("./IntentCheck")),
  "route-planner": L(() => import("./RoutePlanner")),
  "replay": L(() => import("./Replay")),
  "rail-dash": L(() => import("./RailDash")),
  "prism-pop": L(() => import("./PrismPop")),
  "command-line": L(() => import("./CommandLine")),
  "whitepaper-duel": L(() => import("./WhitepaperDuel")),
  "blind-operator": L(() => import("./BlindOperator")),
  "pixel-wall": L(() => import("./PixelWall")),
  "region-rally": L(() => import("./RegionRally")),
  "guess-amplifier": L(() => import("./GuessAmplifier")),
  "caption-bench": L(() => import("./CaptionBench")),
  "fleet-idle": L(() => import("./FleetIdle")),
};
