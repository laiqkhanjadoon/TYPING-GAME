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
// VEHICLE
// ============================================================

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleType,
  x: number,
  y: number,
  speed: number,
  boost: boolean,
  time: number,
  crashed: boolean
) {
  ctx.save();

  ctx.translate(
    x,
    y
  );

  // Crash flip animation
  if (crashed) {
    const flip =
      Math.min(
        1,
        time * 0.025
      );

    ctx.rotate(
      flip *
        Math.PI *
        2
    );

    ctx.scale(
      1 -
        flip * 0.2,
      1 -
        flip * 0.2
    );
  }

  // Tiny suspension only
  const suspension =
    Math.sin(
      time *
        0.08
    ) *
    Math.min(
      2,
      speed / 100
    );

  ctx.translate(
    0,
    suspension
  );

  const isBike =
    vehicle === "bike";

  const isTruck =
    vehicle === "truck";

  const bodyWidth =
    isBike
      ? 65
      : isTruck
      ? 100
      : 95;

  const bodyHeight =
    isBike
      ? 40
      : 45;

  // Shadow
  ctx.save();

  ctx.globalAlpha =
    crashed
      ? 0.2
      : 0.5;

  ctx.fillStyle =
    "#000";

  ctx.beginPath();

  ctx.ellipse(
    0,
    30,
    bodyWidth *
      0.6,
    7,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();

  // ==========================================================
  // BOOST EXHAUST
  // ==========================================================

  if (
    boost &&
    speed > 20 &&
    !crashed
  ) {
    const exhaust =
      ctx.createRadialGradient(
        -bodyWidth / 2,
        5,
        2,
        -bodyWidth / 2,
        5,
        50
      );

    exhaust.addColorStop(
      0,
      "rgba(255,255,100,1)"
    );

    exhaust.addColorStop(
      0.25,
      "rgba(255,130,0,0.9)"
    );

    exhaust.addColorStop(
      0.6,
      "rgba(255,40,0,0.4)"
    );

    exhaust.addColorStop(
      1,
      "rgba(255,0,0,0)"
    );

    ctx.fillStyle =
      exhaust;

    ctx.beginPath();

    ctx.ellipse(
      -bodyWidth / 2,
      5,
      50,
      16,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // ==========================================================
  // BIKE
  // ==========================================================

  if (isBike) {
    const wheelSpin =
      time *
      Math.max(
        0.3,
        speed * 0.04
      );

    const drawWheel = (
      wx: number,
      radius: number
    ) => {
      ctx.save();

      ctx.translate(
        wx,
        18
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

      for (
        let i = 0;
        i < 6;
        i++
      ) {
        const angle =
          (i *
            Math.PI) /
          3;

        ctx.beginPath();

        ctx.moveTo(
          0,
          0
        );

        ctx.lineTo(
          Math.cos(
            angle
          ) *
            radius *
            0.8,
          Math.sin(
            angle
          ) *
            radius *
            0.8
        );

        ctx.strokeStyle =
          "#888";

        ctx.lineWidth = 1;

        ctx.stroke();
      }

      ctx.restore();
    };

    drawWheel(
      -28,
      15
    );

    drawWheel(
      28,
      14
    );

    // Frame
    ctx.beginPath();

    ctx.moveTo(
      -28,
      18
    );

    ctx.lineTo(
      -15,
      3
    );

    ctx.lineTo(
      8,
      0
    );

    ctx.lineTo(
      28,
      10
    );

    ctx.lineTo(
      28,
      18
    );

    ctx.strokeStyle =
      boost
        ? "#ff6600"
        : "#dd3300";

    ctx.lineWidth = 5;

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
      15
    );

    // Tank
    ctx.beginPath();

    ctx.roundRect(
      -8,
      -6,
      22,
      11,
      4
    );

    ctx.fillStyle =
      boost
        ? "#ff5500"
        : "#dd3300";

    ctx.fill();

    // Rider
    ctx.beginPath();

    ctx.roundRect(
      -12,
      -22,
      15,
      18,
      4
    );

    ctx.fillStyle =
      "#cc3300";

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
        ? "#ff9900"
        : "#00ffff";

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
      13,
      -4
    );

    ctx.lineTo(
      23,
      -8
    );

    ctx.strokeStyle =
      "#aaa";

    ctx.lineWidth = 3;

    ctx.stroke();
  }

  // ==========================================================
  // CAR / SUPER CAR / TRUCK
  // ==========================================================

  else {
    const wheelSpin =
      time *
      Math.max(
        0.3,
        speed * 0.04
      );

    // Body
    ctx.beginPath();

    if (isTruck) {
      ctx.roundRect(
        -50,
        -12,
        100,
        38,
        6
      );
    } else {
      ctx.moveTo(
        -50,
        20
      );

      ctx.lineTo(
        -42,
        -3
      );

      ctx.lineTo(
        -20,
        -20
      );

      ctx.lineTo(
        20,
        -20
      );

      ctx.lineTo(
        42,
        -3
      );

      ctx.lineTo(
        50,
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
          ? "#ff7650"
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
    ctx.beginPath();

    if (!isTruck) {
      ctx.moveTo(
        -23,
        -5
      );

      ctx.lineTo(
        -10,
        -14
      );

      ctx.lineTo(
        9,
        -14
      );

      ctx.lineTo(
        24,
        -4
      );

      ctx.closePath();
    } else {
      ctx.rect(
        10,
        -5,
        25,
        14
      );
    }

    ctx.fillStyle =
      "#07101c";

    ctx.fill();

    ctx.strokeStyle =
      "rgba(0,255,255,0.7)";

    ctx.stroke();

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
        "#777";

      ctx.lineWidth = 2;

      ctx.stroke();

      for (
        let i = 0;
        i < 6;
        i++
      ) {
        const angle =
          (i *
            Math.PI) /
          3;

        ctx.beginPath();

        ctx.moveTo(
          0,
          0
        );

        ctx.lineTo(
          Math.cos(
            angle
          ) * 10,
          Math.sin(
            angle
          ) * 10
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
      40,
      5,
      8,
      6
    );

    // Tail light
    ctx.fillStyle =
      "#ff2222";

    ctx.fillRect(
      -48,
      5,
      8,
      6
    );
  }

  // ==========================================================
  // CRASH EFFECT
  // ==========================================================

  if (crashed) {
    ctx.save();

    ctx.shadowColor =
      "#ff3300";

    ctx.shadowBlur = 25;

    ctx.fillStyle =
      "#ff6600";

    for (
      let i = 0;
      i < 10;
      i++
    ) {
      const angle =
        (i * Math.PI * 2) /
        10;

      const distance =
        20 +
        Math.sin(
          time * 0.1 + i
        ) *
          15;

      ctx.beginPath();

      ctx.arc(
        Math.cos(angle) *
          distance,
        Math.sin(angle) *
          distance,
        3 +
          Math.random() *
            4,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
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
        bikeY,
        shake,
        gameOver,
      } = state;

      const W = width;
      const H = height;

      // Vehicle stays in same driving area.
      const vehicleX =
        W * 0.23;

      const vehicleY =
        H * 0.72 +
        bikeY;

      const shakeX =
        shake > 0
          ? (Math.random() -
              0.5) *
            shake
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

      // ========================================================
      // SKY
      // ========================================================

      const colors =
        level < 3
          ? [
              "#080014",
              "#19002e",
              "#300052",
            ]
          : level < 7
          ? [
              "#000c1c",
              "#001633",
              "#00276e",
            ]
          : [
              "#001a0d",
              "#002611",
              "#003318",
            ];

      const sky =
        ctx.createLinearGradient(
          0,
          0,
          0,
          H * 0.65
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

      // ========================================================
      // STARS
      // ========================================================

      for (
        let i = 0;
        i < 70;
        i++
      ) {
        const x =
          ((i * 137.5 +
            bgOffset * 0.05) %
            W +
            W) %
          W;

        const y =
          (i * 73.3) %
          (H * 0.5);

        ctx.globalAlpha =
          0.3 +
          Math.sin(
            t * 0.04 + i
          ) *
            0.25;

        ctx.fillStyle =
          "#fff";

        ctx.fillRect(
          x,
          y,
          2,
          2
        );
      }

      ctx.globalAlpha = 1;

      // ========================================================
      // CITY
      // ========================================================

      const buildings = [
        80, 130, 60, 100,
        150, 70, 110, 90,
        140, 60, 120, 85,
      ];

      let bx =
        -(
          (bgOffset * 0.35) %
          80
        );

      for (
        let i = 0;
        i < 30;
        i++
      ) {
        const bh =
          buildings[
            i %
              buildings.length
          ];

        const bw =
          25 +
          (i % 5) * 8;

        const by =
          H * 0.65 -
          bh;

        ctx.fillStyle =
          "#09051c";

        ctx.fillRect(
          bx,
          by,
          bw,
          bh
        );

        ctx.fillStyle =
          "rgba(255,220,100,0.55)";

        for (
          let wy =
            by + 10;
          wy <
          H * 0.65 - 10;
          wy += 14
        ) {
          if (
            Math.sin(
              i * 10 +
                wy +
                t * 0.01
            ) > 0
          ) {
            ctx.fillRect(
              bx + 5,
              wy,
              4,
              6
            );
          }
        }

        bx +=
          bw + 7;
      }

      // ========================================================
      // ROAD
      // ========================================================

      const roadTop =
        H * 0.65;

      const road =
        ctx.createLinearGradient(
          0,
          roadTop,
          0,
          H
        );

      road.addColorStop(
        0,
        "#1a1a2e"
      );

      road.addColorStop(
        0.5,
        "#16213e"
      );

      road.addColorStop(
        1,
        "#081c3a"
      );

      ctx.fillStyle =
        road;

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

      // ========================================================
      // ROAD MARKINGS — SPEED DEPENDENT
      // ========================================================

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

      const laneY =
        roadTop +
        (H - roadTop) *
          0.2;

      ctx.beginPath();

      ctx.moveTo(
        0,
        laneY
      );

      ctx.lineTo(
        W,
        laneY
      );

      ctx.stroke();

      ctx.restore();

      // Yellow center
      ctx.save();

      ctx.setLineDash([
        55,
        45,
      ]);

      ctx.lineDashOffset =
        -roadOffset * 1.5;

      ctx.strokeStyle =
        "rgba(255,255,0,0.75)";

      ctx.shadowColor =
        "#ffff00";

      ctx.shadowBlur = 8;

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

      // ========================================================
      // SPEED LINES
      // ========================================================

      if (
        bikeSpeed > 30
      ) {
        ctx.save();

        ctx.globalAlpha =
          Math.min(
            0.7,
            bikeSpeed / 300
          );

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
              roadOffset * 2) %
              (H -
                roadTop));

          const x =
            ((seed * 3 +
              roadOffset * 4) %
              (W + 300)) -
            100;

          const len =
            15 +
            bikeSpeed *
              0.12;

          ctx.beginPath();

          ctx.moveTo(
            x,
            y
          );

          ctx.lineTo(
            x - len,
            y
          );

          ctx.stroke();
        }

        ctx.restore();
      }

      // ========================================================
      // PARTICLES
      // ========================================================

      for (
        const p of particles
      ) {
        ctx.save();

        ctx.globalAlpha =
          p.life;

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

        ctx.restore();
      }

      // ========================================================
      // VEHICLE
      // ========================================================

      drawVehicle(
        ctx,
        vehicle,
        vehicleX,
        vehicleY,
        bikeSpeed,
        boostActive,
        t,
        gameOver
      );

      // ========================================================
      // FLOATING TEXT
      // ========================================================

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

      // ========================================================
      // BOOST SCREEN
      // ========================================================

      if (
        boostActive &&
        !gameOver
      ) {
        ctx.save();

        ctx.globalAlpha =
          0.04 +
          Math.sin(
            t * 0.3
          ) *
            0.02;

        const gradient =
          ctx.createLinearGradient(
            0,
            0,
            W,
            0
          );

        gradient.addColorStop(
          0,
          "#ff6600"
        );

        gradient.addColorStop(
          0.5,
          "transparent"
        );

        gradient.addColorStop(
          1,
          "#ff6600"
        );

        ctx.fillStyle =
          gradient;

        ctx.fillRect(
          0,
          0,
          W,
          H
        );

        ctx.restore();
      }

      // ========================================================
      // VIGNETTE
      // ========================================================

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

    return () =>
      cancelAnimationFrame(
        animationId
      );
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
