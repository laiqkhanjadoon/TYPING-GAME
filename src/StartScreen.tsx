import React, { useEffect, useRef } from "react";
import type { HighScoreEntry } from "./useHighScores";

interface Props {
  onStart: () => void;
  highScores: HighScoreEntry[];
  onClearScores: () => void;
}

export default function StartScreen({ onStart, highScores, onClearScores }: Props) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      tRef.current += 1;
      const t = tRef.current;
      const W = canvas.width;
      const H = canvas.height;

      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#0a0015");
      grd.addColorStop(0.6, "#1a0030");
      grd.addColorStop(1, "#0f3460");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 80; i++) {
        const sx = (i * 97.5 + t * 0.05) % W;
        const sy = (i * 53.3) % (H * 0.6);
        const twinkle = Math.sin(t * 0.03 + i) * 0.4 + 0.6;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = "white";
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      const roadGrd = ctx.createLinearGradient(0, H * 0.6, 0, H);
      roadGrd.addColorStop(0, "#1a1a2e");
      roadGrd.addColorStop(1, "#0f3460");
      ctx.fillStyle = roadGrd;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);

      ctx.save();
      ctx.setLineDash([30, 30]);
      ctx.lineDashOffset = -(t * 3);
      ctx.strokeStyle = "rgba(255,255,0,0.5)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#FFFF00";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.75);
      ctx.lineTo(W, H * 0.75);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      const bx = (t * 2) % (W + 120) - 60;
      const by = H * 0.62;
      ctx.translate(bx, by);

      const spin = t * 0.15;
      ctx.fillStyle = "#1a1a1a";
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-25, 16, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(25, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const a = spin + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(-25, 16);
        ctx.lineTo(-25 + Math.cos(a) * 11, 16 + Math.sin(a) * 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(25, 16);
        ctx.lineTo(25 + Math.cos(a) * 9, 16 + Math.sin(a) * 9);
        ctx.stroke();
      }

      ctx.strokeStyle = "#CC3300";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(-25, 16);
      ctx.lineTo(-10, 0);
      ctx.lineTo(10, -4);
      ctx.lineTo(25, 8);
      ctx.lineTo(25, 16);
      ctx.stroke();

      ctx.fillStyle = "#DD3300";
      ctx.fillRect(-15, 0, 20, 14);
      ctx.fillStyle = "#DD3300";
      ctx.fillRect(-5, -8, 18, 8);

      ctx.fillStyle = "#CC3300";
      ctx.fillRect(-10, -18, 12, 14);
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(4, -18, 8, Math.PI, 0);
      ctx.arc(4, -18, 8, 0, Math.PI);
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const ex = -30 - i * 12 + Math.sin(t * 0.2 + i) * 3;
        const ey = 14 + Math.cos(t * 0.15 + i) * 2;
        const ea = ((8 - i) / 8) * 0.5;
        ctx.save();
        ctx.globalAlpha = ea;
        ctx.fillStyle = "#888";
        ctx.beginPath();
        ctx.arc(ex, ey, 4 + i, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return React.createElement(
    "div",
    { className: "absolute inset-0 flex flex-col items-center justify-center select-none" },
    React.createElement("canvas", {
      ref: canvasRef,
      width: 800,
      height: 500,
      className: "absolute inset-0 w-full h-full object-cover",
    }),
    React.createElement(
      "div",
      { className: "relative z-10 flex flex-col items-center gap-6 px-6 max-w-lg w-full" },
      React.createElement(
        "div",
        { className: "text-center" },
        React.createElement(
          "div",
          {
            className: "text-5xl md:text-6xl font-black text-white tracking-tight leading-none",
            style: { fontFamily: "'Orbitron', monospace", textShadow: "0 0 30px #FF6600, 0 0 60px #FF3300" },
          },
          "MOTO"
        ),
        React.createElement(
          "div",
          {
            className: "text-3xl md:text-4xl font-black tracking-widest text-cyan-300",
            style: { fontFamily: "'Orbitron', monospace", textShadow: "0 0 20px #00FFCC" },
          },
          "TYPE RACER"
        ),
        React.createElement(
          "div",
          { className: "text-xs text-cyan-400 font-mono tracking-widest mt-2 uppercase font-bold" },
          "CREATED BY LAEEQ KHAN JADOON"
        )
      ),
      React.createElement(
        "button",
        {
          onClick: onStart,
          className: "px-12 py-4 text-xl font-black tracking-widest text-black uppercase rounded-xl transition-all active:scale-95 cursor-pointer",
          style: {
            fontFamily: "'Orbitron', monospace",
            background: "linear-gradient(135deg, #00FFCC, #00FF88, #FFDD00)",
            boxShadow: "0 0 30px rgba(0,255,200,0.6)",
          },
        },
        "START RACE"
      ),
      React.createElement(
        "div",
        { className: "bg-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-xl px-6 py-4 text-center space-y-1 w-full text-xs text-white/70 font-mono" },
        React.createElement("p", { className: "text-cyan-300 font-bold uppercase tracking-wider" }, "How to Play"),
        React.createElement("p", null, "Type matching letters to accelerate your bike"),
        React.createElement("p", null, "Chain words for combo multipliers & TURBO BOOST")
      ),
      highScores && highScores.length > 0
        ? React.createElement(
            "div",
            { className: "bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 w-full font-mono text-xs" },
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-2 text-yellow-400 font-bold uppercase tracking-widest" },
              React.createElement("span", null, "High Scores"),
              React.createElement(
                "button",
                { onClick: onClearScores, className: "text-white/30 hover:text-white/60 lowercase" },
                "clear"
              )
            ),
            React.createElement(
              "div",
              { className: "space-y-1 max-h-32 overflow-y-auto" },
              highScores.slice(0, 5).map((s, i) =>
                React.createElement(
                  "div",
                  { key: i, className: "flex items-center justify-between text-white/80" },
                  React.createElement("span", null, `#\({i + 1}\){s.name}`),
                  React.createElement("span", { className: "text-cyan-300 font-bold" }, `${s.score.toLocaleString()} pts`)
                )
              )
            )
          )
        : null
    )
  );
}
