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
  const r = Math.min(
    radius,
    width / 2,
    height / 2,
  );

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r,
  );
  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r,
  );
  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    r,
  );
  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    r,
  );
  ctx.closePath();
}

function polygon(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
) {
  ctx.beginPath();

  points.forEach(
    ([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    },
  );

  ctx.closePath();
}

function drawCity(
  ctx: CanvasRenderingContext2D,
  w: number,
  horizon: number,
  time: number,
  offset: number,
) {
  const haze =
    ctx.createLinearGradient(
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
      (offset *
        (0.10 + (i % 3) * 0.035)) %
      (w + 100);

    const bw =
      w * widthFactor;

    const bh =
      horizon * heightFactor;

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

    ctx.fillStyle = facade;

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
            time * 0.0012 +
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
            (col * (bw - 10)) /
              cols,
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
        (0.18 + i * 0.21) +
      Math.sin(
        time * 0.001 + i,
      ) *
        7;

    const top =
      horizon -
      (0.30 +
        (i % 2) * 0.10) *
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

    ctx.fillStyle = CYAN;
    ctx.shadowColor = CYAN;
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

  ctx.fillStyle = ground;

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
    [cx - topHalf, horizon],
    [cx + topHalf, horizon],
    [cx + bottomHalf, h],
    [cx - bottomHalf, h],
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
        ((roadOffset * 0.0007) %
          1)) %
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
      `rgba(116,176,199,${0.025 + p * 0.035})`;

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

  for (
    const side of [-1, 1]
  ) {
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
      cx + side * topHalf,
      horizon,
    );

    ctx.lineTo(
      cx + side * bottomHalf,
      h,
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  const markerCount = 13;

  for (
    let i = 0;
    i < markerCount;
    i++
  ) {
    const p =
      ((i / markerCount) +
        ((roadOffset * 0.0016) %
          1)) %
      1;

    const y =
      horizon +
      Math.pow(p, 1.82) *
        (h - horizon);

    const scale =
      0.06 + p * 1.25;

    const markerW =
      Math.max(
        1,
        w * 0.003 * scale,
      );

    const markerH =
      Math.max(
        3,
        h * 0.016 * scale,
      );

    const alpha =
      0.16 + p * 0.58;

    ctx.fillStyle =
      `rgba(168,230,244,${alpha})`;

    ctx.shadowColor =
      CYAN;

    ctx.shadowBlur =
      p > 0.55 ? 7 : 0;

    roundedRect(
      ctx,
      cx - markerW / 2,
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
        ((roadOffset * 0.0009) %
          1)) %
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
      cx +
      Math.sin(
        i * 12.7 +
          time * 0.001,
      ) *
        half *
        0.66;

    const streakW =
      (5 + p * 35) *
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

/*
 * ============================================================
 * THIRD-PERSON VEHICLE
 * ============================================================
 *
 * FRONT = TOP
 * REAR  = BOTTOM
 *
 * No rotation is used.
 *
 * The player is following the vehicle down the road.
 */

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
      0.9,
      Math.min(
        1.42,
        Math.min(
          window.innerWidth,
          window.innerHeight,
        ) / 650,
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

  const lean =
    Math.sin(
      time * 0.0018,
    ) *
    Math.min(
      2.5,
      speed / 100,
    );

  ctx.translate(
    lean,
    Math.sin(
      time * 0.006,
    ) *
      Math.min(
        1.4,
        speed / 90,
      ),
  );

  if (crashed) {
    ctx.rotate(
      Math.sin(
        time * 0.012,
      ) * 0.035,
    );
  }

  const isBike =
    vehicle === "bike";

  const isTruck =
    vehicle === "truck";

  /*
   * ROAD CONTACT SHADOW
   */

  ctx.save();

  const shadow =
    ctx.createRadialGradient(
      0,
      34,
      4,
      0,
      34,
      isBike ? 48 : 72,
    );

  shadow.addColorStop(
    0,
    boost
      ? "rgba(50,220,255,0.25)"
      : "rgba(0,0,0,0.62)",
  );

  shadow.addColorStop(
    0.55,
    "rgba(0,0,0,0.30)",
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
    38,
    isBike ? 36 : 62,
    isBike ? 13 : 17,
    0,
    0,
    Math.PI * 2,
  );

  ctx.fill();

  ctx.restore();

  /*
   * SPEED TRAILS
   */

  if (
    speed > 8 &&
    !crashed
  ) {
    ctx.save();

    const intensity =
      Math.min(
        0.65,
        speed / 260,
      );

    for (
      let i = 0;
      i < 8;
      i++
    ) {
      const side =
        i % 2 === 0
          ? -1
          : 1;

      const yy =
        8 +
        (i % 4) * 8;

      const length =
        14 +
        ((i * 17 +
          time * 0.12) %
          42) *
          (0.55 + speed / 220);

      const xx =
        side *
        (isBike ? 15 : 28);

      const streak =
        ctx.createLinearGradient(
          xx,
          yy,
          xx + side * length,
          yy + 5,
        );

      streak.addColorStop(
        0,
        `rgba(80,220,255,${intensity})`,
      );

      streak.addColorStop(
        1,
        "rgba(80,220,255,0)",
      );

      ctx.strokeStyle =
        streak;

      ctx.lineWidth =
        i % 2 === 0
          ? 1.6
          : 1;

      ctx.beginPath();

      ctx.moveTo(
        xx,
        yy,
      );

      ctx.lineTo(
        xx + side * length,
        yy + 5,
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  /*
   * ============================================================
   * BIKE
   * ============================================================
   */

  if (isBike) {
    /*
     * REAR WHEEL
     */

    ctx.save();

    ctx.shadowColor =
      "rgba(0,0,0,0.8)";

    ctx.shadowBlur = 12;

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      0,
      35,
      9,
      17,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle =
      "#6e8997";

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.fillStyle =
      "#172a36";

    ctx.beginPath();

    ctx.ellipse(
      0,
      35,
      4,
      10,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.restore();

    /*
     * FRONT WHEEL
     */

    ctx.save();

    ctx.fillStyle =
      "#020407";

    ctx.beginPath();

    ctx.ellipse(
      0,
      -42,
      6,
      13,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "#7794a1";

    ctx.lineWidth = 1.6;

    ctx.stroke();

    ctx.restore();

    /*
     * BIKE BODY
     */

    const rearBody =
      ctx.createLinearGradient(
        -22,
        -5,
        22,
        38,
      );

    rearBody.addColorStop(
      0,
      "#56798a",
    );

    rearBody.addColorStop(
      0.25,
      boost
        ? "#2ebcd6"
        : "#284758",
    );

    rearBody.addColorStop(
      0.72,
      "#0b1721",
    );

    rearBody.addColorStop(
      1,
      "#03070b",
    );

    polygon(ctx, [
      [-10, -8],
      [10, -8],
      [19, 22],
      [14, 34],
      [-14, 34],
      [-19, 22],
    ]);

    ctx.fillStyle =
      rearBody;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(128,231,249,0.8)";

    ctx.lineWidth = 1.3;

    ctx.stroke();

    /*
     * TAIL SECTION
     */

    polygon(ctx, [
      [-13, 13],
      [13, 13],
      [10, 31],
      [-10, 31],
    ]);

    ctx.fillStyle =
      "rgba(7,14,20,0.85)";

    ctx.fill();

    /*
     * RIDER
     */

    polygon(ctx, [
      [-11, -4],
      [-8, -25],
      [0, -34],
      [8, -25],
      [11, -4],
      [6, 10],
      [-6, 10],
    ]);

    const suit =
      ctx.createLinearGradient(
        -10,
        -32,
        10,
        12,
      );

    suit.addColorStop(
      0,
      "#9bb8c4",
    );

    suit.addColorStop(
      0.18,
      "#314b5a",
    );

    suit.addColorStop(
      0.65,
      "#0d1b25",
    );

    suit.addColorStop(
      1,
      "#050a0f",
    );

    ctx.fillStyle =
      suit;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(115,231,248,0.45)";

    ctx.stroke();

    /*
     * HELMET
     */

    ctx.fillStyle =
      "#060a0f";

    ctx.beginPath();

    ctx.ellipse(
      0,
      -31,
      9,
      10,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(153,231,242,0.7)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /*
     * HELMET REFLECTION
     */

    const helmetGlow =
      ctx.createLinearGradient(
        -7,
        -39,
        7,
        -26,
      );

    helmetGlow.addColorStop(
      0,
      "rgba(195,248,255,0.75)",
    );

    helmetGlow.addColorStop(
      0.25,
      "rgba(72,154,177,0.35)",
    );

    helmetGlow.addColorStop(
      1,
      "rgba(0,0,0,0)",
    );

    ctx.fillStyle =
      helmetGlow;

    ctx.beginPath();

    ctx.ellipse(
      0,
      -33,
      7,
      5,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    /*
     * BIKE FRAME
     */

    ctx.strokeStyle =
      "rgba(128,229,247,0.8)";

    ctx.lineWidth = 1.8;

    ctx.beginPath();

    ctx.moveTo(
      -13,
      25,
    );

    ctx.lineTo(
      0,
      -11,
    );

    ctx.lineTo(
      13,
      25,
    );

    ctx.stroke();

    /*
     * REAR LIGHT
     */

    ctx.shadowColor =
      "#ff5266";

    ctx.shadowBlur = 18;

    const rearLight =
      ctx.createLinearGradient(
        -10,
        0,
        10,
        0,
      );

    rearLight.addColorStop(
      0,
      "#6b101c",
    );

    rearLight.addColorStop(
      0.5,
      "#ff4057",
    );

    rearLight.addColorStop(
      1,
      "#6b101c",
    );

    ctx.fillStyle =
      rearLight;

    roundedRect(
      ctx,
      -9,
      23,
      18,
      4,
      2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /*
     * INDICATORS
     */

    ctx.fillStyle =
      "#ffb84a";

    ctx.shadowColor =
      "#ffb84a";

    ctx.shadowBlur = 7;

    ctx.fillRect(
      -17,
      20,
      3,
      3,
    );

    ctx.fillRect(
      14,
      20,
      3,
      3,
    );

    ctx.shadowBlur = 0;

    /*
     * FRONT LIGHT
     */

    ctx.fillStyle =
      WHITE;

    ctx.shadowColor =
      WHITE;

    ctx.shadowBlur = 10;

    ctx.beginPath();

    ctx.arc(
      0,
      -42,
      2.5,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /*
     * FRONT FORK
     */

    ctx.strokeStyle =
      "#7898a7";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      -5,
      -8,
    );

    ctx.lineTo(
      -3,
      -39,
    );

    ctx.moveTo(
      5,
      -8,
    );

    ctx.lineTo(
      3,
      -39,
    );

    ctx.stroke();

  } else {
    /*
     * ==========================================================
     * CARS / TRUCK
     * ==========================================================
     */

    const bodyW =
      isTruck
        ? 88
        : 82;

    const bodyTop =
      isTruck
        ? -33
        : -39;

    const bodyBottom =
      isTruck
        ? 42
        : 45;

    const bodyColor =
      vehicle === "sports-car"
        ? "#d64c58"
        : vehicle === "supercar"
          ? "#6268d6"
          : "#397da4";

    /*
     * MAIN BODY
     */

    const bodyGradient =
      ctx.createLinearGradient(
        0,
        bodyTop,
        0,
        bodyBottom,
      );

    bodyGradient.addColorStop(
      0,
      "#b6d9e3",
    );

    bodyGradient.addColorStop(
      0.10,
      bodyColor,
    );

    bodyGradient.addColorStop(
      0.45,
      "#1c3442",
    );

    bodyGradient.addColorStop(
      0.78,
      "#0a141d",
    );

    bodyGradient.addColorStop(
      1,
      "#03070b",
    );

    polygon(ctx, [
      [-bodyW * 0.30, bodyTop],
      [bodyW * 0.30, bodyTop],
      [bodyW * 0.47, -12],
      [bodyW * 0.54, 24],
      [bodyW * 0.46, bodyBottom],
      [-bodyW * 0.46, bodyBottom],
      [-bodyW * 0.54, 24],
      [-bodyW * 0.47, -12],
    ]);

    ctx.fillStyle =
      bodyGradient;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(137,231,247,0.78)";

    ctx.lineWidth = 1.5;

    ctx.stroke();

    /*
     * REAR WINDOW
     */

    polygon(ctx, [
      [-bodyW * 0.28, -31],
      [bodyW * 0.28, -31],
      [bodyW * 0.38, -7],
      [-bodyW * 0.38, -7],
    ]);

    const cabin =
      ctx.createLinearGradient(
        0,
        -32,
        0,
        -6,
      );

    cabin.addColorStop(
      0,
      "#7fb2c0",
    );

    cabin.addColorStop(
      0.18,
      "#284b5b",
    );

    cabin.addColorStop(
      0.7,
      "#091923",
    );

    cabin.addColorStop(
      1,
      "#04090e",
    );

    ctx.fillStyle =
      cabin;

    ctx.fill();

    ctx.strokeStyle =
      "rgba(168,239,250,0.55)";

    ctx.stroke();

    /*
     * WINDOW REFLECTION
     */

    const windowReflection =
      ctx.createLinearGradient(
        -20,
        -29,
        20,
        -9,
      );

    windowReflection.addColorStop(
      0,
      "rgba(212,249,255,0.42)",
    );

    windowReflection.addColorStop(
      0.32,
      "rgba(89,179,204,0.12)",
    );

    windowReflection.addColorStop(
      1,
      "rgba(0,0,0,0)",
    );

    ctx.fillStyle =
      windowReflection;

    polygon(ctx, [
      [-bodyW * 0.23, -28],
      [0, -28],
      [-bodyW * 0.04, -10],
      [-bodyW * 0.31, -10],
    ]);

    ctx.fill();

    /*
     * REAR DECK
     */

    polygon(ctx, [
      [-bodyW * 0.43, 0],
      [bodyW * 0.43, 0],
      [bodyW * 0.49, 23],
      [-bodyW * 0.49, 23],
    ]);

    ctx.fillStyle =
      "rgba(11,24,33,0.72)";

    ctx.fill();

    /*
     * REAR BUMPER
     */

    polygon(ctx, [
      [-bodyW * 0.49, 23],
      [bodyW * 0.49, 23],
      [bodyW * 0.45, 42],
      [-bodyW * 0.45, 42],
    ]);

    ctx.fillStyle =
      "#050b10";

    ctx.fill();

    ctx.strokeStyle =
      "rgba(98,200,220,0.42)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /*
     * FULL REAR LIGHT BAR
     */

    ctx.shadowColor =
      "#ff4055";

    ctx.shadowBlur = 18;

    const tail =
      ctx.createLinearGradient(
        -bodyW * 0.44,
        0,
        bodyW * 0.44,
        0,
      );

    tail.addColorStop(
      0,
      "rgba(255,52,75,0.18)",
    );

    tail.addColorStop(
      0.15,
      "#a82035",
    );

    tail.addColorStop(
      0.5,
      "#ff4b61",
    );

    tail.addColorStop(
      0.85,
      "#a82035",
    );

    tail.addColorStop(
      1,
      "rgba(255,52,75,0.18)",
    );

    ctx.fillStyle =
      tail;

    roundedRect(
      ctx,
      -bodyW * 0.42,
      25,
      bodyW * 0.84,
      5,
      2.5,
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    /*
     * TAILLIGHT BLOCKS
     */

    ctx.fillStyle =
      "#ff5969";

    roundedRect(
      ctx,
      -bodyW * 0.43,
      23,
      bodyW * 0.22,
      7,
      2,
    );

    ctx.fill();

    roundedRect(
      ctx,
      bodyW * 0.21,
      23,
      bodyW * 0.22,
      7,
      2,
    );

    ctx.fill();

    /*
     * REAR DIFFUSER
     */

    polygon(ctx, [
      [-16, 31],
      [16, 31],
      [12, 43],
      [-12, 43],
    ]);

    ctx.fillStyle =
      "#020508";

    ctx.fill();

    /*
     * EXHAUSTS
     */

    if (!isTruck) {
      for (
        const ex of [-12, 12]
      ) {
        ctx.fillStyle =
          "#020304";

        ctx.beginPath();

        ctx.arc(
          ex,
          40,
          4,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.strokeStyle =
          "rgba(111,220,238,0.35)";

        ctx.lineWidth = 1;

        ctx.stroke();
      }
    }

    /*
     * REAR WHEELS
     */

    for (
      const side of [-1, 1]
    ) {
      const wx =
        side *
        bodyW *
        0.48;

      ctx.fillStyle =
        "#010204";

      roundedRect(
        ctx,
        wx - 7,
        12,
        14,
        27,
        4,
      );

      ctx.fill();

      ctx.strokeStyle =
        "#536a76";

      ctx.lineWidth = 1.3;

      ctx.stroke();

      ctx.fillStyle =
        "#182b35";

      ctx.beginPath();

      ctx.ellipse(
        wx,
        27,
        4,
        8,
        0,
        0,
        Math.PI * 2,
      );

      ctx.fill();
    }

    /*
     * SIDE BODY HIGHLIGHTS
     */

    ctx.strokeStyle =
      "rgba(116,225,244,0.34)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      -bodyW * 0.50,
      -8,
    );

    ctx.lineTo(
      -bodyW * 0.56,
      23,
    );

    ctx.lineTo(
      -bodyW * 0.46,
      39,
    );

    ctx.moveTo(
      bodyW * 0.50,
      -8,
    );

    ctx.lineTo(
      bodyW * 0.56,
      23,
    );

    ctx.lineTo(
      bodyW * 0.46,
      39,
    );

    ctx.stroke();

    /*
     * FRONT LIGHTS FAR AHEAD
     */

    ctx.fillStyle =
      "rgba(204,249,255,0.8)";

    ctx.shadowColor =
      WHITE;

    ctx.shadowBlur = 8;

    ctx.beginPath();

    ctx.ellipse(
      -bodyW * 0.20,
      bodyTop + 4,
      4,
      2,
      0,
      0,
      Math.PI * 2,
    );

    ctx.ellipse(
      bodyW * 0.20,
      bodyTop + 4,
      4,
      2,
      0,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  /*
   * ============================================================
   * BOOST EXHAUST
   * ============================================================
   */

  if (
    boost &&
    speed > 10 &&
    !crashed
  ) {
    ctx.save();

    const plume =
      ctx.createLinearGradient(
        0,
        34,
        0,
        105,
      );

    plume.addColorStop(
      0,
      "rgba(208,250,255,0.85)",
    );

    plume.addColorStop(
      0.20,
      "rgba(70,220,255,0.72)",
    );

    plume.addColorStop(
      0.62,
      "rgba(37,157,255,0.24)",
    );

    plume.addColorStop(
      1,
      "rgba(40,150,255,0)",
    );

    ctx.fillStyle =
      plume;

    ctx.beginPath();

    ctx.moveTo(
      -9,
      34,
    );

    ctx.quadraticCurveTo(
      -14,
      63,
      -7,
      98,
    );

    ctx.quadraticCurveTo(
      0,
      108,
      7,
      98,
    );

    ctx.quadraticCurveTo(
      14,
      63,
      9,
      34,
    );

    ctx.closePath();

    ctx.fill();

    const core =
      ctx.createLinearGradient(
        0,
        35,
        0,
        75,
      );

    core.addColorStop(
      0,
      "rgba(255,255,255,0.9)",
    );

    core.addColorStop(
      0.5,
      "rgba(84,236,255,0.7)",
    );

    core.addColorStop(
      1,
      "rgba(84,236,255,0)",
    );

    ctx.fillStyle =
      core;

    ctx.beginPath();

    ctx.ellipse(
      0,
      55,
      5,
      24,
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

    let raf = 0;
    let time = 0;
    let last = 0;

    const resizeCanvas = () => {
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

      /*
       * GRAPHITE SKY
       */

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

      /*
       * DISTANT LIGHT
       */

      const bloom =
        ctx.createRadialGradient(
          cx,
          horizon * 0.76,
          0,
          cx,
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

      /*
       * ATMOSPHERIC PARTICLES
       */

      for (
        let i = 0;
        i < 54;
        i++
      ) {
        const x =
          (i * 173.7 +
            Math.sin(
              time * 0.00025 +
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
            time * 0.0012 +
              i,
          ) +
            1) *
            0.06;

        ctx.fillStyle =
          `rgba(151,229,255,${alpha})`;

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

      /*
       * CITY
       */

      drawCity(
        ctx,
        w,
        horizon,
        time,
        s.bgOffset || 0,
      );

      /*
       * FOG
       */

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

      /*
       * ROAD
       */

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

      /*
       * SIDE LIGHT BARS
       */

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

        ctx.strokeStyle =
          `rgba(67,205,242,${0.08 + p * 0.25})`;

        ctx.lineWidth =
          1 + p * 1.4;

        for (
          const side of [-1, 1]
        ) {
          ctx.beginPath();

          ctx.moveTo(
            cx +
              side *
                (roadHalf + 4),
            y,
          );

          ctx.lineTo(
            cx +
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

      /*
       * ENGINE PARTICLES
       */

      for (
        const p of
          s.particles || []
      ) {
        const life =
          Math.max(
            0,
            Math.min(
              1,
              p.life,
            ),
          );

        const px =
          w * 0.5 +
          (p.x || 0) *
            0.22;

        const py =
          h * 0.78 +
          (p.y || 0) *
            0.28;

        ctx.save();

        ctx.globalAlpha =
          life * 0.7;

        ctx.fillStyle =
          p.color || CYAN;

        ctx.shadowColor =
          p.color || CYAN;

        ctx.shadowBlur =
          p.type === "spark"
            ? 12
            : 5;

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          Math.max(
            1,
            (p.size || 2) *
              0.8,
          ),
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.restore();
      }

      /*
       * VEHICLE
       *
       * CENTER OF ROAD
       * NEAR PLAYER
       */

      const vehicleX =
        w * 0.5 +
        Math.sin(
          time * 0.00065,
        ) *
          Math.min(
            7,
            speed * 0.02,
          );

      const vehicleY =
        h * 0.82 +
        Math.sin(
          time * 0.006,
        ) *
          Math.min(
            2,
            speed / 70,
          );

      ctx.save();

      if (s.shake > 0) {
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

      /*
       * VIGNETTE
       */

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

      /*
       * FRAME
       */

      ctx.strokeStyle =
        "rgba(122,225,246,0.08)";

      ctx.lineWidth = 1;

      ctx.strokeRect(
        10.5,
        10.5,
        w - 21,
        h - 21,
      );

      /*
       * TELEMETRY
       */

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

      /*
       * PAUSE / GAME OVER
       */

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

        const panelH = 118;

        const px =
          (w - panelW) /
          2;

        const py =
          h * 0.39;

        ctx.save();

        ctx.shadowColor =
          "rgba(67,211,245,0.2)";

        ctx.shadowBlur = 28;

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
