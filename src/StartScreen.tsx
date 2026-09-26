```tsx
import { useEffect, useRef } from "react";
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
      tRef.current++;
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

  return (

```

```html
<canvas width="{800}" height="{500}" />
```

MOTO

TYPE RACER

CREATED BY LAEEQ KHAN JADOON

START RACE

How to Play

Type matching letters to accelerate your bike

Correct letters glow green, errors drain health

Chain words for combo multipliers and turbo boost

{highScores.length > 0 && (

High Scores

clear

{highScores.slice(0, 5).map((s, i) => (

{i + 1}.

{s.name}

{s.score.toLocaleString()}

{s.wpm} wpm

))}

)}

);
}

```

```
