import React, { useEffect, useRef, useState } from "react";
import { HighScoreEntry } from "./useHighScores";
import {
  DEFAULT_GAME_SETTINGS,
  DIFFICULTY_SETTINGS,
  VEHICLE_SETTINGS,
  GameSettings,
  Difficulty,
  TypingMode,
  VehicleType,
} from "./gameTypes";

interface Props {
  onStart: (settings: GameSettings) => void;
  highScores: HighScoreEntry[];
  onClearScores: () => void;
}

const VEHICLES: VehicleType[] = [
  "bike",
  "sports-car",
  "supercar",
  "truck",
];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const VEHICLE_COLORS: Record<
  VehicleType,
  { primary: string; glow: string; accent: string }
> = {
  bike: {
    primary: "#a8d9ff",
    glow: "rgba(70,170,255,.28)",
    accent: "#72c5ff",
  },
  "sports-car": {
    primary: "#ff555f",
    glow: "rgba(255,45,60,.24)",
    accent: "#ff4654",
  },
  supercar: {
    primary: "#d9e8f5",
    glow: "rgba(170,210,255,.2)",
    accent: "#b8dcff",
  },
  truck: {
    primary: "#d2ad6d",
    glow: "rgba(210,165,80,.2)",
    accent: "#d7b873",
  },
};

function getVehicleDescription(vehicle: VehicleType) {
  switch (vehicle) {
    case "bike":
      return "AGILE / LIGHTWEIGHT";
    case "sports-car":
      return "BALANCED / FAST";
    case "supercar":
      return "EXTREME / PRECISION";
    case "truck":
      return "HEAVY / STABLE";
  }
}

function getVehicleStats(vehicle: VehicleType) {
  switch (vehicle) {
    case "bike":
      return { speed: 92, handling: 96, acceleration: 94, braking: 84 };
    case "sports-car":
      return { speed: 95, handling: 90, acceleration: 92, braking: 91 };
    case "supercar":
      return { speed: 100, handling: 86, acceleration: 99, braking: 95 };
    case "truck":
      return { speed: 70, handling: 72, acceleration: 65, braking: 88 };
  }
}

