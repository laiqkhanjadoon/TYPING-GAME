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
  gameOver: boolean,
) {
  /*
    REAR CAMERA VEHICLE
    - centered
    - straight ahead
    - smaller proportional wheels
    - deeper 3D body
    - premium futuristic materials
  */

  const scale = Math.max(
    1.05,
    Math.min(
      1.7,
      Math.min(window.innerWidth, window.innerHeight) / 500,
    ),
  );

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const suspension =
    Math.sin(time * 0.006) * Math.min(1.4, speed / 90);

  ctx.translate(0, suspension);

  const isBike = vehicle === "bike";
  const isTruck = vehicle === "truck";

  const carWidth = isTruck ? 104 : 96;
  const carHeight = isTruck ? 62 : 60;

  const accent = boost ? "#b9ffff" : "#69eaff";

  /* -----------------------------
     soft contact shadow
  ----------------------------- */

  ctx.save();
  ctx.globalAlpha = 0.7;

  const shadow = ctx.createRadialGradient(
    0,
    38,
    2,
    0,
    38,
    isBike ? 40 : 72,
  );

  shadow.addColorStop(
    0,
    boost
      ? "rgba(61,224,255,0.24)"
      : "rgba(48,170,205,0.14)",
  );

  shadow.addColorStop(
    1,
    "rgba(0,0,0,0)",
  );

  ctx.fillStyle = shadow;

  ctx.beginPath();
  ctx.ellipse(
    0,
    39,
    isBike ? 32 : 62,
    isBike ? 9 : 12,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.restore();

  /* -----------------------------
     speed trails behind vehicle
  ----------------------------- */

  if (speed > 18 && !gameOver) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.42, speed / 650);

    for (let i = 0; i < 7; i++) {
      const offsetX =
        isBike
          ? (i - 3) * 3
          : (i - 3) * 10;

      const startY = 27 + i * 2;
      const length =
        24 +
        ((time * 0.06 + i * 17) % 45) *
          (speed / 160);

      const trail = ctx.createLinearGradient(
        0,
        startY,
        0,
        startY + length,
      );

      trail.addColorStop(
        0,
        "rgba(91,230,255,0.55)",
      );

      trail.addColorStop(
        1,
        "rgba(91,230,255,0)",
      );

      ctx.strokeStyle = trail;
      ctx.lineWidth = i % 2 ? 1 : 1.5;

      ctx.beginPath();
      ctx.moveTo(offsetX, startY);
      ctx.lineTo(offsetX, startY + length);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* =========================================================
     BIKE — PREMIUM REAR VIEW
  ========================================================= */

  if (isBike) {
    /*
      Bike stays narrow and centered.
      Tire is intentionally smaller than previous version.
    */

    /* rear tire */

    ctx.fillStyle = "#020407";

    ctx.beginPath();
    ctx.ellipse(
      0,
      18,
      12,
      23,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = "#718d9a";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* wheel rim */

    ctx.strokeStyle = "rgba(128,235,255,0.78)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(
      0,
      18,
      6,
      16,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.fillStyle = "#172d39";
    ctx.beginPath();
    ctx.ellipse(
      0,
      18,
      2.5,
      8,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    /* rear body */

    const bikeBody = ctx.createLinearGradient(
      -18,
      -34,
      18,
      25,
    );

    bikeBody.addColorStop(0, "#a9dfe9");
    bikeBody.addColorStop(0.10, "#3d7181");
    bikeBody.addColorStop(0.42, "#172f3d");
    bikeBody.addColorStop(0.78, "#0a141c");
    bikeBody.addColorStop(1, "#03070b");

    ctx.fillStyle = bikeBody;

    polygon(ctx, [
      [-13, -21],
      [-9, -32],
      [9, -32],
      [13, -21],
      [15, 10],
      [8, 20],
      [0, 24],
      [-8, 20],
      [-15, 10],
    ]);

    ctx.fill();

    ctx.strokeStyle = "rgba(154,241,255,0.78)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    /* seat / rider silhouette */

    ctx.fillStyle = "#050a0f";

    roundedRect(
      ctx,
      -7,
      -31,
      14,
      20,
      5,
    );

    ctx.fill();

    ctx.strokeStyle = "rgba(103,219,241,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    /* helmet */

    const helmet = ctx.createLinearGradient(
      -7,
      -48,
      7,
      -37,
    );

    helmet.addColorStop(0, "#b9f4fa");
    helmet.addColorStop(0.28, "#466f7d");
    helmet.addColorStop(1, "#071119");

    ctx.fillStyle = helmet;

    ctx.beginPath();
    ctx.ellipse(
      0,
      -42,
      7,
      7,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = "rgba(141,235,251,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    /* helmet visor */

    ctx.fillStyle = "rgba(3,12,18,0.9)";

    roundedRect(
      ctx,
      -5,
      -44,
      10,
      3,
      1,
    );

    ctx.fill();

    /* tail light */

    ctx.save();

    ctx.shadowColor = "#ff3f58";
    ctx.shadowBlur = boost ? 18 : 11;

    ctx.fillStyle = "#ff4159";

    roundedRect(
      ctx,
      -7,
      0,
      14,
      5,
      2,
    );

    ctx.fill();

    ctx.restore();

    /* indicators */

    ctx.fillStyle = "#ffb36a";
    ctx.shadowColor = "#ff9e55";
    ctx.shadowBlur = 5;

    roundedRect(
      ctx,
      -13,
      2,
      3,
      3,
      1,
    );

    ctx.fill();

    roundedRect(
      ctx,
      10,
      2,
      3,
      3,
      1,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* side cyan strips */

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.3;

    ctx.beginPath();

    ctx.moveTo(-12, -12);
    ctx.lineTo(-13, 9);

    ctx.moveTo(12, -12);
    ctx.lineTo(13, 9);

    ctx.stroke();
  } else {
    /* =====================================================
       CAR / TRUCK — PREMIUM REAR VIEW
    ===================================================== */

    const width = carWidth;
    const height = carHeight;

    /* rear body shell */

    const body = ctx.createLinearGradient(
      0,
      -height / 2,
      0,
      height / 2,
    );

    body.addColorStop(0, "#e5f7fa");
    body.addColorStop(
      0.08,
      vehicle === "sports-car"
        ? "#bd4b58"
        : vehicle === "supercar"
          ? "#7279dc"
          : vehicle === "truck"
            ? "#4b8ea8"
            : "#4c7180",
    );

    body.addColorStop(0.36, "#203e4d");
    body.addColorStop(0.70, "#0d1c26");
    body.addColorStop(1, "#03070b");

    ctx.fillStyle = body;

    if (isTruck) {
      polygon(ctx, [
        [-width / 2, -25],
        [width / 2, -25],
        [width / 2 - 5, 27],
        [-width / 2 + 5, 27],
      ]);
    } else {
      /* wider shoulder, narrow lower diffuser */
      polygon(ctx, [
        [-34, -27],
        [-25, -35],
        [25, -35],
        [34, -27],
        [44, 18],
        [35, 29],
        [-35, 29],
        [-44, 18],
      ]);
    }

    ctx.fill();

    /* outer body highlight */

    ctx.strokeStyle = "rgba(157,240,255,0.86)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* shoulder highlight */

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(-32, -27);
    ctx.lineTo(-22, -33);
    ctx.lineTo(22, -33);
    ctx.lineTo(32, -27);
    ctx.stroke();

    /* rear window */

    if (isTruck) {
      const truckGlass = ctx.createLinearGradient(
        0,
        -20,
        0,
        8,
      );

      truckGlass.addColorStop(
        0,
        "#5f8e9e",
      );

      truckGlass.addColorStop(
        0.25,
        "#1d3948",
      );

      truckGlass.addColorStop(
        1,
        "#07131b",
      );

      ctx.fillStyle = truckGlass;

      roundedRect(
        ctx,
        -34,
        -19,
        68,
        27,
        3,
      );

      ctx.fill();

      ctx.strokeStyle =
        "rgba(161,235,248,0.52)";

      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle =
        "rgba(190,243,250,0.16)";

      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 7);
      ctx.stroke();
    } else {
      const glass = ctx.createLinearGradient(
        0,
        -31,
        0,
        -7,
      );

      glass.addColorStop(
        0,
        "#b9f2f7",
      );

      glass.addColorStop(
        0.18,
        "#527b88",
      );

      glass.addColorStop(
        0.56,
        "#193441",
      );

      glass.addColorStop(
        1,
        "#07131b",
      );

      ctx.fillStyle = glass;

      polygon(ctx, [
        [-24, -28],
        [24, -28],
        [31, -9],
        [-31, -9],
      ]);

      ctx.fill();

      ctx.strokeStyle =
        "rgba(185,245,252,0.65)";

      ctx.lineWidth = 1;
      ctx.stroke();

      /* rear window split */

      ctx.strokeStyle =
        "rgba(213,249,255,0.20)";

      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(0, -10);
      ctx.stroke();

      /* glass reflection */

      ctx.strokeStyle =
        "rgba(255,255,255,0.18)";

      ctx.beginPath();
      ctx.moveTo(-19, -25);
      ctx.lineTo(8, -25);
      ctx.stroke();
    }

    /* ===================================================
       TAIL LIGHTS
    =================================================== */

    ctx.save();

    ctx.shadowColor = "#ff344f";
    ctx.shadowBlur = boost ? 20 : 13;

    /* left lamp */

    ctx.fillStyle = "#ff3f57";

    roundedRect(
      ctx,
      isTruck ? -40 : -37,
      -2,
      isTruck ? 28 : 24,
      7,
      3,
    );

    ctx.fill();

    /* right lamp */

    roundedRect(
      ctx,
      isTruck ? 12 : 13,
      -2,
      isTruck ? 28 : 24,
      7,
      3,
    );

    ctx.fill();

    ctx.restore();

    /* LED inner highlights */

    ctx.fillStyle =
      "rgba(255,190,197,0.80)";

    roundedRect(
      ctx,
      isTruck ? -35 : -33,
      0,
      isTruck ? 18 : 15,
      2,
      1,
    );

    ctx.fill();

    roundedRect(
      ctx,
      isTruck ? 17 : 18,
      0,
      isTruck ? 18 : 15,
      2,
      1,
    );

    ctx.fill();

    /* center brake LED */

    ctx.fillStyle = "#fff0f2";

    roundedRect(
      ctx,
      -2,
      -2,
      4,
      7,
      1.5,
    );

    ctx.fill();

    /* ===================================================
       LOWER BUMPER
    =================================================== */

    const bumperGradient =
      ctx.createLinearGradient(
        0,
        7,
        0,
        30,
      );

    bumperGradient.addColorStop(
      0,
      "#152a35",
    );

    bumperGradient.addColorStop(
      0.55,
      "#071119",
    );

    bumperGradient.addColorStop(
      1,
      "#020507",
    );

    ctx.fillStyle =
      bumperGradient;

    polygon(ctx, [
      [-(width / 2 - 10), 8],
      [-(width / 2 - 18), 27],
      [-22, 31],
      [22, 31],
      [width / 2 - 18, 27],
      [width / 2 - 10, 8],
    ]);

    ctx.fill();

    /* bumper edge */

    ctx.strokeStyle =
      "rgba(111,222,241,0.48)";

    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(
      -(width / 2 - 17),
      27,
    );
    ctx.quadraticCurveTo(
      0,
      34,
      width / 2 - 17,
      27,
    );
    ctx.stroke();

    /* diffuser */

    ctx.fillStyle = "#020406";

    polygon(ctx, [
      [-24, 25],
      [-16, 33],
      [16, 33],
      [24, 25],
      [15, 29],
      [-15, 29],
    ]);

    ctx.fill();

    /* exhausts */

    if (!isTruck) {
      for (
        const exhaustX of [-21, 21]
      ) {
        ctx.fillStyle = "#020304";

        ctx.beginPath();

        ctx.ellipse(
          exhaustX,
          27,
          4,
          2.5,
          0,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.strokeStyle =
          "rgba(105,170,183,0.55)";

        ctx.lineWidth = 1;

        ctx.stroke();
      }
    }

    /* ===================================================
       WHEELS
       smaller + integrated into body
    =================================================== */

    const wheelY = 20;
    const wheelX =
      isTruck ? 44 : 38;

    const drawWheel = (
      wheelXPosition: number,
    ) => {
      /* tire */

      ctx.fillStyle = "#020305";

      ctx.beginPath();

      ctx.ellipse(
        wheelXPosition,
        wheelY,
        8,
        12,
        0,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      /* tire edge */

      ctx.strokeStyle =
        "rgba(135,164,174,0.85)";

      ctx.lineWidth = 1.8;
      ctx.stroke();

      /* rim */

      const rim =
        ctx.createRadialGradient(
          wheelXPosition,
          wheelY,
          1,
          wheelXPosition,
          wheelY,
          6,
        );

      rim.addColorStop(
        0,
        "#6b9aa9",
      );

      rim.addColorStop(
        0.35,
        "#213c48",
      );

      rim.addColorStop(
        1,
        "#071018",
      );

      ctx.fillStyle = rim;

      ctx.beginPath();

      ctx.ellipse(
        wheelXPosition,
        wheelY,
        5,
        8,
        0,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      ctx.strokeStyle =
        "rgba(114,230,249,0.48)";

      ctx.lineWidth = 1;

      ctx.stroke();

      /* hub */

      ctx.fillStyle =
        "#07141c";

      ctx.beginPath();

      ctx.arc(
        wheelXPosition,
        wheelY,
        2,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      /* subtle rim spoke */

      ctx.strokeStyle =
        "rgba(185,238,247,0.35)";

      ctx.lineWidth = 0.8;

      ctx.beginPath();

      ctx.moveTo(
        wheelXPosition - 3,
        wheelY,
      );

      ctx.lineTo(
        wheelXPosition + 3,
        wheelY,
      );

      ctx.stroke();
    };

    drawWheel(-wheelX);
    drawWheel(wheelX);

    /* cyan side reflection */

    ctx.strokeStyle =
      accent;

    ctx.lineWidth = 1;

    ctx.globalAlpha = 0.6;

    ctx.beginPath();

    ctx.moveTo(
      -width / 2 + 8,
      -14,
    );

    ctx.lineTo(
      -width / 2 + 13,
      13,
    );

    ctx.moveTo(
      width / 2 - 8,
      -14,
    );

    ctx.lineTo(
      width / 2 - 13,
      13,
    );

    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  /* =========================================================
     BOOST EXHAUST / ROAD GLOW
  ========================================================= */

  if (
    boost &&
    speed > 10 &&
    !gameOver
  ) {
    ctx.save();

    ctx.globalCompositeOperation =
      "screen";

    const plume =
      ctx.createLinearGradient(
        0,
        28,
        0,
        95,
      );

    plume.addColorStop(
      0,
      "rgba(222,253,255,0.55)",
    );

    plume.addColorStop(
      0.25,
      "rgba(66,222,255,0.35)",
    );

    plume.addColorStop(
      1,
      "rgba(55,180,255,0)",
    );

    ctx.fillStyle = plume;

    ctx.beginPath();

    ctx.moveTo(-10, 26);
    ctx.quadraticCurveTo(
      -15,
      60,
      -5,
      91,
    );

    ctx.quadraticCurveTo(
      0,
      101,
      5,
      91,
    );

    ctx.quadraticCurveTo(
      15,
      60,
      10,
      26,
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
        const px = w * 0.23 + (p.x || 0) * 0.22;
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
      const vehicleX = w * (0.235 + Math.sin(time * 0.00065) * 0.003);
      const vehicleY = h * 0.755 + Math.sin(time * 0.006) * Math.min(2, speed / 70);
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
