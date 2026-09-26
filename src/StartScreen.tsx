import { useEffect, useRef, useState } from "react";
import type { HighScoreEntry } from "./useHighScores";
import {
  DEFAULT_GAME_SETTINGS,
  DIFFICULTY_SETTINGS,
  VEHICLE_SETTINGS,
  type Difficulty,
  type GameSettings,
  type TypingMode,
  type VehicleType,
} from "./gameTypes";

interface Props {
  onStart: (settings: GameSettings) => void;
  highScores: HighScoreEntry[];
  onClearScores: () => void;
}

export default function StartScreen({
  onStart,
  highScores,
  onClearScores,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const [settings, setSettings] = useState<GameSettings>(
    DEFAULT_GAME_SETTINGS
  );

  /* ---------------------------------------------
     MOUSE EFFECT
  --------------------------------------------- */

  useEffect(() => {
    const screen = screenRef.current;
    const spotlight = spotlightRef.current;

    if (!screen || !spotlight) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = screen.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -2;
      const rotateY = ((x / rect.width) - 0.5) * 2;

      spotlight.style.transform =
        "translate(" +
        (x - 190) +
        "px, " +
        (y - 190) +
        "px)";

      spotlight.style.opacity = "1";

      screen.style.setProperty(
        "--rotate-x",
        rotateX + "deg"
      );

      screen.style.setProperty(
        "--rotate-y",
        rotateY + "deg"
      );
    };

    const handlePointerLeave = () => {
      spotlight.style.opacity = "0";

      screen.style.setProperty(
        "--rotate-x",
        "0deg"
      );

      screen.style.setProperty(
        "--rotate-y",
        "0deg"
      );
    };

    screen.addEventListener(
      "pointermove",
      handlePointerMove
    );

    screen.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    return () => {
      screen.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      screen.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, []);

  /* ---------------------------------------------
     ANIMATED BACKGROUND
  --------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let running = true;
    let time = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      /*
       * IMPORTANT:
       * Use string concatenation here.
       * This avoids the ${...} syntax error
       * that happened in the previous Vercel build.
       */
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    const draw = () => {
      if (!running) return;

      time += 1;

      const width = window.innerWidth;
      const height = window.innerHeight;

      /* -----------------------------------------
         BACKGROUND
      ----------------------------------------- */

      const background = ctx.createLinearGradient(
        0,
        0,
        0,
        height
      );

      background.addColorStop(
        0,
        "#04000b"
      );

      background.addColorStop(
        0.5,
        "#120021"
      );

      background.addColorStop(
        1,
        "#03172a"
      );

      ctx.fillStyle = background;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /* -----------------------------------------
         CYAN GLOW
      ----------------------------------------- */

      const cyanGlow =
        ctx.createRadialGradient(
          width * 0.15,
          height * 0.2,
          0,
          width * 0.15,
          height * 0.2,
          320
        );

      cyanGlow.addColorStop(
        0,
        "rgba(0,255,204,0.18)"
      );

      cyanGlow.addColorStop(
        1,
        "rgba(0,255,204,0)"
      );

      ctx.fillStyle = cyanGlow;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /* -----------------------------------------
         PINK GLOW
      ----------------------------------------- */

      const pinkGlow =
        ctx.createRadialGradient(
          width * 0.85,
          height * 0.25,
          0,
          width * 0.85,
          height * 0.25,
          330
        );

      pinkGlow.addColorStop(
        0,
        "rgba(255,30,120,0.15)"
      );

      pinkGlow.addColorStop(
        1,
        "rgba(255,30,120,0)"
      );

      ctx.fillStyle = pinkGlow;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /* -----------------------------------------
         STARS
      ----------------------------------------- */

      for (let i = 0; i < 130; i += 1) {
        const starX =
          (i * 97.5 + time * 0.04) %
          width;

        const starY =
          (i * 53.3) %
          (height * 0.62);

        const twinkle =
          Math.sin(time * 0.03 + i) *
            0.4 +
          0.6;

        ctx.globalAlpha = twinkle;

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
          starX,
          starY,
          1.2,
          1.2
        );
      }

      ctx.globalAlpha = 1;

      /* -----------------------------------------
         ROAD
      ----------------------------------------- */

      const road =
        ctx.createLinearGradient(
          0,
          height * 0.56,
          0,
          height
        );

      road.addColorStop(
        0,
        "#151624"
      );

      road.addColorStop(
        1,
        "#04182d"
      );

      ctx.fillStyle = road;

      ctx.fillRect(
        0,
        height * 0.56,
        width,
        height * 0.44
      );

      /* -----------------------------------------
         ROAD LIGHT LINE
      ----------------------------------------- */

      ctx.save();

      ctx.setLineDash([
        35,
        35,
      ]);

      ctx.lineDashOffset =
        -(time * 3);

      ctx.strokeStyle =
        "rgba(0,255,220,0.55)";

      ctx.lineWidth = 3;

      ctx.shadowColor =
        "#00ffcc";

      ctx.shadowBlur = 10;

      ctx.beginPath();

      ctx.moveTo(
        0,
        height * 0.76
      );

      ctx.lineTo(
        width,
        height * 0.76
      );

      ctx.stroke();

      ctx.restore();

      /* -----------------------------------------
         MOVING VEHICLE
      ----------------------------------------- */

      ctx.save();

      const vehicleX =
        (time * 2.4) %
          (width + 200) -
        100;

      const vehicleY =
        height * 0.62;

      ctx.translate(
        vehicleX,
        vehicleY
      );

      const selectedVehicle =
        settings.vehicle;

      /* -----------------------------------------
         BIKE
      ----------------------------------------- */

      if (
        selectedVehicle ===
        "bike"
      ) {
        drawBike(
          ctx,
          time
        );
      }

      /* -----------------------------------------
         SPORTS CAR
      ----------------------------------------- */

      if (
        selectedVehicle ===
        "sports-car"
      ) {
        drawSportsCar(
          ctx,
          time
        );
      }

      /* -----------------------------------------
         SUPERCAR
      ----------------------------------------- */

      if (
        selectedVehicle ===
        "supercar"
      ) {
        drawSupercar(
          ctx,
          time
        );
      }

      /* -----------------------------------------
         TRUCK
      ----------------------------------------- */

      if (
        selectedVehicle ===
        "truck"
      ) {
        drawTruck(
          ctx,
          time
        );
      }

      ctx.restore();

      animationRef.current =
        requestAnimationFrame(draw);
    };

    animationRef.current =
      requestAnimationFrame(draw);

    return () => {
      running = false;

      cancelAnimationFrame(
        animationRef.current
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, [settings.vehicle]);

  /* ---------------------------------------------
     SETTINGS HELPERS
  --------------------------------------------- */

  const selectDifficulty = (
    difficulty: Difficulty
  ) => {
    setSettings((current) => ({
      ...current,
      difficulty,
    }));
  };

  const selectTypingMode = (
    typingMode: TypingMode
  ) => {
    setSettings((current) => ({
      ...current,
      typingMode,
    }));
  };

  const selectVehicle = (
    vehicle: VehicleType
  ) => {
    setSettings((current) => ({
      ...current,
      vehicle,
    }));
  };

  const handleStart = () => {
    onStart(settings);
  };

  return (
    <div
      ref={screenRef}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        perspective: "1200px",
      }}
    >
      {/* BACKGROUND */}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* MOUSE LIGHT */}

      <div
        ref={spotlightRef}
        className="pointer-events-none absolute z-[2] h-[380px] w-[380px] rounded-full bg-cyan-300/10 blur-3xl opacity-0 transition-opacity duration-300"
      />

      {/* GRID */}

      <div className="pointer-events-none absolute inset-0 z-[2] opacity-20 [background-image:linear-gradient(rgba(0,255,204,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* MAIN PANEL */}

      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
        <div
          className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-black/30 p-5 shadow-[0_0_80px_rgba(0,255,204,0.08)] backdrop-blur-2xl transition-transform duration-150 sm:p-7 md:p-9"
          style={{
            transform:
              "rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))",
          }}
        >
          {/* HEADER */}

          <div className="text-center">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-200/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#00ffcc]" />

              Neon Typing Challenge
            </div>

            <h1
              className="text-4xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,102,0,.7)] sm:text-5xl md:text-6xl"
              style={{
                fontFamily:
                  "'Orbitron', monospace",
              }}
            >
              MOTO
            </h1>

            <h2
              className="text-2xl font-black tracking-[0.12em] text-cyan-300 drop-shadow-[0_0_18px_rgba(0,255,204,.8)] sm:text-3xl md:text-4xl"
              style={{
                fontFamily:
                  "'Orbitron', monospace",
              }}
            >
              TYPE RACER
            </h2>

            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Type fast · Ride faster
            </p>

          </div>

          {/* GAME SETTINGS */}

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">

            <div className="mb-5 text-center">

              <div
                className="text-xs font-black uppercase tracking-[0.3em] text-white/80"
                style={{
                  fontFamily:
                    "'Orbitron', monospace",
                }}
              >
                Configure Your Race
              </div>

              <div className="mt-1 text-[10px] text-white/35">
                Choose your challenge before starting
              </div>

            </div>

            {/* DIFFICULTY */}

            <div>
              <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300/70">
                Difficulty
              </div>

              <div className="grid grid-cols-3 gap-2">

                {(
                  Object.keys(
                    DIFFICULTY_SETTINGS
                  ) as Difficulty[]
                ).map((difficulty) => {
                  const item =
                    DIFFICULTY_SETTINGS[
                      difficulty
                    ];

                  const selected =
                    settings.difficulty ===
                    difficulty;

                  return (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() =>
                        selectDifficulty(
                          difficulty
                        )
                      }
                      className={
                        "rounded-xl border p-3 text-left transition-all duration-200 " +
                        (selected
                          ? "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_20px_rgba(0,255,204,0.12)]"
                          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]")
                      }
                    >
                      <div
                        className={
                          "text-xs font-black uppercase " +
                          (selected
                            ? "text-cyan-300"
                            : "text-white/70")
                        }
                      >
                        {item.label}
                      </div>

                      <div className="mt-1 text-[9px] leading-relaxed text-white/35">
                        {item.description}
                      </div>
                    </button>
                  );
                })}

              </div>
            </div>

            {/* TYPING MODE */}

            <div className="mt-5">

              <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300/70">
                Typing Mode
              </div>

              <div className="grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    selectTypingMode(
                      "word"
                    )
                  }
                  className={
                    "rounded-xl border p-4 text-left transition-all duration-200 " +
                    (settings.typingMode ===
                    "word"
                      ? "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_20px_rgba(0,255,204,0.12)]"
                      : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]")
                  }
                >
                  <div className="text-xl">
                    ⌨️
                  </div>

                  <div
                    className={
                      "mt-2 text-xs font-black uppercase " +
                      (settings.typingMode ===
                      "word"
                        ? "text-cyan-300"
                        : "text-white/70")
                    }
                  >
                    Word Race
                  </div>

                  <div className="mt-1 text-[9px] text-white/35">
                    Type one word at a time
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectTypingMode(
                      "paragraph"
                    )
                  }
                  className={
                    "rounded-xl border p-4 text-left transition-all duration-200 " +
                    (settings.typingMode ===
                    "paragraph"
                      ? "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_20px_rgba(0,255,204,0.12)]"
                      : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]")
                  }
                >
                  <div className="text-xl">
                    📖
                  </div>

                  <div
                    className={
                      "mt-2 text-xs font-black uppercase " +
                      (settings.typingMode ===
                      "paragraph"
                        ? "text-cyan-300"
                        : "text-white/70")
                    }
                  >
                    Paragraph Race
                  </div>

                  <div className="mt-1 text-[9px] text-white/35">
                    Type continuous paragraphs
                  </div>
                </button>

              </div>
            </div>

            {/* VEHICLE */}

            <div className="mt-5">

              <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300/70">
                Choose Vehicle
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                {(
                  Object.keys(
                    VEHICLE_SETTINGS
                  ) as VehicleType[]
                ).map((vehicle) => {
                  const item =
                    VEHICLE_SETTINGS[
                      vehicle
                    ];

                  const selected =
                    settings.vehicle ===
                    vehicle;

                  return (
                    <button
                      key={vehicle}
                      type="button"
                      onClick={() =>
                        selectVehicle(
                          vehicle
                        )
                      }
                      className={
                        "rounded-xl border p-3 text-center transition-all duration-200 " +
                        (selected
                          ? "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_20px_rgba(0,255,204,0.12)]"
                          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]")
                      }
                    >
                      <div className="text-2xl">
                        {item.icon}
                      </div>

                      <div
                        className={
                          "mt-1 text-[9px] font-bold uppercase " +
                          (selected
                            ? "text-cyan-300"
                            : "text-white/55")
                        }
                      >
                        {item.label}
                      </div>
                    </button>
                  );
                })}

              </div>
            </div>

          </div>

          {/* SELECTED SETTINGS SUMMARY */}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
              {DIFFICULTY_SETTINGS[
                settings.difficulty
              ].label}
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
              {settings.typingMode ===
              "word"
                ? "⌨️ Word Race"
                : "📖 Paragraph Race"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
              {
                VEHICLE_SETTINGS[
                  settings.vehicle
                ].icon
              }{" "}
              {
                VEHICLE_SETTINGS[
                  settings.vehicle
                ].label
              }
            </span>

          </div>

          {/* START BUTTON */}

          <button
            type="button"
            onClick={handleStart}
            className="start-race-button group relative mt-5 w-full overflow-hidden rounded-2xl px-8 py-4 text-base font-black uppercase tracking-[0.2em] text-black transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] active:translate-y-0 active:scale-[0.98]"
            style={{
              fontFamily:
                "'Orbitron', monospace",
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300" />

            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative flex items-center justify-center gap-3">
              <span>⚡</span>

              <span>Start Race</span>

              <span>→</span>
            </span>
          </button>

          {/* HOW TO PLAY */}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

            <div className="mb-3 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
              How To Play
            </div>

            <div className="grid gap-2 text-[10px] text-white/55 sm:grid-cols-2">

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                ⌨️ Type accurately to increase your speed.
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                🔥 Build combos for higher scores.
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                🏁 Finish the race before losing all lives.
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                🏆 Beat your previous high score.
              </div>

            </div>

          </div>

          {/* HIGH SCORES */}

          {highScores.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

              <div className="mb-3 flex items-center justify-between">

                <div
                  className="text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-300"
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
                  className="rounded-md px-2 py-1 text-[9px] uppercase tracking-wider text-white/35 transition hover:bg-white/10 hover:text-white/80"
                >
                  Clear
                </button>

              </div>

              <div className="space-y-2">

                {highScores
                  .slice(0, 5)
                  .map(
                    (score, index) => (
                      <div
                        key={
                          score.name +
                          "-" +
                          score.score +
                          "-" +
                          index
                        }
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                      >

                        <div className="flex min-w-0 items-center gap-2">

                          <span className="w-6 text-center text-xs">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : index + 1 + "."}
                          </span>

                          <span className="truncate text-xs text-white/70">
                            {score.name}
                          </span>

                        </div>

                        <div className="ml-3 flex items-center gap-3">

                          <span
                            className="text-xs font-bold text-cyan-300"
                            style={{
                              fontFamily:
                                "'Orbitron', monospace",
                            }}
                          >
                            {score.score.toLocaleString()}
                          </span>

                          <span className="text-[9px] text-white/35">
                            {score.wpm} WPM
                          </span>

                        </div>

                      </div>
                    )
                  )}

              </div>

            </div>
          )}

          {/* CREATOR */}

          <div className="mt-6 text-center">

            <div className="mx-auto mb-2 h-px w-24 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

            <div className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/30">
              Created By
            </div>

            <div
              className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-white/70"
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

/* =================================================
   VEHICLE DRAWING FUNCTIONS
   ================================================= */

function drawBike(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  const wheelRotation =
    time * 0.15;

  ctx.fillStyle = "#080a10";
  ctx.strokeStyle = "#555b66";
  ctx.lineWidth = 2;

  /* Rear wheel */

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

  /* Front wheel */

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

  /* Spokes */

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 1;

  for (let i = 0; i < 6; i += 1) {
    const angle =
      wheelRotation +
      (i * Math.PI) / 3;

    ctx.beginPath();

    ctx.moveTo(
      -25,
      18
    );

    ctx.lineTo(
      -25 +
        Math.cos(angle) *
          11,
      18 +
        Math.sin(angle) *
          11
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      25,
      18
    );

    ctx.lineTo(
      25 +
        Math.cos(angle) *
          9,
      18 +
        Math.sin(angle) *
          9
    );

    ctx.stroke();
  }

  /* Frame */

  ctx.strokeStyle =
    "#ff4d00";

  ctx.lineWidth = 4;

  ctx.beginPath();

  ctx.moveTo(
    -25,
    18
  );

  ctx.lineTo(
    -10,
    2
  );

  ctx.lineTo(
    10,
    -4
  );

  ctx.lineTo(
    25,
    9
  );

  ctx.lineTo(
    25,
    18
  );

  ctx.stroke();

  /* Body */

  ctx.fillStyle =
    "#ff4d00";

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

  /* Rider */

  ctx.fillRect(
    -10,
    -18,
    12,
    14
  );

  ctx.fillStyle =
    "#111";

  ctx.beginPath();

  ctx.arc(
    4,
    -18,
    8,
    Math.PI,
    0
  );

  ctx.fill();
}

/* =================================================
   SPORTS CAR
   ================================================= */

function drawSportsCar(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  const wheelRotation =
    time * 0.15;

  drawCarBody(
    ctx,
    wheelRotation,
    "#00e5ff",
    1
  );
}

/* =================================================
   SUPERCAR
   ================================================= */

function drawSupercar(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  const wheelRotation =
    time * 0.2;

  drawCarBody(
    ctx,
    wheelRotation,
    "#ff2f92",
    1.15
  );
}

/* =================================================
   TRUCK
   ================================================= */

function drawTruck(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  const wheelRotation =
    time * 0.12;

  ctx.fillStyle =
    "#263746";

  ctx.fillRect(
    -48,
    -10,
    60,
    28
  );

  ctx.fillStyle =
    "#ff7a00";

  ctx.fillRect(
    12,
    -2,
    28,
    20
  );

  ctx.fillStyle =
    "#8de8ff";

  ctx.fillRect(
    18,
    1,
    17,
    9
  );

  drawWheel(
    ctx,
    -30,
    19,
    12,
    wheelRotation
  );

  drawWheel(
    ctx,
    28,
    19,
    12,
    wheelRotation
  );

  ctx.fillStyle =
    "#ffcf33";

  ctx.fillRect(
    -52,
    1,
    5,
    7
  );
}

/* =================================================
   GENERIC CAR
   ================================================= */

function drawCarBody(
  ctx: CanvasRenderingContext2D,
  wheelRotation: number,
  bodyColor: string,
  scale: number
) {
  ctx.save();

  ctx.scale(
    scale,
    scale
  );

  /* Body */

  ctx.fillStyle =
    bodyColor;

  ctx.beginPath();

  ctx.moveTo(
    -52,
    12
  );

  ctx.lineTo(
    -40,
    -5
  );

  ctx.lineTo(
    -18,
    -12
  );

  ctx.lineTo(
    20,
    -12
  );

  ctx.lineTo(
    38,
    -2
  );

  ctx.lineTo(
    52,
    12
  );

  ctx.lineTo(
    52,
    21
  );

  ctx.lineTo(
    -52,
    21
  );

  ctx.closePath();

  ctx.fill();

  /* Windows */

  ctx.fillStyle =
    "#07131f";

  ctx.beginPath();

  ctx.moveTo(
    -20,
    -8
  );

  ctx.lineTo(
    0,
    -8
  );

  ctx.lineTo(
    15,
    -2
  );

  ctx.lineTo(
    -13,
    -2
  );

  ctx.closePath();

  ctx.fill();

  /* Wheels */

  drawWheel(
    ctx,
    -30,
    21,
    11,
    wheelRotation
  );

  drawWheel(
    ctx,
    30,
    21,
    11,
    wheelRotation
  );

  /* Lights */

  ctx.fillStyle =
    "#fff4a3";

  ctx.fillRect(
    45,
    5,
    6,
    5
  );

  ctx.restore();
}

/* =================================================
   WHEEL
   ================================================= */

function drawWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number
) {
  ctx.save();

  ctx.fillStyle =
    "#07090d";

  ctx.strokeStyle =
    "#555d68";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fill();
  ctx.stroke();

  ctx.translate(
    x,
    y
  );

  ctx.rotate(rotation);

  ctx.strokeStyle =
    "#89919b";

  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const angle =
      (i * Math.PI * 2) /
      5;

    ctx.beginPath();

    ctx.moveTo(
      0,
      0
    );

    ctx.lineTo(
      Math.cos(angle) *
        (radius - 2),
      Math.sin(angle) *
        (radius - 2)
    );

    ctx.stroke();
  }

  ctx.restore();
}
