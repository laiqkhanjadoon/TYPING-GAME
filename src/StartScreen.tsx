import { useEffect, useRef, useState } from "react";
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");

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

      // Deep Neon Cyber Sky
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#050014");
      grd.addColorStop(0.5, "#13022b");
      grd.addColorStop(1, "#081026");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Procedural Stars / Neon Grid Dust
      for (let i = 0; i < 90; i++) {
        const sx = (i * 97.5 + t * 0.1) % W;
        const sy = (i * 53.3) % (H * 0.6);
        const twinkle = Math.sin(t * 0.04 + i) * 0.4 + 0.6;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = i % 2 === 0 ? "#00FFFF" : "#FF00FF";
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // Distant Synth Skyline Silhouettes
      const buildingWidths = [45, 30, 55, 40, 25, 50, 35];
      const buildingHeights = [70, 110, 85, 130, 95, 60, 120];
      ctx.fillStyle = "rgba(10, 4, 25, 0.9)";
      let bx = 0;
      while (bx < W) {
        for (let b = 0; b < buildingWidths.length && bx < W; b++) {
          const bw = buildingWidths[b];
          const bh = buildingHeights[b];
          ctx.fillRect(bx, H * 0.62 - bh, bw - 2, bh);
          bx += bw + 3;
        }
      }

      // Neon Highway Grid
      const roadTop = H * 0.62;
      const roadGrd = ctx.createLinearGradient(0, roadTop, 0, H);
      roadGrd.addColorStop(0, "#0b0c1e");
      roadGrd.addColorStop(0.3, "#091226");
      roadGrd.addColorStop(1, "#04050d");
      ctx.fillStyle = roadGrd;
      ctx.fillRect(0, roadTop, W, H - roadTop);

      // Glowing Neon Horizon Boundary
      ctx.save();
      ctx.shadowColor = "#00FFFF";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, roadTop);
      ctx.lineTo(W, roadTop);
      ctx.stroke();
      ctx.restore();

      // Dashed Center Lanes (Animated)
      ctx.save();
      ctx.setLineDash([40, 35]);
      ctx.lineDashOffset = -(t * 6);
      ctx.strokeStyle = "#FFDD00";
      ctx.shadowColor = "#FFDD00";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.78);
      ctx.lineTo(W, H * 0.78);
      ctx.stroke();
      ctx.restore();

      // Animated Bike on Title Screen
      ctx.save();
      const bikeX = (t * 2.5) % (W + 200) - 100;
      const bikeY = H * 0.65;
      ctx.translate(bikeX, bikeY);

      // Wheels
      const spin = t * 0.2;
      ctx.fillStyle = "#111";
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      [-25, 25].forEach((wx) => {
        ctx.beginPath();
        ctx.arc(wx, 16, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let sp = 0; sp < 4; sp++) {
          const a = spin + (sp * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(wx, 16);
          ctx.lineTo(wx + Math.cos(a) * 11, 16 + Math.sin(a) * 11);
          ctx.stroke();
        }
      });

      // Neon Chassis
      ctx.strokeStyle = "#FF0077";
      ctx.shadowColor = "#FF0077";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(-25, 16);
      ctx.lineTo(-10, 0);
      ctx.lineTo(10, -4);
      ctx.lineTo(25, 8);
      ctx.lineTo(25, 16);
      ctx.stroke();

      // Cyber Body
      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(-12, 0, 18, 12);

      // Exhaust Trail
      for (let i = 0; i < 10; i++) {
        const ex = -32 - i * 14 + Math.sin(t * 0.25 + i) * 4;
        const ey = 14 + Math.cos(t * 0.2 + i) * 3;
        ctx.save();
        ctx.globalAlpha = (10 - i) / 10 * 0.45;
        ctx.fillStyle = i % 2 === 0 ? "#FF5500" : "#00FFFF";
        ctx.beginPath();
        ctx.arc(ex, ey, 3 + i * 0.8, 0, Math.PI * 2);
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
