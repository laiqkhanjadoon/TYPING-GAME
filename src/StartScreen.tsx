import { useEffect, useRef } from "react";
import type { HighScoreEntry } from "./useHighScores";

interface Props {
  onStart: () => void;
  highScores: HighScoreEntry[];
  onClearScores: () => void;
}

export default function StartScreen({
  onStart,
  highScores,
  onClearScores,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const screenRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------
     MOUSE FOLLOWING GLASS EFFECT
  --------------------------------------------- */
  useEffect(() => {
    const screen = screenRef.current;
    const spotlight = spotlightRef.current;

    if (!screen || !spotlight) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = screen.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -2.5;
      const rotateY = ((x / rect.width) - 0.5) * 2.5;

      spotlight.style.transform =
        "translate(" +
        (x - 190) +
        "px, " +
        (y - 190) +
        "px)";

      spotlight.style.opacity = "1";

      screen.style.setProperty("--mx", x + "px");
      screen.style.setProperty("--my", y + "px");
      screen.style.setProperty("--rx", rotateX + "deg");
      screen.style.setProperty("--ry", rotateY + "deg");
    };

    const handlePointerLeave = () => {
      spotlight.style.opacity = "0";

      screen.style.setProperty("--rx", "0deg");
      screen.style.setProperty("--ry", "0deg");
    };

    screen.addEventListener("pointermove", handlePointerMove);
    screen.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      screen.removeEventListener("pointermove", handlePointerMove);
      screen.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  /* ---------------------------------------------
     ANIMATED CANVAS BACKGROUND
  --------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let running = true;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      /*
       * Deliberately using string concatenation instead of
       * template literals here to avoid accidental quote errors.
       */
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      if (!running) return;

      timeRef.current += 1;

      const t = timeRef.current;

      const W = window.innerWidth;
      const H = window.innerHeight;

      /* ---------------------------------------------
         BACKGROUND
      --------------------------------------------- */

      const background = ctx.createLinearGradient(0, 0, 0, H);

      background.addColorStop(0, "#05000f");
      background.addColorStop(0.45, "#15002a");
      background.addColorStop(1, "#061b35");

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, W, H);

      /* ---------------------------------------------
         CYAN AMBIENT GLOW
      --------------------------------------------- */

      const cyanGlow = ctx.createRadialGradient(
        W * 0.18,
        H * 0.18,
        0,
        W * 0.18,
        H * 0.18,
        280
      );

      cyanGlow.addColorStop(0, "rgba(0,255,204,0.18)");
      cyanGlow.addColorStop(1, "rgba(0,255,204,0)");

      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, W, H);

      /* ---------------------------------------------
         PINK AMBIENT GLOW
      --------------------------------------------- */

      const pinkGlow = ctx.createRadialGradient(
        W * 0.82,
        H * 0.28,
        0,
        W * 0.82,
        H * 0.28,
        300
      );

      pinkGlow.addColorStop(0, "rgba(255,30,120,0.15)");
      pinkGlow.addColorStop(1, "rgba(255,30,120,0)");

      ctx.fillStyle = pinkGlow;
      ctx.fillRect(0, 0, W, H);

      /* ---------------------------------------------
         STARS
      --------------------------------------------- */

      for (let i = 0; i < 120; i++) {
        const starX = (i * 97.5 + t * 0.05) % W;
        const starY = (i * 53.3) % (H * 0.62);

        const twinkle =
          Math.sin(t * 0.03 + i) * 0.4 + 0.6;

        ctx.globalAlpha = twinkle;

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
          starX,
          starY,
          1.3,
          1.3
        );
      }

      ctx.globalAlpha = 1;

      /* ---------------------------------------------
         HORIZON GLOW
      --------------------------------------------- */

      const horizon = ctx.createLinearGradient(
        0,
        H * 0.48,
        0,
        H * 0.72
      );

      horizon.addColorStop(
        0,
        "rgba(0,255,204,0)"
      );

      horizon.addColorStop(
        0.5,
        "rgba(0,255,204,0.08)"
      );

      horizon.addColorStop(
        1,
        "rgba(0,255,204,0)"
      );

      ctx.fillStyle = horizon;

      ctx.fillRect(
        0,
        H * 0.48,
        W,
        H * 0.24
      );

      /* ---------------------------------------------
         ROAD
      --------------------------------------------- */

      const road = ctx.createLinearGradient(
        0,
        H * 0.58,
        0,
        H
      );

      road.addColorStop(0, "#17182a");
      road.addColorStop(1, "#061a32");

      ctx.fillStyle = road;

      ctx.fillRect(
        0,
        H * 0.58,
        W,
        H * 0.42
      );

      /* ---------------------------------------------
         ROAD HORIZON LINE
      --------------------------------------------- */

      ctx.save();

      ctx.setLineDash([35, 35]);

      ctx.lineDashOffset = -(t * 3);

      ctx.strokeStyle =
        "rgba(0,255,220,0.55)";

      ctx.lineWidth = 3;

      ctx.shadowColor = "#00ffcc";

      ctx.shadowBlur = 10;

      ctx.beginPath();

      ctx.moveTo(0, H * 0.76);
      ctx.lineTo(W, H * 0.76);

      ctx.stroke();

      ctx.restore();

      /* ---------------------------------------------
         SECOND ROAD LINE
      --------------------------------------------- */

      ctx.save();

      ctx.setLineDash([15, 45]);

      ctx.lineDashOffset = t * 2;

      ctx.strokeStyle =
        "rgba(255,90,30,0.25)";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(0, H * 0.83);
      ctx.lineTo(W, H * 0.83);

      ctx.stroke();

      ctx.restore();

      /* ---------------------------------------------
         MOVING MOTORCYCLE
      --------------------------------------------- */

      ctx.save();

      const bikeX =
        (t * 2.4) % (W + 180) - 90;

      const bikeY = H * 0.62;

      ctx.translate(bikeX, bikeY);

      /* wheels */

      ctx.fillStyle = "#080a10";

      ctx.strokeStyle = "#555b66";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.arc(
        -25,
        18,
        14,
        0,
        Math.PI * 2
      );

      ctx.fill();
      ctx.stroke();

      ctx.beginPath();

      ctx.arc(
        25,
        18,
        12,
        0,
        Math.PI * 2
      );

      ctx.fill();
      ctx.stroke();

      /* wheel spokes */

      const wheelRotation = t * 0.15;

      ctx.strokeStyle = "#777";

      ctx.lineWidth = 1.5;

      for (let i = 0; i < 6; i++) {
        const angle =
          wheelRotation +
          (i * Math.PI) / 3;

        ctx.beginPath();

        ctx.moveTo(-25, 18);

        ctx.lineTo(
          -25 + Math.cos(angle) * 11,
          18 + Math.sin(angle) * 11
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(25, 18);

        ctx.lineTo(
          25 + Math.cos(angle) * 9,
          18 + Math.sin(angle) * 9
        );

        ctx.stroke();
      }

      /* bike frame */

      ctx.strokeStyle = "#ff4d00";

      ctx.lineWidth = 4;

      ctx.lineJoin = "round";

      ctx.beginPath();

      ctx.moveTo(-25, 18);
      ctx.lineTo(-10, 2);
      ctx.lineTo(10, -4);
      ctx.lineTo(25, 9);
      ctx.lineTo(25, 18);

      ctx.stroke();

      /* body */

      ctx.fillStyle = "#ff4d00";

      ctx.fillRect(
        -15,
        1,
        20,
        14
      );

      ctx.fillRect(
        -5,
        -8,
        18,
        9
      );

      ctx.fillRect(
        -10,
        -18,
        12,
        14
      );

      /* helmet */

      ctx.fillStyle = "#111";

      ctx.beginPath();

      ctx.arc(
        4,
        -18,
        8,
        Math.PI,
        0
      );

      ctx.arc(
        4,
        -18,
        8,
        0,
        Math.PI
      );

      ctx.fill();

      /* exhaust */

      for (let i = 0; i < 8; i++) {
        const exhaustX =
          -30 -
          i * 12 +
          Math.sin(t * 0.2 + i) * 3;

        const exhaustY =
          14 +
          Math.cos(t * 0.15 + i) * 2;

        ctx.save();

        ctx.globalAlpha =
          ((8 - i) / 8) * 0.45;

        ctx.fillStyle = "#8aa0aa";

        ctx.beginPath();

        ctx.arc(
          exhaustX,
          exhaustY,
          4 + i,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      /* ---------------------------------------------
         ANIMATION LOOP
      --------------------------------------------- */

      animRef.current =
        requestAnimationFrame(draw);
    };

    animRef.current =
      requestAnimationFrame(draw);

    return () => {
      running = false;

      cancelAnimationFrame(
        animRef.current
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, []);

  return (
    <div
      ref={screenRef}
      className="start-screen absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* -----------------------------------------
          CANVAS BACKGROUND
      ----------------------------------------- */}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* -----------------------------------------
          MOUSE FOLLOWING LIGHT
      ----------------------------------------- */}

      <div
        ref={spotlightRef}
        className="pointer-events-none absolute z-[2] h-[380px] w-[380px] rounded-full bg-cyan-300/10 blur-3xl opacity-0 transition-opacity duration-300"
      />

      {/* -----------------------------------------
          GRID
      ----------------------------------------- */}

      <div className="start-grid pointer-events-none absolute inset-0 z-[2] opacity-30" />

      {/* -----------------------------------------
          MAIN CONTENT
      ----------------------------------------- */}

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-4 py-6 sm:px-6">
        <div className="glass-panel w-full rounded-[28px] p-5 sm:p-7 md:p-9">

          {/* -------------------------------------
              TOP BADGE
          ------------------------------------- */}

          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200/80 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#00ffcc]" />

              Neon Typing Challenge
            </div>

            {/* ---------------------------------
                TITLE
            --------------------------------- */}

            <div
              className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,102,0,.7)] sm:text-6xl md:text-7xl"
              style={{
                fontFamily: "'Orbitron', monospace",
              }}
            >
              MOTO
            </div>

            <div
              className="text-3xl font-black tracking-[0.14em] text-cyan-300 drop-shadow-[0_0_18px_rgba(0,255,204,.8)] sm:text-4xl md:text-5xl"
              style={{
                fontFamily: "'Orbitron', monospace",
              }}
            >
              TYPE RACER
            </div>

            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              Type fast · Ride faster
            </div>
          </div>

          {/* -------------------------------------
              START SECTION
          ------------------------------------- */}

          <div className="mt-7 flex flex-col items-center gap-5">

            <button
              type="button"
              onClick={onStart}
              className="start-race-button group relative w-full max-w-sm overflow-hidden rounded-2xl px-10 py-4 text-lg font-black uppercase tracking-[0.18em] text-black transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95"
              style={{
                fontFamily: "'Orbitron', monospace",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300" />

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative flex items-center justify-center gap-3">
                <span>⚡</span>

                <span>Start Race</span>

                <span className="text-black/50">
                  →
                </span>
              </span>
            </button>

            {/* ---------------------------------
                HOW TO PLAY
            --------------------------------- */}

            <div className="glass-card w-full rounded-2xl p-4 sm:p-5">
              <div className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                How To Play
              </div>

              <div className="grid gap-3 text-xs text-white/65 sm:grid-cols-2">

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.05]">
                  <span className="text-lg">
                    ⌨️
                  </span>

                  <span>
                    Type the displayed word to accelerate
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.05]">
                  <span className="text-lg">
                    ✅
                  </span>

                  <span>
                    Correct letters boost your run
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.05]">
                  <span className="text-lg">
                    🔥
                  </span>

                  <span>
                    Chain words for combo multipliers
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.05]">
                  <span className="text-lg">
                    📱
                  </span>

                  <span>
                    Tap anywhere for mobile keyboard
                  </span>
                </div>

              </div>
            </div>

            {/* ---------------------------------
                HIGH SCORES
            --------------------------------- */}

            {highScores.length > 0 && (
              <div className="glass-card w-full rounded-2xl p-4 sm:p-5">

                <div className="mb-4 flex items-center justify-between">

                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-300"
                    style={{
                      fontFamily:
                        "'Orbitron', monospace",
                    }}
                  >
                    🏆 High Scores
                  </div>

                  <button
                    type="button"
                    onClick={onClearScores}
                    className="rounded-md px-2 py-1 text-[10px] uppercase tracking-wider text-white/35 transition hover:bg-white/10 hover:text-white/80"
                  >
                    Clear
                  </button>

                </div>

                <div className="space-y-2">

                  {highScores
                    .slice(0, 5)
                    .map((score, index) => (
                      <div
                        key={`${score.name}-${score.date}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.06]"
                      >

                        <div className="flex min-w-0 items-center gap-2">

                          <span className="w-6 shrink-0 text-center text-sm font-bold text-yellow-300">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `${index + 1}.`}
                          </span>

                          <span className="truncate text-sm text-white/80">
                            {score.name}
                          </span>

                        </div>

                        <div className="ml-3 flex shrink-0 items-center gap-3 text-right">

                          <span
                            className="font-bold text-cyan-300"
                            style={{
                              fontFamily:
                                "'Orbitron', monospace",
                            }}
                          >
                            {score.score.toLocaleString()}
                          </span>

                          <span className="text-xs text-white/40">
                            {score.wpm} WPM
                          </span>

                        </div>

                      </div>
                    ))}

                </div>
              </div>
            )}

          </div>

          {/* -------------------------------------
              CREATOR CREDIT
          ------------------------------------- */}

          <div className="mt-7 text-center">

            <div className="mx-auto mb-3 h-px w-28 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
              Created By
            </div>

            <div
              className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-white/80"
              style={{
                fontFamily:
                  "'Orbitron', monospace",
              }}
            >
              LAEEQ KHAN JADOON
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
