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
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
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
  const haze = ctx.createLinearGradient(
    0,
    horizon - 100,
    0,
    horizon + 35,
  );

  haze.addColorStop(
    0,
    "rgba(26,93,126,0)",
  );

  haze.addColorStop(
    1,
    "rgba(44,170,205,0.13)",
  );

  ctx.fillStyle = haze;
  ctx.fillRect(
    0,
    horizon - 100,
    w,
    140,
  );

  const buildings = [
    [0.04, 0.24, 0.10],
    [0.10, 0.40, 0.07],
    [0.16, 0.29, 0.12],
    [0.23, 0.52, 0.065],
    [0.29, 0.32, 0.10],
    [0.37, 0.44, 0.07],
    [0.44, 0.30, 0.09],
    [0.51, 0.48, 0.065],
    [0.58, 0.34, 0.09],
    [0.65, 0.55, 0.07],
    [0.72, 0.32, 0.10],
    [0.80, 0.45, 0.075],
    [0.87, 0.31, 0.10],
    [0.94, 0.42, 0.09],
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

    const drift =
      ((offset *
        (0.10 +
          (i % 3) *
            0.035)) %
        (w + 100));

    const bw =
      w * widthFactor;

    const bh =
      horizon *
      heightFactor;

    const x =
      ((fraction * w -
        drift +
        w +
        100) %
        (w + 100)) -
      50;

    const y =
      horizon - bh;

    const facade =
      ctx.createLinearGradient(
        x,
        y,
        x + bw,
        horizon,
      );

    facade.addColorStop(
      0,
      "#111c2b",
    );

    facade.addColorStop(
      0.55,
      "#080e18",
    );

    facade.addColorStop(
      1,
      "#04080e",
    );

    ctx.fillStyle =
      facade;

    ctx.fillRect(
      x,
      y,
      bw,
      bh,
    );

    ctx.strokeStyle =
      "rgba(111,223,255,0.12)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      bw - 1,
      bh,
    );

    if (i % 3 === 0) {
      ctx.fillStyle =
        "rgba(83,224,255,0.35)";

      ctx.fillRect(
        x + bw * 0.72,
        y + 5,
        2,
        bh * 0.72,
      );
    }

    const cols =
      Math.max(
        2,
        Math.floor(
          bw / 11,
        ),
      );

    const rows =
      Math.max(
        2,
        Math.floor(
          bh / 13,
        ),
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
        const lit =
          Math.sin(
            i * 17 +
              row * 8.3 +
              col * 3.1,
          ) > 0.18;

        if (!lit) continue;

        const alpha =
          0.16 +
          (Math.sin(
            time *
              0.002 +
              i +
              row,
          ) +
            1) *
            0.07;

        ctx.fillStyle =
          i % 4 === 0
            ? `rgba(96,224,255,${alpha})`
            : `rgba(191,217,237,${alpha * 0.65})`;

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

  for (
    let i = 0;
    i < 4;
    i++
  ) {
    const x =
      w *
        (0.18 +
          i * 0.21) +
      Math.sin(
        time *
          0.001 +
          i,
      ) *
        7;

    const top =
      horizon -
      (0.30 +
        (i % 2) *
          0.10) *
        horizon;

    ctx.strokeStyle =
      "rgba(77,225,255,0.28)";

    ctx.beginPath();
    ctx.moveTo(
      x,
      top,
    );

    ctx.lineTo(
      x,
      horizon,
    );

    ctx.stroke();

    ctx.fillStyle =
      CYAN;

    ctx.shadowColor =
      CYAN;

    ctx.shadowBlur = 12;

    ctx.fillRect(
      x - 1.5,
      top - 2,
      3,
      4,
    );

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
  const cx =
    w * 0.5;

  const topHalf =
    w * 0.045;

  const bottomHalf =
    w * 0.68;

  const ground =
    ctx.createLinearGradient(
      0,
      horizon,
      0,
      h,
    );

  ground.addColorStop(
    0,
    "#081018",
  );

  ground.addColorStop(
    1,
    "#020407",
  );

  ctx.fillStyle =
    ground;

  ctx.fillRect(
    0,
    horizon,
    w,
    h - horizon,
  );

  const roadGradient =
    ctx.createLinearGradient(
      0,
      horizon,
      0,
      h,
    );

  roadGradient.addColorStop(
    0,
    "#101a24",
  );

  roadGradient.addColorStop(
    0.42,
    "#0b121a",
  );

  roadGradient.addColorStop(
    1,
    "#05090e",
  );

  polygon(ctx, [
    [
      cx - topHalf,
      horizon,
    ],
    [
      cx + topHalf,
      horizon,
    ],
    [
      cx + bottomHalf,
      h,
    ],
    [
      cx - bottomHalf,
      h,
    ],
  ]);

  ctx.fillStyle =
    roadGradient;

  ctx.fill();

  for (
    let i = 0;
    i < 24;
    i++
  ) {
    const p =
      ((i / 24) +
        ((roadOffset *
          0.0007) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(
        p,
        1.75,
      ) *
        (h - horizon);

    const half =
      topHalf +
      (bottomHalf -
        topHalf) *
        p;

    ctx.strokeStyle = `rgba(116,176,199,${0.025 + p * 0.035})`;

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      cx - half,
      y,
    );

    ctx.lineTo(
      cx + half,
      y,
    );

    ctx.stroke();
  }

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
      "rgba(92,226,255,0.22)",
    );

    edge.addColorStop(
      0.35,
      boost
        ? "rgba(90,237,255,0.75)"
        : "rgba(65,185,220,0.48)",
    );

    edge.addColorStop(
      1,
      "rgba(63,165,210,0.15)",
    );

    ctx.strokeStyle =
      edge;

    ctx.lineWidth =
      Math.max(
        1.5,
        w * 0.0024,
      );

    ctx.shadowColor =
      CYAN;

    ctx.shadowBlur =
      boost ? 18 : 10;

    ctx.beginPath();

    ctx.moveTo(
      cx +
        side *
          topHalf,
      horizon,
    );

    ctx.lineTo(
      cx +
        side *
          bottomHalf,
      h,
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  const markerCount =
    13;

  for (
    let i = 0;
    i < markerCount;
    i++
  ) {
    const p =
      ((i /
        markerCount) +
        ((roadOffset *
          0.0016) %
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
      p * 1.25;

    const markerW =
      Math.max(
        1,
        w *
          0.003 *
          scale,
      );

    const markerH =
      Math.max(
        3,
        h *
          0.016 *
          scale,
      );

    const alpha =
      0.16 +
      p * 0.58;

    ctx.fillStyle = `rgba(168,230,244,${alpha})`;

    ctx.shadowColor =
      CYAN;

    ctx.shadowBlur =
      p > 0.55
        ? 7
        : 0;

    roundedRect(
      ctx,
      cx -
        markerW / 2,
      y,
      markerW,
      markerH,
      markerW,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  for (
    let i = 0;
    i < 16;
    i++
  ) {
    const p =
      ((i / 16) +
        ((roadOffset *
          0.0009) %
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
      cx +
      Math.sin(
        i * 12.7 +
          time *
            0.001,
      ) *
        half *
        0.66;

    const streakW =
      (5 +
        p * 35) *
      (w / 1200);

    const streak =
      ctx.createLinearGradient(
        x - streakW,
        y,
        x + streakW,
        y,
      );

    streak.addColorStop(
      0,
      "rgba(83,225,255,0)",
    );

    streak.addColorStop(
      0.5,
      `rgba(83,225,255,${0.02 + p * 0.10})`,
    );

    streak.addColorStop(
      1,
      "rgba(83,225,255,0)",
    );

    ctx.fillStyle =
      streak;

    ctx.fillRect(
      x - streakW,
      y,
      streakW * 2,
      Math.max(
        1,
        p * 3,
      ),
    );
  }

  ctx.restore();

  const glow =
    ctx.createRadialGradient(
      cx,
      h * 0.83,
      0,
      cx,
      h * 0.83,
      w * 0.55,
    );

  glow.addColorStop(
    0,
    boost
      ? "rgba(49,190,255,0.13)"
      : "rgba(37,139,176,0.075)",
  );

  glow.addColorStop(
    1,
    "rgba(0,0,0,0)",
  );

  ctx.fillStyle =
    glow;

  ctx.fillRect(
    0,
    horizon,
    w,
    h - horizon,
  );
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
  const scale =
    Math.max(
      0.72,
      Math.min(
        1.35,
        Math.min(
          window.innerWidth,
          window.innerHeight,
        ) / 760,
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

  const sway =
    Math.sin(
      time * 0.0018,
    ) *
    Math.min(
      3,
      speed / 80,
    );

  ctx.translate(
    sway,
    Math.sin(
      time * 0.006,
    ) *
      Math.min(
        1.5,
        speed / 120,
      ),
  );

  if (crashed) {
    ctx.rotate(
      Math.min(
        1.2,
        time * 0.0008,
      ),
    );
  }

  const bike =
    vehicle === "bike";

  const truck =
    vehicle === "truck";

  const bodyW =
    bike
      ? 52
      : truck
        ? 84
        : 76;

  const cyan =
    boost
      ? "#a5fbff"
      : "#54d7f4";

  const bodyColor =
    vehicle ===
    "sports-car"
      ? "#d84b55"
      : vehicle ===
          "supercar"
        ? "#6e70d9"
        : vehicle ===
            "truck"
          ? "#397da4"
          : "#263f52";

  /* Ground shadow */
  ctx.save();

  const shadow =
    ctx.createRadialGradient(
      0,
      26,
      2,
      0,
      26,
      bodyW * 1.45,
    );

  shadow.addColorStop(
    0,
    boost
      ? "rgba(58,220,255,0.25)"
      : "rgba(25,146,185,0.17)",
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
    28,
    bodyW * 1.45,
    bike ? 22 : 19,
    0,
    0,
    Math.PI * 2,
  );

  ctx.fill();

  ctx.restore();

  /* Speed trails */

  if (
    speed > 8 &&
    !crashed
  ) {
    ctx.save();

    ctx.globalAlpha =
      Math.min(
        0.5,
        speed / 300,
      );

    for (
      let i = 0;
      i < 7;
      i++
    ) {
      const yy =
        -4 +
        i * 7;

      const length =
        16 +
        ((i * 17 +
          time *
            0.13) %
          40) *
          (speed /
            120);

      const trail =
        ctx.createLinearGradient(
          -bodyW -
            length,
          yy,
          -bodyW,
          yy,
        );

      trail.addColorStop(
        0,
        "rgba(74,222,255,0)",
      );

      trail.addColorStop(
        1,
        "rgba(74,222,255,0.8)",
      );

      ctx.strokeStyle =
        trail;

      ctx.lineWidth =
        i % 2
          ? 1
          : 1.8;

      ctx.beginPath();

      ctx.moveTo(
        -bodyW -
          length,
        yy,
      );

      ctx.lineTo(
        -bodyW,
        yy,
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  if (bike) {
    const wheel = (
      wx: number,
      radius: number,
    ) => {
      ctx.save();

      ctx.translate(
        wx,
        16,
      );

      ctx.rotate(
        time *
          Math.max(
            0.004,
            speed *
              0.0008,
          ),
      );

      ctx.fillStyle =
        "#030609";

      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        radius *
          0.72,
        radius,
        -0.1,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      ctx.strokeStyle =
        "#8babb9";

      ctx.lineWidth = 2;

      ctx.stroke();

      ctx.strokeStyle =
        "rgba(117,236,255,0.7)";

      ctx.lineWidth = 1;

      for (
        let i = 0;
        i < 6;
        i++
      ) {
        const a =
          (Math.PI * 2 * i) /
          6;

        ctx.beginPath();

        ctx.moveTo(
          0,
          0,
        );

        ctx.lineTo(
          Math.cos(a) *
            radius *
            0.65,
          Math.sin(a) *
            radius *
            0.65,
        );

        ctx.stroke();
      }

      ctx.restore();
    };

    wheel(
      -24,
      14,
    );

    wheel(
      23,
      13,
    );

    polygon(ctx, [
      [-25, 13],
      [-13, -2],
      [4, -8],
      [24, 5],
      [19, 13],
      [1, 8],
      [-14, 14],
    ]);

    const frame =
      ctx.createLinearGradient(
        -15,
        -10,
        18,
        14,
      );

    frame.addColorStop(
      0,
      "#dce8ef",
    );

    frame.addColorStop(
      0.4,
      "#426577",
    );

    frame.addColorStop(
      1,
      "#111c27",
    );

    ctx.fillStyle =
      frame;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(165,239,255,0.75)";

    ctx.lineWidth = 1.2;

    ctx.stroke();

    polygon(ctx, [
      [-8, -9],
      [2, -17],
      [17, -12],
      [14, -3],
      [1, 1],
      [-9, -2],
    ]);

    const tank =
      ctx.createLinearGradient(
        0,
        -18,
        10,
        0,
      );

    tank.addColorStop(
      0,
      "#d8f7ff",
    );

    tank.addColorStop(
      0.16,
      boost
        ? "#4cdcf4"
        : "#3a8ca8",
    );

    tank.addColorStop(
      0.55,
      "#1b3344",
    );

    tank.addColorStop(
      1,
      "#050b11",
    );

    ctx.fillStyle =
      tank;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(174,246,255,0.8)";

    ctx.stroke();

    ctx.fillStyle =
      "#060a10";

    roundedRect(
      ctx,
      -14,
      -7,
      17,
      6,
      3,
    );

    ctx.fill();

    polygon(ctx, [
      [-11, -9],
      [-9, -22],
      [1, -26],
      [9, -18],
      [7, -7],
      [-2, -3],
    ]);

    const suit =
      ctx.createLinearGradient(
        -10,
        -26,
        8,
        -4,
      );

    suit.addColorStop(
      0,
      "#dce8ed",
    );

    suit.addColorStop(
      0.28,
      "#283d4c",
    );

    suit.addColorStop(
      1,
      "#070b11",
    );

    ctx.fillStyle =
      suit;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(122,228,247,0.55)";

    ctx.stroke();

    ctx.fillStyle =
      "#05080d";

    ctx.beginPath();

    ctx.ellipse(
      4,
      -27,
      8,
      8.5,
      -0.2,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    const visor =
      ctx.createLinearGradient(
        -2,
        -29,
        10,
        -25,
      );

    visor.addColorStop(
      0,
      "#2c8196",
    );

    visor.addColorStop(
      1,
      "#b7fbff",
    );

    ctx.fillStyle =
      visor;

    roundedRect(
      ctx,
      0,
      -30,
      9,
      4,
      2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "#c3d5dd";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      14,
      -7,
    );

    ctx.lineTo(
      23,
      -10,
    );

    ctx.lineTo(
      27,
      -7,
    );

    ctx.stroke();

    ctx.strokeStyle =
      "#90b7c6";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
      17,
      -5,
    );

    ctx.lineTo(
      23,
      12,
    );

    ctx.stroke();

    ctx.save();

    const beam =
      ctx.createRadialGradient(
        28,
        0,
        1,
        28,
        0,
        58,
      );

    beam.addColorStop(
      0,
      "rgba(211,251,255,0.42)",
    );

    beam.addColorStop(
      1,
      "rgba(99,222,255,0)",
    );

    ctx.fillStyle =
      beam;

    polygon(ctx, [
      [22, -5],
      [86, -28],
      [86, 27],
      [22, 5],
    ]);

    ctx.fill();

    ctx.restore();

    ctx.shadowColor =
      WHITE;

    ctx.shadowBlur = 14;

    ctx.fillStyle =
      WHITE;

    ctx.beginPath();

    ctx.ellipse(
      25,
      -3,
      3.5,
      2.5,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.shadowColor =
      "#ff5368";

    ctx.shadowBlur = 12;

    ctx.fillStyle =
      "#ff5368";

    roundedRect(
      ctx,
      -29,
      4,
      5,
      3,
      1.5,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  } else {
    const top =
      truck
        ? -15
        : -24;

    polygon(
      ctx,
      truck
        ? [
            [-42, 13],
            [-42, -9],
            [-24, -17],
            [13, -17],
            [25, -7],
            [40, -5],
            [43, 13],
          ]
        : [
            [-40, 13],
            [-34, -4],
            [-18, -20],
            [15, -21],
            [33, -6],
            [40, 13],
          ],
    );

    const body =
      ctx.createLinearGradient(
        0,
        top,
        0,
        18,
      );

    body.addColorStop(
      0,
      "#d8f4fc",
    );

    body.addColorStop(
      0.16,
      bodyColor,
    );

    body.addColorStop(
      0.58,
      "#122330",
    );

    body.addColorStop(
      1,
      "#05090d",
    );

    ctx.fillStyle =
      body;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(139,237,255,0.8)";

    ctx.lineWidth = 1.4;

    ctx.stroke();

    polygon(
      ctx,
      truck
        ? [
            [-19, -13],
            [9, -13],
            [9, -2],
            [-20, -2],
          ]
        : [
            [-16, -5],
            [-9, -16],
            [13, -16],
            [25, -5],
          ],
    );

    const glass =
      ctx.createLinearGradient(
        0,
        -17,
        0,
        -2,
      );

    glass.addColorStop(
      0,
      "#9deaf7",
    );

    glass.addColorStop(
      0.25,
      "#24495a",
    );

    glass.addColorStop(
      1,
      "#07111a",
    );

    ctx.fillStyle =
      glass;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(171,246,255,0.65)";

    ctx.stroke();

    const wheel = (
      wx: number,
    ) => {
      ctx.fillStyle =
        "#020407";

      ctx.beginPath();

      ctx.ellipse(
        wx,
        14,
        9,
        12,
        0,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      ctx.strokeStyle =
        "#8da8b6";

      ctx.lineWidth = 2;

      ctx.stroke();

      ctx.fillStyle =
        "#263e4c";

      ctx.beginPath();

      ctx.arc(
        wx,
        14,
        4,
        0,
        Math.PI * 2,
      );

      ctx.fill();
    };

    wheel(-25);
    wheel(25);

    ctx.shadowColor =
      WHITE;

    ctx.shadowBlur = 13;

    ctx.fillStyle =
      WHITE;

    roundedRect(
      ctx,
      34,
      3,
      5,
      4,
      1,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.shadowColor =
      "#ff5368";

    ctx.shadowBlur = 10;

    ctx.fillStyle =
      "#ff5368";

    roundedRect(
      ctx,
      -41,
      4,
      5,
      4,
      1,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  if (
    boost &&
    speed > 10 &&
    !crashed
  ) {
    ctx.save();

    const plume =
      ctx.createLinearGradient(
        -bodyW - 50,
        0,
        -bodyW,
        0,
      );

    plume.addColorStop(
      0,
      "rgba(64,204,255,0)",
    );

    plume.addColorStop(
      0.65,
      "rgba(70,217,255,0.23)",
    );

    plume.addColorStop(
      1,
      "rgba(197,250,255,0.7)",
    );

    ctx.fillStyle =
      plume;

    ctx.beginPath();

    ctx.ellipse(
      -bodyW - 22,
      7,
      36 +
        Math.min(
          35,
          speed * 0.12,
        ),
      7,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

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

    let raf = 0;
    let time = 0;
    let last = 0;

    const resizeCanvas =
      () => {
        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            2,
          );

        const {
          width: w,
          height: h,
        } =
          dimensionsRef.current;

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

    const draw = (
      now: number,
    ) => {
      raf =
        window.requestAnimationFrame(
          draw,
        );

      const delta =
        last
          ? Math.min(
              40,
              now - last,
            )
          : 16;

      last = now;

      time += delta;

      const s =
        stateRef.current;

      const {
        width: w,
        height: h,
      } =
        dimensionsRef.current;

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

      const cx =
        w * 0.5;

      ctx.save();

      ctx.clearRect(
        0,
        0,
        w,
        h,
      );

      /* ======================================================
         SKY
      ====================================================== */

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

      const bloom =
        ctx.createRadialGradient(
          cx,
          horizon *
            0.76,
          0,
          cx,
          horizon *
            0.76,
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

      /* ======================================================
         ATMOSPHERIC PARTICLES
      ====================================================== */

      for (
        let i = 0;
        i < 54;
        i++
      ) {
        const x =
          (i * 173.7 +
            Math.sin(
              time *
                0.00025 +
                i,
            ) *
              8) %
          w;

        const y =
          (i * 83.9) %
          (h * 0.56);

        const alpha =
          0.08 +
          (Math.sin(
            time *
              0.0012 +
              i,
          ) +
            1) *
            0.06;

        ctx.fillStyle = `rgba(151,229,255,${alpha})`;

        ctx.fillRect(
          x,
          y,
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

      /* ======================================================
         FOG
      ====================================================== */

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

      /* ======================================================
         ROAD
      ====================================================== */

      drawRoad(
        ctx,
        w,
        h,
        horizon,
        speed,
        s.roadOffset || 0,
        time,
        boost,
      );

      /* ======================================================
         SIDE LIGHT BARS
      ====================================================== */

      const roadTop =
        horizon;

      for (
        let i = 0;
        i < 10;
        i++
      ) {
        const p =
          ((i / 10) +
            (((s.roadOffset ||
              0) *
              0.0012) %
              1)) %
          1;

        const y =
          roadTop +
          Math.pow(
            p,
            1.65,
          ) *
            (h -
              roadTop);

        const roadHalf =
          w *
          (0.045 +
            p * 0.63);

        const len =
          5 +
          p * 22;

        ctx.strokeStyle = `rgba(67,205,242,${0.08 + p * 0.25})`;

        ctx.lineWidth =
          1 +
          p * 1.4;

        for (const side of [
          -1,
          1,
        ]) {
          ctx.beginPath();

          ctx.moveTo(
            cx +
              side *
                (roadHalf +
                  4),
            y,
          );

          ctx.lineTo(
            cx +
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

      /* ======================================================
         ENGINE PARTICLES
      ====================================================== */

      for (const p of
        s.particles ||
        []) {
        const life =
          Math.max(
            0,
            Math.min(
              1,
              p.life,
            ),
          );

        const px =
          w * 0.23 +
          (p.x || 0) *
            0.22;

        const py =
          h * 0.72 +
          (p.y || 0) *
            0.28;

        ctx.save();

        ctx.globalAlpha =
          life * 0.7;

        ctx.fillStyle =
          p.color ||
          CYAN;

        ctx.shadowColor =
          p.color ||
          CYAN;

        ctx.shadowBlur =
          p.type ===
          "spark"
            ? 12
            : 5;

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          Math.max(
            1,
            (p.size ||
              2) *
              0.8,
          ),
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.restore();
      }

      /* ======================================================
         PLAYER VEHICLE
         
         IMPORTANT:
         Vehicle is now placed much lower in the foreground.
         This keeps it BELOW the typing panel.
      ====================================================== */

      /*
       * OLD:
       * const vehicleY = h * 0.755;
       *
       * NEW:
       * Push vehicle toward foreground.
       */

      const vehicleX =
        w *
        (0.285 +
          Math.sin(
            time *
              0.00065,
          ) *
            0.003);

      const vehicleY =
        h *
          0.875 +
        Math.sin(
          time *
            0.006,
        ) *
          Math.min(
            2,
            speed / 70,
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
            0.22,
          Math.cos(
            time * 0.1,
          ) *
            s.shake *
            0.16,
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

      /* ======================================================
         VEHICLE FOREGROUND GLOW
      ====================================================== */

      if (
        speed > 20 &&
        !s.gameOver
      ) {
        const vehicleGlow =
          ctx.createRadialGradient(
            vehicleX,
            vehicleY,
            0,
            vehicleX,
            vehicleY,
            w * 0.20,
          );

        vehicleGlow.addColorStop(
          0,
          boost
            ? "rgba(76,224,255,0.11)"
            : "rgba(65,196,230,0.055)",
        );

        vehicleGlow.addColorStop(
          1,
          "rgba(0,0,0,0)",
        );

        ctx.fillStyle =
          vehicleGlow;

        ctx.fillRect(
          vehicleX -
            w * 0.20,
          vehicleY -
            h * 0.12,
          w * 0.40,
          h * 0.24,
        );
      }

      /* ======================================================
         VIGNETTE
      ====================================================== */

      const vignette =
        ctx.createRadialGradient(
          cx,
          h * 0.48,
          h * 0.15,
          cx,
          h * 0.48,
          Math.max(
            w,
            h,
          ) *
            0.78,
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

      /* ======================================================
         FRAME
      ====================================================== */

      ctx.strokeStyle =
        "rgba(122,225,246,0.08)";

      ctx.lineWidth = 1;

      ctx.strokeRect(
        10.5,
        10.5,
        w - 21,
        h - 21,
      );

      /* ======================================================
         TELEMETRY
      ====================================================== */

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
            s.level,
          ),
        ).padStart(
          2,
          "0",
        )}`,
        w - 28,
        h - 28,
      );

      ctx.restore();

      /* ======================================================
         PAUSE / GAME OVER ATMOSPHERE
      ====================================================== */

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

        const px =
          (w -
            panelW) /
          2;

        const py =
          h * 0.39;

        ctx.save();

        ctx.shadowColor =
          "rgba(67,211,245,0.2)";

        ctx.shadowBlur =
          28;

        roundedRect(
          ctx,
          px,
          py,
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

        ctx.fillStyle =
          WHITE;

        ctx.textAlign =
          "center";

        ctx.font =
          "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";

        ctx.fillStyle =
          "rgba(134,229,248,0.7)";

        ctx.fillText(
          "MOTO TYPE RACER  /  COCKPIT",
          w / 2,
          py + 28,
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
          py + 66,
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
          py + 91,
        );

        ctx.restore();
      }

      ctx.restore();
    };

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas,
    );

    raf =
      window.requestAnimationFrame(
        draw,
      );

    return () => {
      window.cancelAnimationFrame(
        raf,
      );

      window.removeEventListener(
        "resize",
        resizeCanvas,
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
