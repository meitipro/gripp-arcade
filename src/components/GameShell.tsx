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
import { Character } from "./Cast";
import { floorPath } from "@/lib/motifs";
import dynamic from "next/dynamic";
const GameIcon = dynamic(() => import("./GameIcon").then((m) => m.GameIcon), { ssr: false, loading: () => <div style={{ width: 72, height: 72 }} /> });

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { let raf = 0; const t0 = performance.now(); const f = (t: number) => { const k = Math.min(1, (t - t0) / 900); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [to]);
  return <>{v.toLocaleString()}</>;
}
const HOST_LINES: Record<string, string> = {
  Gripp: "Almost. Triangles go right.", Moss: "Calm hands, calm score.", Lumen: "One line in. Three lines out.",
  Dot: "I will post the recap when you are done.", Glitch: "p...lay me. if you c...an.",
};
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
  const floor = floorPath(900, 300, 14, 8);
  const quote = HOST_LINES[game.host] ?? HOST_LINES.Gripp;
  const isBest = !!result && best !== undefined && result.score >= best && result.score > 0;

  return (
    <div>
      <header className="pagehead" style={{ paddingTop: 8 }}>
        <div>
          <div className="label bronze">Game {String(game.n).padStart(2, "0")} · {game.category} · {game.mode} · {game.minutes} min · Host {game.host}</div>
          <h1>{game.name.includes(" ") ? <>{game.name.slice(0, game.name.lastIndexOf(" ") + 1)}<i>{game.name.slice(game.name.lastIndexOf(" ") + 1)}</i></> : <i>{game.name}</i>}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "end" }}><div className="label muted">Your best</div><div className="stat" style={{ fontSize: 40 }}>{best !== undefined ? best.toLocaleString() : "–"}</div></div>
          <GameIcon id={game.id} size={68} />
        </div>
      </header>

      <div className="gamecols">
        <section aria-label="Game stage" className="stagecol">
          <div className="stage" style={{ padding: 0, overflow: "hidden" }}>
            <svg viewBox="0 0 900 300" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "45%", pointerEvents: "none" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".18" /></svg>
            <div className="hudstrip">
              <div><div className="label gold">{phase === "play" ? (run?.ranked ? "Ranked" : "Practice") : "Mode"}</div><div className="serif">{phase === "play" ? "Live" : phase === "result" ? "Done" : "Ready"}</div></div>
              <div><div className="label gold">Score</div><div className="serif">{phase === "result" && result ? result.score.toLocaleString() : Math.round(live).toLocaleString()}</div></div>
              <div><div className="label gold">Ranked today</div><div className="serif">{todayRuns}<small> / 10</small></div></div>
            </div>
            <div style={{ position: "relative", padding: 18, minHeight: 380 }}>
              {phase === "intro" && (
                <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "48px 16px" }}>
                  <div>
                    <div style={{ display: "grid", placeItems: "center", marginBottom: 12 }}><GameIcon id={game.id} size={72} /></div>
                    <h2 className="disp3 onink" style={{ maxWidth: "22ch", margin: "0 auto 16px" }}>{game.tagline}</h2>
                    <div className="row" style={{ justifyContent: "center" }}>
                      <button className="btn paperbtn" onClick={() => start(true)} disabled={servoDone}>{tr("play", locale)}</button>
                      <button className="btn alt" style={{ color: "#F4F1EC", borderColor: "rgba(244,241,236,.4)" }} onClick={() => start(false)}>{tr("practice", locale)}</button>
                    </div>
                    {servoDone && <p className="note" style={{ color: "#DFD8D0" }}>Today&apos;s ranked Servo is done. Practice words are unlimited.</p>}
                    <p className="label dim" style={{ marginTop: 18 }}>Verified by {game.verify.toLowerCase()}</p>
                  </div>
                </div>
              )}
              {phase === "loading" && <div style={{ display: "grid", placeItems: "center", minHeight: 320 }}><span className="label gold">Loading…</span></div>}
              {phase === "play" && run && Comp && (
                <>
                  <Comp key={attempt} seed={run.seed} mode={run.ranked ? "ranked" : "practice"} locale={locale} reducedMotion={reduced || !!s.profile?.calm}
                    onReady={noop} onProgress={setLive} onFinish={onFinish} />
                  {hidden && <div className="overlay">Tab hidden. Come back to keep playing.</div>}
                  <div style={{ textAlign: "end", marginTop: 8 }}><button className="chip" style={{ color: "#F4F1EC", borderColor: "rgba(244,241,236,.4)" }} onClick={() => setPhase("intro")}>Quit run</button></div>
                </>
              )}
              {phase === "result" && result && (
                <div style={{ padding: "8px 4px" }}>
                  <div className="label gold">Result{result.award?.held ? " · held for review" : " · verified"}</div>
                  <div className="stat" style={{ fontSize: "clamp(56px, 9vw, 104px)", color: "#F4F1EC" }}><CountUp to={result.score} /> <span style={{ fontSize: 18, fontFamily: "var(--mono)", letterSpacing: ".16em", textTransform: "uppercase" }}>{game.unit ?? "score"}</span></div>
                  <div className="label gold">Band {bi + 1} of 5{isBest ? " · New best" : ""}</div>
                  {result.award && result.award.parts.length > 0 && (
                    <div style={{ margin: "16px 0 4px", maxWidth: 460 }}>
                      {result.award.parts.map((p, i) => <div key={i} className="row sp" style={{ borderBottom: "1px solid rgba(244,241,236,.12)", padding: "8px 0" }}><span>{p.label}</span><b className="label gold">+{p.hp} HP</b></div>)}
                      <div className="row sp" style={{ padding: "10px 0" }}><span>Total</span><b className="serif" style={{ fontSize: 28, color: "#B9986A" }}>+{result.award.hp} HP</b></div>
                    </div>
                  )}
                  {result.award?.newBadges.length ? <p>New badge: {result.award.newBadges.join(", ")}</p> : null}
                  {result.award?.tierUp && <p><b>Tier up!</b> Check your card.</p>}
                  {(result.award?.note || result.verdict) && <p className="note" style={{ color: "#DFD8D0" }}>{result.award?.note} {result.verdict}</p>}
                  <div className="row" style={{ marginTop: 14 }}>
                    <button className="btn paperbtn" onClick={() => start(run?.ranked ?? false)}>{tr("again", locale)}</button>
                    <Link className="btn alt" style={{ color: "#F4F1EC", borderColor: "rgba(244,241,236,.4)" }} href="/card">Share card</Link>
                    <button className="btn alt" style={{ color: "#F4F1EC", borderColor: "rgba(244,241,236,.4)" }} onClick={() => { const t = `Gripp Arcade · ${game.name}: ${result.score.toLocaleString()} ${game.unit ?? "points"} (band ${bi + 1}/5)`; navigator.clipboard?.writeText(t).then(() => window.dispatchEvent(new CustomEvent("gripp:toast", { detail: "Result copied" }))); }}>Copy result</button>
                  </div>
                  <p className="label dim" style={{ marginTop: 16 }}>{tr("hpnote", locale)}</p>
                </div>
              )}
            </div>
            <div className="label dim" style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", padding: "12px 24px 18px" }}>
              <span>{game.mode} · {game.category}</span><span>Verified by {game.verify.toLowerCase()}</span><span>Calm mode removes timers on puzzles</span>
            </div>
          </div>
        </section>

        <aside className="gameside">
          <div className="row" style={{ gap: 10 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => start(true)} disabled={servoDone || phase === "play"}>{tr("play", locale)}</button>
            <button className="btn alt" style={{ flex: 1 }} onClick={() => start(false)} disabled={phase === "play"}>{tr("practice", locale)}</button>
          </div>
          <div className="hpanel" style={{ display: "flex", gap: 14 }}>
            <Character name={game.host as "Gripp" | "Moss" | "Lumen" | "Dot" | "Glitch"} size={56} />
            <div><div className="label muted">{game.host} · host</div><p className="serif" style={{ margin: "4px 0 0", font: "italic 200 22px/1.25 var(--serif)" }}>&ldquo;{quote}&rdquo;</p></div>
          </div>
          <div className="hpanel">
            <div className="label bronze" style={{ marginBottom: 10 }}>How it works</div>
            <ol style={{ margin: 0, paddingInlineStart: 18, display: "grid", gap: 6, fontSize: 14, color: "var(--soft)" }}>{game.rules.map((r) => <li key={r}>{r}</li>)}</ol>
            <p className="label muted" style={{ margin: "14px 0 0", letterSpacing: ".04em", textTransform: "none", fontSize: 12 }}>{game.formula}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
