import { useEffect, useRef } from "react";
import type { GameEngineState } from "./useGameEngine";
import type { VehicleType } from "./gameTypes";

interface Props {
  state: GameEngineState;
  width: number;
  height: number;
}

const CYAN = "#73f7ff";
const BLUE = "#2b9dff";
const WHITE = "#eafcff";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function polygon(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function drawCity(
  ctx: CanvasRenderingContext2D,
  w: number,
  horizon: number,
  time: number,
  offset: number,
) {
  // Distant atmospheric skyline.
  const haze = ctx.createLinearGradient(0, horizon - 100, 0, horizon + 35);
  haze.addColorStop(0, "rgba(26,93,126,0)");
  haze.addColorStop(1, "rgba(44,170,205,0.13)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizon - 100, w, 140);

  const buildings = [
    [0.04, 0.24, 0.10], [0.10, 0.40, 0.07], [0.16, 0.29, 0.12],
    [0.23, 0.52, 0.065], [0.29, 0.32, 0.10], [0.37, 0.44, 0.07],
    [0.44, 0.30, 0.09], [0.51, 0.48, 0.065], [0.58, 0.34, 0.09],
    [0.65, 0.55, 0.07], [0.72, 0.32, 0.10], [0.80, 0.45, 0.075],
    [0.87, 0.31, 0.10], [0.94, 0.42, 0.09],
  ];

  for (let i = 0; i < buildings.length; i++) {
    const [fraction, heightFactor, widthFactor] = buildings[i];
    const drift = ((offset * (0.10 + (i % 3) * 0.035)) % (w + 100));
    const bw = w * widthFactor;
    const bh = horizon * heightFactor;
    const x = ((fraction * w - drift + w + 100) % (w + 100)) - 50;
    const y = horizon - bh;

    const facade = ctx.createLinearGradient(x, y, x + bw, horizon);
    facade.addColorStop(0, "#111c2b");
    facade.addColorStop(0.55, "#080e18");
    facade.addColorStop(1, "#04080e");
    ctx.fillStyle = facade;
    ctx.fillRect(x, y, bw, bh);

    ctx.strokeStyle = "rgba(111,223,255,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh);

    // Architectural vertical light strips.
    if (i % 3 === 0) {
      ctx.fillStyle = "rgba(83,224,255,0.35)";
      ctx.fillRect(x + bw * 0.72, y + 5, 2, bh * 0.72);
    }

    const cols = Math.max(2, Math.floor(bw / 11));
    const rows = Math.max(2, Math.floor(bh / 13));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const lit = Math.sin(i * 17 + row * 8.3 + col * 3.1) > 0.18;
        if (!lit) continue;
        const alpha = 0.16 + (Math.sin(time * 0.002 + i + row) + 1) * 0.07;
        ctx.fillStyle = i % 4 === 0
          ? `rgba(96,224,255,${alpha})`
          : `rgba(191,217,237,${alpha * 0.65})`;
        ctx.fillRect(x + 5 + col * (bw - 10) / cols, y + 7 + row * 11, 2.5, 4);
      }
    }
  }

  // A few skyline beacons.
  for (let i = 0; i < 4; i++) {
    const x = w * (0.18 + i * 0.21) + Math.sin(time * 0.001 + i) * 7;
    const top = horizon - (0.30 + (i % 2) * 0.10) * horizon;
    ctx.strokeStyle = "rgba(77,225,255,0.28)";
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, horizon);
    ctx.stroke();
    ctx.fillStyle = CYAN;
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 12;
    ctx.fillRect(x - 1.5, top - 2, 3, 4);
    ctx.shadowBlur = 0;
  }
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizon: number,
  speed: number,
  roadOffset: number,
  time: number,
  boost: boolean,
) {
  const cx = w * 0.5;
  const topHalf = w * 0.045;
  const bottomHalf = w * 0.68;

  // Dark ground outside the road.
  const ground = ctx.createLinearGradient(0, horizon, 0, h);
  ground.addColorStop(0, "#081018");
  ground.addColorStop(1, "#020407");
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Road body.
  const roadGradient = ctx.createLinearGradient(0, horizon, 0, h);
  roadGradient.addColorStop(0, "#101a24");
  roadGradient.addColorStop(0.42, "#0b121a");
  roadGradient.addColorStop(1, "#05090e");
  polygon(ctx, [
    [cx - topHalf, horizon],
    [cx + topHalf, horizon],
    [cx + bottomHalf, h],
    [cx - bottomHalf, h],
  ]);
  ctx.fillStyle = roadGradient;
  ctx.fill();

  // Subtle asphalt texture bands.
  for (let i = 0; i < 24; i++) {
    const p = ((i / 24) + ((roadOffset * 0.0007) % 1)) % 1;
    const y = horizon + Math.pow(p, 1.75) * (h - horizon);
    const half = topHalf + (bottomHalf - topHalf) * p;
    ctx.strokeStyle = `rgba(116,176,199,${0.025 + p * 0.035})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - half, y);
    ctx.lineTo(cx + half, y);
    ctx.stroke();
  }

  // Road edges with restrained cyan light.
  for (const side of [-1, 1]) {
    const edge = ctx.createLinearGradient(0, horizon, 0, h);
    edge.addColorStop(0, "rgba(92,226,255,0.22)");
    edge.addColorStop(0.35, boost ? "rgba(90,237,255,0.75)" : "rgba(65,185,220,0.48)");
    edge.addColorStop(1, "rgba(63,165,210,0.15)");
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(1.5, w * 0.0024);
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = boost ? 18 : 10;
    ctx.beginPath();
    ctx.moveTo(cx + side * topHalf, horizon);
    ctx.lineTo(cx + side * bottomHalf, h);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Perspective lane markers, animated toward the camera.
  const markerCount = 13;
  for (let i = 0; i < markerCount; i++) {
    const p = ((i / markerCount) + ((roadOffset * 0.0016) % 1)) % 1;
    const y = horizon + Math.pow(p, 1.82) * (h - horizon);
    const scale = 0.06 + p * 1.25;
    const markerW = Math.max(1, w * 0.003 * scale);
    const markerH = Math.max(3, h * 0.016 * scale);
    const alpha = 0.16 + p * 0.58;
    ctx.fillStyle = `rgba(168,230,244,${alpha})`;
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = p > 0.55 ? 7 : 0;
    roundedRect(ctx, cx - markerW / 2, y, markerW, markerH, markerW);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Reflective wet-road streaks.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 16; i++) {
    const p = ((i / 16) + ((roadOffset * 0.0009) % 1)) % 1;
    const y = horizon + Math.pow(p, 1.9) * (h - horizon);
    const half = topHalf + (bottomHalf - topHalf) * p;
    const x = cx + Math.sin(i * 12.7 + time * 0.001) * half * 0.66;
    const streakW = (5 + p * 35) * (w / 1200);
    const streak = ctx.createLinearGradient(x - streakW, y, x + streakW, y);
    streak.addColorStop(0, "rgba(83,225,255,0)");
    streak.addColorStop(0.5, `rgba(83,225,255,${0.02 + p * 0.10})`);
    streak.addColorStop(1, "rgba(83,225,255,0)");
    ctx.fillStyle = streak;
    ctx.fillRect(x - streakW, y, streakW * 2, Math.max(1, p * 3));
  }
  ctx.restore();

  // Low ground glow.
  const glow = ctx.createRadialGradient(cx, h * 0.83, 0, cx, h * 0.83, w * 0.55);
  glow.addColorStop(0, boost ? "rgba(49,190,255,0.13)" : "rgba(37,139,176,0.075)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, horizon, w, h - horizon);
}

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleType,
  x: number,
  y: number,
  speed: number,
  boost: boolean,
  time: number,
  crashed: boolean,
) {
  const scale = Math.max(
    1.0,
    Math.min(
      1.55,
      Math.min(window.innerWidth, window.innerHeight) / 650,
    ),
  );

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Keep vehicle straight on the road. No sideways rotation.
  const bob = Math.sin(time * 0.006) * Math.min(1.2, speed / 100);
  ctx.translate(0, bob);

  const bike = vehicle === "bike";
  const truck = vehicle === "truck";
  const sports = vehicle === "sports-car";
  const supercar = vehicle === "supercar";

  const bodyW = bike ? 58 : truck ? 112 : 118;
  const bodyH = bike ? 68 : truck ? 72 : 70;
  const accent = boost ? "#aefcff" : "#64e7fa";

  // Ground contact shadow.
  ctx.save();
  const shadow = ctx.createRadialGradient(0, 37, 2, 0, 37, bodyW * 0.72);
  shadow.addColorStop(
    0,
    boost
      ? "rgba(65,226,255,0.24)"
      : "rgba(45,164,195,0.16)",
  );
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(0, 39, bodyW * 0.58, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Forward speed trails stay behind the vehicle, never sideways.
  if (speed > 10 && !crashed) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.42, speed / 300);
    for (let i = 0; i < 7; i++) {
      const xOffset = bike ? (i - 3) * 3 : (i - 3) * 10;
      const length = 22 + ((time * 0.08 + i * 17) % 42) * (speed / 140);
      const trail = ctx.createLinearGradient(
        xOffset,
        bodyH * 0.30,
        xOffset,
        bodyH * 0.30 + length,
      );
      trail.addColorStop(0, "rgba(78,225,255,0.55)");
      trail.addColorStop(1, "rgba(78,225,255,0)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = i % 2 ? 1 : 1.5;
      ctx.beginPath();
      ctx.moveTo(xOffset, bodyH * 0.28);
      ctx.lineTo(xOffset, bodyH * 0.28 + length);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (bike) {
    // ---------------- MOTORCYCLE - DIRECT REAR VIEW ----------------
    // Narrow rear tyre, centered chassis, no side-facing elements.
    ctx.save();

    ctx.fillStyle = "#020406";
    ctx.beginPath();
    ctx.ellipse(0, 24, 11, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#91aeb9";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "rgba(105,232,250,0.72)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 24, 6, 18, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#203d4b";
    ctx.beginPath();
    ctx.arc(0, 24, 3, 0, Math.PI * 2);
    ctx.fill();

    // Rear fairing.
    const bikeBody = ctx.createLinearGradient(0, -42, 0, 25);
    bikeBody.addColorStop(0, "#d8f7fb");
    bikeBody.addColorStop(0.12, "#507b8b");
    bikeBody.addColorStop(0.38, "#173341");
    bikeBody.addColorStop(0.82, "#09151d");
    bikeBody.addColorStop(1, "#030609");

    ctx.fillStyle = bikeBody;
    polygon(ctx, [
      [-12, -28],
      [-8, -40],
      [8, -40],
      [12, -28],
      [16, 9],
      [9, 20],
      [0, 25],
      [-9, 20],
      [-16, 9],
    ]);
    ctx.fill();

    ctx.strokeStyle = "rgba(156,240,253,0.80)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Rear seat / rider silhouette.
    ctx.fillStyle = "#05090d";
    roundedRect(ctx, -8, -29, 16, 13, 5);
    ctx.fill();

    ctx.fillStyle = "#101c25";
    ctx.beginPath();
    ctx.ellipse(0, -40, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(140,229,246,0.48)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#071219";
    roundedRect(ctx, -6, -42, 12, 4, 2);
    ctx.fill();

    // Tail light.
    ctx.save();
    ctx.shadowColor = "#ff3e58";
    ctx.shadowBlur = boost ? 18 : 10;
    ctx.fillStyle = "#ff4058";
    roundedRect(ctx, -8, -4, 16, 5, 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#ffdfe3";
    roundedRect(ctx, -2, -4, 4, 5, 1);
    ctx.fill();

    ctx.restore();
  } else {
    // ---------------- CAR / TRUCK - DIRECT REAR VIEW ----------------
    // Everything is symmetrical around x=0, so vehicle is visibly facing
    // straight down the road rather than looking left/right.

    const bodyTop = truck ? -31 : -35;
    const bodyBottom = 31;
    const bodyLeft = -bodyW / 2;
    const bodyRight = bodyW / 2;

    const bodyGradient = ctx.createLinearGradient(
      0,
      bodyTop,
      0,
      bodyBottom,
    );

    if (sports) {
      bodyGradient.addColorStop(0, "#dfe8ff");
      bodyGradient.addColorStop(0.08, "#b64c61");
      bodyGradient.addColorStop(0.32, "#542333");
      bodyGradient.addColorStop(0.72, "#171923");
      bodyGradient.addColorStop(1, "#05070b");
    } else if (supercar) {
      bodyGradient.addColorStop(0, "#eef2ff");
      bodyGradient.addColorStop(0.08, "#7779e4");
      bodyGradient.addColorStop(0.34, "#30345f");
      bodyGradient.addColorStop(0.72, "#151a2a");
      bodyGradient.addColorStop(1, "#05070c");
    } else if (truck) {
      bodyGradient.addColorStop(0, "#d7f4fb");
      bodyGradient.addColorStop(0.08, "#4d91a9");
      bodyGradient.addColorStop(0.34, "#21495c");
      bodyGradient.addColorStop(0.72, "#10222c");
      bodyGradient.addColorStop(1, "#05090d");
    } else {
      bodyGradient.addColorStop(0, "#e1f3f6");
      bodyGradient.addColorStop(0.08, "#517888");
      bodyGradient.addColorStop(0.34, "#263e4c");
      bodyGradient.addColorStop(0.72, "#111e27");
      bodyGradient.addColorStop(1, "#05080c");
    }

    ctx.fillStyle = bodyGradient;

    if (truck) {
      polygon(ctx, [
        [bodyLeft + 4, -27],
        [bodyRight - 4, -27],
        [bodyRight, 23],
        [bodyRight - 8, bodyBottom],
        [bodyLeft + 8, bodyBottom],
        [bodyLeft, 23],
      ]);
    } else if (sports) {
      polygon(ctx, [
        [-48, -25],
        [-36, -36],
        [36, -36],
        [48, -25],
        [54, 16],
        [43, 29],
        [-43, 29],
        [-54, 16],
      ]);
    } else if (supercar) {
      polygon(ctx, [
        [-51, -23],
        [-37, -36],
        [37, -36],
        [51, -23],
        [55, 16],
        [40, 30],
        [-40, 30],
        [-55, 16],
      ]);
    } else {
      polygon(ctx, [
        [-48, -25],
        [-35, -35],
        [35, -35],
        [48, -25],
        [52, 17],
        [42, 30],
        [-42, 30],
        [-52, 17],
      ]);
    }

    ctx.fill();

    ctx.strokeStyle = "rgba(155,241,253,0.86)";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Upper rear glass - wide and symmetrical.
    const glassGradient = ctx.createLinearGradient(
      0,
      -31,
      0,
      -3,
    );

    glassGradient.addColorStop(0, "#aeeaf2");
    glassGradient.addColorStop(0.13, "#4c7583");
    glassGradient.addColorStop(0.48, "#1a3542");
    glassGradient.addColorStop(1, "#07131b");

    ctx.fillStyle = glassGradient;

    if (truck) {
      roundedRect(ctx, -43, -22, 86, 28, 4);
    } else {
      polygon(ctx, [
        [-34, -28],
        [34, -28],
        [43, -6],
        [-43, -6],
      ]);
    }

    ctx.fill();

    ctx.strokeStyle = "rgba(181,243,251,0.60)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rear-window split and subtle reflection.
    ctx.strokeStyle = "rgba(220,250,255,0.20)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -27);
    ctx.lineTo(0, -7);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.moveTo(-26, -25);
    ctx.lineTo(17, -25);
    ctx.stroke();

    // Shoulder lines create real body depth.
    ctx.strokeStyle = "rgba(141,226,241,0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-44, -4);
    ctx.lineTo(-49, 18);
    ctx.moveTo(44, -4);
    ctx.lineTo(49, 18);
    ctx.stroke();

    // Wide LED tail lamps.
    ctx.save();
    ctx.shadowColor = "#ff3652";
    ctx.shadowBlur = boost ? 22 : 14;
    ctx.fillStyle = "#ff3f58";

    if (truck) {
      roundedRect(ctx, -45, 1, 31, 8, 3);
      ctx.fill();
      roundedRect(ctx, 14, 1, 31, 8, 3);
      ctx.fill();
    } else {
      roundedRect(ctx, -43, 1, 34, 8, 3);
      ctx.fill();
      roundedRect(ctx, 9, 1, 34, 8, 3);
      ctx.fill();
    }

    ctx.restore();

    // LED highlights.
    ctx.fillStyle = "rgba(255,213,218,0.82)";
    roundedRect(ctx, -37, 2, 18, 2, 1);
    ctx.fill();
    roundedRect(ctx, 19, 2, 18, 2, 1);
    ctx.fill();

    // Center brake strip.
    ctx.save();
    ctx.shadowColor = "#ff3e57";
    ctx.shadowBlur = 9;
    ctx.fillStyle = "#ff5268";
    roundedRect(ctx, -4, 1, 8, 7, 2);
    ctx.fill();
    ctx.restore();

    // Lower bumper.
    const bumper = ctx.createLinearGradient(
      0,
      8,
      0,
      32,
    );
    bumper.addColorStop(0, "#1a303b");
    bumper.addColorStop(0.5, "#09151d");
    bumper.addColorStop(1, "#020508");

    ctx.fillStyle = bumper;

    polygon(ctx, [
      [bodyLeft + 8, 8],
      [bodyLeft + 14, 27],
      [-23, 33],
      [23, 33],
      [bodyRight - 14, 27],
      [bodyRight - 8, 8],
    ]);

    ctx.fill();

    ctx.strokeStyle = "rgba(112,225,243,0.46)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bodyLeft + 14, 27);
    ctx.quadraticCurveTo(0, 34, bodyRight - 14, 27);
    ctx.stroke();

    // Sport diffuser.
    ctx.fillStyle = "#020406";
    polygon(ctx, [
      [-25, 27],
      [-17, 35],
      [-8, 30],
      [0, 35],
      [8, 30],
      [17, 35],
      [25, 27],
      [16, 30],
      [-16, 30],
    ]);
    ctx.fill();

    // Exhausts for performance cars.
    if (!truck) {
      for (const ex of [-27, 27]) {
        ctx.fillStyle = "#010203";
        ctx.beginPath();
        ctx.ellipse(ex, 28, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(125,177,189,0.60)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (boost && speed > 15) {
          ctx.save();
          ctx.shadowColor = "#59ddff";
          ctx.shadowBlur = 10;
          ctx.fillStyle = "rgba(137,240,255,0.75)";
          ctx.beginPath();
          ctx.ellipse(ex, 31, 3, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Small, realistic rear wheels.
    // IMPORTANT: vehicle position is untouched.
    // Wheels are smaller and tucked closer to the body so they
    // read as real tires instead of large circular side pieces.
    const wheelX = truck ? 44 : 40;
    const wheelY = 21;

    const drawWheel = (wx: number) => {
      // Tire sidewall
      ctx.fillStyle = "#010204";
      ctx.beginPath();
      ctx.ellipse(
        wx,
        wheelY,
        7,
        10,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.strokeStyle = "rgba(132,157,167,0.72)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner rim
      const rim = ctx.createRadialGradient(
        wx - 1,
        wheelY - 1,
        0.5,
        wx,
        wheelY,
        5.5,
      );

      rim.addColorStop(0, "#9bbbc4");
      rim.addColorStop(0.22, "#4c6974");
      rim.addColorStop(0.58, "#172d38");
      rim.addColorStop(1, "#050b10");

      ctx.fillStyle = rim;

      ctx.beginPath();
      ctx.ellipse(
        wx,
        wheelY,
        4.7,
        6.8,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.strokeStyle = "rgba(139,221,237,0.38)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Hub
      ctx.fillStyle = "#08141b";
      ctx.beginPath();
      ctx.arc(
        wx,
        wheelY,
        1.7,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.strokeStyle = "rgba(208,244,250,0.32)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Tiny vertical rim highlight for depth
      ctx.strokeStyle = "rgba(210,244,250,0.20)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(wx, wheelY - 4.5);
      ctx.lineTo(wx, wheelY + 4.5);
      ctx.stroke();
    };

    drawWheel(-wheelX);
    drawWheel(wheelX);

    // Cyan body edge highlights.
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.62;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bodyLeft + 10, -2);
    ctx.lineTo(bodyLeft + 15, 17);
    ctx.moveTo(bodyRight - 10, -2);
    ctx.lineTo(bodyRight - 15, 17);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Vertical boost plume = vehicle accelerating forward.
  if (boost && speed > 10 && !crashed) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const plume = ctx.createLinearGradient(
      0,
      bodyH * 0.30,
      0,
      bodyH * 1.45,
    );
    plume.addColorStop(0, "rgba(224,253,255,0.50)");
    plume.addColorStop(0.24, "rgba(61,220,255,0.30)");
    plume.addColorStop(1, "rgba(61,180,255,0)");

    ctx.fillStyle = plume;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.12, bodyH * 0.36);
    ctx.quadraticCurveTo(
      -bodyW * 0.20,
      bodyH * 0.82,
      -bodyW * 0.07,
      bodyH * 1.32,
    );
    ctx.quadraticCurveTo(
      0,
      bodyH * 1.48,
      bodyW * 0.07,
      bodyH * 1.32,
    );
    ctx.quadraticCurveTo(
      bodyW * 0.20,
      bodyH * 0.82,
      bodyW * 0.12,
      bodyH * 0.36,
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

export default function GameCanvas({ state, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const dimensionsRef = useRef({ width, height });

  stateRef.current = state;
  dimensionsRef.current = { width, height };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let time = 0;
    let last = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width: w, height: h } = dimensionsRef.current;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      raf = window.requestAnimationFrame(draw);
      const delta = last ? Math.min(40, now - last) : 16;
      last = now;
      time += delta;

      const s = stateRef.current;
      const { width: w, height: h } = dimensionsRef.current;
      if (w <= 0 || h <= 0) return;

      const speed = Math.max(0, s.bikeSpeed || 0);
      const boost = !!s.boostActive;
      const horizon = h * 0.405;
      const cx = w * 0.5;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Cinematic graphite sky.
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#030609");
      sky.addColorStop(0.38, "#07111b");
      sky.addColorStop(0.64, "#0b1b27");
      sky.addColorStop(1, "#020508");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Distant light bloom.
      const bloom = ctx.createRadialGradient(cx, horizon * 0.76, 0, cx, horizon * 0.76, w * 0.52);
      bloom.addColorStop(0, "rgba(49,166,202,0.20)");
      bloom.addColorStop(0.35, "rgba(22,91,124,0.09)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h * 0.72);

      // Distant atmospheric particles.
      for (let i = 0; i < 54; i++) {
        const x = (i * 173.7 + Math.sin(time * 0.00025 + i) * 8) % w;
        const y = (i * 83.9) % (h * 0.56);
        const alpha = 0.08 + (Math.sin(time * 0.0012 + i) + 1) * 0.06;
        ctx.fillStyle = `rgba(151,229,255,${alpha})`;
        ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
      }

      drawCity(ctx, w, horizon, time, s.bgOffset || 0);

      // Elevated skyline edge and low fog.
      const fog = ctx.createLinearGradient(0, horizon - 35, 0, horizon + 80);
      fog.addColorStop(0, "rgba(35,123,155,0)");
      fog.addColorStop(0.58, "rgba(65,191,221,0.12)");
      fog.addColorStop(1, "rgba(4,13,21,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, horizon - 35, w, 115);

      drawRoad(ctx, w, h, horizon, speed, s.roadOffset || 0, time, boost);

      // Moving side light bars reinforce forward motion.
      const roadTop = horizon;
      for (let i = 0; i < 10; i++) {
        const p = ((i / 10) + (((s.roadOffset || 0) * 0.0012) % 1)) % 1;
        const y = roadTop + Math.pow(p, 1.65) * (h - roadTop);
        const roadHalf = w * (0.045 + p * 0.63);
        const len = 5 + p * 22;
        ctx.strokeStyle = `rgba(67,205,242,${0.08 + p * 0.25})`;
        ctx.lineWidth = 1 + p * 1.4;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + side * (roadHalf + 4), y);
          ctx.lineTo(cx + side * (roadHalf + 4 + len), y + len * 0.4);
          ctx.stroke();
        }
      }

      // World particles from the engine.
      for (const p of s.particles || []) {
        const life = Math.max(0, Math.min(1, p.life));
        const px = w * 0.5 + (p.x || 0) * 0.22;
        const py = h * 0.72 + (p.y || 0) * 0.28;
        ctx.save();
        ctx.globalAlpha = life * 0.7;
        ctx.fillStyle = p.color || CYAN;
        ctx.shadowColor = p.color || CYAN;
        ctx.shadowBlur = p.type === "spark" ? 12 : 5;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, (p.size || 2) * 0.8), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Vehicle follows a smooth, small camera sway.
      const vehicleX = w * 0.5;
      const vehicleY = h * 0.60 + Math.sin(time * 0.006) * Math.min(1.2, speed / 100);
      ctx.save();
      if (s.shake > 0) {
        ctx.translate((Math.sin(time * 0.08) * s.shake) * 0.22, (Math.cos(time * 0.1) * s.shake) * 0.16);
      }
      drawVehicle(ctx, s.vehicle, vehicleX, vehicleY, speed, boost, time, !!s.gameOver);
      ctx.restore();

      // Cinematic vignette.
      const vignette = ctx.createRadialGradient(cx, h * 0.48, h * 0.15, cx, h * 0.48, Math.max(w, h) * 0.78);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.72, "rgba(0,0,0,0.18)");
      vignette.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Cinematic frame edges.
      ctx.strokeStyle = "rgba(122,225,246,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, 10.5, w - 21, h - 21);

      // Small road telemetry marks, not a competing HUD.
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = CYAN;
      ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("MTR / NIGHT RUN", 28, h - 28);
      ctx.textAlign = "right";
      ctx.fillText(`SECTOR ${String(Math.max(1, s.level)).padStart(2, "0")}`, w - 28, h - 28);
      ctx.restore();

      // Pause / game-over atmospheric overlay; controls remain owned by App.
      if (s.paused || s.gameOver) {
        ctx.fillStyle = "rgba(2,6,10,0.48)";
        ctx.fillRect(0, 0, w, h);
        const panelW = Math.min(380, w * 0.78);
        const panelH = 118;
        const px = (w - panelW) / 2;
        const py = h * 0.39;
        ctx.save();
        ctx.shadowColor = "rgba(67,211,245,0.2)";
        ctx.shadowBlur = 28;
        roundedRect(ctx, px, py, panelW, panelH, 18);
        ctx.fillStyle = "rgba(8,18,27,0.78)";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(123,231,255,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.textAlign = "center";
        ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = "rgba(134,229,248,0.7)";
        ctx.fillText("MOTO TYPE RACER  /  COCKPIT", w / 2, py + 28);
        ctx.fillStyle = WHITE;
        ctx.font = "700 27px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.fillText(s.gameOver ? "SESSION COMPLETE" : "PAUSED", w / 2, py + 66);
        ctx.fillStyle = "rgba(225,245,250,0.62)";
        ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.fillText(s.gameOver ? "Review your run in the results panel" : "Press ESC to return to the race", w / 2, py + 91);
        ctx.restore();
      }

      ctx.restore();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="MOTO TYPE RACER futuristic racing scene"
      style={{
        display: "block",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#030609",
      }}
    />
  );
}
