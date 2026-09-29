import { useEffect, useState } from "react";
import StartScreen from "./StartScreen";
import GameCanvas from "./GameCanvas";
import { useGameEngine } from "./useGameEngine";
import type { HighScoreEntry } from "./useHighScores";

import {
  DEFAULT_GAME_SETTINGS,
  type GameSettings,
} from "./gameTypes";

export default function App() {
  const [gameSettings, setGameSettings] =
    useState<GameSettings>(
      DEFAULT_GAME_SETTINGS
    );

  const [gameStarted, setGameStarted] =
    useState(false);

  const [highScores, setHighScores] =
    useState<HighScoreEntry[]>([]);

  const [dimensions, setDimensions] =
    useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

  const {
    state,
    startGame,
    togglePause,
    handleKeyInput,
  } = useGameEngine();

  // ============================================================
  // WINDOW SIZE
  // ============================================================

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // ============================================================
  // START GAME
  // ============================================================

  useEffect(() => {
    if (gameStarted) {
      startGame(gameSettings);
    }
  }, [
    gameStarted,
    startGame,
    gameSettings,
  ]);

  // ============================================================
  // KEYBOARD
  // ============================================================

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      // Prevent browser scrolling
      if (
        event.key === " " ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
      }

      // Escape = pause
      if (event.key === "Escape") {
        togglePause();
        return;
      }

      handleKeyInput(event.key);
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    gameStarted,
    handleKeyInput,
    togglePause,
  ]);

  // ============================================================
  // START BUTTON
  // ============================================================

  const handleStart = (
    settings: GameSettings
  ) => {
    setGameSettings(settings);
    setGameStarted(true);
  };

  // ============================================================
  // MENU
  // ============================================================

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  // ============================================================
  // CLEAR SCORES
  // ============================================================

  const handleClearScores = () => {
    setHighScores([]);
  };

  // ============================================================
  // START SCREEN
  // ============================================================

  if (!gameStarted) {
    return (
      <StartScreen
        onStart={handleStart}
        highScores={highScores}
        onClearScores={
          handleClearScores
        }
      />
    );
  }

  // ============================================================
  // WORD DISPLAY
  // ============================================================

  const renderWord = () => {
    const word =
      state.currentWord || "";

    const typed =
      state.typedText || "";

    return (
      <div
        style={{
          fontSize:
            "clamp(32px, 5vw, 64px)",
          fontWeight: 900,
          letterSpacing: "5px",
          fontFamily:
            "Orbitron, monospace",
          textAlign: "center",
          marginTop: "12px",
          textShadow:
            "0 0 15px rgba(0,255,255,0.7)",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {word
          .split("")
          .map((char, index) => {
            const isTyped =
              index < typed.length;

            const isCurrent =
              index === typed.length;

            let color =
              "rgba(255,255,255,0.45)";

            if (isTyped) {
              color = "#00ff88";
            }

            if (isCurrent) {
              color = "#ffffff";
            }

            return (
              <span
                key={`${char}-${index}`}
                style={{
                  color,
                  textShadow:
                    isCurrent
                      ? "0 0 15px #00ffff"
                      : isTyped
                        ? "0 0 10px #00ff88"
                        : "none",
                }}
              >
                {char}
              </span>
            );
          })}
      </div>
    );
  };

  // ============================================================
  // PARAGRAPH DISPLAY
  // ============================================================

  const renderParagraph = () => {
    const paragraph =
      state.paragraph || "";

    const progress =
      state.paragraphProgress || 0;

    return (
      <div
        style={{
          width: "min(900px, 85vw)",
          maxHeight: "180px",
          overflow: "hidden",
          margin: "18px auto 0",
          padding: "18px 22px",
          borderRadius: "16px",
          background:
            "rgba(0,0,0,0.55)",
          border:
            "1px solid rgba(0,255,255,0.35)",
          boxShadow:
            "0 0 25px rgba(0,255,255,0.12)",
          backdropFilter:
            "blur(12px)",
          fontFamily:
            "Orbitron, monospace",
          fontSize:
            "clamp(14px, 1.6vw, 20px)",
          lineHeight: 1.8,
          textAlign: "left",
          color: "#ffffff",
          userSelect: "none",
        }}
      >
        {paragraph
          .split("")
          .map((char, index) => {
            const typed =
              index < progress;

            const current =
              index === progress;

            return (
              <span
                key={`${char}-${index}`}
                style={{
                  color: typed
                    ? "#00ff88"
                    : current
                      ? "#ffffff"
                      : "rgba(255,255,255,0.35)",
                  textShadow:
                    current
                      ? "0 0 10px #00ffff"
                      : typed
                        ? "0 0 5px #00ff88"
                        : "none",
                }}
              >
                {char}
              </span>
            );
          })}
      </div>
    );
  };

  // ============================================================
  // HEALTH %
  // ============================================================

  const healthPercent =
    Math.max(
      0,
      Math.min(
        100,
        (state.health /
          state.maxHealth) *
          100
      )
    );

  // ============================================================
  // GAME SCREEN
  // ============================================================

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#050510",
      }}
    >
      {/* ======================================================
          GAME CANVAS
      ====================================================== */}

      <GameCanvas
        state={state}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* ======================================================
          TOP LEFT MENU
      ====================================================== */}

      <button
        onClick={
          handleBackToMenu
        }
        style={{
          position: "fixed",
          top: "18px",
          left: "18px",
          zIndex: 100,
          padding: "10px 18px",
          borderRadius: "10px",
          border:
            "1px solid rgba(0,255,255,0.5)",
          background:
            "rgba(0,0,0,0.65)",
          color: "#00ffff",
          cursor: "pointer",
          fontFamily:
            "Orbitron, monospace",
          fontWeight: "bold",
          backdropFilter:
            "blur(10px)",
          boxShadow:
            "0 0 15px rgba(0,255,255,0.15)",
        }}
      >
        ← MENU
      </button>

      {/* ======================================================
          TOP RIGHT SETTINGS
      ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: "18px",
          right: "18px",
          zIndex: 100,
          padding: "10px 16px",
          borderRadius: "10px",
          border:
            "1px solid rgba(0,255,255,0.3)",
          background:
            "rgba(0,0,0,0.65)",
          color: "#ffffff",
          fontFamily:
            "monospace",
          fontSize: "12px",
          backdropFilter:
            "blur(10px)",
        }}
      >
        {state.difficulty.toUpperCase()}
        {" · "}
        {state.typingMode ===
        "word"
          ? "WORD RACE"
          : "PARAGRAPH RACE"}
        {" · "}
        {state.vehicle
          .toUpperCase()
          .replace("-", " ")}
      </div>

      {/* ======================================================
          MAIN HUD
      ====================================================== */}

      <div
        style={{
          position: "fixed",
          top: "70px",
          left: 0,
          right: 0,
          zIndex: 50,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* SCORE / LEVEL / COMBO */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent:
              "center",
          }}
        >
          {/* SCORE */}

          <div
            style={{
              minWidth: "120px",
              padding:
                "9px 16px",
              borderRadius: "12px",
              background:
                "rgba(0,0,0,0.6)",
              border:
                "1px solid rgba(0,255,255,0.3)",
              backdropFilter:
                "blur(10px)",
              textAlign: "center",
              color: "#ffffff",
              fontFamily:
                "Orbitron, monospace",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#00ffff",
                letterSpacing:
                  "2px",
              }}
            >
              SCORE
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
              }}
            >
              {state.score}
            </div>
          </div>

          {/* LEVEL */}

          <div
            style={{
              minWidth: "100px",
              padding:
                "9px 16px",
              borderRadius: "12px",
              background:
                "rgba(0,0,0,0.6)",
              border:
                "1px solid rgba(168,85,247,0.4)",
              backdropFilter:
                "blur(10px)",
              textAlign: "center",
              color: "#ffffff",
              fontFamily:
                "Orbitron, monospace",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#c084fc",
                letterSpacing:
                  "2px",
              }}
            >
              LEVEL
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
              }}
            >
              {state.level}
            </div>
          </div>

          {/* COMBO */}

          <div
            style={{
              minWidth: "110px",
              padding:
                "9px 16px",
              borderRadius: "12px",
              background:
                state.combo >= 5
                  ? "rgba(255,80,0,0.18)"
                  : "rgba(0,0,0,0.6)",
              border:
                state.combo >= 5
                  ? "1px solid rgba(255,100,0,0.6)"
                  : "1px solid rgba(0,255,255,0.3)",
              backdropFilter:
                "blur(10px)",
              textAlign: "center",
              color: "#ffffff",
              fontFamily:
                "Orbitron, monospace",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color:
                  state.combo >= 5
                    ? "#ff6600"
                    : "#00ffff",
                letterSpacing:
                  "2px",
              }}
            >
              COMBO
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
              }}
            >
              x{state.combo}
            </div>
          </div>
        </div>

        {/* ====================================================
            HEALTH
        ==================================================== */}

        <div
          style={{
            width:
              "min(500px, 70vw)",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginBottom: "5px",
              fontFamily:
                "monospace",
              fontSize: "11px",
              color: "#ffffff",
            }}
          >
            <span>
              ENGINE
            </span>

            <span>
              {Math.round(
                healthPercent
              )}
              %
            </span>
          </div>

          <div
            style={{
              height: "8px",
              borderRadius: "20px",
              background:
                "rgba(0,0,0,0.6)",
              border:
                "1px solid rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width:
                  `${healthPercent}%`,
                height: "100%",
                borderRadius:
                  "20px",
                background:
                  healthPercent > 60
                    ? "#00ff88"
                    : healthPercent > 30
                      ? "#ffaa00"
                      : "#ff3333",
                boxShadow:
                  "0 0 12px currentColor",
                transition:
                  "width 0.15s ease",
              }}
            />
          </div>
        </div>

        {/* ====================================================
            LIVES
        ==================================================== */}

        <div
          style={{
            marginTop: "8px",
            color: "#ff5555",
            fontFamily:
              "Orbitron, monospace",
            fontSize: "15px",
            letterSpacing:
              "4px",
            textShadow:
              "0 0 10px rgba(255,0,0,0.5)",
          }}
        >
          {"♥".repeat(
            Math.max(
              0,
              state.lives
            )
          )}
          {"♡".repeat(
            Math.max(
              0,
              state.maxLives -
                state.lives
            )
          )}
        </div>

        {/* ====================================================
            TYPING TARGET
        ==================================================== */}

        {state.typingMode ===
        "word"
          ? renderWord()
          : renderParagraph()}

        {/* Instruction */}

        <div
          style={{
            marginTop: "8px",
            fontFamily:
              "monospace",
            fontSize: "11px",
            color:
              "rgba(255,255,255,0.5)",
          }}
        >
          {state.typingMode ===
          "word"
            ? "TYPE WORD → PRESS SPACE"
            : "TYPE THE PARAGRAPH"}
        </div>
      </div>

      {/* ======================================================
          PAUSE OVERLAY
      ====================================================== */}

      {state.paused &&
        !state.gameOver && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              background:
                "rgba(0,0,20,0.72)",
              backdropFilter:
                "blur(8px)",
            }}
          >
            <div
              style={{
                padding: "40px",
                borderRadius: "20px",
                border:
                  "1px solid rgba(0,255,255,0.4)",
                background:
                  "rgba(5,5,25,0.9)",
                textAlign: "center",
                color: "#ffffff",
                fontFamily:
                  "Orbitron, monospace",
                boxShadow:
                  "0 0 40px rgba(0,255,255,0.15)",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  color: "#00ffff",
                  marginBottom:
                    "12px",
                }}
              >
                PAUSED
              </div>

              <div
                style={{
                  color:
                    "rgba(255,255,255,0.6)",
                }}
              >
                Press ESC to continue
              </div>
            </div>
          </div>
        )}

      {/* ======================================================
          GAME OVER
      ====================================================== */}

      {state.gameOver && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            background:
              "rgba(10,0,20,0.78)",
            backdropFilter:
              "blur(8px)",
          }}
        >
          <div
            style={{
              width:
                "min(450px, 90vw)",
              padding: "38px",
              borderRadius: "22px",
              border:
                "1px solid rgba(255,50,50,0.5)",
              background:
                "rgba(10,5,25,0.94)",
              textAlign: "center",
              color: "#ffffff",
              fontFamily:
                "Orbitron, monospace",
              boxShadow:
                "0 0 50px rgba(255,0,0,0.15)",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                fontWeight: 900,
                color: "#ff3333",
                textShadow:
                  "0 0 20px rgba(255,0,0,0.6)",
              }}
            >
              GAME OVER
            </div>

            <div
              style={{
                marginTop:
                  "24px",
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "15px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#00ffff",
                  }}
                >
                  SCORE
                </div>

                <div
                  style={{
                    fontSize:
                      "24px",
                    fontWeight: 900,
                  }}
                >
                  {state.score}
                </div>
              </div>

              <div
                style={{
                  padding: "15px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#c084fc",
                  }}
                >
                  LEVEL
                </div>

                <div
                  style={{
                    fontSize:
                      "24px",
                    fontWeight: 900,
                  }}
                >
                  {state.level}
                </div>
              </div>

              <div
                style={{
                  padding: "15px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#00ff88",
                  }}
                >
                  MAX COMBO
                </div>

                <div
                  style={{
                    fontSize:
                      "24px",
                    fontWeight: 900,
                  }}
                >
                  x{state.maxCombo}
                </div>
              </div>

              <div
                style={{
                  padding: "15px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#ffaa00",
                  }}
                >
                  ACCURACY
                </div>

                <div
                  style={{
                    fontSize:
                      "24px",
                    fontWeight: 900,
                  }}
                >
                  {state.totalKeystrokes >
                  0
                    ? Math.round(
                        (state.correctKeystrokes /
                          state.totalKeystrokes) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                startGame(
                  gameSettings
                );
              }}
              style={{
                width: "100%",
                marginTop:
                  "24px",
                padding:
                  "14px",
                borderRadius:
                  "12px",
                border:
                  "1px solid #00ffff",
                background:
                  "rgba(0,255,255,0.1)",
                color: "#00ffff",
                fontFamily:
                  "Orbitron, monospace",
                fontWeight: 900,
                cursor: "pointer",
                fontSize:
                  "15px",
              }}
            >
              PLAY AGAIN
            </button>

            <button
              onClick={
                handleBackToMenu
              }
              style={{
                width: "100%",
                marginTop:
                  "10px",
                padding:
                  "12px",
                borderRadius:
                  "12px",
                border:
                  "1px solid rgba(255,255,255,0.2)",
                background:
                  "rgba(255,255,255,0.05)",
                color:
                  "rgba(255,255,255,0.75)",
                fontFamily:
                  "Orbitron, monospace",
                cursor: "pointer",
              }}
            >
              BACK TO MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