function VehicleVisual({
  vehicle,
  large = false,
}: {
  vehicle: VehicleType;
  large?: boolean;
}) {
  const color = VEHICLE_COLORS[vehicle];

  if (vehicle === "bike") {
    return (
      <div
        className={`machine machineBike ${large ? "machineLarge" : ""}`}
        style={
          {
            "--machine-color": color.primary,
            "--machine-glow": color.glow,
            "--machine-accent": color.accent,
          } as React.CSSProperties
        }
      >
        <div className="machineShadow" />

        <div className="bikeWheel bikeWheelBack" />
        <div className="bikeWheel bikeWheelFront" />

        <div className="bikeFrame" />
        <div className="bikeTank" />
        <div className="bikeSeat" />
        <div className="bikeFork" />
        <div className="bikeHandle" />

        <div className="bikeEngine">
          <span />
          <span />
          <span />
        </div>

        <div className="bikeHeadlight" />
        <div className="bikeTailLight" />
      </div>
    );
  }

  return (
    <div
      className={`machine machineCar ${
        large ? "machineLarge" : ""
      } ${vehicle === "truck" ? "machineTruck" : ""}`}
      style={
        {
          "--machine-color": color.primary,
          "--machine-glow": color.glow,
          "--machine-accent": color.accent,
        } as React.CSSProperties
      }
    >
      <div className="machineShadow" />

      <div className="carWheel carWheelBack" />
      <div className="carWheel carWheelFront" />

      <div className="carMainBody">
        <div className="carUpperBody" />

        <div className="carGlass">
          <div />
          <div />
        </div>

        <div className="carSideLine" />

        <div className="carLight carLightLeft" />
        <div className="carLight carLightRight" />

        <div className="carGrille" />

        <div className="carReflection" />
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="stat">
      <div className="statTop">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="statTrack">
        <div
          className="statProgress"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function StartScreen({
  onStart,
  highScores,
  onClearScores,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cursorPointRef = useRef<HTMLDivElement>(null);
  const cursorTargetRef = useRef({ x: 0, y: 0 });

  const [settings, setSettings] =
    useState<GameSettings>(DEFAULT_GAME_SETTINGS);

  const [vehicleIndex, setVehicleIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const selectedVehicle = VEHICLES[vehicleIndex];
  const selectedStats = getVehicleStats(selectedVehicle);
  const selectedColor = VEHICLE_COLORS[selectedVehicle];

  /*
   * OLED BACKGROUND
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      time += 0.0035;

      ctx.clearRect(0, 0, width, height);

      const background = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        0,
        width * 0.5,
        height * 0.48,
        Math.max(width, height)
      );

      background.addColorStop(0, "#111820");
      background.addColorStop(0.4, "#070a0e");
      background.addColorStop(1, "#010203");

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      /*
       * Slow liquid light
       */
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();

        const baseY = height * (0.18 + i * 0.22);

        for (let x = -100; x <= width + 100; x += 20) {
          const y =
            baseY +
            Math.sin(x * 0.006 + time + i) * (25 + i * 8) +
            Math.sin(x * 0.002 - time * 0.7) * 18;

          if (x === -100) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradient = ctx.createLinearGradient(
          0,
          0,
          width,
          0
        );

        gradient.addColorStop(
          0,
          "rgba(80,160,255,0)"
        );

        gradient.addColorStop(
          0.5,
          "rgba(90,170,255,.045)"
        );

        gradient.addColorStop(
          1,
          "rgba(80,160,255,0)"
        );

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /*
       * Tiny particles
       */
      for (let i = 0; i < 45; i++) {
        const x =
          ((i * 187 + time * 9) % (width + 100)) - 50;

        const y =
          (i * 97 +
            Math.sin(time * 2 + i) * 20) %
          height;

        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(190,220,255,.14)";
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /*
   * MOUSE PARALLAX
   */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const move = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      scene.style.setProperty("--mx", `${x * 14}px`);
      scene.style.setProperty("--my", `${y * 10}px`);
      scene.style.setProperty(
        "--light-x",
        `${50 + x * 35}%`
      );
      scene.style.setProperty(
        "--light-y",
        `${50 + y * 35}%`
      );
    };

    const leave = () => {
      scene.style.setProperty("--mx", "0px");
      scene.style.setProperty("--my", "0px");
      scene.style.setProperty("--light-x", "50%");
      scene.style.setProperty("--light-y", "50%");
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  /*
   * SMOOTH MOUSE FOLLOW POINT
   */
  useEffect(() => {
    const point = cursorPointRef.current;
    const scene = sceneRef.current;
    if (!point || !scene) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    cursorTargetRef.current = { x: targetX, y: targetY };

    const move = (event: MouseEvent) => {
      cursorTargetRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const animate = () => {
      targetX = cursorTargetRef.current.x;
      targetY = cursorTargetRef.current.y;

      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      point.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  const selectVehicle = (index: number) => {
    if (index === vehicleIndex) return;

    setTransitioning(false);

    requestAnimationFrame(() => {
      setTransitioning(true);
    });

    setVehicleIndex(index);

    setSettings((previous) => ({
      ...previous,
      vehicle: VEHICLES[index],
    }));
  };

  const nextVehicle = () => {
    selectVehicle(
      (vehicleIndex + 1) % VEHICLES.length
    );
  };

  const previousVehicle = () => {
    selectVehicle(
      (vehicleIndex - 1 + VEHICLES.length) %
        VEHICLES.length
    );
  };

  const startRace = () => {
    onStart({
      ...settings,
      vehicle: selectedVehicle,
    });
  };

  return (
    <div
      ref={sceneRef}
      className="garage"
      style={
        {
          "--vehicle-glow": selectedColor.glow,
          "--vehicle-accent": selectedColor.accent,
        } as React.CSSProperties
      }
    >
      <canvas ref={canvasRef} className="garageCanvas" />

      <div className="cursorLight" />

      <div
        ref={cursorPointRef}
        className="cursorFollowPoint"
        aria-hidden="true"
      />

      {/* TOP NAV */}
      <header className="topNav">
        <div className="identity">
          <div className="identityBox">MTR</div>

          <div>
            <div className="identityTitle">
              MOTO TYPE RACER
            </div>

            <div className="identitySubtitle">
              PRECISION // SPEED // CONTROL
            </div>
          </div>
        </div>

        <div className="systemStatus">
          <span className="onlineDot" />
          SYSTEM READY

          <button
            className="recordsButton"
            onClick={() => setShowScores(true)}
          >
            RECORDS
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="garageLayout">

        {/* LEFT */}
        <aside className="sidePanel leftSide">
          <div className="eyebrow">
            01 / VEHICLE SELECT
          </div>

          <h2>CHOOSE YOUR MACHINE</h2>

          <p className="muted">
            Select a vehicle before entering the race.
          </p>

          <div className="vehicleChoices">
            {VEHICLES.map((vehicle, index) => {
              const active = vehicle === selectedVehicle;

              return (
                <button
                  key={vehicle}
                  className={`vehicleChoice ${
                    active ? "choiceActive" : ""
                  }`}
                  onClick={() => selectVehicle(index)}
                >
                  <div className="choiceIcon">
                    {VEHICLE_SETTINGS[vehicle].icon}
                  </div>

                  <div className="choiceInfo">
                    <strong>
                      {VEHICLE_SETTINGS[vehicle].label}
                    </strong>

                    <span>
                      {getVehicleDescription(vehicle)}
                    </span>
                  </div>

                  <div className="choiceIndicator">
                    {active ? "●" : "›"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="separator" />

          <div className="eyebrow">
            02 / RACE FORMAT
          </div>

          <div className="formatChoices">
            <button
              className={
                settings.typingMode === "word"
                  ? "formatActive"
                  : ""
              }
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  typingMode: "word",
                }))
              }
            >
              <strong>WORD RACE</strong>
              <span>RAPID</span>
            </button>

            <button
              className={
                settings.typingMode === "paragraph"
                  ? "formatActive"
                  : ""
              }
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  typingMode: "paragraph",
                }))
              }
            >
              <strong>PARAGRAPH</strong>
              <span>ENDURANCE</span>
            </button>
          </div>
        </aside>

        {/* CENTER SHOWROOM */}
        <section className="showroomStage">

          <div className="stageMeta">
            <span>SHOWROOM // {String(vehicleIndex + 1).padStart(2, "0")}</span>
            <span>LIVE CONFIGURATION</span>
          </div>

          <div className="machineName">
            <span>SELECTED MACHINE</span>

            <h1
              key={selectedVehicle}
              className={transitioning ? "nameEnter" : ""}
            >
              {VEHICLE_SETTINGS[selectedVehicle].label.toUpperCase()}
            </h1>

            <p>{getVehicleDescription(selectedVehicle)}</p>
          </div>

          {/* LIGHT BEHIND VEHICLE */}
          <div className="vehicleHalo" />

          {/* FLOOR */}
          <div className="floor">
            <div className="floorRing floorRing1" />
            <div className="floorRing floorRing2" />
            <div className="floorRing floorRing3" />

            <div className="floorGlow" />
          </div>

          {/* VEHICLE */}
          <div
            key={selectedVehicle}
            className={`heroMachine ${
              transitioning ? "machineEnter" : ""
            }`}
          >
            <VehicleVisual
              vehicle={selectedVehicle}
              large
            />
          </div>

          {/* LIGHT REFLECTION */}
          <div className="machineReflection" />

          <div className="mouseInstruction">
            <span>✦</span>
            MOVE CURSOR TO EXPLORE
          </div>

          {/* CAROUSEL */}
          <div className="carousel">
            <button
              className="carouselArrow"
              onClick={previousVehicle}
            >
              ‹
            </button>

            <div className="carouselTrack">
              {VEHICLES.map((vehicle, index) => {
                const active = index === vehicleIndex;

                return (
                  <button
                    key={vehicle}
                    className={`carouselCard ${
                      active ? "carouselActive" : ""
                    }`}
                    onClick={() => selectVehicle(index)}
                  >
                    <div className="miniMachine">
                      <VehicleVisual vehicle={vehicle} />
                    </div>

                    <span>
                      {VEHICLE_SETTINGS[vehicle].label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              className="carouselArrow"
              onClick={nextVehicle}
            >
              ›
            </button>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="sidePanel rightSide">

          <div className="eyebrow">
            PERFORMANCE DATA
          </div>

          <div className="modelHeader">
            <div>
              <span>MODEL</span>
              <strong>
                {VEHICLE_SETTINGS[selectedVehicle].label}
              </strong>
            </div>

            <small>
              MTR-
              {String(vehicleIndex + 1).padStart(2, "0")}
            </small>
          </div>

          <div className="stats">
            <StatBar
              label="TOP SPEED"
              value={selectedStats.speed}
            />

            <StatBar
              label="HANDLING"
              value={selectedStats.handling}
            />

            <StatBar
              label="ACCELERATION"
              value={selectedStats.acceleration}
            />

            <StatBar
              label="BRAKING"
              value={selectedStats.braking}
            />
          </div>

          <div className="separator" />

          <div className="eyebrow">
            03 / DIFFICULTY
          </div>

          <div className="difficultyChoices">
            {DIFFICULTIES.map((difficulty, index) => {
              const active =
                settings.difficulty === difficulty;

              const data =
                DIFFICULTY_SETTINGS[difficulty];

              return (
                <button
                  key={difficulty}
                  className={`difficulty ${
                    active ? "difficultyActive" : ""
                  }`}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      difficulty,
                    }))
                  }
                >
                  <span className="difficultyNo">
                    0{index + 1}
                  </span>

                  <div>
                    <strong>{data.label}</strong>
                    <small>{data.description}</small>
                  </div>

                  <span className="difficultyMark">
                    {active ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            className="startRace"
            onClick={startRace}
          >
            <span>START RACE</span>
            <strong>→</strong>
          </button>

        </aside>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <span>LOCAL // ONLINE</span>

        <div>
          CREATED BY{" "}
          <strong>LAEEQ KHAN JADOON</strong>
        </div>

        <span>V2.0</span>
      </footer>

      {/* RECORDS */}
      {showScores && (
        <div
          className="recordsOverlay"
          onClick={() => setShowScores(false)}
        >
          <div
            className="recordsModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalTop">
              <div>
                <div className="eyebrow">
                  RACE ARCHIVE
                </div>

                <h2>PERSONAL RECORDS</h2>
              </div>

              <button
                className="closeModal"
                onClick={() => setShowScores(false)}
              >
                ×
              </button>
            </div>

            <div className="scoreList">
              {highScores.length === 0 ? (
                <div className="noScores">
                  NO RECORDS YET
                  <small>
                    Complete your first race.
                  </small>
                </div>
              ) : (
                highScores
                  .slice(0, 10)
                  .map((score, index) => (
                    <div
                      className="score"
                      key={`${score.name}-${index}`}
                    >
                      <span>
                        #{String(index + 1).padStart(2, "0")}
                      </span>

                      <strong>{score.name}</strong>

                      <b>{score.score}</b>
                    </div>
                  ))
              )}
            </div>

            {highScores.length > 0 && (
              <button
                className="clearRecords"
                onClick={onClearScores}
              >
                CLEAR RECORDS
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .garage {
          --mx: 0px;
          --my: 0px;
          --light-x: 50%;
          --light-y: 50%;

          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 650px;
          overflow: hidden;

          background: #010203;
          color: #eef6ff;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .garageCanvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .cursorLight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;

          background:
            radial-gradient(
              circle at var(--light-x) var(--light-y),
              rgba(130,200,255,.07),
              transparent 28%
            );
        }

        .cursorFollowPoint {
          position: fixed;
          left: 0;
          top: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 100;
          background: #ffffff;
          will-change: transform;

          box-shadow:
            0 0 7px rgba(255,255,255,.95),
            0 0 16px rgba(120,210,255,.9),
            0 0 32px rgba(80,160,255,.48);

          animation: cursorPulse 1.8s ease-in-out infinite;
        }

        .cursorFollowPoint::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(120,205,255,.13),
            rgba(80,160,255,.045) 38%,
            transparent 72%
          );
          filter: blur(2px);
        }

        @keyframes cursorPulse {
          0%,
          100% {
            opacity: .78;
            scale: .9;
          }

          50% {
            opacity: 1;
            scale: 1.12;
          }
        }

        .garage::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 50;

          background:
            linear-gradient(
              rgba(255,255,255,.015) 1px,
              transparent 1px
            );

          background-size: 100% 4px;
          opacity: .18;
        }

        /* TOP */

        .topNav {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 74px;

          padding: 0 32px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid rgba(255,255,255,.07);

          background: rgba(2,5,8,.55);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          z-index: 20;
        }

        .identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .identityBox {
          width: 37px;
          height: 37px;

          display: grid;
          place-items: center;

          border: 1px solid rgba(190,225,255,.38);
          border-radius: 10px;

          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;

          background: rgba(255,255,255,.035);

          box-shadow:
            inset 0 0 20px rgba(100,180,255,.06),
            0 0 25px rgba(80,170,255,.06);
        }

        .identityTitle {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.7px;
        }

        .identitySubtitle {
          margin-top: 4px;

          color: rgba(215,235,250,.35);

          font-size: 7px;
          letter-spacing: 2px;
        }

        .systemStatus {
          display: flex;
          align-items: center;
          gap: 9px;

          color: rgba(215,235,250,.4);

          font-size: 7px;
          letter-spacing: 1.8px;
        }

        .onlineDot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #9bffc9;

          box-shadow:
            0 0 12px rgba(100,255,180,.8);
        }

        .recordsButton {
          height: 34px;
          margin-left: 12px;
          padding: 0 14px;

          border: 1px solid rgba(255,255,255,.09);
          border-radius: 8px;

          background: rgba(255,255,255,.03);

          color: rgba(235,245,255,.7);

          font-size: 7px;
          letter-spacing: 1.5px;

          cursor: pointer;

          transition: .25s ease;
        }

        .recordsButton:hover {
          border-color: rgba(150,215,255,.4);
          background: rgba(100,180,255,.08);
        }

        /* LAYOUT */

        .garageLayout {
          position: absolute;

          top: 74px;
          bottom: 54px;
          left: 0;
          right: 0;

          display: grid;

          grid-template-columns:
            minmax(210px, 255px)
            minmax(400px, 1fr)
            minmax(225px, 275px);

          gap: 17px;

          padding: 18px 27px;

          z-index: 5;
        }

        /* PANELS */

        .sidePanel {
          border: 1px solid rgba(210,235,255,.1);
          border-radius: 17px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.06),
              rgba(255,255,255,.015)
            );

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.055),
            0 25px 70px rgba(0,0,0,.35);

          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);

          padding: 22px 17px;

          overflow: hidden;
        }

        .eyebrow {
          color: rgba(150,205,255,.48);

          font-size: 7px;
          font-weight: 800;
          letter-spacing: 2.4px;
        }

        .sidePanel h2 {
          margin: 9px 0 7px;

          font-size: 15px;
          letter-spacing: 1px;
        }

        .muted {
          margin: 0 0 17px;

          color: rgba(220,235,250,.35);

          font-size: 8px;
          line-height: 1.65;
        }

        /* VEHICLE LIST */

        .vehicleChoices {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vehicleChoice {
          position: relative;

          width: 100%;
          min-height: 54px;

          display: grid;
          grid-template-columns: 34px 1fr 14px;
          align-items: center;

          gap: 8px;

          padding: 8px;

          border: 1px solid transparent;
          border-radius: 9px;

          background: rgba(255,255,255,.018);

          color: rgba(235,245,255,.72);

          text-align: left;

          cursor: pointer;

          transition: .25s ease;
        }

        .vehicleChoice:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,.04);
        }

        .vehicleChoice.choiceActive {
          border-color: rgba(140,210,255,.28);

          background:
            linear-gradient(
              90deg,
              rgba(100,185,255,.11),
              rgba(255,255,255,.018)
            );

          box-shadow:
            inset 3px 0 0 var(--vehicle-accent),
            0 10px 25px rgba(0,0,0,.18);
        }

        .choiceIcon {
          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          border-radius: 8px;

          background: rgba(255,255,255,.045);

          font-size: 16px;
        }

        .choiceInfo {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .choiceInfo strong {
          font-size: 8px;
          letter-spacing: .9px;
        }

        .choiceInfo span {
          font-size: 6px;
          letter-spacing: .7px;
          color: rgba(220,235,250,.3);
        }

        .choiceIndicator {
          color: rgba(220,240,255,.25);
          font-size: 12px;
        }

        .choiceActive .choiceIndicator {
          color: var(--vehicle-accent);
          text-shadow: 0 0 12px var(--vehicle-glow);
        }

        .separator {
          height: 1px;
          margin: 20px 0;

          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.11),
              transparent
            );
        }

        /* FORMAT */

        .formatChoices {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          margin-top: 11px;
        }

        .formatChoices button {
          min-height: 48px;

          padding: 8px;

          border: 1px solid rgba(255,255,255,.06);
          border-radius: 8px;

          background: rgba(255,255,255,.018);

          color: rgba(225,240,250,.43);

          text-align: left;

          cursor: pointer;

          transition: .22s ease;
        }

        .formatChoices button:hover {
          background: rgba(255,255,255,.04);
        }

        .formatChoices button.formatActive {
          border-color: rgba(130,205,255,.27);
          background: rgba(100,180,255,.07);
          color: #eef8ff;
        }

        .formatChoices strong,
        .formatChoices span {
          display: block;
        }

        .formatChoices strong {
          font-size: 7px;
          letter-spacing: .9px;
        }

        .formatChoices span {
          margin-top: 5px;

          color: rgba(215,235,250,.27);

          font-size: 6px;
          letter-spacing: 1px;
        }

        /* SHOWROOM */

        .showroomStage {
          position: relative;

          min-width: 0;

          overflow: hidden;

          border: 1px solid rgba(255,255,255,.055);
          border-radius: 19px;

          background:
            radial-gradient(
              ellipse at 50% 58%,
              rgba(90,160,220,.07),
              transparent 45%
            ),
            rgba(2,5,8,.2);

          transform:
            perspective(1400px)
            rotateY(var(--mx))
            rotateX(calc(var(--my) * -.35));

          transition: transform .14s ease-out;
        }

        .stageMeta {
          position: absolute;

          top: 17px;
          left: 21px;
          right: 21px;

          display: flex;
          justify-content: space-between;

          color: rgba(210,230,245,.25);

          font-size: 6px;
          letter-spacing: 1.8px;
        }

        .machineName {
          position: absolute;

          top: 43px;
          left: 0;
          right: 0;

          text-align: center;

          z-index: 8;
        }

        .machineName > span {
          color: rgba(150,205,255,.4);

          font-size: 6px;
          font-weight: 800;
          letter-spacing: 2.6px;
        }

        .machineName h1 {
          margin: 8px 0 0;

          font-size: clamp(25px, 3vw, 44px);
          line-height: 1;

          letter-spacing: 6px;
          font-weight: 800;

          color: rgba(245,250,255,.94);

          text-shadow:
            0 0 35px rgba(130,205,255,.1);
        }

        .machineName h1.nameEnter {
          animation: nameEnter .45s ease;
        }

        @keyframes nameEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .machineName p {
          margin: 8px 0 0;

          color: rgba(220,235,250,.32);

          font-size: 7px;
          letter-spacing: 2px;
        }

        /* HALO */

        .vehicleHalo {
          position: absolute;

          width: 45%;
          height: 43%;

          left: 27.5%;
          top: 29%;

          border-radius: 50%;

          background:
            radial-gradient(
              ellipse,
              var(--vehicle-glow),
              transparent 68%
            );

          filter: blur(18px);

          opacity: .9;

          transition:
            background .45s ease,
            transform .4s ease;
        }

        /* FLOOR */

        .floor {
          position: absolute;

          left: 8%;
          right: 8%;

          top: 52%;
          height: 35%;

          perspective: 500px;
        }

        .floorRing {
          position: absolute;

          left: 50%;
          top: 30%;

          transform:
            translate(-50%, -50%)
            rotateX(66deg);

          border-radius: 50%;

          border: 1px solid var(--vehicle-glow);

          transition: border-color .4s ease;
        }

        .floorRing1 {
          width: 88%;
          height: 44%;

          box-shadow:
            0 0 22px var(--vehicle-glow);
        }

        .floorRing2 {
          width: 69%;
          height: 34%;

          border-color: rgba(180,220,255,.13);
        }

        .floorRing3 {
          width: 49%;
          height: 25%;

          border-color: rgba(180,220,255,.09);
        }

        .floorGlow {
          position: absolute;

          left: 20%;
          right: 20%;
          top: 21%;

          height: 18%;

          border-radius: 50%;

          background: var(--vehicle-glow);

          filter: blur(25px);
        }

        /* HERO VEHICLE */

        .heroMachine {
          position: absolute;

          left: 50%;
          top: 49%;

          width: 440px;
          height: 300px;

          display: grid;
          place-items: center;

          transform:
            translate(-50%, -50%)
            translate3d(var(--mx), var(--my), 0);

          z-index: 6;

          transition:
            transform .15s ease-out;
        }

        .heroMachine.machineEnter {
          animation: machineEnter .65s cubic-bezier(.16,.9,.25,1);
        }

        @keyframes machineEnter {
          0% {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              translateX(100px)
              translateY(10px)
              scale(.78)
              rotateY(-15deg);

            filter: blur(8px);
          }

          55% {
            opacity: 1;
          }

          100% {
            opacity: 1;

            transform:
              translate(-50%, -50%)
              translate3d(var(--mx), var(--my), 0)
              scale(1)
              rotateY(0);

            filter: blur(0);
          }
        }

        /* MACHINE BASE */

        .machine {
          position: relative;

          width: 230px;
          height: 160px;

          transform: translateY(0);

          animation: machineFloat 4s ease-in-out infinite;
        }

        .machineLarge {
          transform: scale(1.45);
        }

        @keyframes machineFloat {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -7px;
          }
        }

        .machineShadow {
          position: absolute;

          width: 190px;
          height: 28px;

          left: 20px;
          bottom: 10px;

          border-radius: 50%;

          background: rgba(0,0,0,.7);

          filter: blur(12px);
        }

        /* CAR */

        .machineCar {
          width: 250px;
          height: 170px;
        }

        .carMainBody {
          position: absolute;

          width: 215px;
          height: 55px;

          left: 18px;
          top: 72px;

          border-radius:
            30px
            55px
            15px
            14px;

          background:
            linear-gradient(
              150deg,
              #52616d,
              #11181e 30%,
              #05080b 63%,
              #2a3944
            );

          border: 1px solid rgba(220,240,255,.34);

          box-shadow:
            inset 0 2px 8px rgba(255,255,255,.17),
            inset 0 -10px 15px rgba(0,0,0,.55),
            0 15px 25px rgba(0,0,0,.5);
        }

        .carUpperBody {
          position: absolute;

          width: 120px;
          height: 45px;

          left: 45px;
          top: -34px;

          border-radius:
            70px
            80px
            5px
            5px;

          background:
            linear-gradient(
              140deg,
              #3b4a56,
              #0a0f13
            );

          border: 1px solid rgba(210,235,255,.28);

          transform: skewX(-8deg);
        }

        .carGlass {
          position: absolute;

          left: 59px;
          top: -27px;

          width: 91px;
          height: 27px;

          display: flex;

          overflow: hidden;

          border: 1px solid rgba(180,220,255,.17);

          transform: skewX(-8deg);

          z-index: 3;
        }

        .carGlass div {
          flex: 1;

          background:
            linear-gradient(
              140deg,
              rgba(110,180,225,.4),
              rgba(4,10,15,.95)
            );
        }

        .carGlass div + div {
          border-left: 1px solid rgba(200,225,245,.1);
        }

        .carSideLine {
          position: absolute;

          left: 25px;
          right: 24px;
          top: 20px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(220,240,255,.45),
              transparent
            );
        }

        .carLight {
          position: absolute;

          top: 27px;

          width: 22px;
          height: 5px;

          border-radius: 5px;

          background: #d9f5ff;

          box-shadow:
            0 0 14px rgba(150,225,255,.9);
        }

        .carLightLeft {
          left: 4px;
          transform: rotate(-10deg);
        }

        .carLightRight {
          right: 3px;
          transform: rotate(10deg);
        }

        .carGrille {
          position: absolute;

          left: 93px;
          bottom: 4px;

          width: 38px;
          height: 7px;

          border-radius: 50%;

          border: 1px solid rgba(200,230,250,.2);
        }

        .carReflection {
          position: absolute;

          left: 35px;
          top: 12px;

          width: 90px;
          height: 2px;

          background: rgba(255,255,255,.16);

          filter: blur(2px);
        }

        .carWheel {
          position: absolute;

          top: 103px;

          width: 37px;
          height: 37px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              #71808a 0 12%,
              #10161b 14% 50%,
              #050708 53% 68%,
              #53616b 70% 73%,
              #030405 76%
            );

          border: 2px solid #151d23;

          z-index: 5;
        }

        .carWheelBack {
          left: 39px;
        }

        .carWheelFront {
          right: 34px;
        }

        /* TRUCK */

        .machineTruck .carMainBody {
          border-radius: 9px 16px 12px 12px;
        }

        .machineTruck .carUpperBody {
          width: 73px;
          height: 52px;

          left: 102px;
          top: -39px;

          border-radius: 7px 13px 2px 2px;
        }

        .machineTruck .carGlass {
          left: 112px;
          top: -29px;
          width: 57px;
        }

        /* BIKE */

        .machineBike {
          width: 240px;
          height: 175px;
        }

        .bikeWheel {
          position: absolute;

          top: 87px;

          width: 55px;
          height: 55px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              #6f7e87 0 7%,
              #080c10 9% 47%,
              #596873 49% 52%,
              #030506 55%
            );

          border: 2px solid rgba(215,235,250,.22);
        }

        .bikeWheelBack {
          left: 27px;
        }

        .bikeWheelFront {
          right: 28px;
        }

        .bikeFrame {
          position: absolute;

          width: 110px;
          height: 55px;

          left: 62px;
          top: 64px;

          border-left: 5px solid #6f818c;
          border-bottom: 5px solid #536773;

          transform:
            skewX(-14deg)
            rotate(-5deg);
        }

        .bikeTank {
          position: absolute;

          width: 78px;
          height: 35px;

          left: 68px;
          top: 52px;

          border-radius:
            45%
            55%
            35%
            20%;

          background:
            linear-gradient(
              145deg,
              #4d5d68,
              #11181d
            );

          border: 1px solid rgba(220,240,255,.3);

          transform: rotate(-7deg);
        }

        .bikeSeat {
          position: absolute;

          width: 49px;
          height: 9px;

          left: 86px;
          top: 45px;

          border-radius: 8px;

          background: #070a0d;

          border: 1px solid rgba(220,235,245,.2);

          transform: rotate(-7deg);
        }

        .bikeFork {
          position: absolute;

          right: 50px;
          top: 42px;

          width: 5px;
          height: 65px;

          border-radius: 5px;

          background: #748590;

          transform: rotate(11deg);
        }

        .bikeHandle {
          position: absolute;

          right: 40px;
          top: 35px;

          width: 39px;
          height: 14px;

          border-top: 2px solid #9aaab5;

          transform: rotate(-5deg);
        }

        .bikeEngine {
          position: absolute;

          left: 94px;
          top: 79px;

          width: 42px;
          height: 31px;

          border-radius: 6px;

          background:
            linear-gradient(
              140deg,
              #4c5961,
              #11161a
            );

          border: 1px solid rgba(210,230,240,.2);
        }

        .bikeEngine span {
          position: absolute;

          left: 7px;

          width: 27px;
          height: 2px;

          background: rgba(190,215,230,.24);
        }

        .bikeEngine span:nth-child(1) {
          top: 8px;
        }

        .bikeEngine span:nth-child(2) {
          top: 14px;
        }

        .bikeEngine span:nth-child(3) {
          top: 20px;
        }

        .bikeHeadlight {
          position: absolute;

          right: 37px;
          top: 45px;

          width: 14px;
          height: 8px;

          border-radius: 5px;

          background: #e0f8ff;

          box-shadow:
            0 0 18px rgba(140,225,255,1);
        }

        .bikeTailLight {
          position: absolute;

          left: 45px;
          top: 69px;

          width: 9px;
          height: 5px;

          border-radius: 5px;

          background: #ff4d57;

          box-shadow:
            0 0 10px rgba(255,50,60,.8);
        }

        /* REFLECTION */

        .machineReflection {
          position: absolute;

          left: 27%;
          width: 46%;

          top: 68%;

          height: 14%;

          border-radius: 50%;

          background:
            radial-gradient(
              ellipse,
              var(--vehicle-glow),
              transparent 65%
            );

          filter: blur(20px);

          opacity: .65;
        }

        .mouseInstruction {
          position: absolute;

          bottom: 101px;

          left: 0;
          right: 0;

          display: flex;
          justify-content: center;
          gap: 7px;

          color: rgba(215,235,250,.23);

          font-size: 6px;
          letter-spacing: 1.8px;
        }

        .mouseInstruction span {
          color: var(--vehicle-accent);
        }

        /* CAROUSEL */

        .carousel {
          position: absolute;

          left: 8%;
          right: 8%;
          bottom: 18px;

          height: 72px;

          display: flex;
          align-items: center;

          gap: 7px;

          padding: 6px;

          border:
            1px solid rgba(255,255,255,.08);

          border-radius: 12px;

          background: rgba(2,5,8,.53);

          backdrop-filter: blur(20px);

          z-index: 10;
        }

        .carouselTrack {
          flex: 1;

          height: 100%;

          display: grid;
          grid-template-columns: repeat(4, 1fr);

          gap: 5px;
        }

        .carouselArrow {
          width: 29px;
          height: 38px;

          border: 1px solid rgba(255,255,255,.08);
          border-radius: 7px;

          background: rgba(255,255,255,.025);

          color: rgba(235,245,255,.6);

          font-size: 20px;

          cursor: pointer;

          transition: .2s ease;
        }

        .carouselArrow:hover {
          background: rgba(100,180,255,.1);
          color: white;
        }

        .carouselCard {
          position: relative;

          overflow: hidden;

          border: 1px solid transparent;
          border-radius: 8px;

          background: transparent;

          color: rgba(220,235,250,.28);

          cursor: pointer;

          transition: .25s ease;
        }

        .carouselCard:hover {
          background: rgba(255,255,255,.04);
        }

        .carouselCard.carouselActive {
          border-color: rgba(140,210,255,.28);
          background: rgba(100,180,255,.07);
          color: rgba(240,250,255,.85);

          box-shadow:
            inset 0 0 18px rgba(100,190,255,.035);
        }

        .miniMachine {
          position: absolute;

          left: 50%;
          top: -4px;

          width: 75px;
          height: 50px;

          transform:
            translateX(-50%)
            scale(.35);

          transform-origin: top center;

          opacity: .45;
        }

        .carouselActive .miniMachine {
          opacity: 1;
          transform:
            translateX(-50%)
            scale(.4);
        }

        .carouselCard > span {
          position: absolute;

          bottom: 5px;
          left: 0;
          right: 0;

          font-size: 5px;
          letter-spacing: .7px;
        }

        /* RIGHT PANEL */

        .modelHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;

          margin-top: 16px;
          padding-bottom: 13px;
        }

        .modelHeader div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .modelHeader span {
          color: rgba(210,230,245,.3);

          font-size: 6px;
          letter-spacing: 1.5px;
        }

        .modelHeader strong {
          font-size: 11px;
          letter-spacing: .7px;
        }

        .modelHeader small {
          color: rgba(150,205,255,.38);

          font-size: 6px;
          letter-spacing: 1px;
        }

        .stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .statTop {
          display: flex;
          justify-content: space-between;

          margin-bottom: 5px;

          color: rgba(215,235,250,.37);

          font-size: 6px;
          letter-spacing: 1px;
        }

        .statTop strong {
          color: rgba(230,245,255,.62);
          font-size: 6px;
        }

        .statTrack {
          height: 3px;

          overflow: hidden;

          border-radius: 5px;

          background: rgba(255,255,255,.07);
        }

        .statProgress {
          height: 100%;

          border-radius: 5px;

          background:
            linear-gradient(
              90deg,
              var(--vehicle-accent),
              rgba(235,250,255,.95)
            );

          box-shadow:
            0 0 9px var(--vehicle-glow);

          transition:
            width .4s cubic-bezier(.2,.8,.2,1);
        }

        .difficultyChoices {
          display: flex;
          flex-direction: column;

          gap: 5px;

          margin-top: 10px;
        }

        .difficulty {
          width: 100%;
          min-height: 43px;

          display: grid;

          grid-template-columns: 26px 1fr 17px;

          align-items: center;

          gap: 7px;

          padding: 6px;

          border: 1px solid transparent;
          border-radius: 8px;

          background: rgba(255,255,255,.017);

          color: rgba(220,235,250,.5);

          text-align: left;

          cursor: pointer;

          transition: .22s ease;
        }

        .difficulty:hover {
          background: rgba(255,255,255,.04);
        }

        .difficulty.difficultyActive {
          border-color: rgba(130,205,255,.24);
          background: rgba(100,180,255,.065);
          color: #f0f8ff;
        }

        .difficultyNo {
          color: rgba(150,205,255,.3);

          font-size: 6px;
          letter-spacing: 1px;
        }

        .difficulty div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .difficulty strong {
          font-size: 8px;
          letter-spacing: .7px;
        }

        .difficulty small {
          color: rgba(220,235,250,.28);
          font-size: 6px;
        }

        .difficultyMark {
          color: var(--vehicle-accent);
          font-size: 10px;
          text-align: center;
        }

        /* START */

        .startRace {
          position: relative;

          width: 100%;
          height: 53px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 18px;
          padding: 0 16px;

          overflow: hidden;

          border: 1px solid rgba(175,225,255,.4);
          border-radius: 10px;

          background:
            linear-gradient(
              105deg,
              rgba(100,190,255,.14),
              rgba(255,255,255,.035)
            );

          color: #f4fbff;

          cursor: pointer;

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.1),
            0 0 28px rgba(80,175,255,.06);

          transition: .25s ease;
        }

        .startRace::before {
          content: "";

          position: absolute;

          top: 0;
          bottom: 0;
          left: -100%;

          width: 65%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.18),
              transparent
            );

          transform: skewX(-20deg);

          transition: .7s ease;
        }

        .startRace:hover {
          transform: translateY(-2px);

          border-color: rgba(200,240,255,.8);

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.15),
            0 0 35px var(--vehicle-glow);
        }

        .startRace:hover::before {
          left: 140%;
        }

        .startRace span {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .startRace strong {
          font-size: 18px;
          font-weight: 400;
        }

        /* FOOTER */

        .footer {
          position: absolute;

          bottom: 0;
          left: 0;
          right: 0;

          height: 54px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;

          border-top: 1px solid rgba(255,255,255,.055);

          background: rgba(2,5,8,.45);

          backdrop-filter: blur(18px);

          z-index: 20;

          color: rgba(210,230,245,.23);

          font-size: 6px;
          letter-spacing: 1.6px;
        }

        .footer strong {
          color: rgba(225,240,250,.55);
        }

        /* MODAL */

        .recordsOverlay {
          position: fixed;

          inset: 0;

          z-index: 100;

          display: grid;
          place-items: center;

          padding: 20px;

          background: rgba(0,0,0,.7);

          backdrop-filter: blur(16px);
        }

        .recordsModal {
          width: min(500px, 100%);

          padding: 25px;

          border: 1px solid rgba(190,225,255,.14);
          border-radius: 17px;

          background:
            linear-gradient(
              145deg,
              rgba(22,30,38,.96),
              rgba(4,7,10,.97)
            );

          box-shadow:
            0 40px 100px rgba(0,0,0,.7);
        }

        .modalTop {
          display: flex;
          justify-content: space-between;
        }

        .modalTop h2 {
          margin: 7px 0 0;

          font-size: 17px;
          letter-spacing: 1.5px;
        }

        .closeModal {
          width: 32px;
          height: 32px;

          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;

          background: rgba(255,255,255,.03);

          color: rgba(235,245,255,.7);

          font-size: 18px;

          cursor: pointer;
        }

        .scoreList {
          margin-top: 20px;

          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .score {
          min-height: 43px;

          display: grid;

          grid-template-columns: 48px 1fr auto;

          align-items: center;

          padding: 0 12px;

          border: 1px solid rgba(255,255,255,.05);
          border-radius: 8px;

          background: rgba(255,255,255,.025);
        }

        .score span {
          color: rgba(150,205,255,.4);
          font-size: 8px;
        }

        .score strong {
          font-size: 9px;
          letter-spacing: .7px;
        }

        .score b {
          font-size: 10px;
          color: rgba(225,245,255,.8);
        }

        .noScores {
          padding: 40px 20px;

          text-align: center;

          color: rgba(220,235,250,.4);

          font-size: 9px;
          letter-spacing: 2px;
        }

        .noScores small {
          display: block;

          margin-top: 8px;

          color: rgba(220,235,250,.23);

          font-size: 7px;
          letter-spacing: 1px;
        }

        .clearRecords {
          margin-top: 15px;

          height: 37px;

          padding: 0 13px;

          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;

          background: rgba(255,255,255,.025);

          color: rgba(220,235,250,.4);

          font-size: 7px;
          letter-spacing: 1.5px;

          cursor: pointer;
        }

        .clearRecords:hover {
          color: white;
          border-color: rgba(255,90,90,.25);
          background: rgba(255,70,70,.06);
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .garageLayout {
            grid-template-columns:
              195px
              1fr
              215px;

            gap: 10px;
            padding: 14px;
          }

          .sidePanel {
            padding: 17px 12px;
          }

          .heroMachine {
            transform:
              translate(-50%, -50%)
              scale(.85)
              translate3d(var(--mx), var(--my), 0);
          }
        }

        @media (max-width: 820px) {
          .garage {
            min-height: 900px;
            overflow-y: auto;
          }

          .topNav {
            padding: 0 15px;
          }

          .systemStatus > .onlineDot,
          .systemStatus {
            font-size: 0;
          }

          .recordsButton {
            font-size: 7px;
          }

          .garageLayout {
            position: relative;

            top: 74px;
            bottom: auto;

            display: flex;
            flex-direction: column;

            min-height: calc(100vh - 128px);

            padding: 10px;

            overflow-y: auto;
          }

          .showroomStage {
            order: 1;
            min-height: 500px;
          }

          .leftSide {
            order: 2;
          }

          .rightSide {
            order: 3;
          }

          .footer {
            position: relative;
            top: 74px;
          }

          .vehicleChoices {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 500px) {
          .identityTitle {
            font-size: 9px;
            letter-spacing: 1.7px;
          }

          .identitySubtitle {
            font-size: 5px;
          }

          .identityBox {
            width: 31px;
            height: 31px;
          }

          .showroomStage {
            min-height: 470px;
          }

          .machineName h1 {
            font-size: 24px;
            letter-spacing: 3px;
          }

          .heroMachine {
            transform:
              translate(-50%, -50%)
              scale(.72);
          }

          .carousel {
            left: 3%;
            right: 3%;
          }

          .carouselArrow {
            display: none;
          }

          .footer {
            justify-content: center;
          }

          .footer > span {
            display: none;
          }
        }

      `}</style>
    </div>
  );
}
