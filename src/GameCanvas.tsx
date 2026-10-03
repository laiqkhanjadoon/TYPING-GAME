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
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
}

/* =========================================================
   CITY
========================================================= */

function drawCity(
  ctx: CanvasRenderingContext2D,
  width: number,
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
    const [
      fraction,
      heightFactor,
      widthFactor,
    ] = buildings[i];

    const buildingWidth =
      width * widthFactor;

    const buildingHeight =
      horizon * heightFactor;

    const drift =
      (offset *
        (0.08 + (i % 3) * 0.025)) %
      (width + 100);

    const x =
      ((fraction * width -
        drift +
        width +
        100) %
        (width + 100)) -
      50;

    const y =
      horizon -
      buildingHeight;

    const facade =
      ctx.createLinearGradient(
        x,
        y,
        x,
        horizon,
      );

    facade.addColorStop(
      0,
      "#142331",
    );

    facade.addColorStop(
      0.55,
      "#09131d",
    );

    facade.addColorStop(
      1,
      "#03070b",
    );

    ctx.fillStyle = facade;

    ctx.fillRect(
      x,
      y,
      buildingWidth,
      buildingHeight,
    );

    ctx.strokeStyle =
      "rgba(110,220,245,0.13)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      buildingWidth - 1,
      buildingHeight,
    );

    const columns =
      Math.max(
        2,
        Math.floor(
          buildingWidth / 12,
        ),
      );

    const rows =
      Math.max(
        2,
        Math.floor(
          buildingHeight / 14,
        ),
      );

    for (
      let row = 0;
      row < rows;
      row++
    ) {
      for (
        let column = 0;
        column < columns;
        column++
      ) {
        const active =
          Math.sin(
            i * 17 +
              row * 8.2 +
              column * 3.4,
          ) > 0.2;

        if (!active) continue;

        const alpha =
          0.10 +
          (Math.sin(
            time * 0.001 +
              i +
              row,
          ) +
            1) *
            0.04;

        ctx.fillStyle =
          i % 4 === 0
            ? `rgba(91,224,255,${alpha})`
            : `rgba(195,220,232,${alpha * 0.55})`;

        ctx.fillRect(
          x +
            5 +
            column *
              ((buildingWidth - 10) /
                columns),
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
      horizon + 60,
    );

  haze.addColorStop(
    0,
    "rgba(30,120,150,0)",
  );

  haze.addColorStop(
    0.55,
    "rgba(55,185,215,0.08)",
  );

  haze.addColorStop(
    1,
    "rgba(4,13,20,0.18)",
  );

  ctx.fillStyle = haze;

  ctx.fillRect(
    0,
    horizon - 100,
    width,
    160,
  );
}

/* =========================================================
   ROAD
========================================================= */

function drawRoad(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizon: number,
  roadOffset: number,
  boost: boolean,
) {
  const center =
    width * 0.5;

  const topHalf =
    width * 0.045;

  const bottomHalf =
    width * 0.68;

  const ground =
    ctx.createLinearGradient(
      0,
      horizon,
      0,
      height,
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
    width,
    height - horizon,
  );

  const road =
    ctx.createLinearGradient(
      0,
      horizon,
      0,
      height,
    );

  road.addColorStop(
    0,
    "#121e28",
  );

  road.addColorStop(
    0.45,
    "#0a141d",
  );

  road.addColorStop(
    1,
    "#04080d",
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
      height,
    ],
    [
      center - bottomHalf,
      height,
    ],
  ]);

  ctx.fillStyle = road;

  ctx.fill();

  /* Road texture */

  for (let i = 0; i < 24; i++) {
    const p =
      ((i / 24) +
        ((roadOffset * 0.0007) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.75) *
        (height - horizon);

    const half =
      topHalf +
      (bottomHalf - topHalf) *
        p;

    ctx.strokeStyle =
      `rgba(116,176,199,${0.025 + p * 0.035})`;

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

  /* Neon road edges */

  for (const side of [-1, 1]) {
    const edge =
      ctx.createLinearGradient(
        0,
        horizon,
        0,
        height,
      );

    edge.addColorStop(
      0,
      "rgba(92,226,255,0.22)",
    );

    edge.addColorStop(
      0.35,
      boost
        ? "rgba(90,237,255,0.80)"
        : "rgba(65,185,220,0.48)",
    );

    edge.addColorStop(
      1,
      "rgba(63,165,210,0.12)",
    );

    ctx.strokeStyle = edge;

    ctx.lineWidth =
      Math.max(
        1.5,
        width * 0.0024,
      );

    ctx.shadowColor = CYAN;

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
      height,
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  /* Center lane markers */

  for (let i = 0; i < 14; i++) {
    const p =
      ((i / 14) +
        ((roadOffset * 0.0016) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.82) *
        (height - horizon);

    const scale =
      0.06 +
      p * 1.25;

    const markerWidth =
      Math.max(
        2,
        width *
          0.003 *
          scale,
      );

    const markerHeight =
      Math.max(
        3,
        height *
          0.016 *
          scale,
      );

    ctx.fillStyle =
      `rgba(168,230,244,${0.16 + p * 0.58})`;

    ctx.shadowColor = CYAN;

    ctx.shadowBlur =
      p > 0.55 ? 7 : 0;

    roundedRect(
      ctx,
      center -
        markerWidth / 2,
      y,
      markerWidth,
      markerHeight,
      markerWidth,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  /* Wet road reflections */

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  for (let i = 0; i < 18; i++) {
    const p =
      ((i / 18) +
        ((roadOffset * 0.0009) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.9) *
        (height - horizon);

    const half =
      topHalf +
      (bottomHalf - topHalf) *
        p;

    const x =
      center +
      Math.sin(i * 9.7) *
        half *
        0.65;

    const length =
      6 +
      p * 38;

    const reflection =
      ctx.createLinearGradient(
        x - length,
        y,
        x + length,
        y,
      );

    reflection.addColorStop(
      0,
      "rgba(80,220,255,0)",
    );

    reflection.addColorStop(
      0.5,
      `rgba(80,220,255,${0.025 + p * 0.09})`,
    );

    reflection.addColorStop(
      1,
      "rgba(80,220,255,0)",
    );

    ctx.fillStyle = reflection;

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
}

/* =========================================================
   VEHICLE
   REAR CAMERA — STRAIGHT FORWARD
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
  /*
    IMPORTANT:

    This is a REAR CAMERA.

    The player is directly behind the vehicle.
    Therefore:
      - vehicle is centered
      - no sideways rotation
      - no left/right-facing body
      - tail lights face player
      - road continues forward behind it
  */

  const scale =
    Math.max(
      1.05,
      Math.min(
        1.75,
        Math.min(
          window.innerWidth,
          window.innerHeight,
        ) / 500,
      ),
    );

  ctx.save();

  ctx.translate(
    x,
    y,
  );

  ctx.scale(
    scale,
    scale,
  );

  /* very small camera suspension */

  ctx.translate(
    0,
    Math.sin(
      time * 0.006,
    ) *
      Math.min(
        1.8,
        speed / 90,
      ),
  );

  const isBike =
    vehicle === "bike";

  const isTruck =
    vehicle === "truck";

  const bodyWidth =
    isBike
      ? 44
      : isTruck
        ? 94
        : 88;

  const cyan =
    boost
      ? "#b8ffff"
      : "#63e8ff";

  const bodyColor =
    vehicle === "sports-car"
      ? "#c84655"
      : vehicle === "supercar"
        ? "#666bd5"
        : vehicle === "truck"
          ? "#347d9e"
          : "#31576b";

  /* =====================================================
     GROUND SHADOW
  ===================================================== */

  const shadow =
    ctx.createRadialGradient(
      0,
      38,
      0,
      0,
      38,
      bodyWidth * 1.55,
    );

  shadow.addColorStop(
    0,
    boost
      ? "rgba(65,225,255,0.30)"
      : "rgba(37,160,200,0.18)",
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
    bodyWidth * 1.5,
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
    speed > 10 &&
    !gameOver
  ) {
    ctx.save();

    ctx.globalAlpha =
      Math.min(
        0.5,
        speed / 280,
      );

    for (
      let i = 0;
      i < 8;
      i++
    ) {
      const startY =
        -22 +
        i * 7;

      const length =
        22 +
        ((i * 19 +
          time * 0.12) %
          45) *
          (speed / 130);

      const trail =
        ctx.createLinearGradient(
          0,
          startY,
          0,
          startY + length,
        );

      trail.addColorStop(
        0,
        "rgba(72,225,255,0.72)",
      );

      trail.addColorStop(
        1,
        "rgba(72,225,255,0)",
      );

      ctx.strokeStyle = trail;

      ctx.lineWidth =
        i % 2 ? 1 : 1.6;

      ctx.beginPath();

      ctx.moveTo(
        0,
        startY,
      );

      ctx.lineTo(
        0,
        startY + length,
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  /* =====================================================
     BIKE — DIRECT REAR VIEW
  ===================================================== */

  if (isBike) {
    /* rear tyre */

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      0,
      18,
      16,
      27,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "#8aaebb";

    ctx.lineWidth = 2.5;

    ctx.stroke();

    /* rim */

    ctx.strokeStyle =
      "rgba(109,231,250,0.72)";

    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.ellipse(
      0,
      18,
      8,
      18,
      0,
      0,
      Math.PI * 2,
    );

    ctx.stroke();

    /* bike body */

    const bikeBody =
      ctx.createLinearGradient(
        -24,
        -27,
        24,
        23,
      );

    bikeBody.addColorStop(
      0,
      "#dceff4",
    );

    bikeBody.addColorStop(
      0.14,
      "#477487",
    );

    bikeBody.addColorStop(
      0.48,
      "#1a3443",
    );

    bikeBody.addColorStop(
      1,
      "#050a10",
    );

    ctx.fillStyle =
      bikeBody;

    polygon(ctx, [
      [-18, -17],
      [-12, -29],
      [12, -29],
      [18, -17],
      [14, 14],
      [0, 23],
      [-14, 14],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(145,239,255,0.86)";

    ctx.lineWidth = 1.4;

    ctx.stroke();

    /* rider */

    ctx.fillStyle =
      "#070c12";

    polygon(ctx, [
      [-9, -28],
      [-10, -43],
      [-6, -49],
      [6, -49],
      [10, -43],
      [9, -28],
    ]);

    ctx.fill();

    ctx.strokeStyle =
      "rgba(105,221,243,0.55)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /* helmet */

    ctx.fillStyle =
      "#03070b";

    ctx.beginPath();

    ctx.ellipse(
      0,
      -50,
      9,
      9,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(116,229,249,0.65)";

    ctx.stroke();

    /* helmet reflection */

    const helmet =
      ctx.createLinearGradient(
        -7,
        -57,
        7,
        -45,
      );

    helmet.addColorStop(
      0,
      "#bffaff",
    );

    helmet.addColorStop(
      0.3,
      "#376b7c",
    );

    helmet.addColorStop(
      1,
      "#07121a",
    );

    ctx.fillStyle =
      helmet;

    roundedRect(
      ctx,
      -6,
      -56,
      12,
      4,
      2,
    );

    ctx.fill();

    /* rear tail light */

    ctx.shadowColor =
      "#ff3f59";

    ctx.shadowBlur =
      boost ? 22 : 15;

    ctx.fillStyle =
      "#ff4058";

    roundedRect(
      ctx,
      -8,
      1,
      16,
      7,
      2.5,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* rear indicators */

    ctx.fillStyle =
      "#ffb45c";

    ctx.shadowColor =
      "#ff9b4b";

    ctx.shadowBlur = 7;

    roundedRect(
      ctx,
      -16,
      3,
      4,
      4,
      1,
    );

    ctx.fill();

    roundedRect(
      ctx,
      12,
      3,
      4,
      4,
      1,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* cyan body strips */

    ctx.strokeStyle =
      cyan;

    ctx.lineWidth = 1.8;

    ctx.beginPath();

    ctx.moveTo(
      -15,
      -10,
    );

    ctx.lineTo(
      -17,
      10,
    );

    ctx.moveTo(
      15,
      -10,
    );

    ctx.lineTo(
      17,
      10,
    );

    ctx.stroke();
  } else {
    /* ===================================================
       CAR / TRUCK — DIRECT REAR VIEW
    =================================================== */

    const width =
      isTruck
        ? 96
        : 90;

    const height =
      isTruck
        ? 64
        : 62;

    /* main body */

    const body =
      ctx.createLinearGradient(
        0,
        -height / 2,
        0,
        height / 2,
      );

    body.addColorStop(
      0,
      "#dff5fa",
    );

    body.addColorStop(
      0.12,
      bodyColor,
    );

    body.addColorStop(
      0.48,
      "#19303d",
    );

    body.addColorStop(
      0.82,
      "#0a151e",
    );

    body.addColorStop(
      1,
      "#03070b",
    );

    ctx.fillStyle = body;

    if (isTruck) {
      polygon(ctx, [
        [-width / 2, -28],
        [width / 2, -28],
        [width / 2 - 4, 30],
        [-width / 2 + 4, 30],
      ]);
    } else {
      polygon(ctx, [
        [-39, -24],
        [-28, -34],
        [28, -34],
        [39, -24],
        [44, 24],
        [32, 31],
        [-32, 31],
        [-44, 24],
      ]);
    }

    ctx.fill();

    ctx.strokeStyle =
      "rgba(145,239,255,0.88)";

    ctx.lineWidth = 1.6;

    ctx.stroke();

    /* rear glass */

    if (isTruck) {
      ctx.fillStyle =
        "#07131c";

      roundedRect(
        ctx,
        -35,
        -20,
        70,
        31,
        4,
      );

      ctx.fill();

      ctx.strokeStyle =
        "rgba(132,225,242,0.52)";

      ctx.lineWidth = 1;

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        0,
        -19,
      );

      ctx.lineTo(
        0,
        10,
      );

      ctx.stroke();
    } else {
      const glass =
        ctx.createLinearGradient(
          0,
          -30,
          0,
          -7,
        );

      glass.addColorStop(
        0,
        "#a9edf7",
      );

      glass.addColorStop(
        0.22,
        "#396778",
      );

      glass.addColorStop(
        0.70,
        "#102632",
      );

      glass.addColorStop(
        1,
        "#061018",
      );

      ctx.fillStyle =
        glass;

      polygon(ctx, [
        [-25, -28],
        [25, -28],
        [32, -9],
        [-32, -9],
      ]);

      ctx.fill();

      ctx.strokeStyle =
        "rgba(185,247,255,0.65)";

      ctx.lineWidth = 1;

      ctx.stroke();

      /* rear glass center reflection */

      ctx.strokeStyle =
        "rgba(210,250,255,0.18)";

      ctx.beginPath();

      ctx.moveTo(
        0,
        -27,
      );

      ctx.lineTo(
        0,
        -10,
      );

      ctx.stroke();
    }

    /* wide rear light */

    ctx.shadowColor =
      "#ff4058";

    ctx.shadowBlur =
      boost ? 24 : 16;

    ctx.fillStyle =
      "#ff4058";

    roundedRect(
      ctx,
      isTruck
        ? -38
        : -35,
      -1,
      isTruck
        ? 76
        : 70,
      7,
      3,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /* light bar center */

    ctx.fillStyle =
      "rgba(255,220,225,0.78)";

    roundedRect(
      ctx,
      -2,
      -1,
      4,
      7,
      1.5,
    );

    ctx.fill();

    /* lower diffuser */

    ctx.fillStyle =
      "#03070b";

    polygon(ctx, [
      [-(width / 2 - 9), 11],
      [-(width / 2 - 18), 29],
      [width / 2 - 18, 29],
      [width / 2 - 9, 11],
    ]);

    ctx.fill();

    /* wheels */

    const drawWheel =
      (wheelX: number) => {
        ctx.fillStyle =
          "#020407";

        ctx.beginPath();

        ctx.ellipse(
          wheelX,
          22,
          9,
          14,
          0,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.strokeStyle =
          "#8da9b7";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.fillStyle =
          "#263d4a";

        ctx.beginPath();

        ctx.arc(
          wheelX,
          22,
          4,
          0,
          Math.PI * 2,
        );

        ctx.fill();
      };

    drawWheel(
      -(isTruck ? 47 : 39),
    );

    drawWheel(
      isTruck ? 47 : 39,
    );

    /* license / telemetry */

    ctx.fillStyle =
      "rgba(117,235,250,0.85)";

    roundedRect(
      ctx,
      -13,
      10,
      26,
      5,
      1.5,
    );

    ctx.fill();
  }

  /* =====================================================
     BOOST EXHAUST
  ===================================================== */

  if (
    boost &&
    speed > 10 &&
    !gameOver
  ) {
    ctx.save();

    const plume =
      ctx.createLinearGradient(
        0,
        25,
        0,
        110,
      );

    plume.addColorStop(
      0,
      "rgba(214,253,255,0.78)",
    );

    plume.addColorStop(
      0.22,
      "rgba(67,220,255,0.46)",
    );

    plume.addColorStop(
      1,
      "rgba(50,180,255,0)",
    );

    ctx.fillStyle =
      plume;

    ctx.beginPath();

    ctx.moveTo(
      -12,
      27,
    );

    ctx.quadraticCurveTo(
      -20,
      65,
      -5,
      100,
    );

    ctx.quadraticCurveTo(
      0,
      108,
      5,
      100,
    );

    ctx.quadraticCurveTo(
      20,
      65,
      12,
      27,
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/* =========================================================
   MAIN CANVAS
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

    const resize =
      () => {
        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            2,
          );

        const w =
          dimensionsRef.current.width;

        const h =
          dimensionsRef.current.height;

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

    const render =
      (
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

        /* =================================================
           SKY
        ================================================= */

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
          "#07111b",
        );

        sky.addColorStop(
          0.64,
          "#0b1b27",
        );

        sky.addColorStop(
          1,
          "#020508",
        );

        ctx.fillStyle =
          sky;

        ctx.fillRect(
          0,
          0,
          w,
          h,
        );

        /* atmospheric bloom */

        const bloom =
          ctx.createRadialGradient(
            center,
            horizon * 0.76,
            0,
            center,
            horizon * 0.76,
            w * 0.52,
          );

        bloom.addColorStop(
          0,
          "rgba(49,166,202,0.20)",
        );

        bloom.addColorStop(
          0.35,
          "rgba(22,91,124,0.09)",
        );

        bloom.addColorStop(
          1,
          "rgba(0,0,0,0)",
        );

        ctx.fillStyle =
          bloom;

        ctx.fillRect(
          0,
          0,
          w,
          h * 0.72,
        );

        /* atmospheric particles */

        for (
          let i = 0;
          i < 54;
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
            (h * 0.56);

          const alpha =
            0.08 +
            (Math.sin(
              time * 0.0012 +
                i,
            ) +
              1) *
              0.06;

          ctx.fillStyle =
            `rgba(151,229,255,${alpha})`;

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

        /* city */

        drawCity(
          ctx,
          w,
          horizon,
          time,
          s.bgOffset || 0,
        );

        /* horizon fog */

        const fog =
          ctx.createLinearGradient(
            0,
            horizon - 35,
            0,
            horizon + 80,
          );

        fog.addColorStop(
          0,
          "rgba(35,123,155,0)",
        );

        fog.addColorStop(
          0.58,
          "rgba(65,191,221,0.12)",
        );

        fog.addColorStop(
          1,
          "rgba(4,13,21,0)",
        );

        ctx.fillStyle =
          fog;

        ctx.fillRect(
          0,
          horizon - 35,
          w,
          115,
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

        for (
          let i = 0;
          i < 10;
          i++
        ) {
          const p =
            ((i / 10) +
              (((s.roadOffset || 0) *
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

          const length =
            5 +
            p * 22;

          ctx.strokeStyle =
            `rgba(67,205,242,${0.08 + p * 0.25})`;

          ctx.lineWidth =
            1 +
            p * 1.4;

          for (
            const side of [-1, 1]
          ) {
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
                    length),
              y +
                length *
                  0.4,
            );

            ctx.stroke();
          }
        }

        /* game particles */

        for (
          const particle of
            s.particles || []
        ) {
          const life =
            Math.max(
              0,
              Math.min(
                1,
                particle.life,
              ),
            );

          const px =
            w * 0.5 +
            (particle.x || 0) *
              0.18;

          const py =
            h * 0.72 +
            (particle.y || 0) *
              0.20;

          ctx.save();

          ctx.globalAlpha =
            life * 0.7;

          ctx.fillStyle =
            particle.color ||
            CYAN;

          ctx.shadowColor =
            particle.color ||
            CYAN;

          ctx.shadowBlur =
            particle.type ===
            "spark"
              ? 12
              : 5;

          ctx.beginPath();

          ctx.arc(
            px,
            py,
            Math.max(
              1,
              (particle.size ||
                2) *
                0.8,
            ),
            0,
            Math.PI * 2,
          );

          ctx.fill();

          ctx.restore();
        }

        /* =================================================
           VEHICLE POSITION

           THIS IS THE IMPORTANT PART.

           50% = exact center
           66% = your red-marked position

           The target box sits lower, so the vehicle
           remains ABOVE it.
        ================================================= */

        const vehicleX =
          w * 0.5;

        const vehicleY =
          h * 0.66 +
          Math.sin(
            time * 0.006,
          ) *
            Math.min(
              1.5,
              speed / 80,
            );

        ctx.save();

        if (
          s.shake > 0
        ) {
          ctx.translate(
            Math.sin(
              time * 0.08,
            ) *
              s.shake *
              0.18,
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

        /* =================================================
           VIGNETTE
        ================================================= */

        const vignette =
          ctx.createRadialGradient(
            center,
            h * 0.48,
            h * 0.15,
            center,
            h * 0.48,
            Math.max(
              w,
              h,
            ) * 0.78,
          );

        vignette.addColorStop(
          0,
          "rgba(0,0,0,0)",
        );

        vignette.addColorStop(
          0.72,
          "rgba(0,0,0,0.18)",
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

        /* cinematic frame */

        ctx.strokeStyle =
          "rgba(122,225,246,0.08)";

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

        /* =================================================
           PAUSE / GAME OVER
        ================================================= */

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

          const panelWidth =
            Math.min(
              380,
              w * 0.78,
            );

          const panelHeight =
            118;

          const panelX =
            (w -
              panelWidth) /
            2;

          const panelY =
            h * 0.39;

          ctx.save();

          ctx.shadowColor =
            "rgba(67,211,245,0.20)";

          ctx.shadowBlur = 28;

          roundedRect(
            ctx,
            panelX,
            panelY,
            panelWidth,
            panelHeight,
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
            "rgba(134,229,248,0.70)";

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
