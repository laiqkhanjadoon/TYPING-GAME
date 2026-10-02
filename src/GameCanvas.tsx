import { useEffect, useRef } from "react";
import type { GameEngineState } from "./useGameEngine";
import type { VehicleType } from "./gameTypes";

interface Props {
  state: GameEngineState;
  width: number;
  height: number;
}

const CYAN = "#72efff";
const WHITE = "#eafcff";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(
    x + w,
    y,
    x + w,
    y + radius,
  );
  ctx.lineTo(
    x + w,
    y + h - radius,
  );
  ctx.quadraticCurveTo(
    x + w,
    y + h,
    x + w - radius,
    y + h,
  );
  ctx.lineTo(
    x + radius,
    y + h,
  );
  ctx.quadraticCurveTo(
    x,
    y + h,
    x,
    y + h - radius,
  );
  ctx.lineTo(
    x,
    y + radius,
  );
  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y,
  );
  ctx.closePath();
}

function polygon(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
) {
  ctx.beginPath();

  points.forEach(([x, y], i) => {
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
}

/* ============================================================
   CITY
============================================================ */

function drawCity(
  ctx: CanvasRenderingContext2D,
  w: number,
  horizon: number,
  time: number,
  offset: number,
) {
  const buildings = [
    [0.03, 0.28, 0.09],
    [0.10, 0.42, 0.07],
    [0.17, 0.31, 0.11],
    [0.25, 0.52, 0.065],
    [0.31, 0.34, 0.09],
    [0.39, 0.46, 0.07],
    [0.46, 0.30, 0.08],
    [0.53, 0.48, 0.065],
    [0.60, 0.34, 0.09],
    [0.67, 0.54, 0.065],
    [0.74, 0.32, 0.10],
    [0.82, 0.45, 0.07],
    [0.89, 0.30, 0.10],
    [0.96, 0.41, 0.085],
  ];

  for (
    let i = 0;
    i < buildings.length;
    i++
  ) {
    const [
      fraction,
      heightFactor,
      widthFactor,
    ] = buildings[i];

    const bw =
      w * widthFactor;

    const bh =
      horizon * heightFactor;

    const drift =
      (offset *
        (0.07 +
          (i % 3) * 0.025)) %
      (w + 120);

    const x =
      ((fraction * w -
        drift +
        w +
        120) %
        (w + 120)) -
      60;

    const y =
      horizon - bh;

    const buildingGradient =
      ctx.createLinearGradient(
        x,
        y,
        x + bw,
        horizon,
      );

    buildingGradient.addColorStop(
      0,
      "#14212d",
    );

    buildingGradient.addColorStop(
      0.5,
      "#09121b",
    );

    buildingGradient.addColorStop(
      1,
      "#03070c",
    );

    ctx.fillStyle =
      buildingGradient;

    ctx.fillRect(
      x,
      y,
      bw,
      bh,
    );

    ctx.strokeStyle =
      "rgba(105,220,245,0.12)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      bw - 1,
      bh,
    );

    const cols =
      Math.max(
        2,
        Math.floor(bw / 11),
      );

    const rows =
      Math.max(
        2,
        Math.floor(bh / 13),
      );

    for (
      let row = 0;
      row < rows;
      row++
    ) {
      for (
        let col = 0;
        col < cols;
        col++
      ) {
        const active =
          Math.sin(
            i * 17 +
              row * 8.2 +
              col * 3.7,
          ) > 0.2;

        if (!active)
          continue;

        const alpha =
          0.12 +
          (Math.sin(
            time * 0.001 +
              i +
              row,
          ) +
            1) *
            0.045;

        ctx.fillStyle =
          i % 4 === 0
            ? `rgba(100,225,255,${alpha})`
            : `rgba(201,224,235,${alpha * 0.55})`;

        ctx.fillRect(
          x +
            5 +
            col *
              ((bw - 10) /
                cols),
          y +
            7 +
            row * 11,
          2.5,
          4,
        );
      }
    }
  }

  const haze =
    ctx.createLinearGradient(
      0,
      horizon - 100,
      0,
      horizon + 50,
    );

  haze.addColorStop(
    0,
    "rgba(20,83,111,0)",
  );

  haze.addColorStop(
    1,
    "rgba(45,165,195,0.13)",
  );

  ctx.fillStyle =
    haze;

  ctx.fillRect(
    0,
    horizon - 100,
    w,
    150,
  );
}

/* ============================================================
   ROAD
============================================================ */

function drawRoad(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizon: number,
  speed: number,
  roadOffset: number,
  boost: boolean,
) {
  const center =
    w * 0.5;

  const topHalf =
    w * 0.045;

  const bottomHalf =
    w * 0.69;

  const road =
    ctx.createLinearGradient(
      0,
      horizon,
      0,
      h,
    );

  road.addColorStop(
    0,
    "#111b24",
  );

  road.addColorStop(
    0.5,
    "#0a1118",
  );

  road.addColorStop(
    1,
    "#03070b",
  );

  polygon(ctx, [
    [
      center - topHalf,
      horizon,
    ],
    [
      center + topHalf,
      horizon,
    ],
    [
      center + bottomHalf,
      h,
    ],
    [
      center - bottomHalf,
      h,
    ],
  ]);

  ctx.fillStyle =
    road;

  ctx.fill();

  /* road horizontal reflections */

  for (
    let i = 0;
    i < 25;
    i++
  ) {
    const p =
      ((i / 25) +
        ((roadOffset *
          0.00065) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(
        p,
        1.78,
      ) *
        (h - horizon);

    const half =
      topHalf +
      (bottomHalf -
        topHalf) *
        p;

    ctx.strokeStyle = `rgba(110,176,196,${0.02 + p * 0.04})`;

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      center - half,
      y,
    );

    ctx.lineTo(
      center + half,
      y,
    );

    ctx.stroke();
  }

  /* road edges */

  for (const side of [
    -1,
    1,
  ]) {
    const edge =
      ctx.createLinearGradient(
        0,
        horizon,
        0,
        h,
      );

    edge.addColorStop(
      0,
      "rgba(72,211,240,0.2)",
    );

    edge.addColorStop(
      0.45,
      boost
        ? "rgba(91,236,255,0.75)"
        : "rgba(67,190,222,0.48)",
    );

    edge.addColorStop(
      1,
      "rgba(55,153,190,0.12)",
    );

    ctx.strokeStyle =
      edge;

    ctx.lineWidth = 2;

    ctx.shadowColor =
      CYAN;

    ctx.shadowBlur =
      boost ? 18 : 9;

    ctx.beginPath();

    ctx.moveTo(
      center +
        side * topHalf,
      horizon,
    );

    ctx.lineTo(
      center +
        side * bottomHalf,
      h,
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  /* center lane markers */

  const markerCount =
    14;

  for (
    let i = 0;
    i < markerCount;
    i++
  ) {
    const p =
      ((i / markerCount) +
        ((roadOffset *
          0.0017) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(
        p,
        1.82,
      ) *
        (h - horizon);

    const scale =
      0.06 +
      p * 1.3;

    const markerW =
      Math.max(
        2,
        w *
          0.003 *
          scale,
      );

    const markerH =
      Math.max(
        3,
        h *
          0.015 *
          scale,
      );

    ctx.fillStyle = `rgba(180,236,247,${0.18 + p * 0.58})`;

    ctx.shadowColor =
      CYAN;

    ctx.shadowBlur =
      p > 0.55 ? 8 : 0;

    roundedRect(
      ctx,
      center -
        markerW / 2,
      y,
      markerW,
      markerH,
      markerW,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  /* reflective streaks */

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  for (
    let i = 0;
    i < 18;
    i++
  ) {
    const p =
      ((i / 18) +
        ((roadOffset *
          0.00085) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(
        p,
        1.9,
      ) *
        (h - horizon);

    const half =
      topHalf +
      (bottomHalf -
        topHalf) *
        p;

    const x =
      center +
      Math.sin(i * 9.7) *
        half *
        0.65;

    const length =
      (7 + p * 42) *
      (w / 1200);

    const reflection =
      ctx.createLinearGradient(
        x - length,
        y,
        x + length,
        y,
      );

    reflection.addColorStop(
      0,
      "rgba(74,220,255,0)",
    );

    reflection.addColorStop(
      0.5,
      `rgba(74,220,255,${0.025 + p * 0.11})`,
    );

    reflection.addColorStop(
      1,
      "rgba(74,220,255,0)",
    );

    ctx.fillStyle =
      reflection;

    ctx.fillRect(
      x - length,
      y,
      length * 2,
      Math.max(
        1,
        p * 3,
      ),
    );
  }

  ctx.restore();

  /* road glow */

  const roadGlow =
    ctx.createRadialGradient(
      center,
      h * 0.82,
      0,
      center,
      h * 0.82,
      w * 0.55,
    );

  roadGlow.addColorStop(
    0,
    boost
      ? "rgba(42,194,240,0.13)"
      : "rgba(35,139,175,0.07)",
  );

  roadGlow.addColorStop(
    1,
    "rgba(0,0,0,0)",
  );

  ctx.fillStyle =
    roadGlow;

  ctx.fillRect(
    0,
    horizon,
    w,
    h - horizon,
  );

  /* side moving lights */

  for (
    let i = 0;
    i < 10;
    i++
  ) {
    const p =
      ((i / 10) +
        ((roadOffset *
          0.0012) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(
        p,
        1.65,
      ) *
        (h - horizon);

    const roadHalf =
      w *
      (0.045 +
        p * 0.63);

    const len =
      5 + p * 22;

    ctx.strokeStyle = `rgba(72,212,243,${0.08 + p * 0.24})`;

    ctx.lineWidth =
      1 +
      p * 1.3;

    for (const side of [
      -1,
      1,
    ]) {
      ctx.beginPath();

      ctx.moveTo(
        center +
          side *
            (roadHalf + 4),
        y,
      );

      ctx.lineTo(
        center +
          side *
            (roadHalf +
              4 +
              len),
        y +
          len *
            0.4,
      );

      ctx.stroke();
    }
  }
}

/* ============================================================
   FORWARD-FACING VEHICLE
   IMPORTANT:
   This is now a REAR/COCKPIT racing view.
   No side-facing car.
============================================================ */

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
  ctx.save();

  ctx.translate(
    x,
    y,
  );

  /*
   * Very small suspension movement.
   * This keeps vehicle grounded instead of looking like
   * it is flying.
   */
  const suspension =
    Math.sin(
      time * 0.009,
    ) *
    Math.min(
      1.2,
      speed / 180,
    );

  ctx.translate(
    0,
    suspension,
  );

  const scale =
    Math.max(
      0.78,
      Math.min(
        1.25,
        window.innerWidth /
          1250,
      ),
    );

  ctx.scale(
    scale,
    scale,
  );

  const isBike =
    vehicle === "bike";

  const isTruck =
    vehicle === "truck";

  const isSports =
    vehicle ===
    "sports-car";

  const isSuper =
    vehicle ===
    "supercar";

  const bodyWidth =
    isBike
      ? 64
      : isTruck
        ? 108
        : 116;

  /* ========================================================
     GROUND SHADOW
  ======================================================== */

  const shadow =
    ctx.createRadialGradient(
      0,
      20,
      0,
      0,
      20,
      bodyWidth * 0.9,
    );

  shadow.addColorStop(
    0,
    boost
      ? "rgba(61,222,255,0.28)"
      : "rgba(30,155,190,0.16)",
  );

  shadow.addColorStop(
    1,
    "rgba(0,0,0,0)",
  );

  ctx.fillStyle =
    shadow;

  ctx.beginPath();

  ctx.ellipse(
    0,
    21,
    bodyWidth *
      0.85,
    isBike ? 15 : 18,
    0,
    0,
    Math.PI * 2,
  );

  ctx.fill();

  /* ========================================================
     SPEED TRAILS BEHIND VEHICLE
  ======================================================== */

  if (
    speed > 15 &&
    !gameOver
  ) {
    ctx.save();

    ctx.globalAlpha =
      Math.min(
        0.42,
        speed / 330,
      );

    for (
      let i = 0;
      i < 8;
      i++
    ) {
      const yy =
        -4 +
        i * 4;

      const length =
        18 +
        ((i * 19 +
          time * 0.13) %
          45) *
          (speed / 150);

      const trail =
        ctx.createLinearGradient(
          -length,
          yy,
          0,
          yy,
        );

      trail.addColorStop(
        0,
        "rgba(70,218,255,0)",
      );

      trail.addColorStop(
        1,
        "rgba(70,218,255,0.7)",
      );

      ctx.strokeStyle =
        trail;

      ctx.lineWidth =
        i % 2 === 0
          ? 1.4
          : 0.8;

      ctx.beginPath();

      ctx.moveTo(
        -length,
        yy,
      );

      ctx.lineTo(
        0,
        yy,
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  /* ========================================================
     BIKE — REAR VIEW
  ======================================================== */

  if (isBike) {
    /*
     * Rear tyre
     */

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      0,
      8,
      18,
      30,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "#718d99";

    ctx.lineWidth = 2.5;

    ctx.stroke();

    /*
     * Wheel rim
     */

    ctx.strokeStyle =
      "rgba(117,225,245,0.75)";

    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.ellipse(
      0,
      8,
      9,
      20,
      0,
      0,
      Math.PI * 2,
    );

    ctx.stroke();

    /*
     * Rear body
     */

    const bikeBody =
      ctx.createLinearGradient(
        -22,
        -13,
        22,
        15,
      );

    bikeBody.addColorStop(
      0,
      "#d5e7ed",
    );

    bikeBody.addColorStop(
      0.15,
      "#426172",
    );

    bikeBody.addColorStop(
      0.5,
      "#162a38",
    );

    bikeBody.addColorStop(
      1,
      "#050a10",
    );

    ctx.fillStyle =
      bikeBody;

    polygon(ctx, [
      [-20, -12],
      [-11, -22],
      [11, -22],
      [20, -12],
      [14, 14],
      [0, 21],
      [-14, 14],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(130,233,251,0.8)";

    ctx.lineWidth = 1.4;

    ctx.stroke();

    /*
     * Rider / upper section
     */

    ctx.fillStyle =
      "#0a1119";

    polygon(ctx, [
      [-9, -21],
      [-7, -39],
      [0, -45],
      [7, -39],
      [9, -21],
    ]);

    ctx.fill();

    /*
     * Helmet
     */

    ctx.fillStyle =
      "#05090e";

    ctx.beginPath();

    ctx.ellipse(
      0,
      -45,
      8,
      9,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(119,228,246,0.55)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /*
     * Helmet visor
     */

    const visor =
      ctx.createLinearGradient(
        -7,
        -47,
        7,
        -43,
      );

    visor.addColorStop(
      0,
      "#24566b",
    );

    visor.addColorStop(
      0.5,
      "#b5f8ff",
    );

    visor.addColorStop(
      1,
      "#28586c",
    );

    ctx.fillStyle =
      visor;

    roundedRect(
      ctx,
      -6,
      -48,
      12,
      4,
      2,
    );

    ctx.fill();

    /*
     * Rear red light
     */

    ctx.shadowColor =
      "#ff4f68";

    ctx.shadowBlur = 15;

    ctx.fillStyle =
      "#ff4e66";

    roundedRect(
      ctx,
      -6,
      4,
      12,
      5,
      2.5,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /*
     * Rear cyan strips
     */

    ctx.strokeStyle =
      boost
        ? "#9fffff"
        : "#50dff4";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      -13,
      -7,
    );

    ctx.lineTo(
      -17,
      8,
    );

    ctx.moveTo(
      13,
      -7,
    );

    ctx.lineTo(
      17,
      8,
    );

    ctx.stroke();

    /*
     * Exhaust
     */

    if (
      boost &&
      speed > 10 &&
      !gameOver
    ) {
      const exhaust =
        ctx.createLinearGradient(
          0,
          16,
          0,
          70,
        );

      exhaust.addColorStop(
        0,
        "rgba(210,250,255,0.8)",
      );

      exhaust.addColorStop(
        0.25,
        "rgba(70,219,255,0.55)",
      );

      exhaust.addColorStop(
        1,
        "rgba(50,180,255,0)",
      );

      ctx.fillStyle =
        exhaust;

      polygon(ctx, [
        [-5, 17],
        [5, 17],
        [9, 63],
        [0, 74],
        [-9, 63],
      ]);

      ctx.fill();
    }
  }

  /* ========================================================
     CAR — REAR VIEW
  ======================================================== */

  if (
    isSports ||
    isSuper
  ) {
    const carColor =
      isSports
        ? "#b84650"
        : "#6265c7";

    /*
     * Main rear body.
     * Wide at bottom, narrower at roof.
     */

    const body =
      ctx.createLinearGradient(
        0,
        -32,
        0,
        30,
      );

    body.addColorStop(
      0,
      "#d9f2f7",
    );

    body.addColorStop(
      0.12,
      carColor,
    );

    body.addColorStop(
      0.55,
      "#172a38",
    );

    body.addColorStop(
      1,
      "#05090e",
    );

    ctx.fillStyle =
      body;

    polygon(ctx, [
      [-38, -28],
      [-24, -39],
      [24, -39],
      [38, -28],
      [49, 20],
      [35, 30],
      [-35, 30],
      [-49, 20],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(145,237,252,0.85)";

    ctx.lineWidth = 1.5;

    ctx.stroke();

    /*
     * Rear window
     */

    const glass =
      ctx.createLinearGradient(
        0,
        -36,
        0,
        -13,
      );

    glass.addColorStop(
      0,
      "#9cecf8",
    );

    glass.addColorStop(
      0.3,
      "#315d6d",
    );

    glass.addColorStop(
      1,
      "#07121a",
    );

    ctx.fillStyle =
      glass;

    polygon(ctx, [
      [-22, -34],
      [22, -34],
      [31, -17],
      [-31, -17],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(177,247,255,0.55)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /*
     * Rear spoiler
     */

    ctx.fillStyle =
      "#09131d";

    roundedRect(
      ctx,
      -43,
      -8,
      86,
      5,
      2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(102,220,242,0.55)";

    ctx.stroke();

    /*
     * Tail light bar
     */

    ctx.shadowColor =
      "#ff405b";

    ctx.shadowBlur = 14;

    ctx.fillStyle =
      "#ff405b";

    roundedRect(
      ctx,
      -36,
      2,
      72,
      5,
      2.5,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /*
     * Tail light inner split
     */

    ctx.fillStyle =
      "rgba(255,230,235,0.75)";

    ctx.fillRect(
      -2,
      2,
      4,
      5,
    );

    /*
     * Lower diffuser
     */

    ctx.fillStyle =
      "#030609";

    polygon(ctx, [
      [-34, 12],
      [-22, 27],
      [22, 27],
      [34, 12],
      [27, 30],
      [-27, 30],
    ]);

    ctx.fill();

    /*
     * Rear wheels — viewed from behind
     */

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      -41,
      19,
      8,
      14,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(
      41,
      19,
      8,
      14,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    /*
     * Center exhausts
     */

    ctx.fillStyle =
      "#1d3948";

    ctx.beginPath();

    ctx.arc(
      -9,
      25,
      4,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
      9,
      25,
      4,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    if (
      boost &&
      speed > 10 &&
      !gameOver
    ) {
      const exhaust =
        ctx.createLinearGradient(
          0,
          28,
          0,
          76,
        );

      exhaust.addColorStop(
        0,
        "rgba(215,252,255,0.8)",
      );

      exhaust.addColorStop(
        0.25,
        "rgba(64,219,255,0.5)",
      );

      exhaust.addColorStop(
        1,
        "rgba(40,180,255,0)",
      );

      ctx.fillStyle =
        exhaust;

      polygon(ctx, [
        [-13, 27],
        [-5, 27],
        [-3, 72],
        [-9, 82],
      ]);

      ctx.fill();

      polygon(ctx, [
        [5, 27],
        [13, 27],
        [9, 82],
        [3, 72],
      ]);

      ctx.fill();
    }
  }

  /* ========================================================
     TRUCK — REAR VIEW
  ======================================================== */

  if (isTruck) {
    const truckBody =
      ctx.createLinearGradient(
        0,
        -35,
        0,
        32,
      );

    truckBody.addColorStop(
      0,
      "#6ba8c1",
    );

    truckBody.addColorStop(
      0.2,
      "#326f8b",
    );

    truckBody.addColorStop(
      0.65,
      "#102330",
    );

    truckBody.addColorStop(
      1,
      "#05090d",
    );

    ctx.fillStyle =
      truckBody;

    polygon(ctx, [
      [-48, -31],
      [48, -31],
      [54, 29],
      [-54, 29],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(136,232,249,0.8)";

    ctx.lineWidth = 1.5;

    ctx.stroke();

    /*
     * Rear cargo door
     */

    ctx.fillStyle =
      "#0b1b26";

    roundedRect(
      ctx,
      -39,
      -24,
      78,
      43,
      4,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(111,210,233,0.38)";

    ctx.stroke();

    /*
     * Door split
     */

    ctx.beginPath();

    ctx.moveTo(
      0,
      -22,
    );

    ctx.lineTo(
      0,
      16,
    );

    ctx.stroke();

    /*
     * Tail lights
     */

    ctx.shadowColor =
      "#ff4d62";

    ctx.shadowBlur = 12;

    ctx.fillStyle =
      "#ff4d62";

    roundedRect(
      ctx,
      -48,
      -2,
      6,
      15,
      2,
    );

    ctx.fill();

    roundedRect(
      ctx,
      42,
      -2,
      6,
      15,
      2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /*
     * Lower bumper
     */

    ctx.fillStyle =
      "#05090e";

    roundedRect(
      ctx,
      -49,
      18,
      98,
      11,
      3,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(94,200,224,0.45)";

    ctx.stroke();

    /*
     * Wheels
     */

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      -49,
      20,
      9,
      15,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(
      49,
      20,
      9,
      15,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();
  }

  /* ========================================================
     BOOST GLOW
  ======================================================== */

  if (
    boost &&
    speed > 15 &&
    !gameOver
  ) {
    const glow =
      ctx.createRadialGradient(
        0,
        16,
        0,
        0,
        16,
        bodyWidth * 0.75,
      );

    glow.addColorStop(
      0,
      "rgba(84,226,255,0.18)",
    );

    glow.addColorStop(
      1,
      "rgba(84,226,255,0)",
    );

    ctx.fillStyle =
      glow;

    ctx.fillRect(
      -bodyWidth,
      -10,
      bodyWidth * 2,
      60,
    );
  }

  ctx.restore();
}

/* ============================================================
   MAIN CANVAS
============================================================ */

export default function GameCanvas({
  state,
  width,
  height,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement>(
      null,
    );

  const stateRef =
    useRef(state);

  const dimensionsRef =
    useRef({
      width,
      height,
    });

  stateRef.current =
    state;

  dimensionsRef.current = {
    width,
    height,
  };

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas)
      return;

    const ctx =
      canvas.getContext(
        "2d",
        {
          alpha: false,
        },
      );

    if (!ctx)
      return;

    let animationFrame = 0;

    let time = 0;

    let lastTime = 0;

    const resize =
      () => {
        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            2,
          );

        const w =
          dimensionsRef.current
            .width;

        const h =
          dimensionsRef.current
            .height;

        canvas.width =
          Math.max(
            1,
            Math.floor(
              w * dpr,
            ),
          );

        canvas.height =
          Math.max(
            1,
            Math.floor(
              h * dpr,
            ),
          );

        canvas.style.width =
          `${w}px`;

        canvas.style.height =
          `${h}px`;

        ctx.setTransform(
          dpr,
          0,
          0,
          dpr,
          0,
          0,
        );
      };

    const render = (
      now: number,
    ) => {
      animationFrame =
        requestAnimationFrame(
          render,
        );

      const delta =
        lastTime
          ? Math.min(
              40,
              now - lastTime,
            )
          : 16;

      lastTime =
        now;

      time += delta;

      const s =
        stateRef.current;

      const w =
        dimensionsRef.current
          .width;

      const h =
        dimensionsRef.current
          .height;

      if (
        w <= 0 ||
        h <= 0
      ) {
        return;
      }

      const speed =
        Math.max(
          0,
          s.bikeSpeed || 0,
        );

      const boost =
        !!s.boostActive;

      const horizon =
        h * 0.405;

      const center =
        w * 0.5;

      ctx.save();

      ctx.clearRect(
        0,
        0,
        w,
        h,
      );

      /* ====================================================
         SKY
      ==================================================== */

      const sky =
        ctx.createLinearGradient(
          0,
          0,
          0,
          h,
        );

      sky.addColorStop(
        0,
        "#020509",
      );

      sky.addColorStop(
        0.38,
        "#07111a",
      );

      sky.addColorStop(
        0.68,
        "#0a1821",
      );

      sky.addColorStop(
        1,
        "#020507",
      );

      ctx.fillStyle =
        sky;

      ctx.fillRect(
        0,
        0,
        w,
        h,
      );

      /* atmospheric center glow */

      const atmosphericGlow =
        ctx.createRadialGradient(
          center,
          horizon * 0.72,
          0,
          center,
          horizon * 0.72,
          w * 0.55,
        );

      atmosphericGlow.addColorStop(
        0,
        "rgba(46,160,195,0.17)",
      );

      atmosphericGlow.addColorStop(
        0.4,
        "rgba(21,90,119,0.08)",
      );

      atmosphericGlow.addColorStop(
        1,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle =
        atmosphericGlow;

      ctx.fillRect(
        0,
        0,
        w,
        h * 0.75,
      );

      /* ====================================================
         SMALL ATMOSPHERIC PARTICLES
      ==================================================== */

      for (
        let i = 0;
        i < 55;
        i++
      ) {
        const px =
          (i * 173.7 +
            Math.sin(
              time * 0.00025 +
                i,
            ) *
              8) %
          w;

        const py =
          (i * 83.9) %
          (h * 0.58);

        const alpha =
          0.05 +
          (Math.sin(
            time * 0.0012 +
              i,
          ) +
            1) *
            0.045;

        ctx.fillStyle = `rgba(150,228,250,${alpha})`;

        ctx.fillRect(
          px,
          py,
          i % 5 === 0
            ? 2
            : 1,
          i % 5 === 0
            ? 2
            : 1,
        );
      }

      drawCity(
        ctx,
        w,
        horizon,
        time,
        s.bgOffset || 0,
      );

      /* ====================================================
         FOG
      ==================================================== */

      const fog =
        ctx.createLinearGradient(
          0,
          horizon - 50,
          0,
          horizon + 100,
        );

      fog.addColorStop(
        0,
        "rgba(35,127,158,0)",
      );

      fog.addColorStop(
        0.55,
        "rgba(62,188,218,0.10)",
      );

      fog.addColorStop(
        1,
        "rgba(4,13,20,0)",
      );

      ctx.fillStyle =
        fog;

      ctx.fillRect(
        0,
        horizon - 50,
        w,
        150,
      );

      /* ====================================================
         ROAD
      ==================================================== */

      drawRoad(
        ctx,
        w,
        h,
        horizon,
        speed,
        s.roadOffset || 0,
        boost,
      );

      /* ====================================================
         ENGINE PARTICLES
      ==================================================== */

      for (const particle of
        s.particles ||
        []) {
        const life =
          Math.max(
            0,
            Math.min(
              1,
              particle.life,
            ),
          );

        const px =
          center +
          (particle.x || 0) *
            0.25;

        const py =
          h * 0.72 +
          (particle.y || 0) *
            0.28;

        ctx.save();

        ctx.globalAlpha =
          life * 0.65;

        ctx.fillStyle =
          particle.color ||
          CYAN;

        ctx.shadowColor =
          particle.color ||
          CYAN;

        ctx.shadowBlur = 7;

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          Math.max(
            1,
            (particle.size ||
              2) *
              0.75,
          ),
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.restore();
      }

      /* ====================================================
         PLAYER VEHICLE

         CENTERED + LOW FOREGROUND.
         This is what prevents the vehicle from hiding
         behind the typing target.
      ==================================================== */

      const vehicleX =
        center;

      const vehicleY =
        h * 0.875;

      ctx.save();

      if (
        s.shake > 0
      ) {
        ctx.translate(
          Math.sin(
            time * 0.08,
          ) *
            s.shake *
            0.15,
          Math.cos(
            time * 0.1,
          ) *
            s.shake *
            0.10,
        );
      }

      drawVehicle(
        ctx,
        s.vehicle,
        vehicleX,
        vehicleY,
        speed,
        boost,
        time,
        !!s.gameOver,
      );

      ctx.restore();

      /* ====================================================
         FOREGROUND VEHICLE LIGHT
      ==================================================== */

      if (
        speed > 15 &&
        !s.gameOver
      ) {
        const glow =
          ctx.createRadialGradient(
            vehicleX,
            vehicleY,
            0,
            vehicleX,
            vehicleY,
            w * 0.22,
          );

        glow.addColorStop(
          0,
          boost
            ? "rgba(68,221,255,0.10)"
            : "rgba(58,180,215,0.045)",
        );

        glow.addColorStop(
          1,
          "rgba(0,0,0,0)",
        );

        ctx.fillStyle =
          glow;

        ctx.fillRect(
          vehicleX -
            w * 0.22,
          vehicleY -
            h * 0.14,
          w * 0.44,
          h * 0.28,
        );
      }

      /* ====================================================
         VIGNETTE
      ==================================================== */

      const vignette =
        ctx.createRadialGradient(
          center,
          h * 0.48,
          h * 0.12,
          center,
          h * 0.48,
          Math.max(
            w,
            h,
          ) * 0.8,
        );

      vignette.addColorStop(
        0,
        "rgba(0,0,0,0)",
      );

      vignette.addColorStop(
        0.72,
        "rgba(0,0,0,0.16)",
      );

      vignette.addColorStop(
        1,
        "rgba(0,0,0,0.72)",
      );

      ctx.fillStyle =
        vignette;

      ctx.fillRect(
        0,
        0,
        w,
        h,
      );

      /* ====================================================
         FRAME
      ==================================================== */

      ctx.strokeStyle =
        "rgba(120,222,244,0.08)";

      ctx.lineWidth = 1;

      ctx.strokeRect(
        10.5,
        10.5,
        w - 21,
        h - 21,
      );

      /* ====================================================
         TELEMETRY
      ==================================================== */

      ctx.save();

      ctx.globalAlpha =
        0.36;

      ctx.fillStyle =
        CYAN;

      ctx.font =
        "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";

      ctx.fillText(
        "MTR / NIGHT RUN",
        28,
        h - 28,
      );

      ctx.textAlign =
        "right";

      ctx.fillText(
        `SECTOR ${String(
          Math.max(
            1,
            s.level || 1,
          ),
        ).padStart(
          2,
          "0",
        )}`,
        w - 28,
        h - 28,
      );

      ctx.restore();

      /* ====================================================
         PAUSE / GAME OVER
      ==================================================== */

      if (
        s.paused ||
        s.gameOver
      ) {
        ctx.fillStyle =
          "rgba(2,6,10,0.48)";

        ctx.fillRect(
          0,
          0,
          w,
          h,
        );

        const panelW =
          Math.min(
            380,
            w * 0.78,
          );

        const panelH =
          118;

        const panelX =
          (w -
            panelW) /
          2;

        const panelY =
          h * 0.39;

        ctx.save();

        ctx.shadowColor =
          "rgba(65,210,240,0.22)";

        ctx.shadowBlur = 28;

        roundedRect(
          ctx,
          panelX,
          panelY,
          panelW,
          panelH,
          18,
        );

        ctx.fillStyle =
          "rgba(8,18,27,0.78)";

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.strokeStyle =
          "rgba(123,231,255,0.35)";

        ctx.lineWidth = 1;

        ctx.stroke();

        ctx.textAlign =
          "center";

        ctx.fillStyle =
          "rgba(134,229,248,0.7)";

        ctx.font =
          "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";

        ctx.fillText(
          "MOTO TYPE RACER  /  COCKPIT",
          w / 2,
          panelY + 28,
        );

        ctx.fillStyle =
          WHITE;

        ctx.font =
          "700 27px system-ui, -apple-system, Segoe UI, sans-serif";

        ctx.fillText(
          s.gameOver
            ? "SESSION COMPLETE"
            : "PAUSED",
          w / 2,
          panelY + 66,
        );

        ctx.fillStyle =
          "rgba(225,245,250,0.62)";

        ctx.font =
          "12px system-ui, -apple-system, Segoe UI, sans-serif";

        ctx.fillText(
          s.gameOver
            ? "Review your run in the results panel"
            : "Press ESC to return to the race",
          w / 2,
          panelY + 91,
        );

        ctx.restore();
      }

      ctx.restore();
    };

    resize();

    window.addEventListener(
      "resize",
      resize,
    );

    animationFrame =
      requestAnimationFrame(
        render,
      );

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "resize",
        resize,
      );
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
