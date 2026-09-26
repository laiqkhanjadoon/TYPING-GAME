```tsx
import React, { useEffect, useRef, useState } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  const [mouse, setMouse] = useState({
    x: 50,
    y: 50,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      tRef.current += 1;
      const t = tRef.current;

      const W = window.innerWidth;
      const H = window.innerHeight;

      /* Background */
      const grd = ctx.createLinearGradient(0, 0, 0, H);

      grd.addColorStop(0, "#05000d");
      grd.addColorStop(0.45, "#12001f");
      grd.addColorStop(0.75, "#071b30");
      grd.addColorStop(1, "#02060c");

      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      /* Ambient purple glow */
      const glow = ctx.createRadialGradient(
        W * 0.5,
        H * 0.35,
        0,
        W * 0.5,
        H * 0.35,
        Math.max(W, H) * 0.7
      );

      glow.addColorStop(0, "rgba(140, 0, 255, 0.18)");
      glow.addColorStop(0.45, "rgba(0, 255, 220, 0.06)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      /* Stars */
      for (let i = 0; i < 100; i++) {
        const sx = (i * 97.5 + t * 0.05) % W;
        const sy = (i * 53.3) % (H * 0.65);

        const twinkle =
          Math.sin(t * 0.03 + i) * 0.35 + 0.65;

        ctx.globalAlpha = twinkle;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      ctx.globalAlpha = 1;

      /* Road */
      const roadGrd = ctx.createLinearGradient(
        0,
        H * 0.58,
        0,
        H
      );

      roadGrd.addColorStop(0, "#101525");
      roadGrd.addColorStop(1, "#02060c");

      ctx.fillStyle = roadGrd;
      ctx.fillRect(0, H * 0.58, W, H * 0.42);

      /* Neon road line */
      ctx.save();

      ctx.setLineDash([35, 35]);
      ctx.lineDashOffset = -(t * 3);

      ctx.strokeStyle = "rgba(0,255,220,0.55)";
      ctx.lineWidth = 3;

      ctx.shadowColor = "#00ffcc";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, H * 0.76);
      ctx.lineTo(W, H * 0.76);
      ctx.stroke();

      ctx.restore();

      /* Motorcycle */
      ctx.save();

      const bx =
        (t * 2.2) % (W + 180) - 90;

      const by = H * 0.63;

      ctx.translate(bx, by);

      const spin = t * 0.15;

      /* Wheels */
      ctx.fillStyle = "#090909";
      ctx.strokeStyle = "#555";

      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(-25, 16, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(25, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      /* Wheel spokes */
      ctx.strokeStyle = "#777";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 6; i++) {
        const a =
          spin + (i * Math.PI) / 3;

        ctx.beginPath();
        ctx.moveTo(-25, 16);
        ctx.lineTo(
          -25 + Math.cos(a) * 11,
          16 + Math.sin(a) * 11
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(25, 16);
        ctx.lineTo(
          25 + Math.cos(a) * 9,
          16 + Math.sin(a) * 9
        );
        ctx.stroke();
      }

      /* Bike frame */
      ctx.strokeStyle = "#ff3300";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(-25, 16);
      ctx.lineTo(-10, 0);
      ctx.lineTo(10, -4);
      ctx.lineTo(25, 8);
      ctx.lineTo(25, 16);
      ctx.stroke();

      /* Bike body */
      ctx.fillStyle = "#dd3300";

      ctx.fillRect(-15, 0, 20, 14);
      ctx.fillRect(-5, -8, 18, 8);

      /* Rider */
      ctx.fillStyle = "#cc3300";
      ctx.fillRect(-10, -18, 12, 14);

      ctx.fillStyle = "#111";

      ctx.beginPath();
      ctx.arc(4, -18, 8, Math.PI, 0);
      ctx.arc(4, -18, 8, 0, Math.PI);
      ctx.fill();

      /* Exhaust */
      for (let i = 0; i < 8; i++) {
        const ex =
          -30 -
          i * 12 +
          Math.sin(t * 0.2 + i) * 3;

        const ey =
          14 +
          Math.cos(t * 0.15 + i) * 2;

        const ea =
          ((8 - i) / 8) * 0.5;

        ctx.save();

        ctx.globalAlpha = ea;
        ctx.fillStyle = "#888";

        ctx.beginPath();
        ctx.arc(
          ex,
          ey,
          4 + i,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      animRef.current =
        requestAnimationFrame(draw);
    };

    animRef.current =
      requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* Mouse interaction */
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((e.clientY - rect.top) /
        rect.height) *
      100;

    setMouse({ x, y });
  };

  const rotateX =
    (mouse.y - 50) * -0.06;

  const rotateY =
    (mouse.x - 50) * 0.06;

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Mouse-following light */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-150"
        style={{
          background: `
            radial-gradient(
              circle 280px at ${mouse.x}% ${mouse.y}%,
              rgba(0,255,220,0.12),
              rgba(120,0,255,0.05) 35%,
              transparent 70%
            )
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0,255,220,0.12) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0,255,220,0.12) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 40%, transparent)",
        }}
      />

      {/* Main UI */}
      <div className="relative z-10 flex min-h-full items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-xl transition-transform duration-150"
          style={{
            transform: `
              perspective(1200px)
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
            `,
          }}
        >
          {/* Glass container */}
          <div
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl md:p-8"
            style={{
              boxShadow: `
                0 0 80px rgba(0,255,220,0.08),
                inset 0 1px 0 rgba(255,255,255,0.15),
                inset 0 0 40px rgba(255,255,255,0.02)
              `,
            }}
          >
            {/* Glass reflection */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-40"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)",
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-6">
              {/* Title */}
              <div className="text-center">
                <div
                  className="text-5xl font-black leading-none tracking-tight text-white md:text-7xl"
                  style={{
                    fontFamily:
                      "'Orbitron', monospace",
                    textShadow:
                      "0 0 25px #ff6600, 0 0 55px #ff3300",
                  }}
                >
                  MOTO
                </div>

                <div
                  className="mt-1 text-2xl font-black tracking-[0.25em] text-cyan-300 md:text-4xl"
                  style={{
                    fontFamily:
                      "'Orbitron', monospace",
                    textShadow:
                      "0 0 20px #00ffcc",
                  }}
                >
                  TYPE RACER
                </div>

                <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/70">
                  Type • Race • Dominate
                </p>
              </div>

              {/* Start button */}
              <button
                onClick={onStart}
                className="group relative overflow-hidden rounded-2xl border border-cyan-200/40 px-14 py-4 text-lg font-black tracking-[0.2em] text-black uppercase transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  fontFamily:
                    "'Orbitron', monospace",
                  background:
                    "linear-gradient(135deg, #00ffcc, #00ff88, #ffdd00)",
                  boxShadow:
                    "0 0 30px rgba(0,255,200,0.5)",
                }}
              >
                <span className="relative z-10">
                  START RACE
                </span>

                {/* Button shine */}
                <span
                  className="absolute inset-y-0 -left-20 w-12 rotate-12 bg-white/60 blur-md transition-all duration-700 group-hover:left-[120%]"
                />
              </button>

              {/* How to play */}
              <div
                className="w-full rounded-2xl border border-cyan-400/15 bg-black/25 p-5 text-center backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/35 hover:bg-black/35"
              >
                <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  How To Play
                </p>

                <div className="space-y-2 text-xs font-mono text-white/65">
                  <p>
                    ⌨ Type matching letters to accelerate
                    your bike
                  </p>

                  <p>
                    ⚡ Chain words for combo multipliers
                  </p>

                  <p>
                    🚀 Build combos to activate TURBO BOOST
                  </p>
                </div>
              </div>

              {/* High scores */}
              {highScores &&
                highScores.length > 0 && (
                  <div
                    className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                        High Scores
                      </span>

                      <button
                        onClick={onClearScores}
                        className="text-xs font-mono text-white/30 transition hover:text-red-300"
                      >
                        clear
                      </button>
                    </div>

                    <div className="max-h-32 space-y-1 overflow-y-auto">
                      {highScores
                        .slice(0, 5)
                        .map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg px-2 py-1.5 font-mono text-xs text-white/75 transition hover:bg-white/5 hover:text-white"
                          >
                            <span>
                              #{i + 1} {s.name}
                            </span>

                            <span className="font-bold text-cyan-300">
                              {s.score.toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Creator */}
              <div className="pt-1 text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                  Created by
                </p>

                <p
                  className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-white/80"
                  style={{
                    textShadow:
                      "0 0 15px rgba(0,255,220,0.45)",
                  }}
                >
                  LAEEQ KHAN JADOON
                </p>

                <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```
