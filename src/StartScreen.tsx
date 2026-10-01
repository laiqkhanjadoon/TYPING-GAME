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

function VehicleVisual({
  vehicle,
  active,
}: {
  vehicle: VehicleType;
  active: boolean;
}) {
  if (vehicle === "bike") {
    return (
      <div className={`vehicleVisual bikeVisual ${active ? "active" : ""}`}>
        <div className="bikeGlow" />
        <div className="bikeWheel wheelLeft" />
        <div className="bikeWheel wheelRight" />
        <div className="bikeBody" />
        <div className="bikeSeat" />
        <div className="bikeFront" />
        <div className="bikeHandle" />
        <div className="bikeLight" />
      </div>
    );
  }

  const truck = vehicle === "truck";

  return (
    <div
      className={`vehicleVisual carVisual ${
        truck ? "truckVisual" : ""
      } ${active ? "active" : ""}`}
    >
      <div className="carGlow" />

      <div className="carWheel carWheelLeft" />
      <div className="carWheel carWheelRight" />

      <div className="carBody">
        <div className="carWindow carWindowLeft" />
        <div className="carWindow carWindowRight" />
        <div className="carRoof" />

        {truck && <div className="truckCab" />}

        <div className="carHeadlight carHeadlightLeft" />
        <div className="carHeadlight carHeadlightRight" />

        <div className="carLine" />
      </div>
    </div>
  );
}

function getVehicleDescription(vehicle: VehicleType) {
  switch (vehicle) {
    case "bike":
      return "Agile / Lightweight";
    case "sports-car":
      return "Balanced / Fast";
    case "supercar":
      return "Extreme / Precision";
    case "truck":
      return "Heavy / Stable";
    default:
      return "";
  }
}

function getVehicleStats(vehicle: VehicleType) {
  switch (vehicle) {
    case "bike":
      return {
        speed: 92,
        handling: 96,
        acceleration: 94,
        braking: 84,
      };
    case "sports-car":
      return {
        speed: 95,
        handling: 90,
        acceleration: 92,
        braking: 91,
      };
    case "supercar":
      return {
        speed: 100,
        handling: 86,
        acceleration: 99,
        braking: 95,
      };
    case "truck":
      return {
        speed: 70,
        handling: 72,
        acceleration: 65,
        braking: 88,
      };
  }
}

