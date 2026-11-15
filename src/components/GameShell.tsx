"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameMeta } from "@/lib/catalog";
import { GAME_COMPONENTS } from "@/games/registry";
import { awardRun, AwardResult, rankedOn, update, useStore, getState } from "@/lib/store";
import { bandIndex } from "@/lib/points";
import { utcDay } from "@/lib/rng";
import { tr } from "@/lib/i18n";
import { syncToDiscord } from "@/lib/sync";
import dynamic from "next/dynamic";
const GameIcon = dynamic(() => import("./GameIcon").then((m) => m.GameIcon), { ssr: false, loading: () => <div style={{ width: 72, height: 72 }} /> });

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { let raf = 0; const t0 = performance.now(); const f = (t: number) => { const k = Math.min(1, (t - t0) / 900); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [to]);
  return <>{v.toLocaleString()}</>;
}
type Phase = "intro" | "loading" | "play" | "result";
interface Run { seed: number; token?: string; ranked: boolean }

export function GameShell({ game }: { game: GameMeta }) {
  const s = useStore();
  const locale = s.profile?.locale ?? "en";
  const [phase, setPhase] = useState<Phase>("intro");
  const [run, setRun] = useState<Run | null>(null);
  const [live, setLive] = useState(0);
  const [result, setResult] = useState<{ score: number; award: AwardResult | null; verdict?: string } | null>(null);
  const [help, setHelp] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const finished = useRef(false);
  const noop = useCallback(() => {}, []);
  const Comp = GAME_COMPONENTS[game.id];
  const reduced = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const servoDone = game.id === "servo" && rankedOn(s, utcDay()).some((r) => r.game === "servo");
  const todayRuns = rankedOn(s, utcDay()).length;

  const start = useCallback(async (ranked: boolean) => {
    setPhase("loading"); finished.current = false; setLive(0);
    let seed = Math.floor(Math.random() * 2 ** 31), token: string | undefined;
    if (ranked) {
      try {
        const r = await fetch("/api/run/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: game.id }) });
        if (r.ok) { const j = await r.json(); seed = j.seed; token = j.token; }
      } catch { /* offline: the run is kept locally */ }
    }
    setRun({ seed, token, ranked }); setAttempt((a) => a + 1);
    setPhase("play");
  }, [game.id]);

  const onFinish = useCallback(async (res: { score: number; log: unknown[] }) => {
    if (finished.current || !run) return;
    finished.current = true;
    const score = Math.max(0, Math.round(res.score));
    let held = false, verdict: string | undefined;
    if (run.ranked && run.token) {
      try {
        const r = await fetch("/api/run/submit", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: run.token, score, log: res.log.slice(0, 2000), handle: getState().profile?.handle }) });
        const j = await r.json();
        if (j.status === "held") { held = true; verdict = (j.reasons || []).join(", "); }
        if (j.status === "duplicate") { setResult({ score, award: null, verdict: "This run was already submitted. Nothing counted twice." }); setPhase("result"); return; }
      } catch { /* network drop: the run still counts locally */ }
    }
    let award: AwardResult | null = null;
    update((st) => { const a = awardRun(st, game.id, score, run.ranked, { held }); award = a; return a.state; });
    syncToDiscord();
    const a = award as AwardResult | null;
    if (a) {
      const t = (m: string) => window.dispatchEvent(new CustomEvent("gripp:toast", { detail: m }));
      if (a.hp > 0) t(`+${a.hp} HP`);
      if (a.tierUp) t("Tier up! Check your card");
      for (const b of a.newBadges) t(`New badge: ${b}`);
    }
    setResult({ score, award, verdict }); setPhase("result");
  }, [run, game.id]);

  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const f = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);

  const best = s.bests[game.id];
  const bi = result ? bandIndex(result.score, game.thresholds) : 0;

  return (
    <div>
      <header className="pagehead" style={{ paddingTop: 8 }}><div><div className="label bronze">Game {String(game.n).padStart(2, "0")} · {game.category}</div><h1>{game.name.includes(" ") ? <>{game.name.slice(0, game.name.lastIndexOf(" ") + 1)}<i>{game.name.slice(game.name.lastIndexOf(" ") + 1)}</i></> : <i>{game.name}</i>}</h1></div><GameIcon id={game.id} size={64} /></header>
      <div className="row sp" style={{ marginBottom: 12 }}>
        <div className="label">Game {String(game.n).padStart(2, "0")} of 20 · {game.category} · {game.mode} · ~{game.minutes} min · Host {game.host}</div>
        <button className="chip" onClick={() => setHelp((h) => !h)} aria-expanded={help}>{help ? "Hide help" : "Help"}</button>
      </div>
      {help && <div className="panel" style={{ marginBottom: 12 }}><ol style={{ margin: 0, paddingInlineStart: 20 }}>{game.rules.map((r) => <li key={r}>{r}</li>)}</ol><p className="note">Score: {game.formula}</p></div>}

      {phase === "intro" && (
        <div className="stage" style={{ display: "grid", placeItems: "center", textAlign: "center", padding: 32 }}>
          <div>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}><GameIcon id={game.id} size={72} /></div><h2 className="disp3 onink">{game.tagline}</h2>
            {best !== undefined && <p className="mono" style={{ color: "#B9986A" }}>Your best: {best.toLocaleString()} {game.unit ?? ""}</p>}
            <div className="row" style={{ justifyContent: "center" }}>
              <button className="btn" onClick={() => start(true)} disabled={servoDone}>{tr("play", locale)}</button>
              <button className="btn alt" onClick={() => start(false)}>{tr("practice", locale)}</button>
            </div>
            {servoDone && <p className="note" style={{ color: "#DFD8D0" }}>Today&apos;s ranked Servo is done. Practice words are unlimited.</p>}
            <p className="mono" style={{ color: "#B9986A", marginTop: 16 }}>Ranked runs today: {todayRuns}/10 · Verified by {game.verify.toLowerCase()}</p>
          </div>
        </div>
      )}
      {phase === "loading" && <div className="stage" style={{ display: "grid", placeItems: "center" }}><span className="mono">Loading…</span></div>}
      {phase === "play" && run && Comp && (
        <div className="stage">
          <div className="hud"><div>{run.ranked ? "Ranked" : "Practice"}<b>{game.name}</b></div><div style={{ textAlign: "end" }}>Score<b>{Math.round(live).toLocaleString()}</b></div></div>
          <Comp key={attempt} seed={run.seed} mode={run.ranked ? "ranked" : "practice"} locale={locale} reducedMotion={reduced || !!s.profile?.calm}
            onReady={noop} onProgress={setLive} onFinish={onFinish} />
          {hidden && <div className="overlay">Tab hidden. Come back to keep playing.</div>}
          <div style={{ textAlign: "end", marginTop: 8 }}><button className="chip" style={{ color: "#F4F1EC", borderColor: "#F4F1EC" }} onClick={() => setPhase("intro")}>Quit run</button></div>
        </div>
      )}
      {phase === "result" && result && (
        <div className="stage" style={{ padding: 24 }}>
          <div className="label" style={{ color: "#B9986A" }}>Result</div>
          <div className="stat" style={{ fontSize: "3.4rem" }}><CountUp to={result.score} /> <span style={{ fontSize: "1rem" }}>{game.unit ?? "score"}</span></div>
          <div className="mono" style={{ color: "#B9986A" }}>Band {bi + 1} of 5{best !== undefined && result.score >= best ? " · New best" : ""}</div>
          {result.award && result.award.parts.length > 0 && (
            <div style={{ margin: "16px 0" }}>
              {result.award.parts.map((p, i) => <div key={i} className="row sp" style={{ borderBottom: "1px solid #4a4a4a", padding: "6px 0" }}><span>{p.label}</span><b className="mono">+{p.hp} HP</b></div>)}
              <div className="row sp" style={{ padding: "8px 0" }}><span>Total</span><b style={{ color: "#B9986A" }}>+{result.award.hp} HP</b></div>
            </div>
          )}
          {result.award?.newBadges.length ? <p>New badge: {result.award.newBadges.join(", ")}</p> : null}
          {result.award?.tierUp && <p><b>Tier up!</b> Check your card.</p>}
          {(result.award?.note || result.verdict) && <p className="note" style={{ color: "#DFD8D0" }}>{result.award?.note} {result.verdict}</p>}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => start(run?.ranked ?? false)}>{tr("again", locale)}</button>
            <Link className="btn alt" href="/boards">Boards</Link>
            <Link className="btn alt" href="/card">My card</Link>
            <button className="btn alt" onClick={() => { const t = `Gripp Arcade · ${game.name}: ${result.score.toLocaleString()} ${game.unit ?? "points"} (band ${bi + 1}/5)`; navigator.clipboard?.writeText(t).then(() => window.dispatchEvent(new CustomEvent("gripp:toast", { detail: "Result copied" }))); }}>Copy result</button>
          </div>
          <p className="note" style={{ color: "#DFD8D0" }}>{tr("hpnote", locale)}</p>
        </div>
      )}
    </div>
  );
}
