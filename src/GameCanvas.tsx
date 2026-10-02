import { useEffect, useRef } from "react";
import type { GameEngineState } from "./useGameEngine";
import type { VehicleType } from "./gameTypes";

interface Props {
  state: GameEngineState;
  width: number;
  height: number;
}

const CYAN = "#73f7ff";
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
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function polygon(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
) {
  ctx.beginPath();

  points.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.closePath();
}

/* =========================================================
   CITY
========================================================= */

function drawCity(
  ctx: CanvasRenderingContext2D,
  w: number,
  horizon: number,
  time: number,
  offset: number,
) {
  const buildings = [
    [0.02, 0.27, 0.09],
    [0.09, 0.40, 0.07],
    [0.16, 0.30, 0.11],
    [0.24, 0.52, 0.065],
    [0.30, 0.33, 0.09],
    [0.38, 0.45, 0.07],
    [0.45, 0.30, 0.09],
    [0.52, 0.48, 0.065],
    [0.59, 0.34, 0.09],
    [0.66, 0.54, 0.065],
    [0.73, 0.32, 0.10],
    [0.81, 0.44, 0.07],
    [0.89, 0.30, 0.10],
    [0.96, 0.41, 0.08],
  ];

  for (let i = 0; i < buildings.length; i++) {
    const [fraction, heightFactor, widthFactor] = buildings[i];

    const bw = w * widthFactor;
    const bh = horizon * heightFactor;

    const drift =
      (offset * (0.08 + (i % 3) * 0.025)) % (w + 100);

    const x =
      ((fraction * w - drift + w + 100) % (w + 100)) - 50;

    const y = horizon - bh;

    const building = ctx.createLinearGradient(
      x,
      y,
      x,
      horizon,
    );

    building.addColorStop(0, "#13202d");
    building.addColorStop(0.55, "#09131d");
    building.addColorStop(1, "#03070c");

    ctx.fillStyle = building;
    ctx.fillRect(x, y, bw, bh);

    ctx.strokeStyle = "rgba(110,220,245,0.13)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh);

    const cols = Math.max(2, Math.floor(bw / 12));
    const rows = Math.max(2, Math.floor(bh / 14));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const active =
          Math.sin(i * 17 + row * 8.2 + col * 3.4) > 0.2;

        if (!active) continue;

        const alpha =
          0.11 +
          (Math.sin(time * 0.001 + i + row) + 1) * 0.045;

        ctx.fillStyle =
          i % 4 === 0
            ? `rgba(91,224,255,${alpha})`
            : `rgba(195,220,232,${alpha * 0.55})`;

        ctx.fillRect(
          x + 5 + col * ((bw - 10) / cols),
          y + 7 + row * 11,
          2.5,
          4,
        );
      }
    }
  }

  const haze = ctx.createLinearGradient(
    0,
    horizon - 100,
    0,
    horizon + 60,
  );

  haze.addColorStop(
    0,
    "rgba(25,105,140,0)",
  );

  haze.addColorStop(
    1,
    "rgba(44,177,211,0.14)",
  );

  ctx.fillStyle = haze;

  ctx.fillRect(
    0,
    horizon - 100,
    w,
    160,
  );
}

/* =========================================================
   ROAD
========================================================= */