export default function StartScreen({
  onStart,
  highScores,
  onClearScores,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  const [settings, setSettings] =
    useState<GameSettings>(DEFAULT_GAME_SETTINGS);

  const [vehicleIndex, setVehicleIndex] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [vehiclePulse, setVehiclePulse] = useState(false);

  const selectedVehicle = VEHICLES[vehicleIndex];
  const selectedStats = getVehicleStats(selectedVehicle);

  /*
   * Liquid OLED animated background
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
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

      time += 0.004;

      ctx.clearRect(0, 0, width, height);

      /*
       * Deep OLED base
       */
      const base = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        0,
        width * 0.5,
        height * 0.48,
        Math.max(width, height)
      );

      base.addColorStop(0, "#111820");
      base.addColorStop(0.42, "#06090d");
      base.addColorStop(1, "#010203");

      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      /*
       * Liquid light ribbons
       */
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();

        const yBase = height * (0.15 + i * 0.18);

        for (let x = -100; x <= width + 100; x += 18) {
          const y =
            yBase +
            Math.sin(x * 0.006 + time * (1 + i * 0.08)) *
              (30 + i * 8) +
            Math.sin(x * 0.002 - time * 0.7) * 20;

          if (x === -100) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const gradient = ctx.createLinearGradient(
          0,
          0,
          width,
          height
        );

        if (i % 2 === 0) {
          gradient.addColorStop(0, "rgba(80,150,255,0)");
          gradient.addColorStop(0.45, "rgba(80,150,255,0.055)");
          gradient.addColorStop(0.72, "rgba(110,210,255,0.025)");
          gradient.addColorStop(1, "rgba(80,150,255,0)");
        } else {
          gradient.addColorStop(0, "rgba(120,90,255,0)");
          gradient.addColorStop(0.5, "rgba(120,90,255,0.035)");
          gradient.addColorStop(1, "rgba(120,90,255,0)");
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /*
       * Tiny atmospheric particles
       */
      for (let i = 0; i < 55; i++) {
        const x =
          ((i * 173.73 + time * (8 + (i % 4) * 2)) %
            (width + 100)) -
          50;

        const y =
          (i * 91.37 + Math.sin(time + i) * 35) %
          height;

        const radius = 0.4 + (i % 3) * 0.25;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,215,255,${0.08 + (i % 4) * 0.025})`;
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /*
   * Mouse-reactive showroom
   */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      scene.style.setProperty("--mouse-x", `${x * 18}px`);
      scene.style.setProperty("--mouse-y", `${y * 12}px`);
      scene.style.setProperty("--mouse-light-x", `${50 + x * 35}%`);
      scene.style.setProperty("--mouse-light-y", `${50 + y * 30}%`);
    };

    const handleMouseLeave = () => {
      scene.style.setProperty("--mouse-x", "0px");
      scene.style.setProperty("--mouse-y", "0px");
      scene.style.setProperty("--mouse-light-x", "50%");
      scene.style.setProperty("--mouse-light-y", "50%");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const changeVehicle = (index: number) => {
    setVehicleIndex(index);

    setVehiclePulse(false);

    requestAnimationFrame(() => {
      setVehiclePulse(true);
    });

    setSettings((previous) => ({
      ...previous,
      vehicle: VEHICLES[index],
    }));
  };

  const selectDifficulty = (difficulty: Difficulty) => {
    setSettings((previous) => ({
      ...previous,
      difficulty,
    }));
  };

  const selectMode = (typingMode: TypingMode) => {
    setSettings((previous) => ({
      ...previous,
      typingMode,
    }));
  };

  const startRace = () => {
    onStart({
      ...settings,
      vehicle: selectedVehicle,
    });
  };

  const vehicleName = VEHICLE_SETTINGS[selectedVehicle].label;

  return (
    <div ref={sceneRef} className="showroom">
      <canvas ref={canvasRef} className="showroomCanvas" />

      <div className="mouseLight" />

      <div className="topBar">
        <div className="brandBlock">
          <div className="brandMark">MTR</div>

          <div>
            <div className="brandName">MOTO TYPE RACER</div>
            <div className="brandSub">PRECISION TYPING // RACING</div>
          </div>
        </div>

        <div className="topRight">
          <div className="statusDot" />
          <span>SYSTEM READY</span>

          <button
            className="scoresButton"
            onClick={() => setShowScores(!showScores)}
          >
            <span>◉</span>
            RECORDS
          </button>
        </div>
      </div>

      <main className="showroomMain">
        {/* LEFT CONTROL PANEL */}
        <aside className="leftPanel glassPanel">
          <div className="panelEyebrow">01 / GARAGE</div>

          <h2>SELECT VEHICLE</h2>

          <p className="panelDescription">
            Choose your machine. Each vehicle changes the visual
            identity of your race.
          </p>

          <div className="vehicleList">
            {VEHICLES.map((vehicle, index) => {
              const active = selectedVehicle === vehicle;

              return (
                <button
                  key={vehicle}
                  className={`vehicleOption ${active ? "selected" : ""}`}
                  onClick={() => changeVehicle(index)}
                >
                  <div className="vehicleOptionIcon">
                    {VEHICLE_SETTINGS[vehicle].icon}
                  </div>

                  <div className="vehicleOptionText">
                    <strong>
                      {VEHICLE_SETTINGS[vehicle].label}
                    </strong>

                    <span>{getVehicleDescription(vehicle)}</span>
                  </div>

                  <div className="vehicleArrow">
                    {active ? "●" : "›"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="panelDivider" />

          <div className="panelEyebrow">02 / RACE MODE</div>

          <div className="modeSelector">
            <button
              className={
                settings.typingMode === "word" ? "modeActive" : ""
              }
              onClick={() => selectMode("word")}
            >
              <span>WORD</span>
              <small>RAPID</small>
            </button>

            <button
              className={
                settings.typingMode === "paragraph"
                  ? "modeActive"
                  : ""
              }
              onClick={() => selectMode("paragraph")}
            >
              <span>PARAGRAPH</span>
              <small>ENDURANCE</small>
            </button>
          </div>
        </aside>

        {/* CENTER SHOWROOM */}
        <section className="vehicleStage">
          <div className="stageTopLine">
            <span>SHOWROOM // 001</span>

            <span>
              {String(vehicleIndex + 1).padStart(2, "0")} /{" "}
              {String(VEHICLES.length).padStart(2, "0")}
            </span>
          </div>

          <div className="stageTitle">
            <div className="stageSmall">SELECTED MACHINE</div>

            <h1 key={selectedVehicle} className={vehiclePulse ? "pulse" : ""}>
              {vehicleName.toUpperCase()}
            </h1>

            <p>{getVehicleDescription(selectedVehicle)}</p>
          </div>

          <div className="vehicleDisplay">
            <div className="platform platformOuter" />
            <div className="platform platformMiddle" />
            <div className="platform platformInner" />

            <div className="platformLight" />

            <div
              key={selectedVehicle}
              className={`vehicleAnimated ${
                vehiclePulse ? "vehicleEnter" : ""
              }`}
            >
              <VehicleVisual
                vehicle={selectedVehicle}
                active={true}
              />
            </div>

            <div className="reflection" />
          </div>

          <div className="stageHint">
            <span className="mouseIcon">✦</span>
            MOVE CURSOR TO EXPLORE
          </div>

          {/* VEHICLE CAROUSEL */}
          <div className="vehicleCarousel">
            <button
              className="carouselArrow"
              onClick={() =>
                changeVehicle(
                  (vehicleIndex - 1 + VEHICLES.length) %
                    VEHICLES.length
                )
              }
            >
              ‹
            </button>

            <div className="carouselItems">
              {VEHICLES.map((vehicle, index) => (
                <button
                  key={vehicle}
                  className={`carouselItem ${
                    selectedVehicle === vehicle ? "active" : ""
                  }`}
                  onClick={() => changeVehicle(index)}
                >
                  <VehicleVisual
                    vehicle={vehicle}
                    active={selectedVehicle === vehicle}
                  />

                  <span>
                    {VEHICLE_SETTINGS[vehicle].label}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="carouselArrow"
              onClick={() =>
                changeVehicle(
                  (vehicleIndex + 1) % VEHICLES.length
                )
              }
            >
              ›
            </button>
          </div>
        </section>

        {/* RIGHT PERFORMANCE PANEL */}
        <aside className="rightPanel glassPanel">
          <div className="panelEyebrow">PERFORMANCE</div>

          <div className="performanceHeader">
            <div>
              <span className="performanceLabel">MODEL</span>
              <strong>{vehicleName}</strong>
            </div>

            <span className="modelCode">
              MTR-{String(vehicleIndex + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="statList">
            <StatBar label="TOP SPEED" value={selectedStats.speed} />
            <StatBar label="HANDLING" value={selectedStats.handling} />
            <StatBar
              label="ACCELERATION"
              value={selectedStats.acceleration}
            />
            <StatBar label="BRAKING" value={selectedStats.braking} />
          </div>

          <div className="panelDivider" />

          <div className="panelEyebrow">03 / DIFFICULTY</div>

          <div className="difficultyList">
            {DIFFICULTIES.map((difficulty) => {
              const active = settings.difficulty === difficulty;
              const data = DIFFICULTY_SETTINGS[difficulty];

              return (
                <button
                  key={difficulty}
                  className={`difficultyOption ${
                    active ? "active" : ""
                  }`}
                  onClick={() => selectDifficulty(difficulty)}
                >
                  <div className="difficultyNumber">
                    {difficulty === "easy"
                      ? "01"
                      : difficulty === "medium"
                      ? "02"
                      : "03"}
                  </div>

                  <div>
                    <strong>{data.label}</strong>
                    <span>{data.description}</span>
                  </div>

                  <div className="difficultyCheck">
                    {active ? "✓" : ""}
                  </div>
                </button>
              );
            })}
          </div>

          <button className="startButton" onClick={startRace}>
            <span>START RACE</span>
            <strong>→</strong>
          </button>
        </aside>
      </main>

      <footer className="bottomBar">
        <div>
          <span className="footerLine" />
          <span>ONLINE // LOCAL</span>
        </div>

        <div className="creator">
          CREATED BY <strong>LAEEQ KHAN JADOON</strong>
        </div>

        <div>
          <span>v2.0</span>
          <span className="footerLine" />
        </div>
      </footer>

      {/* RECORDS OVERLAY */}
      {showScores && (
        <div
          className="scoresOverlay"
          onClick={() => setShowScores(false)}
        >
          <div
            className="scoresModal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modalHeader">
              <div>
                <span className="panelEyebrow">RACE ARCHIVE</span>
                <h2>PERSONAL RECORDS</h2>
              </div>

              <button
                className="closeButton"
                onClick={() => setShowScores(false)}
              >
                ×
              </button>
            </div>

            <div className="scoreRows">
              {highScores.length === 0 ? (
                <div className="emptyScores">
                  NO RECORDS YET
                  <span>Complete your first race.</span>
                </div>
              ) : (
                highScores.slice(0, 10).map((score, index) => (
                  <div className="scoreRow" key={`${score.name}-${index}`}>
                    <span className="rank">
                      #{String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="scoreName">
                      {score.name}
                    </span>

                    <span className="scoreValue">
                      {score.score}
                    </span>
                  </div>
                ))
              )}
            </div>

            {highScores.length > 0 && (
              <button
                className="clearScoresButton"
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

        .showroom {
          --mouse-x: 0px;
          --mouse-y: 0px;
          --mouse-light-x: 50%;
          --mouse-light-y: 50%;

          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 650px;
          overflow: hidden;
          background: #010203;
          color: #eef5ff;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          isolation: isolate;
        }

        .showroomCanvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: -4;
        }

        .mouseLight {
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background:
            radial-gradient(
              circle at var(--mouse-light-x) var(--mouse-light-y),
              rgba(115, 190, 255, 0.075),
              transparent 27%
            );
          mix-blend-mode: screen;
        }

        .showroom::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background:
            linear-gradient(
              rgba(255,255,255,0.018) 1px,
              transparent 1px
            );
          background-size: 100% 4px;
          opacity: 0.12;
        }

        .topBar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 76px;
          padding: 0 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.075);
          background: rgba(2,5,8,0.48);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          z-index: 20;
        }

        .brandBlock,
        .topRight,
        .performanceHeader,
        .creator {
          display: flex;
          align-items: center;
        }

        .brandBlock {
          gap: 13px;
        }

        .brandMark {
          width: 37px;
          height: 37px;
          border: 1px solid rgba(180,220,255,0.55);
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          background: rgba(255,255,255,0.035);
          box-shadow:
            inset 0 0 18px rgba(100,180,255,0.07),
            0 0 20px rgba(70,150,255,0.08);
        }

        .brandName {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.8px;
        }

        .brandSub {
          margin-top: 4px;
          font-size: 8px;
          color: rgba(220,235,250,0.43);
          letter-spacing: 2px;
        }

        .topRight {
          gap: 16px;
          font-size: 8px;
          letter-spacing: 1.8px;
          color: rgba(220,235,250,0.5);
        }

        .statusDot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8fffc1;
          box-shadow: 0 0 12px rgba(100,255,180,0.8);
        }

        .scoresButton {
          height: 35px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          background: rgba(255,255,255,0.035);
          color: rgba(235,245,255,0.8);
          font-size: 8px;
          letter-spacing: 1.4px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .scoresButton:hover {
          border-color: rgba(150,210,255,0.45);
          background: rgba(120,190,255,0.07);
          transform: translateY(-1px);
        }

        .showroomMain {
          position: absolute;
          top: 76px;
          bottom: 56px;
          left: 0;
          right: 0;
          display: grid;
          grid-template-columns: minmax(210px, 255px) 1fr minmax(235px, 285px);
          gap: 18px;
          padding: 20px 28px;
          z-index: 5;
        }

        .glassPanel {
          border: 1px solid rgba(210,235,255,0.11);
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.065),
              rgba(255,255,255,0.018)
            );
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.06),
            0 22px 80px rgba(0,0,0,0.32);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .leftPanel,
        .rightPanel {
          padding: 24px 18px;
          border-radius: 17px;
          overflow: hidden;
        }

        .panelEyebrow {
          color: rgba(155,205,255,0.52);
          font-size: 7px;
          letter-spacing: 2.4px;
          font-weight: 800;
        }

        .leftPanel h2,
        .rightPanel h2 {
          margin: 9px 0 8px;
          font-size: 16px;
          letter-spacing: 1.4px;
          font-weight: 700;
        }

        .panelDescription {
          margin: 0 0 17px;
          color: rgba(225,238,250,0.38);
          font-size: 9px;
          line-height: 1.65;
        }

        .vehicleList {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vehicleOption {
          position: relative;
          width: 100%;
          min-height: 53px;
          padding: 8px 9px;
          display: grid;
          grid-template-columns: 34px 1fr 15px;
          align-items: center;
          gap: 8px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: rgba(255,255,255,0.018);
          color: #e9f3ff;
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.25s ease,
            border 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .vehicleOption:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,0.04);
        }

        .vehicleOption.selected {
          border-color: rgba(135,205,255,0.3);
          background:
            linear-gradient(
              90deg,
              rgba(110,190,255,0.12),
              rgba(255,255,255,0.025)
            );
          box-shadow:
            inset 3px 0 0 rgba(145,215,255,0.85),
            0 10px 25px rgba(0,0,0,0.18);
        }

        .vehicleOptionIcon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255,255,255,0.045);
          font-size: 17px;
        }

        .vehicleOptionText {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vehicleOptionText strong {
          font-size: 9px;
          letter-spacing: 0.9px;
        }

        .vehicleOptionText span {
          font-size: 7px;
          color: rgba(220,235,250,0.35);
          letter-spacing: 0.4px;
        }

        .vehicleArrow {
          color: rgba(200,225,245,0.35);
          font-size: 13px;
        }

        .vehicleOption.selected .vehicleArrow {
          color: #bde5ff;
          text-shadow: 0 0 10px rgba(100,200,255,0.8);
        }

        .panelDivider {
          height: 1px;
          margin: 20px 0;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.11),
            transparent
          );
        }

        .modeSelector {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .modeSelector button {
          min-height: 48px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          background: rgba(255,255,255,0.02);
          color: rgba(220,235,250,0.48);
          cursor: pointer;
          text-align: left;
          padding: 8px;
          transition: 0.25s ease;
        }

        .modeSelector button:hover {
          background: rgba(255,255,255,0.05);
        }

        .modeSelector button.modeActive {
          color: #eaf7ff;
          border-color: rgba(125,205,255,0.28);
          background: rgba(110,190,255,0.08);
        }

        .modeSelector span,
        .modeSelector small {
          display: block;
        }

        .modeSelector span {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .modeSelector small {
          margin-top: 5px;
          font-size: 6px;
          letter-spacing: 1.3px;
          opacity: 0.45;
        }

        /*
         * CENTER
         */

        .vehicleStage {
          position: relative;
          min-width: 0;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.055);
          background:
            radial-gradient(
              ellipse at 50% 56%,
              rgba(90,150,205,0.08),
              transparent 44%
            ),
            rgba(2,5,8,0.18);
          transform:
            perspective(1200px)
            rotateY(var(--mouse-x))
            rotateX(calc(var(--mouse-y) * -0.45));
          transition: transform 0.15s ease-out;
        }

        .stageTopLine {
          position: absolute;
          top: 18px;
          left: 22px;
          right: 22px;
          display: flex;
          justify-content: space-between;
          color: rgba(200,225,245,0.28);
          font-size: 7px;
          letter-spacing: 2px;
        }

        .stageTitle {
          position: absolute;
          top: 46px;
          left: 0;
          right: 0;
          text-align: center;
          z-index: 4;
        }

        .stageSmall {
          color: rgba(155,205,255,0.4);
          font-size: 7px;
          letter-spacing: 2.7px;
          font-weight: 800;
        }

        .stageTitle h1 {
          margin: 7px 0 2px;
          font-size: clamp(25px, 3.1vw, 46px);
          font-weight: 800;
          letter-spacing: 6px;
          line-height: 1;
          color: rgba(245,250,255,0.94);
          text-shadow:
            0 0 30px rgba(140,210,255,0.12);
        }

        .stageTitle h1.pulse {
          animation: titlePulse 0.42s ease;
        }

        .stageTitle p {
          margin: 9px 0 0;
          color: rgba(215,235,250,0.34);
          font-size: 8px;
          letter-spacing: 2px;
        }

        @keyframes titlePulse {
          0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(5px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .vehicleDisplay {
          position: absolute;
          left: 8%;
          right: 8%;
          top: 23%;
          bottom: 22%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform {
          position: absolute;
          left: 50%;
          top: 59%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(145,210,255,0.24);
          transform-origin: center;
        }

        .platformOuter {
          width: 86%;
          height: 31%;
          box-shadow:
            0 0 30px rgba(90,180,255,0.06),
            inset 0 0 25px rgba(90,180,255,0.025);
        }

        .platformMiddle {
          width: 69%;
          height: 24%;
          border-color: rgba(145,210,255,0.17);
        }

        .platformInner {
          width: 52%;
          height: 17%;
          border-color: rgba(145,210,255,0.12);
        }

        .platformLight {
          position: absolute;
          width: 55%;
          height: 12%;
          left: 22.5%;
          top: 58%;
          border-radius: 50%;
          background: rgba(80,170,255,0.08);
          filter: blur(22px);
        }

        .vehicleAnimated {
          position: relative;
          z-index: 3;
          width: min(390px, 65%);
          height: 230px;
          display: grid;
          place-items: center;
          transform:
            translate3d(
              var(--mouse-x),
              var(--mouse-y),
              0
            );
          transition: transform 0.12s ease-out;
        }

        .vehicleAnimated.vehicleEnter {
          animation: vehicleEntrance 0.5s cubic-bezier(.2,.85,.25,1);
        }

        @keyframes vehicleEntrance {
          0% {
            opacity: 0;
            transform:
              translate3d(80px, 15px, 0)
              scale(0.84)
              rotateY(-14deg);
            filter: blur(8px);
          }

          55% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform:
              translate3d(var(--mouse-x), var(--mouse-y), 0)
              scale(1)
              rotateY(0);
            filter: blur(0);
          }
        }

        .reflection {
          position: absolute;
          width: 42%;
          height: 12%;
          bottom: 16%;
          border-radius: 50%;
          background: rgba(180,220,255,0.07);
          filter: blur(18px);
        }

        /*
         * CSS VEHICLES
         */

        .vehicleVisual {
          position: relative;
          width: 230px;
          height: 150px;
          transition: 0.3s ease;
        }

        .vehicleVisual.active {
          filter:
            drop-shadow(0 15px 25px rgba(0,0,0,0.5))
            drop-shadow(0 0 22px rgba(105,190,255,0.12));
        }

        .carGlow {
          position: absolute;
          width: 190px;
          height: 35px;
          left: 20px;
          bottom: 25px;
          border-radius: 50%;
          background: rgba(80,170,255,0.2);
          filter: blur(22px);
        }

        .carBody {
          position: absolute;
          width: 195px;
          height: 52px;
          left: 18px;
          top: 67px;
          border-radius: 45px 70px 18px 18px;
          background:
            linear-gradient(
              160deg,
              #26323c,
              #0b1015 45%,
              #1c2933
            );
          border: 1px solid rgba(220,240,255,0.32);
          box-shadow:
            inset 0 2px 8px rgba(255,255,255,0.15),
            inset 0 -8px 15px rgba(0,0,0,0.45);
        }

        .carRoof {
          position: absolute;
          width: 105px;
          height: 43px;
          left: 48px;
          top: -31px;
          border-radius: 55px 65px 4px 4px;
          background:
            linear-gradient(
              140deg,
              #26343f,
              #080c10
            );
          border: 1px solid rgba(210,235,255,0.28);
          transform: skewX(-8deg);
        }

        .carWindow {
          position: absolute;
          top: -25px;
          width: 42px;
          height: 26px;
          background:
            linear-gradient(
              135deg,
              rgba(115,175,220,0.42),
              rgba(8,15,21,0.9)
            );
          border: 1px solid rgba(200,230,255,0.18);
          z-index: 2;
        }

        .carWindowLeft {
          left: 58px;
          transform: skewX(-12deg);
        }

        .carWindowRight {
          left: 103px;
          transform: skewX(-12deg);
        }

        .carWheel {
          position: absolute;
          top: 102px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              #52616d 0 18%,
              #10151a 20% 52%,
              #020304 54%
            );
          border: 2px solid #151e25;
          box-shadow: 0 3px 9px rgba(0,0,0,0.7);
          z-index: 4;
        }

        .carWheelLeft {
          left: 42px;
        }

        .carWheelRight {
          right: 35px;
        }

        .carHeadlight {
          position: absolute;
          top: 82px;
          width: 17px;
          height: 5px;
          border-radius: 8px;
          background: #c9efff;
          box-shadow: 0 0 14px rgba(140,220,255,0.9);
          z-index: 5;
        }

        .carHeadlightLeft {
          left: 15px;
          transform: rotate(-9deg);
        }

        .carHeadlightRight {
          right: 10px;
          transform: rotate(8deg);
        }

        .carLine {
          position: absolute;
          left: 35px;
          right: 25px;
          top: 17px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(190,225,255,0.42),
            transparent
          );
        }

        .truckVisual .carBody {
          width: 185px;
          border-radius: 10px 20px 13px 13px;
        }

        .truckVisual .carRoof {
          width: 78px;
          height: 50px;
          left: 91px;
          top: -38px;
          border-radius: 8px 14px 2px 2px;
        }

        .truckCab {
          position: absolute;
          width: 68px;
          height: 36px;
          left: 112px;
          top: -25px;
          border-radius: 5px;
          border: 1px solid rgba(210,235,255,0.2);
          background: rgba(100,140,170,0.12);
          z-index: 4;
        }

        /*
         * BIKE
         */

        .bikeVisual {
          width: 220px;
          height: 165px;
        }

        .bikeGlow {
          position: absolute;
          width: 150px;
          height: 28px;
          left: 35px;
          top: 105px;
          border-radius: 50%;
          background: rgba(100,190,255,0.24);
          filter: blur(20px);
        }

        .bikeWheel {
          position: absolute;
          width: 52px;
          height: 52px;
          top: 82px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              #677680 0 8%,
              #0a0e12 10% 47%,
              #778792 49% 52%,
              #050709 54%
            );
          border: 2px solid rgba(210,235,255,0.22);
        }

        .wheelLeft {
          left: 31px;
        }

        .wheelRight {
          right: 31px;
        }

        .bikeBody {
          position: absolute;
          width: 105px;
          height: 30px;
          left: 58px;
          top: 69px;
          border-radius: 50% 20% 45% 20%;
          background:
            linear-gradient(
              150deg,
              #42525e,
              #10171d 50%,
              #263944
            );
          border: 1px solid rgba(220,240,255,0.3);
          transform: skewX(-16deg);
        }

        .bikeSeat {
          position: absolute;
          width: 44px;
          height: 9px;
          left: 79px;
          top: 56px;
          border-radius: 8px;
          background: #090d10;
          border: 1px solid rgba(220,235,245,0.2);
          transform: rotate(-7deg);
        }

        .bikeFront {
          position: absolute;
          width: 32px;
          height: 68px;
          right: 47px;
          top: 43px;
          border-right: 4px solid #65747f;
          transform: rotate(12deg);
        }

        .bikeHandle {
          position: absolute;
          width: 34px;
          height: 13px;
          right: 38px;
          top: 37px;
          border-top: 2px solid #9aabb7;
          transform: rotate(-6deg);
        }

        .bikeLight {
          position: absolute;
          width: 13px;
          height: 7px;
          right: 31px;
          top: 46px;
          border-radius: 5px;
          background: #d9f5ff;
          box-shadow: 0 0 16px rgba(140,225,255,1);
        }

        .stageHint {
          position: absolute;
          bottom: 112px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          color: rgba(210,230,245,0.24);
          font-size: 6px;
          letter-spacing: 1.7px;
        }

        .mouseIcon {
          color: rgba(150,215,255,0.6);
        }

        /*
         * CAROUSEL
         */

        .vehicleCarousel {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 20px;
          height: 76px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 9px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 13px;
          background: rgba(2,5,8,0.48);
          backdrop-filter: blur(18px);
          z-index: 5;
        }

        .carouselItems {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
          height: 100%;
        }

        .carouselArrow {
          width: 29px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          color: rgba(230,245,255,0.65);
          font-size: 20px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .carouselArrow:hover {
          background: rgba(100,180,255,0.1);
          color: white;
        }

        .carouselItem {
          position: relative;
          min-width: 0;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: rgba(215,235,250,0.3);
          cursor: pointer;
          overflow: hidden;
          transition: 0.25s ease;
        }

        .carouselItem:hover {
          background: rgba(255,255,255,0.035);
        }

        .carouselItem.active {
          border-color: rgba(145,210,255,0.25);
          background: rgba(110,190,255,0.06);
          color: rgba(235,248,255,0.82);
        }

        .carouselItem .vehicleVisual {
          position: absolute;
          width: 80px;
          height: 50px;
          left: 50%;
          top: 0;
          transform: translateX(-50%) scale(0.34);
          transform-origin: top center;
          opacity: 0.55;
        }

        .carouselItem.active .vehicleVisual {
          opacity: 1;
          transform: translateX(-50%) scale(0.38);
        }

        .carouselItem > span {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 6px;
          font-size: 5px;
          letter-spacing: 0.8px;
        }

        /*
         * RIGHT PANEL
         */

        .performanceHeader {
          justify-content: space-between;
          margin-top: 15px;
          padding: 10px 0 13px;
        }

        .performanceHeader > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .performanceLabel {
          color: rgba(200,225,245,0.32);
          font-size: 6px;
          letter-spacing: 1.5px;
        }

        .performanceHeader strong {
          font-size: 11px;
          letter-spacing: 0.8px;
        }

        .modelCode {
          color: rgba(150,205,255,0.4);
          font-size: 7px;
          letter-spacing: 1px;
        }

        .statList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .statRow {
          display: grid;
          grid-template-columns: 73px 1fr 27px;
          align-items: center;
          gap: 7px;
        }

        .statLabel {
          font-size: 6px;
          letter-spacing: 1.1px;
          color: rgba(220,235,250,0.39);
        }

        .statTrack {
          height: 3px;
          overflow: hidden;
          border-radius: 5px;
          background: rgba(255,255,255,0.08);
        }

        .statFill {
          height: 100%;
          border-radius: 5px;
          background: linear-gradient(
            90deg,
            rgba(100,175,255,0.6),
            rgba(205,240,255,0.95)
          );
          box-shadow: 0 0 8px rgba(100,190,255,0.3);
        }

        .statValue {
          font-size: 6px;
          color: rgba(230,245,255,0.55);
          text-align: right;
        }

        .difficultyList {
          margin-top: 11px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .difficultyOption {
          width: 100%;
          min-height: 43px;
          display: grid;
          grid-template-columns: 27px 1fr 18px;
          align-items: center;
          gap: 7px;
          padding: 6px 7px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: rgba(255,255,255,0.018);
          color: rgba(225,240,250,0.55);
          text-align: left;
          cursor: pointer;
          transition: 0.22s ease;
        }

        .difficultyOption:hover {
          background: rgba(255,255,255,0.04);
        }

        .difficultyOption.active {
          border-color: rgba(130,205,255,0.23);
          background: rgba(105,185,255,0.065);
          color: #eef8ff;
        }

        .difficultyNumber {
          font-size: 6px;
          letter-spacing: 1px;
          color: rgba(155,210,255,0.35);
        }

        .difficultyOption div:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .difficultyOption strong {
          font-size: 8px;
          letter-spacing: 0.7px;
        }

        .difficultyOption span {
          font-size: 6px;
          color: rgba(220,235,250,0.3);
        }

        .difficultyCheck {
          font-size: 10px;
          color: #bdeaff;
          text-align: center;
        }

        .startButton {
          position: relative;
          width: 100%;
          height: 52px;
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border: 1px solid rgba(175,225,255,0.42);
          border-radius: 11px;
          background:
            linear-gradient(
              105deg,
              rgba(130,205,255,0.15),
              rgba(255,255,255,0.045)
            );
          color: #f4fbff;
          cursor: pointer;
          overflow: hidden;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 30px rgba(80,175,255,0.07);
          transition: 0.25s ease;
        }

        .startButton::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -100%;
          width: 60%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.16),
            transparent
          );
          transform: skewX(-20deg);
          transition: 0.6s ease;
        }

        .startButton:hover {
          transform: translateY(-2px);
          border-color: rgba(190,235,255,0.8);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 0 32px rgba(80,175,255,0.17);
        }

        .startButton:hover::before {
          left: 140%;
        }

        .startButton span {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .startButton strong {
          font-size: 18px;
          font-weight: 400;
        }

        /*
         * FOOTER
         */

        .bottomBar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 56px;
          padding: 0 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.055);
          background: rgba(2,5,8,0.42);
          backdrop-filter: blur(18px);
          z-index: 20;
          color: rgba(210,230,245,0.24);
          font-size: 6px;
          letter-spacing: 1.7px;
        }

        .bottomBar > div:first-child,
        .bottomBar > div:last-child {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .footerLine {
          display: block;
          width: 25px;
          height: 1px;
          background: rgba(170,215,245,0.25);
        }

        .creator strong {
          margin-left: 4px;
          color: rgba(225,240,250,0.55);
          font-weight: 700;
        }

        /*
         * RECORDS MODAL
         */

        .scoresOverlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0,0,0,0.68);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }

        .scoresModal {
          width: min(500px, 100%);
          max-height: 80vh;
          overflow: auto;
          padding: 25px;
          border: 1px solid rgba(190,225,255,0.15);
          border-radius: 17px;
          background:
            linear-gradient(
              145deg,
              rgba(22,30,38,0.93),
              rgba(5,8,11,0.95)
            );
          box-shadow:
            0 40px 100px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modalHeader h2 {
          margin: 7px 0 0;
          font-size: 17px;
          letter-spacing: 1.5px;
        }

        .closeButton {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          color: rgba(235,245,255,0.65);
          font-size: 18px;
          cursor: pointer;
        }

        .scoreRows {
          margin-top: 22px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .scoreRow {
          min-height: 43px;
          display: grid;
          grid-template-columns: 48px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
        }

        .rank {
          color: rgba(150,205,255,0.4);
          font-size: 8px;
        }

        .scoreName {
          font-size: 9px;
          letter-spacing: 0.8px;
        }

        .scoreValue {
          font-size: 10px;
          font-weight: 800;
          color: rgba(220,242,255,0.8);
        }

        .emptyScores {
          padding: 45px 20px;
          text-align: center;
          color: rgba(220,235,250,0.4);
          font-size: 10px;
          letter-spacing: 2px;
        }

        .emptyScores span {
          display: block;
          margin-top: 8px;
          color: rgba(220,235,250,0.22);
          font-size: 7px;
          letter-spacing: 1px;
        }

        .clearScoresButton {
          margin-top: 16px;
          height: 38px;
          padding: 0 13px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
          color: rgba(220,235,250,0.42);
          font-size: 7px;
          letter-spacing: 1.5px;
          cursor: pointer;
        }

        .clearScoresButton:hover {
          color: #fff;
          background: rgba(255,80,80,0.07);
          border-color: rgba(255,100,100,0.2);
        }

        /*
         * RESPONSIVE
         */

        @media (max-width: 1050px) {
          .showroomMain {
            grid-template-columns: 205px 1fr 225px;
            gap: 10px;
            padding: 15px;
          }

          .leftPanel,
          .rightPanel {
            padding: 18px 13px;
          }

          .vehicleCarousel {
            left: 5%;
            right: 5%;
          }

          .vehicleDisplay {
            left: 2%;
            right: 2%;
          }
        }

        @media (max-width: 820px) {
          .showroom {
            min-height: 760px;
            overflow-y: auto;
          }

          .topBar {
            padding: 0 15px;
          }

          .topRight > span,
          .statusDot {
            display: none;
          }

          .showroomMain {
            position: relative;
            top: 76px;
            bottom: auto;
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 132px);
            padding: 12px;
            overflow-y: auto;
          }

          .leftPanel,
          .rightPanel {
            flex-shrink: 0;
          }

          .leftPanel {
            order: 2;
          }

          .vehicleStage {
            order: 1;
            min-height: 520px;
          }

          .rightPanel {
            order: 3;
          }

          .bottomBar {
            position: relative;
            top: 76px;
            height: 50px;
            padding: 0 15px;
          }

          .creator {
            font-size: 5px;
          }

          .vehicleList {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .modeSelector {
            max-width: 400px;
          }
        }

        @media (max-width: 500px) {
          .brandName {
            font-size: 9px;
            letter-spacing: 1.8px;
          }

          .brandSub {
            font-size: 6px;
          }

          .brandMark {
            width: 31px;
            height: 31px;
          }

          .scoresButton {
            padding: 0 9px;
          }

          .vehicleStage {
            min-height: 470px;
          }

          .stageTitle h1 {
            font-size: 24px;
            letter-spacing: 3px;
          }

          .vehicleAnimated {
            transform: scale(0.82);
          }

          .vehicleCarousel {
            left: 3%;
            right: 3%;
          }

          .carouselArrow {
            display: none;
          }

          .carouselItems {
            gap: 2px;
          }

          .bottomBar > div:first-child,
          .bottomBar > div:last-child {
            display: none;
          }

          .bottomBar {
            justify-content: center;
          }
        }
      `}</style>
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
    <div className="statRow">
      <span className="statLabel">{label}</span>

      <div className="statTrack">
        <div
          className="statFill"
          style={{ width: `${value}%` }}
        />
      </div>

      <span className="statValue">{value}</span>
    </div>
  );
}
