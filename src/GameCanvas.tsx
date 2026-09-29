import {
  useEffect,
  useRef,
  useCallback,
} from "react";

import type {
  GameEngineState,
} from "./useGameEngine";

import type {
  VehicleType,
} from "./gameTypes";

interface Props {
  state: GameEngineState;
  width: number;
  height: number;
}

// ============================================================
// BIKE
// ============================================================

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

  const wheelSpin =
    time * speed * 0.3;

  const lean =
    Math.min(
      speed * 1.5,
      12
    );

  ctx.rotate(
    (lean * Math.PI) / 180
  );

  // Boost exhaust
  if (boost) {
    const grd =
      ctx.createRadialGradient(
        -45,
        10,
        2,
        -45,
        10,
        35
      );

    grd.addColorStop(
      0,
      "rgba(255,150,0,1)"
    );

    grd.addColorStop(
      0.5,
      "rgba(255,60,0,0.6)"
    );

    grd.addColorStop(
      1,
      "rgba(255,0,0,0)"
    );

    ctx.fillStyle = grd;

    ctx.beginPath();

    ctx.ellipse(
      -45,
      10,
      35,
      14,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Shadow
  ctx.fillStyle =
    "rgba(0,0,0,0.4)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    30,
    38,
    7,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Wheels
  const drawWheel = (
    wx: number,
    radius: number
  ) => {
    ctx.save();

    ctx.translate(
      wx,
      20
    );

    ctx.rotate(
      wheelSpin
    );

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#111";

    ctx.fill();

    ctx.strokeStyle =
      "#555";

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      radius * 0.3,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#777";

    ctx.fill();

    ctx.strokeStyle =
      "#aaa";

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i < 6;
      i++
    ) {
      const angle =
        (i * Math.PI) / 3;

      ctx.beginPath();

      ctx.moveTo(
        0,
        0
      );

      ctx.lineTo(
        Math.cos(angle) *
          radius *
          0.8,
        Math.sin(angle) *
          radius *
          0.8
      );

      ctx.stroke();
    }

    ctx.restore();
  };

  drawWheel(
    -30,
    16
  );

  drawWheel(
    28,
    14
  );

  // Frame
  ctx.beginPath();

  ctx.moveTo(-30, 20);
  ctx.lineTo(-15, 5);
  ctx.lineTo(5, 0);
  ctx.lineTo(28, 10);
  ctx.lineTo(28, 20);

  ctx.strokeStyle =
    boost
      ? "#ff6600"
      : "#cc3300";

  ctx.lineWidth = 4;

  ctx.stroke();

  // Engine
  ctx.fillStyle =
    boost
      ? "#ff4400"
      : "#bb2200";

  ctx.fillRect(
    -20,
    4,
    25,
    16
  );

  // Tank
  ctx.beginPath();

  ctx.roundRect(
    -8,
    -6,
    22,
    10,
    4
  );

  ctx.fillStyle =
    boost
      ? "#ff5500"
      : "#dd3300";

  ctx.fill();

  // Seat
  ctx.beginPath();

  ctx.roundRect(
    -22,
    -5,
    18,
    7,
    3
  );

  ctx.fillStyle =
    "#222";

  ctx.fill();

  // Rider
  ctx.beginPath();

  ctx.roundRect(
    -12,
    -22,
    14,
    18,
    4
  );

  ctx.fillStyle =
    boost
      ? "#ff4400"
      : "#cc3300";

  ctx.fill();

  // Helmet
  ctx.beginPath();

  ctx.arc(
    4,
    -22,
    10,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#111";

  ctx.fill();

  // Visor
  ctx.strokeStyle =
    boost
      ? "#ff8800"
      : "#00ccff";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.arc(
    4,
    -20,
    7,
    -0.4,
    0.4
  );

  ctx.stroke();

  // Handle
  ctx.beginPath();

  ctx.moveTo(
    14,
    -4
  );

  ctx.lineTo(
    22,
    -8
  );

  ctx.strokeStyle =
    "#aaa";

  ctx.lineWidth = 3;

  ctx.stroke();

  // Fork
  ctx.beginPath();

  ctx.moveTo(
    22,
    -2
  );

  ctx.lineTo(
    28,
    10
  );

  ctx.strokeStyle =
    "#aaa";

  ctx.stroke();

  // Headlight
  if (
    speed > 2 ||
    boost
  ) {
    const light =
      ctx.createRadialGradient(
        40,
        -2,
        1,
        50,
        -2,
        25
      );

    light.addColorStop(
      0,
      "rgba(255,255,180,1)"
    );

    light.addColorStop(
      1,
      "rgba(255,255,180,0)"
    );

    ctx.fillStyle =
      light;

    ctx.beginPath();

    ctx.ellipse(
      50,
      -2,
      25,
      12,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.restore();
}

// ============================================================
// CAR
// ============================================================

function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  speed: number,
  boost: boolean,
  time: number,
  vehicle: VehicleType
) {
  ctx.save();

  ctx.translate(
    x,
    y
  );

  const wheelSpin =
    time * speed * 0.25;

  let scale = 1;

  if (
    vehicle === "truck"
  ) {
    scale = 1.15;
  }

  ctx.scale(
    scale,
    scale
  );

  // Shadow
  ctx.fillStyle =
    "rgba(0,0,0,0.45)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    30,
    52,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Exhaust
  if (boost) {
    const exhaust =
      ctx.createRadialGradient(
        -55,
        10,
        2,
        -55,
        10,
        40
      );

    exhaust.addColorStop(
      0,
      "rgba(255,170,0,1)"
    );

    exhaust.addColorStop(
      0.5,
      "rgba(255,60,0,0.6)"
    );

    exhaust.addColorStop(
      1,
      "rgba(255,0,0,0)"
    );

    ctx.fillStyle =
      exhaust;

    ctx.beginPath();

    ctx.ellipse(
      -55,
      10,
      40,
      15,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Body
  ctx.beginPath();

  if (
    vehicle === "truck"
  ) {
    ctx.roundRect(
      -50,
      -8,
      90,
      35,
      6
    );
  } else {
    ctx.moveTo(
      -48,
      20
    );

    ctx.lineTo(
      -38,
      -3
    );

    ctx.lineTo(
      -17,
      -18
    );

    ctx.lineTo(
      18,
      -18
    );

    ctx.lineTo(
      42,
      -2
    );

    ctx.lineTo(
      48,
      20
    );

    ctx.closePath();
  }

  if (
    vehicle ===
    "sports-car"
  ) {
    ctx.fillStyle =
      boost
        ? "#ff7849"
        : "#ef4444";
  } else if (
    vehicle ===
    "supercar"
  ) {
    ctx.fillStyle =
      boost
        ? "#c084fc"
        : "#7c3aed";
  } else {
    ctx.fillStyle =
      boost
        ? "#60a5fa"
        : "#2563eb";
  }

  ctx.fill();

  ctx.strokeStyle =
    "#00ffff";

  ctx.lineWidth = 2;

  ctx.stroke();

  // Windows
  if (
    vehicle !==
    "truck"
  ) {
    ctx.beginPath();

    ctx.moveTo(
      -22,
      -5
    );

    ctx.lineTo(
      -10,
      -13
    );

    ctx.lineTo(
      8,
      -13
    );

    ctx.lineTo(
      23,
      -4
    );

    ctx.closePath();

    ctx.fillStyle =
      "#07101c";

    ctx.fill();

    ctx.strokeStyle =
      "rgba(0,255,255,0.7)";

    ctx.stroke();
  } else {
    ctx.fillStyle =
      "#07101c";

    ctx.fillRect(
      10,
      -3,
      20,
      13
    );
  }

  // Wheels
  const wheel = (
    wx: number
  ) => {
    ctx.save();

    ctx.translate(
      wx,
      20
    );

    ctx.rotate(
      wheelSpin
    );

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      14,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#111";

    ctx.fill();

    ctx.strokeStyle =
      "#555";

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      5,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#888";

    ctx.fill();

    for (
      let i = 0;
      i < 6;
      i++
    ) {
      const angle =
        (i * Math.PI) / 3;

      ctx.beginPath();

      ctx.moveTo(
        0,
        0
      );

      ctx.lineTo(
        Math.cos(angle) *
          11,
        Math.sin(angle) *
          11
      );

      ctx.strokeStyle =
        "#aaa";

      ctx.lineWidth = 1;

      ctx.stroke();
    }

    ctx.restore();
  };

  wheel(-32);
  wheel(32);

  // Headlights
  ctx.fillStyle =
    "#ffffaa";

  ctx.fillRect(
    38,
    6,
    7,
    5
  );

  // Headlight beam
  if (
    speed > 2 ||
    boost
  ) {
    const light =
      ctx.createRadialGradient(
        48,
        8,
        1,
        70,
        8,
        30
      );

    light.addColorStop(
      0,
      "rgba(255,255,180,0.9)"
    );

    light.addColorStop(
      1,
      "rgba(255,255,180,0)"
    );

    ctx.fillStyle =
      light;

    ctx.beginPath();

    ctx.ellipse(
      65,
      8,
      30,
      14,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Tail light
  ctx.fillStyle =
    "#ff2222";

  ctx.fillRect(
    -48,
    6,
    7,
    5
  );

  ctx.restore();
}

// ============================================================
// VEHICLE
// ============================================================

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleType,
  x: number,
  y: number,
  speed: number,
  boost: boolean,
  time: number
) {
  if (
    vehicle === "bike"
  ) {
    drawBike(
      ctx,
      x,
      y,
      speed,
      boost,
      time
    );

    return;
  }

  drawCar(
    ctx,
    x,
    y,
    speed,
    boost,
    time,
    vehicle
  );
}

// ============================================================
// GAME CANVAS
// ============================================================

export default function GameCanvas({
  state,
  width,
  height,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement>(
      null
    );

  const timeRef =
    useRef(0);

  const draw =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const ctx =
        canvas.getContext(
          "2d"
        );

      if (!ctx) return;

      timeRef.current += 1;

      const t =
        timeRef.current;

      const {
        bikeSpeed,
        roadOffset,
        bgOffset,
        particles,
        floatingTexts,
        boostActive,
        level,
        vehicle,
        bikeX,
        bikeY,
        shake,
      } = state;

      const W = width;
      const H = height;

      // ======================================================
      // VEHICLE SCREEN POSITION
      // ======================================================

      // Keep vehicle moving visibly across screen
      const movementRange =
        Math.max(
          120,
          W * 0.18
        );

      const baseVehicleX =
        W * 0.22;

      const vehicleX =
        baseVehicleX +
        Math.sin(
          t *
            0.025 *
            Math.max(
              1,
              bikeSpeed
            )
        ) *
          movementRange;

      const vehicleY =
        H * 0.72 +
        Math.sin(
          t * 0.12
        ) *
          Math.min(
            6,
            bikeSpeed
          ) +
        bikeY;

      const shakeX =
        shake > 0
          ? (Math.random() -
              0.5) *
            shake *
            2
          : 0;

      const shakeY =
        shake > 0
          ? (Math.random() -
              0.5) *
            shake
          : 0;

      ctx.save();

      ctx.translate(
        shakeX,
        shakeY
      );

      // ======================================================
      // SKY
      // ======================================================

      const skyColors = [
        [
          "#080014",
          "#19002e",
          "#300052",
        ],
        [
          "#0d001a",
          "#21003b",
          "#390066",
        ],
        [
          "#000c1c",
          "#001633",
          "#00276e",
        ],
        [
          "#001a0d",
          "#002611",
          "#003318",
        ],
      ];

      const colorIndex =
        Math.min(
          Math.floor(
            (level - 1) / 2
          ),
          3
        );

      const colors =
        skyColors[
          colorIndex
        ];

      const sky =
        ctx.createLinearGradient(
          0,
          0,
          0,
          H * 0.7
        );

      sky.addColorStop(
        0,
        colors[0]
      );

      sky.addColorStop(
        0.5,
        colors[1]
      );

      sky.addColorStop(
        1,
        colors[2]
      );

      ctx.fillStyle =
        sky;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );

      // ======================================================
      // STARS
      // ======================================================

      for (
        let i = 0;
        i < 70;
        i++
      ) {
        const sx =
          ((i * 137.5 +
            bgOffset * 0.08) %
            W +
            W) %
          W;

        const sy =
          (i * 73.3) %
          (H * 0.5);

        const size =
          0.5 +
          (i % 3) *
            0.5;

        const alpha =
          0.4 +
          Math.sin(
            t * 0.05 + i
          ) *
            0.3;

        ctx.globalAlpha =
          alpha;

        ctx.fillStyle =
          "#ffffff";

        ctx.fillRect(
          sx,
          sy,
          size,
          size
        );
      }

      ctx.globalAlpha = 1;

      // ======================================================
      // CITY
      // ======================================================

      const buildingHeights = [
        80,
        130,
        60,
        100,
        150,
        70,
        110,
        90,
        140,
        60,
        120,
        85,
      ];

      const buildingWidths = [
        40,
        30,
        50,
        35,
        25,
        45,
        30,
        55,
        28,
        48,
        32,
        42,
      ];

      let bx =
        -(
          (bgOffset * 0.5) %
          80
        );

      for (
        let i = 0;
        i < 30;
        i++
      ) {
        const index =
          i %
          buildingHeights.length;

        const bh =
          buildingHeights[
            index
          ];

        const bw =
          buildingWidths[
            index
          ];

        const by =
          H * 0.65 -
          bh;

        ctx.fillStyle =
          "rgba(8,4,25,0.98)";

        ctx.fillRect(
          bx,
          by,
          bw - 2,
          bh
        );

        ctx.fillStyle =
          "rgba(255,220,100,0.6)";

        for (
          let wy =
            by + 8;
          wy <
          H * 0.65 - 10;
          wy += 12
        ) {
          for (
            let wx =
              bx + 5;
            wx <
            bx + bw - 8;
            wx += 10
          ) {
            if (
              Math.sin(
                wx * 3.7 +
                  wy * 2.3 +
                  t * 0.01
              ) > 0.2
            ) {
              ctx.fillRect(
                wx,
                wy,
                4,
                6
              );
            }
          }
        }

        bx +=
          bw + 4;
      }

      // ======================================================
      // ROAD
      // ======================================================

      const roadTop =
        H * 0.65;

      const roadGradient =
        ctx.createLinearGradient(
          0,
          roadTop,
          0,
          H
        );

      roadGradient.addColorStop(
        0,
        "#1a1a2e"
      );

      roadGradient.addColorStop(
        0.5,
        "#16213e"
      );

      roadGradient.addColorStop(
        1,
        "#0a2345"
      );

      ctx.fillStyle =
        roadGradient;

      ctx.fillRect(
        0,
        roadTop,
        W,
        H - roadTop
      );

      // Road edge
      ctx.save();

      ctx.shadowColor =
        "#00ffff";

      ctx.shadowBlur = 10;

      ctx.strokeStyle =
        "#00ffff";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(
        0,
        roadTop
      );

      ctx.lineTo(
        W,
        roadTop
      );

      ctx.stroke();

      ctx.restore();

      // ======================================================
      // MOVING ROAD MARKINGS
      // ======================================================

      ctx.save();

      ctx.setLineDash([
        45,
        45,
      ]);

      ctx.lineDashOffset =
        -roadOffset;

      ctx.strokeStyle =
        "rgba(255,255,255,0.22)";

      ctx.lineWidth = 3;

      const lane1 =
        roadTop +
        (H - roadTop) *
          0.2;

      const lane2 =
        roadTop +
        (H - roadTop) *
          0.65;

      ctx.beginPath();

      ctx.moveTo(
        0,
        lane1
      );

      ctx.lineTo(
        W,
        lane1
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        0,
        lane2
      );

      ctx.lineTo(
        W,
        lane2
      );

      ctx.stroke();

      ctx.restore();

      // Yellow center
      ctx.save();

      ctx.setLineDash([
        50,
        45,
      ]);

      ctx.lineDashOffset =
        -roadOffset * 1.4;

      ctx.strokeStyle =
        "rgba(255,255,0,0.75)";

      ctx.shadowColor =
        "#ffff00";

      ctx.shadowBlur = 7;

      ctx.lineWidth = 4;

      ctx.beginPath();

      ctx.moveTo(
        0,
        roadTop +
          (H - roadTop) *
            0.42
      );

      ctx.lineTo(
        W,
        roadTop +
          (H - roadTop) *
            0.42
      );

      ctx.stroke();

      ctx.restore();

      // ======================================================
      // SPEED LINES
      // ======================================================

      if (
        bikeSpeed > 4
      ) {
        ctx.save();

        const intensity =
          Math.min(
            0.6,
            (bikeSpeed - 4) /
              15
          );

        ctx.globalAlpha =
          intensity;

        ctx.strokeStyle =
          boostActive
            ? "#ff6600"
            : "#00ccff";

        ctx.lineWidth = 2;

        for (
          let i = 0;
          i < 35;
          i++
        ) {
          const seed =
            i * 7919;

          const y =
            roadTop +
            ((seed +
              t *
                bikeSpeed *
                2) %
              (H -
                roadTop));

          const x =
            ((seed * 3 +
              t *
                bikeSpeed *
                4) %
              (W + 200)) -
            100;

          const length =
            20 +
            bikeSpeed * 4;

          ctx.beginPath();

          ctx.moveTo(
            x,
            y
          );

          ctx.lineTo(
            x - length,
            y
          );

          ctx.stroke();
        }

        ctx.restore();
      }

      // ======================================================
      // PARTICLES
      // ======================================================

      for (
        const p of particles
      ) {
        ctx.save();

        ctx.globalAlpha =
          Math.max(
            0,
            p.life
          );

        if (
          p.type ===
          "smoke"
        ) {
          const smoke =
            ctx.createRadialGradient(
              p.x,
              p.y,
              0,
              p.x,
              p.y,
              p.size
            );

          smoke.addColorStop(
            0,
            p.color
          );

          smoke.addColorStop(
            1,
            "transparent"
          );

          ctx.fillStyle =
            smoke;

          ctx.beginPath();

          ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
          );

          ctx.fill();
        } else {
          ctx.shadowColor =
            p.color;

          ctx.shadowBlur = 8;

          ctx.fillStyle =
            p.color;

          ctx.beginPath();

          ctx.arc(
            p.x,
            p.y,
            Math.max(
              1,
              p.size *
                p.life
            ),
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        ctx.restore();
      }

      // ======================================================
      // VEHICLE
      // ======================================================

      drawVehicle(
        ctx,
        vehicle,
        vehicleX,
        vehicleY,
        bikeSpeed,
        boostActive,
        t
      );

      // ======================================================
      // FLOATING TEXT
      // ======================================================

      for (
        const ft of floatingTexts
      ) {
        ctx.save();

        ctx.globalAlpha =
          ft.life;

        ctx.font =
          "bold 18px Orbitron, monospace";

        ctx.textAlign =
          "center";

        ctx.fillStyle =
          ft.color;

        ctx.shadowColor =
          ft.color;

        ctx.shadowBlur = 15;

        ctx.fillText(
          ft.text,
          vehicleX,
          vehicleY - 65
        );

        ctx.restore();
      }

      // ======================================================
      // BOOST SCREEN EFFECT
      // ======================================================

      if (
        boostActive
      ) {
        const pulse =
          0.04 +
          Math.sin(
            t * 0.3
          ) *
            0.025;

        ctx.save();

        ctx.globalAlpha =
          pulse;

        const boostGradient =
          ctx.createLinearGradient(
            0,
            0,
            W,
            0
          );

        boostGradient.addColorStop(
          0,
          "#ff6600"
        );

        boostGradient.addColorStop(
          0.5,
          "transparent"
        );

        boostGradient.addColorStop(
          1,
          "#ff6600"
        );

        ctx.fillStyle =
          boostGradient;

        ctx.fillRect(
          0,
          0,
          W,
          H
        );

        ctx.restore();
      }

      // ======================================================
      // VIGNETTE
      // ======================================================

      const vignette =
        ctx.createRadialGradient(
          W / 2,
          H / 2,
          H * 0.25,
          W / 2,
          H / 2,
          H * 0.85
        );

      vignette.addColorStop(
        0,
        "transparent"
      );

      vignette.addColorStop(
        1,
        "rgba(0,0,10,0.45)"
      );

      ctx.fillStyle =
        vignette;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );

      ctx.restore();
    }, [
      state,
      width,
      height,
    ]);

  useEffect(() => {
    let animationId: number;

    const loop = () => {
      draw();

      animationId =
        requestAnimationFrame(
          loop
        );
    };

    animationId =
      requestAnimationFrame(
        loop
      );

    return () => {
      cancelAnimationFrame(
        animationId
      );
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block w-full h-full"
    />
  );
}