function drawRoad(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizon: number,
  roadOffset: number,
  boost: boolean,
) {
  const center = w * 0.5;

  const topHalf = w * 0.045;
  const bottomHalf = w * 0.68;

  const ground = ctx.createLinearGradient(
    0,
    horizon,
    0,
    h,
  );

  ground.addColorStop(
    0,
    "#08121a",
  );

  ground.addColorStop(
    1,
    "#020508",
  );

  ctx.fillStyle = ground;

  ctx.fillRect(
    0,
    horizon,
    w,
    h - horizon,
  );

  const road = ctx.createLinearGradient(
    0,
    horizon,
    0,
    h,
  );

  road.addColorStop(
    0,
    "#111d27",
  );

  road.addColorStop(
    0.5,
    "#09131c",
  );

  road.addColorStop(
    1,
    "#04080d",
  );

  polygon(ctx, [
    [center - topHalf, horizon],
    [center + topHalf, horizon],
    [center + bottomHalf, h],
    [center - bottomHalf, h],
  ]);

  ctx.fillStyle = road;
  ctx.fill();

  /* asphalt lines */

  for (let i = 0; i < 26; i++) {
    const p =
      ((i / 26) +
        ((roadOffset * 0.0007) % 1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.75) *
        (h - horizon);

    const half =
      topHalf +
      (bottomHalf - topHalf) *
        p;

    ctx.strokeStyle =
      `rgba(100,170,195,${0.02 + p * 0.035})`;

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

  for (const side of [-1, 1]) {
    const edge =
      ctx.createLinearGradient(
        0,
        horizon,
        0,
        h,
      );

    edge.addColorStop(
      0,
      "rgba(80,220,245,0.20)",
    );

    edge.addColorStop(
      0.4,
      boost
        ? "rgba(86,240,255,0.75)"
        : "rgba(64,190,220,0.48)",
    );

    edge.addColorStop(
      1,
      "rgba(55,160,200,0.12)",
    );

    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;

    ctx.shadowColor = CYAN;
    ctx.shadowBlur = boost ? 18 : 9;

    ctx.beginPath();

    ctx.moveTo(
      center + side * topHalf,
      horizon,
    );

    ctx.lineTo(
      center + side * bottomHalf,
      h,
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  /* center lane */

  for (let i = 0; i < 14; i++) {
    const p =
      ((i / 14) +
        ((roadOffset * 0.0016) % 1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.82) *
        (h - horizon);

    const scale =
      0.06 +
      p * 1.25;

    const markerW =
      Math.max(
        2,
        w * 0.003 * scale,
      );

    const markerH =
      Math.max(
        3,
        h * 0.016 * scale,
      );

    ctx.fillStyle =
      `rgba(180,235,245,${0.16 + p * 0.58})`;

    ctx.shadowColor = CYAN;
    ctx.shadowBlur =
      p > 0.55 ? 7 : 0;

    roundedRect(
      ctx,
      center - markerW / 2,
      y,
      markerW,
      markerH,
      markerW,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  /* wet road reflections */

  ctx.save();

  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 18; i++) {
    const p =
      ((i / 18) +
        ((roadOffset * 0.0009) % 1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.9) *
        (h - horizon);

    const half =
      topHalf +
      (bottomHalf - topHalf) *
        p;

    const x =
      center +
      Math.sin(i * 9.7) *
        half *
        0.65;

    const len =
      6 +
      p * 38;

    const reflection =
      ctx.createLinearGradient(
        x - len,
        y,
        x + len,
        y,
      );

    reflection.addColorStop(
      0,
      "rgba(80,220,255,0)",
    );

    reflection.addColorStop(
      0.5,
      `rgba(80,220,255,${0.025 + p * 0.10})`,
    );

    reflection.addColorStop(
      1,
      "rgba(80,220,255,0)",
    );

    ctx.fillStyle = reflection;

    ctx.fillRect(
      x - len,
      y,
      len * 2,
      Math.max(1, p * 3),
    );
  }

  ctx.restore();
}

/* =========================================================
   VEHICLE
   IMPORTANT:
   THIS IS A REAR-FACING RACING VIEW.
   THE VEHICLE IS NOT SIDEWAYS.
========================================================= */

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

  ctx.translate(x, y);

  const scale =
    Math.max(
      0.65,
      Math.min(
        1.05,
        Math.min(
          window.innerWidth,
          window.innerHeight,
        ) / 850,
      ),
    );

  ctx.scale(
    scale,
    scale,
  );

  /* grounded suspension */

  ctx.translate(
    0,
    Math.sin(time * 0.008) *
      Math.min(
        1.5,
        speed / 100,
      ),
  );

  const isBike =
    vehicle === "bike";

  const isTruck =
    vehicle === "truck";

  const bodyWidth =
    isBike
      ? 48
      : isTruck
        ? 86
        : 82;

  /* =====================================================
     SHADOW
  ===================================================== */

  const shadow =
    ctx.createRadialGradient(
      0,
      28,
      0,
      0,
      28,
      bodyWidth * 1.5,
    );

  shadow.addColorStop(
    0,
    boost
      ? "rgba(70,220,255,0.28)"
      : "rgba(40,160,200,0.15)",
  );

  shadow.addColorStop(
    1,
    "rgba(0,0,0,0)",
  );

  ctx.fillStyle = shadow;

  ctx.beginPath();

  ctx.ellipse(
    0,
    28,
    bodyWidth * 1.35,
    18,
    0,
    0,
    Math.PI * 2,
  );

  ctx.fill();

  /* =====================================================
     SPEED TRAILS
  ===================================================== */

  if (
    speed > 12 &&
    !gameOver
  ) {
    ctx.save();

    ctx.globalAlpha =
      Math.min(
        0.45,
        speed / 300,
      );

    for (let i = 0; i < 8; i++) {
      const yy =
        -15 +
        i * 5;

      const length =
        18 +
        ((i * 19 +
          time * 0.12) %
          45) *
          (speed / 130);

      const trail =
        ctx.createLinearGradient(
          0,
          yy,
          -length,
          yy,
        );

      trail.addColorStop(
        0,
        "rgba(80,220,255,0)",
      );

      trail.addColorStop(
        1,
        "rgba(80,220,255,0.75)",
      );

      ctx.strokeStyle = trail;

      ctx.lineWidth =
        i % 2 === 0
          ? 1.5
          : 0.8;

      ctx.beginPath();

      ctx.moveTo(
        0,
        yy,
      );

      ctx.lineTo(
        -length,
        yy,
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  /* =====================================================
     BIKE — REAR VIEW
  ===================================================== */

  if (isBike) {
    /* rear tyre */

    ctx.fillStyle =
      "#020406";

    ctx.beginPath();

    ctx.ellipse(
      0,
      11,
      17,
      28,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "#829da9";

    ctx.lineWidth = 2.5;

    ctx.stroke();

    /* wheel rim */

    ctx.strokeStyle =
      "rgba(120,230,250,0.75)";

    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.ellipse(
      0,
      11,
      8,
      20,
      0,
      0,
      Math.PI * 2,
    );

    ctx.stroke();

    /* motorcycle body */

    const body =
      ctx.createLinearGradient(
        -20,
        -16,
        20,
        20,
      );

    body.addColorStop(
      0,
      "#d8edf2",
    );

    body.addColorStop(
      0.16,
      "#426274",
    );

    body.addColorStop(
      0.5,
      "#162b39",
    );

    body.addColorStop(
      1,
      "#04090e",
    );

    ctx.fillStyle = body;

    polygon(ctx, [
      [-20, -13],
      [-11, -24],
      [11, -24],
      [20, -13],
      [14, 16],
      [0, 21],
      [-14, 16],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(135,235,252,0.85)";

    ctx.lineWidth = 1.4;

    ctx.stroke();

    /* rider */

    ctx.fillStyle =
      "#080f16";

    polygon(ctx, [
      [-9, -23],
      [-7, -40],
      [0, -46],
      [7, -40],
      [9, -23],
    ]);

    ctx.fill();

    /* helmet */

    ctx.fillStyle =
      "#05090d";

    ctx.beginPath();

    ctx.ellipse(
      0,
      -46,
      8,
      9,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(120,225,245,0.6)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /* visor */

    const visor =
      ctx.createLinearGradient(
        -7,
        -49,
        7,
        -43,
      );

    visor.addColorStop(
      0,
      "#24566a",
    );

    visor.addColorStop(
      0.5,
      "#c2f8ff",
    );

    visor.addColorStop(
      1,
      "#28586a",
    );

    ctx.fillStyle = visor;

    roundedRect(
      ctx,
      -6,
      -49,
      12,
      4,
      2,
    );

    ctx.fill();

    /* rear light */

    ctx.shadowColor =
      "#ff4f68";

    ctx.shadowBlur = 16;

    ctx.fillStyle =
      "#ff4f68";

    roundedRect(
      ctx,
      -6,
      3,
      12,
      5,
      2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* side cyan strips */

    ctx.strokeStyle =
      boost
        ? "#b0ffff"
        : "#4ddcf5";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      -13,
      -7,
    );

    ctx.lineTo(
      -17,
      9,
    );

    ctx.moveTo(
      13,
      -7,
    );

    ctx.lineTo(
      17,
      9,
    );

    ctx.stroke();
  }

  /* =====================================================
     CAR — REAR VIEW
  ===================================================== */

  if (
    vehicle === "sports-car" ||
    vehicle === "supercar"
  ) {
    const carColor =
      vehicle === "sports-car"
        ? "#b94854"
        : "#686bd0";

    const body =
      ctx.createLinearGradient(
        0,
        -35,
        0,
        31,
      );

    body.addColorStop(
      0,
      "#dff6fa",
    );

    body.addColorStop(
      0.14,
      carColor,
    );

    body.addColorStop(
      0.52,
      "#172b38",
    );

    body.addColorStop(
      1,
      "#05090e",
    );

    ctx.fillStyle = body;

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

    /* rear window */

    const glass =
      ctx.createLinearGradient(
        0,
        -37,
        0,
        -14,
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

    ctx.fillStyle = glass;

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

    /* spoiler */

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

    /* tail light */

    ctx.shadowColor =
      "#ff405b";

    ctx.shadowBlur = 15;

    ctx.fillStyle =
      "#ff405b";

    roundedRect(
      ctx,
      -36,
      2,
      72,
      6,
      2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* center light separation */

    ctx.fillStyle =
      "rgba(255,235,240,0.75)";

    ctx.fillRect(
      -2,
      2,
      4,
      6,
    );

    /* lower diffuser */

    ctx.fillStyle =
      "#030609";

    polygon(ctx, [
      [-34, 12],
      [-22, 28],
      [22, 28],
      [34, 12],
      [27, 31],
      [-27, 31],
    ]);

    ctx.fill();

    /* rear wheels */

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      -41,
      20,
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
      20,
      8,
      14,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    /* exhaust */

    ctx.fillStyle =
      "#203c4a";

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
  }

  /* =====================================================
     TRUCK — REAR VIEW
  ===================================================== */

  if (isTruck) {
    const body =
      ctx.createLinearGradient(
        0,
        -34,
        0,
        32,
      );

    body.addColorStop(
      0,
      "#6ca9c0",
    );

    body.addColorStop(
      0.22,
      "#326f8a",
    );

    body.addColorStop(
      0.65,
      "#102430",
    );

    body.addColorStop(
      1,
      "#05090d",
    );

    ctx.fillStyle = body;

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

    /* cargo door */

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

    /* truck lights */

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

    /* bumper */

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

    /* wheels */

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

  /* =====================================================
     BOOST
  ===================================================== */

  if (
    boost &&
    speed > 10 &&
    !gameOver
  ) {
    const exhaust =
      ctx.createLinearGradient(
        -20,
        0,
        -95,
        0,
      );

    exhaust.addColorStop(
      0,
      "rgba(220,255,255,0.75)",
    );

    exhaust.addColorStop(
      0.25,
      "rgba(72,220,255,0.55)",
    );

    exhaust.addColorStop(
      1,
      "rgba(40,180,255,0)",
    );

    ctx.fillStyle = exhaust;

    ctx.beginPath();

    ctx.ellipse(
      -55,
      8,
      42 +
        Math.min(
          30,
          speed * 0.12,
        ),
      7,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();
  }

  ctx.restore();
}

/* =========================================================
   MAIN GAME CANVAS
========================================================= */

export default function GameCanvas({
  state,
  width,
  height,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

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

    if (!canvas) return;

    const ctx =
      canvas.getContext(
        "2d",
        {
          alpha: false,
        },
      );

    if (!ctx) return;

    let animationFrame = 0;

    let time = 0;

    let lastTime = 0;

    const resize = () => {
      const dpr =
        Math.min(
          window.devicePixelRatio || 1,
          2,
        );

      const w =
        dimensionsRef.current.width;

      const h =
        dimensionsRef.current.height;

      canvas.width =
        Math.max(
          1,
          Math.floor(w * dpr),
        );

      canvas.height =
        Math.max(
          1,
          Math.floor(h * dpr),
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

      lastTime = now;

      time += delta;

      const s =
        stateRef.current;

      const w =
        dimensionsRef.current.width;

      const h =
        dimensionsRef.current.height;

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

      /* ===================================================
         SKY
      =================================================== */

      const sky =
        ctx.createLinearGradient(
          0,
          0,
          0,
          h,
        );

      sky.addColorStop(
        0,
        "#030609",
      );

      sky.addColorStop(
        0.38,
        "#07121b",
      );

      sky.addColorStop(
        0.65,
        "#0a1923",
      );

      sky.addColorStop(
        1,
        "#020507",
      );

      ctx.fillStyle = sky;

      ctx.fillRect(
        0,
        0,
        w,
        h,
      );

      /* atmospheric glow */

      const glow =
        ctx.createRadialGradient(
          center,
          horizon * 0.75,
          0,
          center,
          horizon * 0.75,
          w * 0.55,
        );

      glow.addColorStop(
        0,
        "rgba(45,165,205,0.16)",
      );

      glow.addColorStop(
        0.4,
        "rgba(25,100,130,0.07)",
      );

      glow.addColorStop(
        1,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle = glow;

      ctx.fillRect(
        0,
        0,
        w,
        h * 0.75,
      );

      /* tiny atmospheric particles */

      for (let i = 0; i < 55; i++) {
        const px =
          (i * 173.7 +
            Math.sin(
              time * 0.00025 + i,
            ) *
              8) %
          w;

        const py =
          (i * 83.9) %
          (h * 0.58);

        const alpha =
          0.05 +
          (Math.sin(
            time * 0.0012 + i,
          ) +
            1) *
            0.045;

        ctx.fillStyle =
          `rgba(150,228,250,${alpha})`;

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

      /* fog */

      const fog =
        ctx.createLinearGradient(
          0,
          horizon - 45,
          0,
          horizon + 100,
        );

      fog.addColorStop(
        0,
        "rgba(30,120,150,0)",
      );

      fog.addColorStop(
        0.55,
        "rgba(55,185,215,0.10)",
      );

      fog.addColorStop(
        1,
        "rgba(4,13,20,0)",
      );

      ctx.fillStyle = fog;

      ctx.fillRect(
        0,
        horizon - 45,
        w,
        145,
      );

      /* road */

      drawRoad(
        ctx,
        w,
        h,
        horizon,
        s.roadOffset || 0,
        boost,
      );

      /* side speed lights */

      for (let i = 0; i < 10; i++) {
        const p =
          ((i / 10) +
            (((s.roadOffset || 0) *
              0.0012) %
              1)) %
          1;

        const y =
          horizon +
          Math.pow(p, 1.65) *
            (h - horizon);

        const roadHalf =
          w *
          (0.045 +
            p * 0.63);

        const len =
          5 +
          p * 22;

        ctx.strokeStyle =
          `rgba(67,205,242,${0.08 + p * 0.25})`;

        ctx.lineWidth =
          1 +
          p * 1.4;

        for (const side of [-1, 1]) {
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
              len * 0.4,
          );

          ctx.stroke();
        }
      }

      /* engine particles */

      for (const p of s.particles || []) {
        const life =
          Math.max(
            0,
            Math.min(
              1,
              p.life,
            ),
          );

        const px =
          w * 0.19 +
          (p.x || 0) * 0.22;

        const py =
          h * 0.72 +
          (p.y || 0) * 0.28;

        ctx.save();

        ctx.globalAlpha =
          life * 0.65;

        ctx.fillStyle =
          p.color || CYAN;

        ctx.shadowColor =
          p.color || CYAN;

        ctx.shadowBlur =
          p.type === "spark"
            ? 10
            : 5;

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          Math.max(
            1,
            (p.size || 2) * 0.8,
          ),
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.restore();
      }

      /* ===================================================
         VEHICLE POSITION — FIXED
         
         x = 19% of screen
         y = 84% of screen

         This keeps vehicle completely OUTSIDE
         the centered Current Target panel.
      =================================================== */

      const vehicleX =
        w *
        (
          0.19 +
          Math.sin(
            time * 0.00065,
          ) *
            0.002
        );

      const vehicleY =
        h *
        0.84;

      ctx.save();

      if (s.shake > 0) {
        ctx.translate(
          Math.sin(
            time * 0.08,
          ) *
            s.shake *
            0.20,
          Math.cos(
            time * 0.1,
          ) *
            s.shake *
            0.14,
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

      /* vignette */

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
        "rgba(0,0,0,0.70)",
      );

      ctx.fillStyle =
        vignette;

      ctx.fillRect(
        0,
        0,
        w,
        h,
      );

      /* frame */

      ctx.strokeStyle =
        "rgba(120,222,244,0.08)";

      ctx.lineWidth = 1;

      ctx.strokeRect(
        10.5,
        10.5,
        w - 21,
        h - 21,
      );

      /* bottom telemetry */

      ctx.save();

      ctx.globalAlpha =
        0.35;

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

      /* pause / game over */

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
          (w - panelW) / 2;

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

        ctx.stroke();

        ctx.textAlign =
          "center";

        ctx.fillStyle =
          "rgba(134,229,248,0.7)";

        ctx.font =
          "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";

        ctx.fillText(
          "MOTO TYPE RACER / COCKPIT",
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
