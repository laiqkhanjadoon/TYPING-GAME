import {
  useEffect,
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

  // ==========================================================
  // RESIZE
  // ==========================================================

  useEffect(() => {
    const resize = () => {
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

    return () =>
      window.removeEventListener(
        "resize",
        resize
      );
  }, []);

  // ==========================================================
  // START
  // ==========================================================

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

  // ==========================================================
  // KEYBOARD
  // ==========================================================

  useEffect(() => {
    if (
      !gameStarted
    ) {
      return;
    }

    const keyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        togglePause();
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

    return () =>
      window.removeEventListener(
        "keydown",
        keyDown
      );
  }, [
    gameStarted,
    handleKeyInput,
    togglePause,
  ]);

  // ==========================================================
  // START BUTTON
  // ==========================================================

  const handleStart = (
    settings: GameSettings
  ) => {
    setGameSettings(
      settings
    );

    setGameStarted(
      true
    );
  };

  // ==========================================================
  // MENU
  // ==========================================================

  const handleMenu = () => {
    setGameStarted(
      false
    );
  };

  // ==========================================================
  // SCORE CALCULATIONS
  // ==========================================================

  const minutes =
    Math.max(
      state.elapsedTime /
        60,
      1 / 60
    );

  const wpm = Math.round(
    state.correctKeystrokes /
      5 /
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
      : 100;

  const cpm = Math.round(
    state.correctKeystrokes /
      minutes
  );

  // ==========================================================
  // STRONG / WEAK KEYS
  // ==========================================================

  const keyEntries =
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
      )
      .sort(
        (a, b) =>
          b.accuracy -
          a.accuracy
      );

  const strongKeys =
    keyEntries
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

  // ==========================================================
  // START SCREEN
  // ==========================================================

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

  // ==========================================================
  // MAIN GAME
  // ==========================================================

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position:
          "relative",
        background:
          "#050510",
      }}
    >
      <GameCanvas
        state={state}
        width={
          dimensions.width
        }
        height={
          dimensions.height
        }
      />

      {/* ====================================================
          TOP SPEEDOMETER
      ==================================================== */}

      {!state.gameOver && (
        <div
          style={{
            position:
              "fixed",
            top: "18px",
            left: "50%",
            transform:
              "translateX(-50%)",
            zIndex: 100,
            display:
              "flex",
            alignItems:
              "center",
            gap: "22px",
            padding:
              "10px 22px",
            border:
              "1px solid rgba(0,255,255,0.35)",
            borderRadius:
              "14px",
            background:
              "rgba(0,0,0,0.65)",
            backdropFilter:
              "blur(14px)",
            color: "#fff",
            fontFamily:
              "monospace",
            boxShadow:
              "0 0 25px rgba(0,255,255,0.15)",
          }}
        >
          <div
            style={{
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "28px",
                fontWeight:
                  "bold",
                color:
                  state.bikeSpeed >
                  160
                    ? "#ff6600"
                    : "#00ffff",
              }}
            >
              {Math.round(
                state.bikeSpeed
              )}
            </div>

            <div
              style={{
                fontSize:
                  "10px",
                opacity: 0.7,
              }}
            >
              KM/H
            </div>
          </div>

          <div>
            <div>
              WPM{" "}
              <b>
                {wpm}
              </b>
            </div>

            <div>
              ACC{" "}
              <b>
                {accuracy}%
              </b>
            </div>
          </div>

          <div>
            <div>
              SCORE{" "}
              <b>
                {state.score}
              </b>
            </div>

            <div>
              COMBO{" "}
              <b>
                x{state.combo}
              </b>
            </div>
          </div>

          <div>
            <div>
              LVL{" "}
              <b>
                {state.level}
              </b>
            </div>

            <div>
              ❤️{" "}
              <b>
                {state.lives}
              </b>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MENU BUTTON
      ==================================================== */}

      {!state.gameOver && (
        <button
          onClick={
            handleMenu
          }
          style={{
            position:
              "fixed",
            top: "20px",
            left: "20px",
            zIndex: 100,
            padding:
              "10px 18px",
            border:
              "1px solid rgba(0,255,255,0.4)",
            borderRadius:
              "10px",
            background:
              "rgba(0,0,0,0.65)",
            color:
              "#00ffff",
            cursor:
              "pointer",
            fontFamily:
              "monospace",
            fontWeight:
              "bold",
            backdropFilter:
              "blur(10px)",
          }}
        >
          ← MENU
        </button>
      )}

      {/* ====================================================
          TYPING TARGET
      ==================================================== */}

      {!state.gameOver &&
        state.typingMode ===
          "word" && (
          <div
            style={{
              position:
                "fixed",
              left: "50%",
              bottom:
                "42px",
              transform:
                "translateX(-50%)",
              zIndex: 100,
              padding:
                "14px 30px",
              borderRadius:
                "14px",
              background:
                "rgba(0,0,0,0.65)",
              border:
                "1px solid rgba(0,255,255,0.3)",
              backdropFilter:
                "blur(12px)",
              fontFamily:
                "monospace",
              fontSize:
                "30px",
              fontWeight:
                "bold",
              letterSpacing:
                "3px",
              color:
                "#ffffff",
            }}
          >
            <span
              style={{
                color:
                  "#00ffff",
              }}
            >
              {
                state.typedText
              }
            </span>

            <span
              style={{
                opacity:
                  0.5,
              }}
            >
              {
                state.currentWord.slice(
                  state.typedText
                    .length
                )
              }
            </span>
          </div>
        )}

      {/* ====================================================
          PARAGRAPH
      ==================================================== */}

      {!state.gameOver &&
        state.typingMode ===
          "paragraph" && (
          <div
            style={{
              position:
                "fixed",
              left: "50%",
              bottom:
                "30px",
              transform:
                "translateX(-50%)",
              width:
                "80%",
              maxWidth:
                "1100px",
              zIndex: 100,
              padding:
                "18px 24px",
              borderRadius:
                "14px",
              background:
                "rgba(0,0,0,0.7)",
              border:
                "1px solid rgba(0,255,255,0.3)",
              backdropFilter:
                "blur(12px)",
              fontFamily:
                "monospace",
              fontSize:
                "17px",
              lineHeight:
                "1.7",
              color:
                "#ffffff",
            }}
          >
            <span
              style={{
                color:
                  "#00ffff",
              }}
            >
              {state.paragraph.slice(
                0,
                state.paragraphProgress
              )}
            </span>

            <span
              style={{
                opacity:
                  0.45,
              }}
            >
              {state.paragraph.slice(
                state.paragraphProgress
              )}
            </span>
          </div>
        )}

      {/* ====================================================
          GAME OVER
      ==================================================== */}

      {state.gameOver && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 300,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            background:
              "rgba(2,0,10,0.88)",
            backdropFilter:
              "blur(16px)",
            fontFamily:
              "monospace",
            color:
              "#ffffff",
          }}
        >
          <div
            style={{
              width:
                "min(900px, 92vw)",
              maxHeight:
                "90vh",
              overflow:
                "auto",
              padding:
                "34px",
              border:
                "1px solid rgba(0,255,255,0.35)",
              borderRadius:
                "22px",
              background:
                "linear-gradient(145deg, rgba(15,10,35,0.96), rgba(4,15,30,0.96))",
              boxShadow:
                "0 0 60px rgba(0,255,255,0.15)",
            }}
          >
            <div
              style={{
                textAlign:
                  "center",
                marginBottom:
                  "25px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "42px",
                  fontWeight:
                    "bold",
                  color:
                    "#ff3333",
                  textShadow:
                    "0 0 25px rgba(255,0,0,0.5)",
                }}
              >
                CRASHED
              </div>

              <div
                style={{
                  opacity:
                    0.6,
                  marginTop:
                    "6px",
                }}
              >
                RACE COMPLETE
              </div>
            </div>

            {/* MAIN STATS */}

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                [
                  "SCORE",
                  state.score,
                ],
                [
                  "WPM",
                  wpm,
                ],
                [
                  "CPM",
                  cpm,
                ],
                [
                  "ACCURACY",
                  `${accuracy}%`,
                ],
                [
                  "MAX COMBO",
                  `x${state.maxCombo}`,
                ],
                [
                  "MISTAKES",
                  state.mistakes,
                ],
                [
                  "KEYSTROKES",
                  state.totalKeystrokes,
                ],
                [
                  "TIME",
                  `${Math.round(
                    state.elapsedTime
                  )}s`,
                ],
                [
                  "MAX SPEED",
                  `${Math.round(
                    state.bikeSpeed
                  )} km/h`,
                ],
              ].map(
                (item) => (
                  <div
                    key={
                      String(
                        item[0]
                      )
                    }
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "12px",
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        opacity:
                          0.5,
                        marginBottom:
                          "8px",
                      }}
                    >
                      {item[0]}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "25px",
                        fontWeight:
                          "bold",
                        color:
                          "#00ffff",
                      }}
                    >
                      {item[1]}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* KEY ANALYSIS */}

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "16px",
                marginTop:
                  "20px",
              }}
            >
              <div
                style={{
                  padding:
                    "18px",
                  borderRadius:
                    "14px",
                  background:
                    "rgba(0,255,150,0.05)",
                  border:
                    "1px solid rgba(0,255,150,0.18)",
                }}
              >
                <div
                  style={{
                    color:
                      "#00ff99",
                    fontWeight:
                      "bold",
                    marginBottom:
                      "12px",
                  }}
                >
                  STRONG KEYS
                </div>

                {strongKeys.length ===
                0 ? (
                  <div
                    style={{
                      opacity:
                        0.5,
                    }}
                  >
                    Not enough data
                  </div>
                ) : (
                  strongKeys.map(
                    (key) => (
                      <div
                        key={
                          key.key
                        }
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "5px 0",
                        }}
                      >
                        <b>
                          {key.key.toUpperCase()}
                        </b>

                        <span>
                          {key.accuracy}%
                        </span>
                      </div>
                    )
                  )
                )}
              </div>

              <div
                style={{
                  padding:
                    "18px",
                  borderRadius:
                    "14px",
                  background:
                    "rgba(255,60,60,0.05)",
                  border:
                    "1px solid rgba(255,60,60,0.18)",
                }}
              >
                <div
                  style={{
                    color:
                      "#ff5555",
                    fontWeight:
                      "bold",
                    marginBottom:
                      "12px",
                  }}
                >
                  WEAK KEYS
                </div>

                {weakKeys.length ===
                0 ? (
                  <div
                    style={{
                      opacity:
                        0.5,
                    }}
                  >
                    No weak keys detected
                  </div>
                ) : (
                  weakKeys.map(
                    (key) => (
                      <div
                        key={
                          key.key
                        }
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "5px 0",
                        }}
                      >
                        <b>
                          {key.key.toUpperCase()}
                        </b>

                        <span>
                          {key.accuracy}%
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "center",
                gap: "12px",
                marginTop:
                  "25px",
              }}
            >
              <button
                onClick={() => {
                  startGame(
                    gameSettings
                  );
                }}
                style={{
                  padding:
                    "13px 25px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #00ffff",
                  background:
                    "rgba(0,255,255,0.1)",
                  color:
                    "#00ffff",
                  cursor:
                    "pointer",
                  fontFamily:
                    "monospace",
                  fontWeight:
                    "bold",
                }}
              >
                RACE AGAIN
              </button>

              <button
                onClick={
                  handleMenu
                }
                style={{
                  padding:
                    "13px 25px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid rgba(255,255,255,0.25)",
                  background:
                    "rgba(255,255,255,0.05)",
                  color:
                    "#fff",
                  cursor:
                    "pointer",
                  fontFamily:
                    "monospace",
                  fontWeight:
                    "bold",
                }}
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
