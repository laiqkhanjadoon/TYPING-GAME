import { useEffect, useRef, useCallback } from "react";
import type { GameEngineState } from "./useGameEngine";

interface Props {
  state: GameEngineState;
  width: number;
  height: number;
}

// Draw the motorcycle using canvas 2D
function drawBike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  speed: number,
  boost: boolean,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Wheel spin animation
  const wheelSpin = time * speed * 0.3;
  const lean = Math.min(speed * 1.5, 12);
  ctx.rotate((lean * Math.PI) / 180);

  // Exhaust glow when boosting
  if (boost) {
    ctx.save();
    const grd = ctx.createRadialGradient(-45, 10, 2, -45, 10, 30);
    grd.addColorStop(0, "rgba(255,100,0,0.9)");
    grd.addColorStop(0.5, "rgba(255,50,0,0.4)");
    grd.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(-45, 10, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 28, 35, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Rear wheel
  ctx.save();
  ctx.translate(-30, 20);
  // Tire
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hub
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#555";
  ctx.fill();
  // Spokes
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const angle = wheelSpin + (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 13, Math.sin(angle) * 13);
    ctx.stroke();
  }
  ctx.restore();

  // Front wheel
  ctx.save();
  ctx.translate(28, 20);
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#555";
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const angle = wheelSpin + (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 11, Math.sin(angle) * 11);
    ctx.stroke();
  }
  ctx.restore();

  // Frame / chassis
  ctx.beginPath();
  ctx.moveTo(-30, 20); // rear axle
  ctx.lineTo(-15, 5); // rear frame up
  ctx.lineTo(5, 0); // top of frame
  ctx.lineTo(28, 10); // front fork top
  ctx.lineTo(28, 20); // front axle
  ctx.strokeStyle = boost ? "#FF6600" : "#CC3300";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Engine block
  ctx.beginPath();
  ctx.rect(-20, 4, 25, 16);
  ctx.fillStyle = boost ? "#FF4400" : "#BB2200";
  ctx.fill();
  ctx.strokeStyle = "#441100";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Engine detail
  ctx.fillStyle = "#882200";
  ctx.fillRect(-18, 7, 8, 5);
  ctx.fillRect(-7, 7, 8, 5);

  // Fuel tank
  ctx.beginPath();
  ctx.roundRect(-8, -6, 22, 10, 4);
  ctx.fillStyle = boost ? "#FF5500" : "#DD3300";
  ctx.fill();
  ctx.strokeStyle = "#551100";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tank highlight
  ctx.beginPath();
  ctx.roundRect(-6, -4, 18, 4, 2);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();

  // Seat
  ctx.beginPath();
  ctx.roundRect(-22, -5, 18, 7, 3);
  ctx.fillStyle = "#222";
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Handlebar
  ctx.beginPath();
  ctx.moveTo(14, -4);
  ctx.lineTo(22, -8);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  // Front fork
  ctx.beginPath();
  ctx.moveTo(22, -2);
  ctx.lineTo(28, 10);
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Rider silhouette
  // Body
  ctx.beginPath();
  ctx.roundRect(-12, -22, 14, 18, 4);
  ctx.fillStyle = boost ? "#FF4400" : "#CC3300";
  ctx.fill();

  // Helmet
  ctx.beginPath();
  ctx.arc(4, -22, 10, Math.PI, Math.PI * 2);
  ctx.arc(4, -22, 10, 0, Math.PI);
  ctx.fillStyle = "#111";
  ctx.fill();

  // Visor
  ctx.beginPath();
  ctx.arc(4, -20, 7, -0.4, 0.4);
  ctx.strokeStyle = boost ? "#FF8800" : "#00CCFF";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Arms to handlebar
  ctx.beginPath();
  ctx.moveTo(2, -10);
  ctx.quadraticCurveTo(12, -8, 20, -6);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.lineTo(-15, 10);
  ctx.moveTo(-5, -4);
  ctx.lineTo(-5, 10);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Exhaust pipe
  ctx.beginPath();
  ctx.moveTo(-28, 12);
  ctx.quadraticCurveTo(-38, 18, -40, 14);
  ctx.strokeStyle = "#777";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Headlight
  if (boost || speed > 2) {
    ctx.save();
    const headGrd = ctx.createRadialGradient(32, -2, 1, 45, -2, 20);
    headGrd.addColorStop(0, "rgba(255,220,100,0.9)");
    headGrd.addColorStop(1, "rgba(255,220,100,0)");
    ctx.fillStyle = headGrd;
    ctx.beginPath();
    ctx.ellipse(45, -2, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

export default function GameCanvas({ state, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    timeRef.current += 1;
    const t = timeRef.current;
    const {
      bikeSpeed,
      roadOffset,
      bgOffset,
      particles,
      floatingTexts,
      bikeX,
      boostActive,
      shake,
      level,
    } = state;

    const W = width;
    const H = height;
    const bikeY = H * 0.62;

    // Screen shake
    const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
    const shakeY = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // ---- Background sky gradient ----
    const skyColors = [
      ["#0a0015", "#1a0030", "#2d0050"], // level 1-2: deep purple night
      ["#0d001a", "#1f0035", "#330060"], // level 3-4
      ["#000d1a", "#001433", "#002266"], // level 5-6: dark blue night
      ["#001a0d", "#002611", "#003318"], // level 7+: dark green cyber
    ];
    const colorIdx = Math.min(Math.floor((level - 1) / 2), skyColors.length - 1);
    const [skyTop, skyMid, skyBot] = skyColors[colorIdx];
    const skyGrd = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyGrd.addColorStop(0, skyTop);
    skyGrd.addColorStop(0.5, skyMid);
    skyGrd.addColorStop(1, skyBot);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5 + bgOffset * 0.1) % W + W) % W;
      const sy = (i * 73.3) % (H * 0.5);
      const ss = (i % 3) * 0.5 + 0.5;
      const twinkle = Math.sin(t * 0.05 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillRect(sx, sy, ss, ss);
    }
    ctx.globalAlpha = 1;

    // City skyline silhouette (scrolling)
    const buildingHeights = [80, 130, 60, 100, 150, 70, 110, 90, 140, 60, 120, 85, 95, 130, 70];
    const buildingWidths = [40, 30, 50, 35, 25, 45, 30, 55, 28, 48, 32, 42, 38, 26, 44];
    ctx.fillStyle = "rgba(10,5,30,0.95)";
    let bx = -((bgOffset * 0.5) % 80);
    for (let i = 0; i < 20; i++) {
      const idx = i % buildingHeights.length;
      const bh = buildingHeights[idx];
      const bw = buildingWidths[idx];
      const by = H * 0.65 - bh;
      ctx.fillRect(bx, by, bw - 2, bh);

      // Windows
      ctx.fillStyle = "rgba(255,220,100,0.6)";
      for (let wy = by + 8; wy < H * 0.65 - 10; wy += 12) {
        for (let wx = bx + 5; wx < bx + bw - 8; wx += 10) {
          if (Math.sin(wx * 3.7 + wy * 2.3 + t * 0.01) > 0.2) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      }
      ctx.fillStyle = "rgba(10,5,30,0.95)";
      bx += bw + 4;
    }

    // Mountains / hills
    ctx.fillStyle = "rgba(20,10,40,0.8)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.65);
    const hillOffset = bgOffset * 0.2;
    for (let mx = 0; mx <= W + 60; mx += 60) {
      const idx = Math.floor((mx + hillOffset) / 60) % 5;
      const hillH = [40, 70, 55, 80, 45][idx];
      ctx.lineTo(mx - (hillOffset % 60), H * 0.65 - hillH);
      ctx.lineTo(mx - (hillOffset % 60) + 60, H * 0.65);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // ---- Road ----
    const roadTop = H * 0.65;
    const roadBot = H;

    // Road gradient
    const roadGrd = ctx.createLinearGradient(0, roadTop, 0, roadBot);
    roadGrd.addColorStop(0, "#1a1a2e");
    roadGrd.addColorStop(0.3, "#16213e");
    roadGrd.addColorStop(1, "#0f3460");
    ctx.fillStyle = roadGrd;
    ctx.fillRect(0, roadTop, W, roadBot - roadTop);

    // Road edge lines (glowing)
    const drawGlowLine = (y: number, color: string, width: number, alpha: number) => {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.restore();
    };

    drawGlowLine(roadTop, "#00FFFF", 2, 0.8);
    drawGlowLine(H - 4, "#00FFFF", 2, 0.5);

    // Dashed center line (animated)
    ctx.save();
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -roadOffset * 2;
    ctx.strokeStyle = "rgba(255,255,0,0.6)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#FFFF00";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, roadTop + (roadBot - roadTop) * 0.4);
    ctx.lineTo(W, roadTop + (roadBot - roadTop) * 0.4);
    ctx.stroke();
    ctx.restore();

    // Road markings - lane lines
    ctx.save();
    ctx.setLineDash([20, 60]);
    ctx.lineDashOffset = -roadOffset * 2;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadTop + (roadBot - roadTop) * 0.15);
    ctx.lineTo(W, roadTop + (roadBot - roadTop) * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, roadTop + (roadBot - roadTop) * 0.65);
    ctx.lineTo(W, roadTop + (roadBot - roadTop) * 0.65);
    ctx.stroke();
    ctx.restore();

    // Speed lines (when going fast) - deterministic, seeded by t
    if (bikeSpeed > 3) {
      const alpha = Math.min((bikeSpeed - 3) / 9, 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      const color = boostActive ? "#FF6600" : "#00CCFF";
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 3;
      ctx.lineWidth = 1;
      const roadH = roadBot - roadTop;
      for (let i = 0; i < 20; i++) {
        // Pseudo-random but deterministic per i
        const seed = (i * 7919 + Math.floor(t * bikeSpeed * 0.5)) % 1000;
        const lineY = roadTop + ((seed * 9.3) % roadH);
        const lineX = (((seed * 3.7 + t * bikeSpeed * 2) % (W + 200)) + W + 200) % (W + 200) - 100;
        const lineLen = 15 + (seed % 50) * (bikeSpeed / 10);
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(lineX - lineLen, lineY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---- Particles ----
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      if (p.type === "smoke") {
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grd.addColorStop(0, p.color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "exhaust") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // spark / star
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        if (p.type === "star") {
          // Draw star shape
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(t * 0.1);
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const angle = (s * Math.PI * 2) / 5 - Math.PI / 2;
            const outerX = Math.cos(angle) * p.size;
            const outerY = Math.sin(angle) * p.size;
            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * (p.size * 0.4);
            const innerY = Math.sin(innerAngle) * (p.size * 0.4);
            if (s === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // ---- Bike ----
    drawBike(ctx, bikeX, bikeY, bikeSpeed, boostActive, t);

    // ---- Floating texts ----
    for (const ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.life;
      ctx.font = `bold ${14 + Math.round((1 - ft.life) * 4)}px Orbitron, monospace`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.textAlign = "center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Boost vignette overlay
    if (boostActive) {
      const pulse = Math.sin(t * 0.3) * 0.03 + 0.06;
      ctx.save();
      ctx.globalAlpha = pulse;
      const bGrd = ctx.createLinearGradient(0, 0, W, 0);
      bGrd.addColorStop(0, "#FF6600");
      bGrd.addColorStop(0.5, "transparent");
      bGrd.addColorStop(1, "#FF6600");
      ctx.fillStyle = bGrd;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Road neon reflections on the pavement
    if (bikeSpeed > 1) {
      ctx.save();
      ctx.globalAlpha = Math.min(bikeSpeed / 15, 0.35);
      // Cyan reflection pool
      const refGrd = ctx.createLinearGradient(0, H * 0.65, 0, H * 0.75);
      refGrd.addColorStop(0, boostActive ? "rgba(255,100,0,0.8)" : "rgba(0,255,255,0.8)");
      refGrd.addColorStop(1, "transparent");
      ctx.fillStyle = refGrd;
      ctx.fillRect(0, H * 0.65, W, H * 0.15);
      ctx.restore();
    }

    // Vignette
    ctx.save();
    const vigGrd = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    vigGrd.addColorStop(0, "transparent");
    vigGrd.addColorStop(1, "rgba(0,0,10,0.4)");
    ctx.fillStyle = vigGrd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    ctx.restore(); // end shake transform
  }, [state, width, height]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
