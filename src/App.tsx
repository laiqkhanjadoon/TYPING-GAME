import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StartScreen from "./StartScreen";
import GameCanvas from "./GameCanvas";

import {
  useGameEngine,
} from "./useGameEngine";

import type {
  HighScoreEntry,
} from "./useHighScores";

import {
  DEFAULT_GAME_SETTINGS,
  type GameSettings,
} from "./gameTypes";

interface FinalStats {
  score: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  maxCombo: number;
  mistakes: number;
  keystrokes: number;
  time: number;
  maxSpeed: number;

  strongKeys: {
    key: string;
    accuracy: number;
  }[];

  weakKeys: {
    key: string;
    accuracy: number;
  }[];
}

const glass =
  "rgba(7,14,21,0.68)";

const glassStrong =
  "rgba(5,12,19,0.84)";

const border =
  "rgba(117,229,247,0.22)";

const borderBright =
  "rgba(117,229,247,0.42)";

const cyan =
  "#72f3ff";

const cyanSoft =
  "#3ab7cc";

const white =
  "#eafcff";

const muted =
  "rgba(219,243,248,0.52)";

const red =
  "#ff5268";

const green =
  "#5dffbd";

const orange =
  "#ffb45b";

function GlassPanel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, rgba(15,29,39,0.78), rgba(3,10,16,0.72))",
        border:
          `1px solid ${border}`,
        boxShadow:
          "0 18px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.035), 0 0 30px rgba(58,183,204,0.045)",
        backdropFilter:
          "blur(18px) saturate(135%)",
        WebkitBackdropFilter:
          "blur(18px) saturate(135%)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TinyLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.19em",
        textTransform: "uppercase",
        color: muted,
        fontWeight: 700,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  accent = cyan,
  suffix,
}: {
  label: string;
  value: string | number;
  accent?: string;
  suffix?: string;
}) {
  return (
    <div
      style={{
        minWidth: 76,
      }}
    >
      <TinyLabel>
        {label}
      </TinyLabel>

      <div
        style={{
          marginTop: 4,
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          color: white,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: accent,
            textShadow:
              `0 0 16px ${accent}33`,
          }}
        >
          {value}
        </span>

        {suffix && (
          <span
            style={{
              fontSize: 8,
              color: muted,
              letterSpacing:
                "0.1em",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 28,
        background:
          "linear-gradient(to bottom, transparent, rgba(130,225,240,0.28), transparent)",
      }}
    />
  );
}

function getVehicleName(
  vehicle: string
) {
  switch (vehicle) {
    case "sports-car":
      return "SPORTS CAR";

    case "supercar":
      return "SUPERCAR";

    case "truck":
      return "TRUCK";

    default:
      return "BIKE";
  }
}

function getVehicleIcon(
  vehicle: string
) {
  switch (vehicle) {
    case "sports-car":
      return "▰";

    case "supercar":
      return "◆";

    case "truck":
      return "▣";

    default:
      return "◇";
  }
}

export default function App() {
  const [
    gameSettings,
    setGameSettings,
  ] =
    useState<GameSettings>(
      DEFAULT_GAME_SETTINGS
    );

  const [
    gameStarted,
    setGameStarted,
  ] =
    useState(false);

  const [
    highScores,
    setHighScores,
  ] =
    useState<HighScoreEntry[]>(
      []
    );

  const [
    finalStats,
    setFinalStats,
  ] =
    useState<FinalStats | null>(
      null
    );

  const [
    dimensions,
    setDimensions,
  ] =
    useState({
      width:
        window.innerWidth,
      height:
        window.innerHeight,
    });

  const {
    state,
    startGame,
    togglePause,
    handleKeyInput,
  } =
    useGameEngine();

  /*
   * ==========================================================
   * RESIZE
   * ==========================================================
   */

  useEffect(() => {
    const resize =
      () => {
        setDimensions({
          width:
            window.innerWidth,
          height:
            window.innerHeight,
        });
      };

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  /*
   * ==========================================================
   * START GAME
   * ==========================================================
   */

  useEffect(() => {
    if (
      gameStarted
    ) {
      startGame(
        gameSettings
      );
    }
  }, [
    gameStarted,
    startGame,
  ]);

  /*
   * ==========================================================
   * KEYBOARD
   * ==========================================================
   */

  useEffect(() => {
    if (
      !gameStarted
    ) {
      return;
    }

    const keyDown =
      (
        event: KeyboardEvent
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          togglePause();
          return;
        }

        if (
          state.paused ||
          state.gameOver
        ) {
          return;
        }

        handleKeyInput(
          event.key
        );
      };

    window.addEventListener(
      "keydown",
      keyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        keyDown
      );
    };
  }, [
    gameStarted,
    state.paused,
    state.gameOver,
    handleKeyInput,
    togglePause,
  ]);

  /*
   * ==========================================================
   * FINAL STATISTICS
   * ==========================================================
   */

  useEffect(() => {
    if (
      !gameStarted ||
      !state.gameOver
    ) {
      return;
    }

    const minutes =
      Math.max(
        state.elapsedTime /
          60,
        1 / 60
      );

    const wpm =
      Math.round(
        state.correctKeystrokes /
          5 /
          minutes
      );

    const cpm =
      Math.round(
        state.correctKeystrokes /
          minutes
      );

    const accuracy =
      state.totalKeystrokes >
      0
        ? Math.round(
            (state.correctKeystrokes /
              state.totalKeystrokes) *
              100
          )
        : 0;

    const keyEntries =
      Object.entries(
        state.keyStats
      ).map(
        ([
          key,
          stats,
        ]) => {
          const total =
            stats.correct +
            stats.wrong;

          const keyAccuracy =
            total > 0
              ? Math.round(
                  (stats.correct /
                    total) *
                    100
                )
              : 0;

          return {
            key,
            ...stats,
            total,
            accuracy:
              keyAccuracy,
          };
        }
      );

    const strongKeys =
      [...keyEntries]
        .sort(
          (a, b) =>
            b.accuracy -
            a.accuracy
        )
        .filter(
          (x) =>
            x.total >= 2
        )
        .slice(0, 5)
        .map(
          (x) => ({
            key: x.key,
            accuracy:
              x.accuracy,
          })
        );

    const weakKeys =
      [...keyEntries]
        .sort(
          (a, b) =>
            a.accuracy -
            b.accuracy
        )
        .filter(
          (x) =>
            x.total >= 1
        )
        .slice(0, 5)
        .map(
          (x) => ({
            key: x.key,
            accuracy:
              x.accuracy,
          })
        );

    setFinalStats({
      score:
        state.score,

      wpm,

      cpm,

      accuracy,

      maxCombo:
        state.maxCombo,

      mistakes:
        state.mistakes,

      keystrokes:
        state.totalKeystrokes,

      time:
        Math.round(
          state.elapsedTime
        ),

      /*
       * IMPORTANT:
       * Use maxSpeed, NOT current bikeSpeed.
       */
      maxSpeed:
        Math.round(
          state.maxSpeed
        ),

      strongKeys,

      weakKeys,
    });
  }, [
    gameStarted,
    state.gameOver,
  ]);

  /*
   * ==========================================================
   * START
   * ==========================================================
   */

  const handleStart =
    (
      settings: GameSettings
    ) => {
      setGameSettings(
        settings
      );

      setFinalStats(
        null
      );

      setGameStarted(
        true
      );
    };

  /*
   * ==========================================================
   * MAIN MENU
   * ==========================================================
   */

  const handleMenu =
    () => {
      setGameStarted(
        false
      );

      setFinalStats(
        null
      );
    };

  /*
   * ==========================================================
   * LIVE METRICS
   * ==========================================================
   */

  const liveMinutes =
    Math.max(
      state.elapsedTime /
        60,
      1 / 60
    );

  const liveWpm =
    Math.round(
      state.correctKeystrokes /
        5 /
        liveMinutes
    );

  const liveCpm =
    Math.round(
      state.correctKeystrokes /
        liveMinutes
    );

  const liveAccuracy =
    state.totalKeystrokes >
    0
      ? Math.round(
          (state.correctKeystrokes /
            state.totalKeystrokes) *
            100
        )
      : 100;

  const healthPercent =
    state.maxHealth >
    0
      ? Math.max(
          0,
          Math.min(
            100,
            (state.health /
              state.maxHealth) *
              100
          )
        )
      : 0;

  const comboPercent =
    Math.min(
      100,
      state.combo *
        10
    );

  const vehicleName =
    getVehicleName(
      state.vehicle
    );

  const vehicleIcon =
    getVehicleIcon(
      state.vehicle
    );

  /*
   * ==========================================================
   * KEY ANALYSIS
   * ==========================================================
   */

  const keyEntries =
    useMemo(
      () =>
        Object.entries(
          state.keyStats
        )
          .map(
            ([
              key,
              stats,
            ]) => {
              const total =
                stats.correct +
                stats.wrong;

              const accuracy =
                total > 0
                  ? Math.round(
                      (stats.correct /
                        total) *
                        100
                    )
                  : 0;

              return {
                key,
                ...stats,
                total,
                accuracy,
              };
            }
          ),
      [state.keyStats]
    );

  const strongKeys =
    [...keyEntries]
      .sort(
        (a, b) =>
          b.accuracy -
          a.accuracy
      )
      .filter(
        (x) =>
          x.total >= 2
      )
      .slice(0, 5);

  const weakKeys =
    [...keyEntries]
      .sort(
        (a, b) =>
          a.accuracy -
          b.accuracy
      )
      .filter(
        (x) =>
          x.total >= 1
      )
      .slice(0, 5);

  /*
   * ==========================================================
   * START SCREEN
   * ==========================================================
   */

  if (
    !gameStarted
  ) {
    return (
      <StartScreen
        onStart={
          handleStart
        }
        highScores={
          highScores
        }
        onClearScores={() =>
          setHighScores(
            []
          )
        }
      />
    );
  }

  /*
   * ==========================================================
   * GAME
   * ==========================================================
   */

  return (
    <div
      style={{
        width:
          "100vw",
        height:
          "100vh",
        overflow:
          "hidden",
        position:
          "relative",
        background:
          "#030609",
        color:
          white,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <GameCanvas
        state={
          state
        }
        width={
          dimensions.width
        }
        height={
          dimensions.height
        }
      />

      {/* ======================================================
          TOP LEFT IDENTITY
      ====================================================== */}

      {!state.gameOver && (
        <GlassPanel
          style={{
            position:
              "fixed",
            top: 18,
            left: 18,
            zIndex: 100,
            borderRadius:
              13,
            padding:
              "10px 14px",
            display:
              "flex",
            alignItems:
              "center",
            gap: 11,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius:
                9,
              display:
                "grid",
              placeItems:
                "center",
              color:
                cyan,
              border:
                `1px solid ${borderBright}`,
              background:
                "rgba(92,224,242,0.06)",
              boxShadow:
                "0 0 20px rgba(90,225,245,0.08)",
              fontSize:
                15,
              fontWeight:
                900,
            }}
          >
            M
          </div>

          <div>
            <div
              style={{
                fontSize:
                  10,
                letterSpacing:
                  "0.2em",
                fontWeight:
                  800,
              }}
            >
              MOTO TYPE
            </div>

            <div
              style={{
                marginTop:
                  2,
                fontSize:
                  8,
                color:
                  muted,
                letterSpacing:
                  "0.18em",
                fontFamily:
                  "ui-monospace, monospace",
              }}
            >
              RACING SYSTEM
            </div>
          </div>
        </GlassPanel>
      )}

      {/* ======================================================
          TOP CENTER COCKPIT
      ====================================================== */}

      {!state.gameOver && (
        <GlassPanel
          style={{
            position:
              "fixed",
            top: 18,
            left:
              "50%",
            transform:
              "translateX(-50%)",
            zIndex: 100,
            borderRadius:
              18,
            padding:
              "10px 17px",
            display:
              "flex",
            alignItems:
              "center",
            gap: 17,
            minWidth:
              "min(670px, 68vw)",
            justifyContent:
              "center",
          }}
        >
          <Metric
            label="WPM"
            value={
              liveWpm
            }
          />

          <Divider />

          <Metric
            label="CPM"
            value={
              liveCpm
            }
          />

          <Divider />

          <Metric
            label="ACCURACY"
            value={`${liveAccuracy}%`}
            accent={
              liveAccuracy >=
              95
                ? green
                : liveAccuracy >=
                    80
                  ? orange
                  : red
            }
          />

          <Divider />

          <Metric
            label="SCORE"
            value={
              state.score
            }
          />

          <Divider />

          <Metric
            label="LEVEL"
            value={
              String(
                state.level
              ).padStart(
                2,
                "0"
              )
            }
          />

          <Divider />

          <Metric
            label="VEHICLE"
            value={
              vehicleIcon
            }
            suffix={
              vehicleName
            }
          />
        </GlassPanel>
      )}

      {/* ======================================================
          SPEEDOMETER
      ====================================================== */}

      {!state.gameOver && (
        <GlassPanel
          style={{
            position:
              "fixed",
            top: 18,
            right: 18,
            zIndex: 100,
            width: 150,
            borderRadius:
              18,
            padding:
              "13px 15px 14px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <TinyLabel>
              VELOCITY
            </TinyLabel>

            <span
              style={{
                width: 6,
                height: 6,
                borderRadius:
                  "50%",
                background:
                  state.boostActive
                    ? orange
                    : cyan,
                boxShadow:
                  state.boostActive
                    ? `0 0 12px ${orange}`
                    : `0 0 12px ${cyan}`,
              }}
            />
          </div>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "baseline",
              gap: 6,
              marginTop:
                3,
            }}
          >
            <span
              style={{
                fontSize:
                  34,
                lineHeight:
                  1,
                fontWeight:
                  850,
                letterSpacing:
                  "-0.05em",
                color:
                  state.boostActive
                    ? orange
                    : cyan,
                fontFamily:
                  "ui-monospace, monospace",
                textShadow:
                  state.boostActive
                    ? `0 0 22px ${orange}44`
                    : `0 0 22px ${cyan}33`,
              }}
            >
              {Math.round(
                state.bikeSpeed
              )}
            </span>

            <span
              style={{
                fontSize:
                  8,
                color:
                  muted,
                letterSpacing:
                  "0.13em",
              }}
            >
              KM/H
            </span>
          </div>

          {/* Speed scale */}
          <div
            style={{
              position:
                "relative",
              height: 20,
              marginTop:
                9,
            }}
          >
            <div
              style={{
                position:
                  "absolute",
                left: 0,
                right: 0,
                top: 8,
                height: 2,
                background:
                  "rgba(255,255,255,0.08)",
                borderRadius:
                  99,
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                left: 0,
                top: 8,
                height: 2,
                width:
                  `${Math.min(
                    100,
                    (state.bikeSpeed /
                      280) *
                      100
                  )}%`,
                background:
                  state.boostActive
                    ? orange
                    : cyan,
                boxShadow:
                  state.boostActive
                    ? `0 0 10px ${orange}`
                    : `0 0 10px ${cyan}`,
                borderRadius:
                  99,
                transition:
                  "width 80ms linear",
              }}
            />

            {[
              0,
              25,
              50,
              75,
              100,
            ].map(
              (
                value
              ) => (
                <div
                  key={
                    value
                  }
                  style={{
                    position:
                      "absolute",
                    left:
                      `${value}%`,
                    top: 5,
                    width: 1,
                    height: 8,
                    background:
                      "rgba(210,245,250,0.25)",
                  }}
                />
              )
            )}
          </div>

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              marginTop:
                -2,
              fontSize:
                7,
              color:
                muted,
                fontFamily:
                  "ui-monospace, monospace",
            }}
          >
            <span>
              0
            </span>

            <span>
              140
            </span>

            <span>
              280
            </span>
          </div>
        </GlassPanel>
      )}

      {/* ======================================================
          LEFT LOWER SYSTEM PANEL
      ====================================================== */}

      {!state.gameOver && (
        <GlassPanel
          style={{
            position:
              "fixed",
            left: 18,
            bottom: 18,
            zIndex: 100,
            width:
              180,
            borderRadius:
              15,
            padding:
              "13px 14px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
            }}
          >
            <TinyLabel>
              SYSTEM
            </TinyLabel>

            <span
              style={{
                fontSize:
                  8,
                color:
                  green,
                letterSpacing:
                  "0.12em",
              }}
            >
              ONLINE
            </span>
          </div>

          {/* Health */}
          <div
            style={{
              marginTop:
                11,
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >
              <span
                style={{
                  fontSize:
                    8,
                  color:
                    muted,
                  letterSpacing:
                    "0.12em",
                }}
              >
                INTEGRITY
              </span>

              <span
                style={{
                  fontSize:
                    9,
                  color:
                    healthPercent >
                    55
                      ? green
                      : healthPercent >
                          25
                        ? orange
                        : red,
                  fontFamily:
                    "ui-monospace, monospace",
                }}
              >
                {Math.round(
                  healthPercent
                )}
                %
              </span>
            </div>

            <div
              style={{
                height: 4,
                marginTop:
                  7,
                borderRadius:
                  99,
                background:
                  "rgba(255,255,255,0.07)",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  height:
                    "100%",
                  width:
                    `${healthPercent}%`,
                  background:
                    healthPercent >
                    55
                      ? green
                      : healthPercent >
                          25
                        ? orange
                        : red,
                  boxShadow:
                    "0 0 10px currentColor",
                  transition:
                    "width 160ms ease",
                }}
              />
            </div>
          </div>

          {/* Lives */}
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              marginTop:
                13,
            }}
          >
            <span
              style={{
                fontSize:
                  8,
                color:
                  muted,
                letterSpacing:
                  "0.12em",
              }}
            >
              LIVES
            </span>

            <div
              style={{
                display:
                  "flex",
                gap: 5,
              }}
            >
              {Array.from({
                length:
                  state.maxLives,
              }).map(
                (
                  _,
                  index
                ) => {
                  const alive =
                    index <
                    state.lives;

                  return (
                    <div
                      key={
                        index
                      }
                      style={{
                        width:
                          19,
                        height:
                          5,
                        borderRadius:
                          99,
                        background:
                          alive
                            ? red
                            : "rgba(255,255,255,0.08)",
                        boxShadow:
                          alive
                            ? `0 0 9px ${red}66`
                            : "none",
                      }}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Combo */}
          <div
            style={{
              marginTop:
                13,
              paddingTop:
                10,
              borderTop:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "baseline",
              }}
            >
              <span
                style={{
                  fontSize:
                    8,
                  color:
                    muted,
                  letterSpacing:
                    "0.12em",
                }}
              >
                COMBO
              </span>

              <span
                style={{
                  fontSize:
                    18,
                  fontWeight:
                    800,
                  color:
                    state.combo >
                    0
                      ? cyan
                      : muted,
                  fontFamily:
                    "ui-monospace, monospace",
                }}
              >
                x{state.combo}
              </span>
            </div>

            <div
              style={{
                height: 2,
                marginTop:
                  7,
                borderRadius:
                  99,
                background:
                  "rgba(255,255,255,0.06)",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  height:
                    "100%",
                  width:
                    `${comboPercent}%`,
                  background:
                    cyan,
                  boxShadow:
                    `0 0 10px ${cyan}`,
                  transition:
                    "width 100ms ease",
                }}
              />
            </div>
          </div>
        </GlassPanel>
      )}

      {/* ======================================================
          RIGHT LOWER TELEMETRY
      ====================================================== */}

      {!state.gameOver && (
        <GlassPanel
          style={{
            position:
              "fixed",
            right: 18,
            bottom: 18,
            zIndex: 100,
            width:
              180,
            borderRadius:
              15,
            padding:
              "13px 14px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >
            <TinyLabel>
              RACE TELEMETRY
            </TinyLabel>

            <span
              style={{
                fontSize:
                  8,
                color:
                  cyan,
                fontFamily:
                  "ui-monospace, monospace",
              }}
            >
              0{state.level}
            </span>
          </div>

          <div
            style={{
              marginTop:
                12,
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap:
                "11px 16px",
            }}
          >
            <Metric
              label="SCORE"
              value={
                state.score
              }
            />

            <Metric
              label="COMBO"
              value={
                `x${state.combo}`
              }
            />

            <Metric
              label="WPM"
              value={
                liveWpm
              }
            />

            <Metric
              label="ACC"
              value={`${liveAccuracy}%`}
            />
          </div>
        </GlassPanel>
      )}

      {/* ======================================================
          PREMIUM TYPING TARGET
      ====================================================== */}

      {!state.gameOver &&
        !state.paused &&
        state.typingMode ===
          "word" && (
          <div
            style={{
              position:
                "fixed",
              left:
                "50%",
              bottom:
                44,
              transform:
                "translateX(-50%)",
              zIndex: 110,
              width:
                "min(520px, 72vw)",
            }}
          >
            <GlassPanel
              style={{
                position:
                  "relative",
                borderRadius:
                  19,
                padding:
                  "14px 20px 16px",
                textAlign:
                  "center",
                overflow:
                  "hidden",
              }}
            >
              {/* top line */}
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    10,
                }}
              >
                <TinyLabel>
                  CURRENT TARGET
                </TinyLabel>

                <span
                  style={{
                    fontSize:
                      8,
                    color:
                      muted,
                    fontFamily:
                      "ui-monospace, monospace",
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  TYPE TO ACCELERATE
                </span>
              </div>

              <div
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize:
                    "clamp(23px, 3vw, 35px)",
                  fontWeight:
                    750,
                  letterSpacing:
                    "0.06em",
                  whiteSpace:
                    "nowrap",
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                  textShadow:
                    "0 0 24px rgba(114,243,255,0.12)",
                }}
              >
                <span
                  style={{
                    color:
                      cyan,
                  }}
                >
                  {
                    state.typedText
                  }
                </span>

                <span
                  style={{
                    color:
                      "rgba(225,244,248,0.45)",
                  }}
                >
                  {state.currentWord.slice(
                    state.typedText
                      .length
                  )}
                </span>
              </div>

              {/* progress */}
              <div
                style={{
                  marginTop:
                    13,
                  height: 3,
                  borderRadius:
                    99,
                  background:
                    "rgba(255,255,255,0.06)",
                  overflow:
                    "hidden",
                }}
              >
                <div
                  style={{
                    height:
                      "100%",
                    width:
                      state.currentWord
                        .length >
                      0
                        ? `${
                            Math.min(
                              100,
                              (state.typedText
                                .length /
                                state.currentWord
                                  .length) *
                                100
                            )
                          }%`
                        : "0%",
                    background:
                      cyan,
                    boxShadow:
                      `0 0 13px ${cyan}`,
                    transition:
                      "width 80ms ease",
                  }}
                />
              </div>

              {/* corner accents */}
              <div
                style={{
                  position:
                    "absolute",
                  left: 0,
                  top: 0,
                  width: 28,
                  height: 28,
                  borderTop:
                    `1px solid ${cyan}`,
                  borderLeft:
                    `1px solid ${cyan}`,
                  opacity:
                    0.65,
                }}
              />

              <div
                style={{
                  position:
                    "absolute",
                  right: 0,
                  bottom: 0,
                  width: 28,
                  height: 28,
                  borderRight:
                    `1px solid ${cyan}`,
                  borderBottom:
                    `1px solid ${cyan}`,
                  opacity:
                    0.65,
                }}
              />
            </GlassPanel>
          </div>
        )}

      {/* ======================================================
          PREMIUM PARAGRAPH TARGET
      ====================================================== */}

      {!state.gameOver &&
        !state.paused &&
        state.typingMode ===
          "paragraph" && (
          <div
            style={{
              position:
                "fixed",
              left:
                "50%",
              bottom:
                30,
              transform:
                "translateX(-50%)",
              width:
                "min(1050px, 82vw)",
              zIndex:
                110,
            }}
          >
            <GlassPanel
              style={{
                borderRadius:
                  19,
                padding:
                  "16px 21px 18px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    10,
                }}
              >
                <TinyLabel>
                  PARAGRAPH TARGET
                </TinyLabel>

                <span
                  style={{
                    fontSize:
                      8,
                    color:
                      cyan,
                    fontFamily:
                      "ui-monospace, monospace",
                  }}
                >
                  {Math.round(
                    state.paragraph.length >
                      0
                      ? (state.paragraphProgress /
                          state.paragraph
                            .length) *
                          100
                      : 0
                  )}
                  %
                </span>
              </div>

              <div
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize:
                    "clamp(12px, 1.2vw, 16px)",
                  lineHeight:
                    1.75,
                  maxHeight:
                    112,
                  overflow:
                    "hidden",
                }}
              >
                <span
                  style={{
                    color:
                      cyan,
                  }}
                >
                  {state.paragraph.slice(
                    0,
                    state.paragraphProgress
                  )}
                </span>

                <span
                  style={{
                    color:
                      "rgba(226,245,249,0.38)",
                  }}
                >
                  {state.paragraph.slice(
                    state.paragraphProgress
                  )}
                </span>
              </div>

              <div
                style={{
                  height: 3,
                  marginTop:
                    11,
                  background:
                    "rgba(255,255,255,0.06)",
                  borderRadius:
                    99,
                  overflow:
                    "hidden",
                }}
              >
                <div
                  style={{
                    height:
                      "100%",
                    width:
                      `${
                        state.paragraph
                          .length >
                        0
                          ? Math.min(
                              100,
                              (state.paragraphProgress /
                                state
                                  .paragraph
                                  .length) *
                                100
                            )
                          : 0
                      }%`,
                    background:
                      cyan,
                    boxShadow:
                      `0 0 13px ${cyan}`,
                  }}
                />
              </div>
            </GlassPanel>
          </div>
        )}

      {/* ======================================================
          MENU BUTTON
      ====================================================== */}

      {!state.gameOver && (
        <button
          onClick={
            handleMenu
          }
          style={{
            position:
              "fixed",
            top: 88,
            left: 18,
            zIndex: 120,
            border:
              `1px solid ${border}`,
            borderRadius:
              10,
            background:
              "rgba(5,13,19,0.66)",
            color:
              muted,
            padding:
              "8px 12px",
            fontSize:
              8,
            fontWeight:
              800,
            letterSpacing:
              "0.15em",
            cursor:
              "pointer",
            backdropFilter:
              "blur(12px)",
            transition:
              "all 160ms ease",
          }}
          onMouseEnter={(
            event
          ) => {
            event.currentTarget.style.color =
              cyan;

            event.currentTarget.style.borderColor =
              borderBright;
          }}
          onMouseLeave={(
            event
          ) => {
            event.currentTarget.style.color =
              muted;

            event.currentTarget.style.borderColor =
              border;
          }}
        >
          MAIN MENU
        </button>
      )}

      {/* ======================================================
          PAUSE MENU
      ====================================================== */}

      {state.paused &&
        !state.gameOver && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              zIndex: 500,
              display:
                "grid",
              placeItems:
                "center",
              background:
                "rgba(1,5,9,0.62)",
              backdropFilter:
                "blur(17px)",
            }}
          >
            <GlassPanel
              style={{
                width:
                  "min(470px, 88vw)",
                borderRadius:
                  24,
                padding:
                  "34px 36px",
                textAlign:
                  "center",
                boxShadow:
                  "0 30px 100px rgba(0,0,0,0.65), 0 0 50px rgba(85,223,246,0.08)",
              }}
            >
              <div
                style={{
                  fontSize:
                    9,
                  letterSpacing:
                    "0.25em",
                  color:
                    cyan,
                  fontFamily:
                    "ui-monospace, monospace",
                  fontWeight:
                    800,
                }}
              >
                MOTO TYPE / COCKPIT
              </div>

              <div
                style={{
                  marginTop:
                    13,
                  fontSize:
                    36,
                  fontWeight:
                    800,
                  letterSpacing:
                    "-0.04em",
                }}
              >
                RACE PAUSED
              </div>

              <div
                style={{
                  marginTop:
                    8,
                  color:
                    muted,
                  fontSize:
                    12,
                }}
              >
                Your run is frozen.
                Ready when you are.
              </div>

              <div
                style={{
                  marginTop:
                    25,
                  display:
                    "grid",
                  gap: 9,
                }}
              >
                <button
                  onClick={
                    togglePause
                  }
                  style={{
                    height:
                      48,
                    borderRadius:
                      12,
                    border:
                      `1px solid ${borderBright}`,
                    background:
                      "rgba(104,230,248,0.08)",
                    color:
                      cyan,
                    cursor:
                      "pointer",
                    fontSize:
                      10,
                    fontWeight:
                      800,
                    letterSpacing:
                      "0.16em",
                  }}
                >
                  RESUME RACE
                </button>

                <button
                  onClick={
                    handleMenu
                  }
                  style={{
                    height:
                      44,
                    borderRadius:
                      12,
                    border:
                      "1px solid rgba(255,255,255,0.10)",
                    background:
                      "rgba(255,255,255,0.035)",
                    color:
                      muted,
                    cursor:
                      "pointer",
                    fontSize:
                      9,
                    fontWeight:
                      800,
                    letterSpacing:
                      "0.16em",
                  }}
                >
                  RETURN TO GARAGE
                </button>
              </div>

              <div
                style={{
                  marginTop:
                    18,
                  color:
                    "rgba(220,245,250,0.32)",
                  fontSize:
                    8,
                  letterSpacing:
                    "0.12em",
                  fontFamily:
                    "ui-monospace, monospace",
                }}
              >
                ESC / RESUME
              </div>
            </GlassPanel>
          </div>
        )}

      {/* ======================================================
          GAME OVER
      ====================================================== */}

      {state.gameOver && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 600,
            overflowY:
              "auto",
            padding:
              "30px 18px",
            background:
              "rgba(1,4,8,0.80)",
            backdropFilter:
              "blur(20px)",
          }}
        >
          <div
            style={{
              width:
                "min(1050px, 94vw)",
              margin:
                "0 auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-end",
                justifyContent:
                  "space-between",
                gap: 20,
                marginBottom:
                  18,
              }}
            >
              <div>
                <TinyLabel>
                  SESSION REPORT / NIGHT RUN
                </TinyLabel>

                <h1
                  style={{
                    margin:
                      "8px 0 0",
                    fontSize:
                      "clamp(30px, 5vw, 58px)",
                    lineHeight:
                      0.95,
                    letterSpacing:
                      "-0.055em",
                    fontWeight:
                      850,
                  }}
                >
                  RACE COMPLETE
                </h1>

                <div
                  style={{
                    marginTop:
                      10,
                    color:
                      muted,
                    fontSize:
                      12,
                  }}
                >
                  {vehicleName}
                  {"  /  "}
                  LEVEL{" "}
                  {state.level}
                </div>
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                }}
              >
                <TinyLabel>
                  FINAL SCORE
                </TinyLabel>

                <div
                  style={{
                    marginTop:
                      4,
                    fontSize:
                      32,
                    fontWeight:
                      850,
                    color:
                      cyan,
                    fontFamily:
                      "ui-monospace, monospace",
                    textShadow:
                      `0 0 30px ${cyan}22`,
                  }}
                >
                  {finalStats?.score ??
                    state.score}
                </div>
              </div>
            </div>

            {/* Main report */}
            <GlassPanel
              style={{
                borderRadius:
                  24,
                padding:
                  "20px",
              }}
            >
              {/* Hero metrics */}
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                {[
                  {
                    label:
                      "WPM",
                    value:
                      finalStats?.wpm ??
                      0,
                    accent:
                      cyan,
                  },
                  {
                    label:
                      "ACCURACY",
                    value:
                      `${finalStats?.accuracy ?? 0}%`,
                    accent:
                      green,
                  },
                  {
                    label:
                      "MAX SPEED",
                    value:
                      `${finalStats?.maxSpeed ?? 0}`,
                    suffix:
                      "KM/H",
                    accent:
                      orange,
                  },
                  {
                    label:
                      "MAX COMBO",
                    value:
                      `x${finalStats?.maxCombo ?? 0}`,
                    accent:
                      cyan,
                  },
                ].map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.label
                      }
                      style={{
                        minHeight:
                          105,
                        borderRadius:
                          16,
                        border:
                          "1px solid rgba(255,255,255,0.075)",
                        background:
                          "rgba(255,255,255,0.025)",
                        padding:
                          "18px",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        justifyContent:
                          "center",
                      }}
                    >
                      <TinyLabel>
                        {
                          item.label
                        }
                      </TinyLabel>

                      <div
                        style={{
                          marginTop:
                            8,
                          display:
                            "flex",
                          alignItems:
                            "baseline",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize:
                              29,
                            fontWeight:
                              850,
                            color:
                              item.accent,
                            fontFamily:
                              "ui-monospace, monospace",
                          }}
                        >
                          {
                            item.value
                          }
                        </span>

                        {item.suffix && (
                          <span
                            style={{
                              fontSize:
                                8,
                              color:
                                muted,
                            }}
                          >
                            {
                              item.suffix
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Secondary metrics */}
              <div
                style={{
                  marginTop:
                    10,
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                {[
                  [
                    "CPM",
                    finalStats?.cpm ??
                      0,
                  ],
                  [
                    "MISTAKES",
                    finalStats?.mistakes ??
                      0,
                  ],
                  [
                    "KEYSTROKES",
                    finalStats?.keystrokes ??
                      0,
                  ],
                  [
                    "TIME",
                    `${finalStats?.time ?? 0}s`,
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      key={
                        String(
                          label
                        )
                      }
                      style={{
                        padding:
                          "13px 15px",
                        borderRadius:
                          13,
                        border:
                          "1px solid rgba(255,255,255,0.055)",
                        background:
                          "rgba(255,255,255,0.018)",
                      }}
                    >
                      <TinyLabel>
                        {label}
                      </TinyLabel>

                      <div
                        style={{
                          marginTop:
                            6,
                          color:
                            white,
                          fontSize:
                            18,
                          fontWeight:
                            750,
                          fontFamily:
                            "ui-monospace, monospace",
                        }}
                      >
                        {
                          value
                        }
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Analysis */}
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 10,
                  marginTop:
                    10,
                }}
              >
                {/* Strong */}
                <div
                  style={{
                    padding:
                      "17px",
                    borderRadius:
                      15,
                    border:
                      "1px solid rgba(93,255,189,0.14)",
                    background:
                      "rgba(93,255,189,0.025)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <TinyLabel>
                      STRONG KEYS
                    </TinyLabel>

                    <span
                      style={{
                        fontSize:
                          8,
                        color:
                          green,
                      }}
                    >
                      TOP PERFORMANCE
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop:
                        12,
                      display:
                        "grid",
                      gap: 7,
                    }}
                  >
                    {(
                      finalStats?.strongKeys ??
                      strongKeys
                    ).length ===
                    0 ? (
                      <div
                        style={{
                          color:
                            muted,
                          fontSize:
                            11,
                        }}
                      >
                        Not enough
                        typing data.
                      </div>
                    ) : (
                      (
                        finalStats?.strongKeys ??
                        strongKeys
                      ).map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.key
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              padding:
                                "7px 9px",
                              borderRadius:
                                8,
                              background:
                                "rgba(255,255,255,0.025)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily:
                                  "ui-monospace, monospace",
                                fontWeight:
                                  800,
                                color:
                                  white,
                              }}
                            >
                              {item.key.toUpperCase()}
                            </span>

                            <span
                              style={{
                                color:
                                  green,
                                fontFamily:
                                  "ui-monospace, monospace",
                                fontSize:
                                  10,
                              }}
                            >
                              {
                                item.accuracy
                              }
                              %
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                {/* Weak */}
                <div
                  style={{
                    padding:
                      "17px",
                    borderRadius:
                      15,
                    border:
                      "1px solid rgba(255,82,104,0.14)",
                    background:
                      "rgba(255,82,104,0.025)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <TinyLabel>
                      WEAK KEYS
                    </TinyLabel>

                    <span
                      style={{
                        fontSize:
                          8,
                        color:
                          red,
                      }}
                    >
                      REVIEW
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop:
                        12,
                      display:
                        "grid",
                      gap: 7,
                    }}
                  >
                    {(
                      finalStats?.weakKeys ??
                      weakKeys
                    ).length ===
                    0 ? (
                      <div
                        style={{
                          color:
                            muted,
                          fontSize:
                            11,
                        }}
                      >
                        No weak
                        keys detected.
                      </div>
                    ) : (
                      (
                        finalStats?.weakKeys ??
                        weakKeys
                      ).map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.key
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              padding:
                                "7px 9px",
                              borderRadius:
                                8,
                              background:
                                "rgba(255,255,255,0.025)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily:
                                  "ui-monospace, monospace",
                                fontWeight:
                                  800,
                                color:
                                  white,
                              }}
                            >
                              {item.key.toUpperCase()}
                            </span>

                            <span
                              style={{
                                color:
                                  red,
                                fontFamily:
                                  "ui-monospace, monospace",
                                fontSize:
                                  10,
                              }}
                            >
                              {
                                item.accuracy
                              }
                              %
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom buttons */}
              <div
                style={{
                  marginTop:
                    18,
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: 12,
                  flexWrap:
                    "wrap",
                }}
              >
                <div>
                  <TinyLabel>
                    MOTO TYPE RACER
                  </TinyLabel>

                  <div
                    style={{
                      marginTop:
                        4,
                      color:
                        muted,
                      fontSize:
                        9,
                      fontFamily:
                        "ui-monospace, monospace",
                    }}
                  >
                    SESSION ARCHIVED
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: 9,
                  }}
                >
                  <button
                    onClick={() => {
                      setFinalStats(
                        null
                      );

                      startGame(
                        gameSettings
                      );
                    }}
                    style={{
                      height:
                        44,
                      padding:
                        "0 22px",
                      borderRadius:
                        11,
                      border:
                        `1px solid ${borderBright}`,
                      background:
                        "rgba(103,232,248,0.08)",
                      color:
                        cyan,
                      cursor:
                        "pointer",
                      fontSize:
                        9,
                      fontWeight:
                        800,
                      letterSpacing:
                        "0.15em",
                    }}
                  >
                    RACE AGAIN
                  </button>

                  <button
                    onClick={
                      handleMenu
                    }
                    style={{
                      height:
                        44,
                      padding:
                        "0 22px",
                      borderRadius:
                        11,
                      border:
                        "1px solid rgba(255,255,255,0.11)",
                      background:
                        "rgba(255,255,255,0.035)",
                      color:
                        muted,
                      cursor:
                        "pointer",
                      fontSize:
                        9,
                      fontWeight:
                        800,
                      letterSpacing:
                        "0.15em",
                    }}
                  >
                    MAIN MENU
                  </button>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
