import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_GAME_SETTINGS,
  DIFFICULTY_SETTINGS,
  type GameSettings,
} from "./gameTypes";

import {
  generateWordQueue,
  getWordForLevel,
} from "./words";

export interface Particle {
  x: number;
  y: number;
  size: number;
  life: number;
  color: string;
  type:
    | "smoke"
    | "exhaust"
    | "star"
    | "spark";
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface KeyStat {
  correct: number;
  wrong: number;
}

export interface GameEngineState {
  gameStarted: boolean;
  gameOver: boolean;
  paused: boolean;

  difficulty: GameSettings["difficulty"];
  typingMode: GameSettings["typingMode"];
  vehicle: GameSettings["vehicle"];

  currentWord: string;
  typedText: string;
  wordQueue: string[];
  currentWordIndex: number;

  paragraph: string;
  paragraphProgress: number;

  score: number;
  combo: number;
  maxCombo: number;

  totalKeystrokes: number;
  correctKeystrokes: number;
  mistakes: number;

  lives: number;
  maxLives: number;

  health: number;
  maxHealth: number;

  bikeSpeed: number;
  roadOffset: number;
  bgOffset: number;

  bikeX: number;
  bikeY: number;

  boostActive: boolean;
  level: number;
  shake: number;

  particles: Particle[];
  floatingTexts: FloatingText[];

  startTime: number;
  elapsedTime: number;

  keyStats: Record<string, KeyStat>;
}

const INITIAL_STATE: GameEngineState = {
  gameStarted: false,
  gameOver: false,
  paused: false,

  difficulty: "medium",
  typingMode: "word",
  vehicle: "bike",

  currentWord: "",
  typedText: "",
  wordQueue: [],
  currentWordIndex: 0,

  paragraph: "",
  paragraphProgress: 0,

  score: 0,
  combo: 0,
  maxCombo: 0,

  totalKeystrokes: 0,
  correctKeystrokes: 0,
  mistakes: 0,

  lives: 3,
  maxLives: 3,

  health: 100,
  maxHealth: 100,

  bikeSpeed: 0,
  roadOffset: 0,
  bgOffset: 0,

  bikeX: 0,
  bikeY: 0,

  boostActive: false,
  level: 1,
  shake: 0,

  particles: [],
  floatingTexts: [],

  startTime: 0,
  elapsedTime: 0,

  keyStats: {},
};

function createParagraph(
  level: number,
  count: number
) {
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    words.push(
      getWordForLevel(level)
    );
  }

  return words.join(" ");
}

function createParticles(
  x: number,
  y: number,
  color: string,
  count: number,
  type: Particle["type"]
) {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x:
        x +
        (Math.random() - 0.5) * 35,

      y:
        y +
        (Math.random() - 0.5) * 20,

      size:
        2 +
        Math.random() * 5,

      life:
        0.5 +
        Math.random() * 0.5,

      color,
      type,
    });
  }

  return particles;
}

export function useGameEngine() {
  const [state, setState] =
    useState<GameEngineState>(
      INITIAL_STATE
    );

  const stateRef =
    useRef<GameEngineState>(
      INITIAL_STATE
    );

  const lastTypingTimeRef =
    useRef(0);

  const updateState = (
    next: GameEngineState
  ) => {
    stateRef.current = next;
    return next;
  };

  // ============================================================
  // START GAME
  // ============================================================

  const startGame = useCallback(
    (
      settings: GameSettings =
        DEFAULT_GAME_SETTINGS
    ) => {
      const difficulty =
        DIFFICULTY_SETTINGS[
          settings.difficulty
        ];

      const queue =
        generateWordQueue(
          80,
          1
        );

      const paragraph =
        createParagraph(
          1,
          50
        );

      const now =
        performance.now();

      const newState: GameEngineState = {
        ...INITIAL_STATE,

        gameStarted: true,
        gameOver: false,
        paused: false,

        difficulty:
          settings.difficulty,

        typingMode:
          settings.typingMode,

        vehicle:
          settings.vehicle,

        currentWord:
          queue[0],

        typedText: "",

        wordQueue: queue,

        currentWordIndex: 0,

        paragraph,

        paragraphProgress: 0,

        lives:
          difficulty.lives,

        maxLives:
          difficulty.lives,

        health: 100,
        maxHealth: 100,

        bikeSpeed: 0,

        roadOffset: 0,
        bgOffset: 0,

        bikeX: 0,
        bikeY: 0,

        boostActive: false,
        level: 1,
        shake: 0,

        particles: [],
        floatingTexts: [],

        startTime: now,
        elapsedTime: 0,

        keyStats: {},
      };

      stateRef.current =
        newState;

      lastTypingTimeRef.current =
        now;

      setState(newState);
    },
    []
  );

  // ============================================================
  // PAUSE
  // ============================================================

  const togglePause =
    useCallback(() => {
      setState((prev) => {
        if (
          !prev.gameStarted ||
          prev.gameOver
        ) {
          return prev;
        }

        return updateState({
          ...prev,
          paused: !prev.paused,
        });
      });
    }, []);

  // ============================================================
  // NEXT WORD
  // ============================================================

  const nextWord = (
    prev: GameEngineState
  ) => {
    const nextIndex =
      prev.currentWordIndex + 1;

    let queue =
      prev.wordQueue;

    if (
      nextIndex >=
      queue.length - 10
    ) {
      queue = [
        ...queue,
        ...generateWordQueue(
          30,
          prev.level
        ),
      ];
    }

    const next =
      queue[nextIndex] ??
      getWordForLevel(
        prev.level
      );

    const combo =
      prev.combo + 1;

    const score =
      prev.score +
      100 +
      combo * 10;

    const level =
      Math.max(
        1,
        Math.floor(
          score / 1000
        ) + 1
      );

    return {
      ...prev,

      currentWord: next,
      typedText: "",

      currentWordIndex:
        nextIndex,

      wordQueue: queue,

      score,

      combo,

      maxCombo:
        Math.max(
          prev.maxCombo,
          combo
        ),

      level,

      boostActive:
        combo >= 3,

      health:
        Math.min(
          100,
          prev.health + 2
        ),

      particles: [
        ...prev.particles,
        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          combo >= 3
            ? "#ff6600"
            : "#00ffff",
          combo >= 3 ? 12 : 5,
          combo >= 3
            ? "exhaust"
            : "spark"
        ),
      ].slice(-150),

      floatingTexts: [
        ...prev.floatingTexts,
        {
          x: prev.bikeX,
          y:
            prev.bikeY - 50,
          text:
            combo >= 3
              ? `BOOST x${combo}`
              : "+100",
          color:
            combo >= 3
              ? "#ff6600"
              : "#00ffff",
          life: 1,
        },
      ].slice(-20),
    };
  };

  // ============================================================
  // PARAGRAPH COMPLETE
  // ============================================================

  const completeParagraph = (
    prev: GameEngineState
  ) => {
    const combo =
      prev.combo + 1;

    const score =
      prev.score +
      1000 +
      combo * 50;

    const level =
      Math.max(
        1,
        Math.floor(
          score / 1000
        ) + 1
      );

    return {
      ...prev,

      paragraph:
        createParagraph(
          level,
          50
        ),

      paragraphProgress: 0,

      typedText: "",

      score,

      combo,

      maxCombo:
        Math.max(
          prev.maxCombo,
          combo
        ),

      level,

      boostActive: true,

      health: 100,

      particles: [
        ...prev.particles,
        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          "#00ffff",
          30,
          "star"
        ),
      ].slice(-150),

      floatingTexts: [
        ...prev.floatingTexts,
        {
          x: prev.bikeX,
          y:
            prev.bikeY - 50,
          text:
            "PARAGRAPH COMPLETE!",
          color: "#00ffff",
          life: 1,
        },
      ].slice(-20),
    };
  };

  // ============================================================
  // KEY INPUT
  // ============================================================

  const handleKeyInput =
    useCallback(
      (key: string) => {
        setState((prev) => {
          if (
            !prev.gameStarted ||
            prev.gameOver ||
            prev.paused
          ) {
            return prev;
          }

          if (
            key === "Backspace"
          ) {
            return updateState({
              ...prev,
              typedText:
                prev.typedText.slice(
                  0,
                  -1
                ),
            });
          }

          if (
            key.length !== 1
          ) {
            return prev;
          }

          const now =
            performance.now();

          lastTypingTimeRef.current =
            now;

          const keyName =
            key.toLowerCase();

          const oldKeyStat =
            prev.keyStats[
              keyName
            ] ?? {
              correct: 0,
              wrong: 0,
            };

          // ========================================================
          // WORD MODE
          // ========================================================

          if (
            prev.typingMode ===
            "word"
          ) {
            const expected =
              prev.currentWord[
                prev.typedText
                  .length
              ];

            // WRONG KEY
            if (
              key !== expected
            ) {
              const newHealth =
                Math.max(
                  0,
                  prev.health - 15
                );

              const newLives =
                newHealth <= 0
                  ? Math.max(
                      0,
                      prev.lives - 1
                    )
                  : prev.lives;

              const crashed =
                newHealth <= 0 ||
                newLives <= 0;

              return updateState({
                ...prev,

                totalKeystrokes:
                  prev.totalKeystrokes +
                  1,

                mistakes:
                  prev.mistakes +
                  1,

                combo: 0,

                boostActive: false,

                health:
                  crashed
                    ? 0
                    : newHealth,

                lives:
                  crashed
                    ? 0
                    : newLives,

                gameOver:
                  crashed,

                shake: 14,

                bikeSpeed:
                  Math.max(
                    0,
                    prev.bikeSpeed -
                      35
                  ),

                keyStats: {
                  ...prev.keyStats,

                  [keyName]: {
                    correct:
                      oldKeyStat.correct,
                    wrong:
                      oldKeyStat.wrong +
                      1,
                  },
                },

                particles: [
                  ...prev.particles,
                  ...createParticles(
                    prev.bikeX,
                    prev.bikeY,
                    "#ff2222",
                    crashed
                      ? 35
                      : 10,
                    crashed
                      ? "smoke"
                      : "spark"
                  ),
                ].slice(-180),

                floatingTexts: [
                  ...prev.floatingTexts,
                  {
                    x:
                      prev.bikeX,
                    y:
                      prev.bikeY -
                      55,
                    text:
                      crashed
                        ? "CRASH!"
                        : "WRONG!",
                    color:
                      "#ff2222",
                    life: 1,
                  },
                ].slice(-20),
              });
            }

            // CORRECT KEY
            const typed =
              prev.typedText +
              key;

            const stat =
              {
                correct:
                  oldKeyStat.correct +
                  1,
                wrong:
                  oldKeyStat.wrong,
              };

            const nextState = {
              ...prev,

              typedText:
                typed,

              totalKeystrokes:
                prev.totalKeystrokes +
                1,

              correctKeystrokes:
                prev.correctKeystrokes +
                1,

              keyStats: {
                ...prev.keyStats,

                [keyName]: stat,
              },

              // EACH CORRECT KEY = MORE SPEED
              bikeSpeed:
                Math.min(
                  240,
                  prev.bikeSpeed +
                    8
                ),

              roadOffset:
                prev.roadOffset +
                8,

              bgOffset:
                prev.bgOffset +
                2,

              health:
                Math.min(
                  100,
                  prev.health + 0.5
                ),
            };

            // LAST LETTER = NEXT WORD
            if (
              typed.length >=
              prev.currentWord.length
            ) {
              return updateState(
                nextWord(
                  nextState
                )
              );
            }

            return updateState(
              nextState
            );
          }

          // ========================================================
          // PARAGRAPH MODE
          // ========================================================

          const expected =
            prev.paragraph[
              prev.paragraphProgress
            ];

          if (
            key !== expected
          ) {
            const newHealth =
              Math.max(
                0,
                prev.health - 12
              );

            const crashed =
              newHealth <= 0;

            return updateState({
              ...prev,

              totalKeystrokes:
                prev.totalKeystrokes +
                1,

              mistakes:
                prev.mistakes +
                1,

              combo: 0,

              boostActive: false,

              health:
                crashed
                  ? 0
                  : newHealth,

              gameOver:
                crashed,

              shake: 14,

              bikeSpeed:
                Math.max(
                  0,
                  prev.bikeSpeed -
                    30
                ),

              keyStats: {
                ...prev.keyStats,

                [keyName]: {
                  correct:
                    oldKeyStat.correct,
                  wrong:
                    oldKeyStat.wrong +
                    1,
                },
              },

              particles: [
                ...prev.particles,
                ...createParticles(
                  prev.bikeX,
                  prev.bikeY,
                  "#ff2222",
                  crashed
                    ? 35
                    : 8,
                  crashed
                    ? "smoke"
                    : "spark"
                ),
              ].slice(-180),
            });
          }

          const progress =
            prev.paragraphProgress +
            1;

          const completed =
            progress >=
            prev.paragraph.length;

          const nextState = {
            ...prev,

            paragraphProgress:
              progress,

            typedText:
              prev.paragraph.slice(
                0,
                progress
              ),

            totalKeystrokes:
              prev.totalKeystrokes +
              1,

            correctKeystrokes:
              prev.correctKeystrokes +
              1,

            keyStats: {
              ...prev.keyStats,

              [keyName]: {
                correct:
                  oldKeyStat.correct +
                  1,
                wrong:
                  oldKeyStat.wrong,
              },
            },

            bikeSpeed:
              Math.min(
                240,
                prev.bikeSpeed +
                  5
              ),

            roadOffset:
              prev.roadOffset +
              5,

            bgOffset:
              prev.bgOffset +
              1,
          };

          if (
            completed
          ) {
            return updateState(
              completeParagraph(
                nextState
              )
            );
          }

          return updateState(
            nextState
          );
        });
      },
      []
    );

  // ============================================================
  // ANIMATION / PHYSICS
  // ============================================================

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setState((prev) => {
          if (
            !prev.gameStarted
          ) {
            return prev;
          }

          const now =
            performance.now();

          const elapsed =
            Math.max(
              0,
              (now -
                prev.startTime) /
                1000
            );

          if (
            prev.gameOver
          ) {
            return updateState({
              ...prev,

              elapsedTime:
                elapsed,

              // Vehicle slows after crash
              bikeSpeed:
                Math.max(
                  0,
                  prev.bikeSpeed -
                    4
                ),

              shake:
                Math.max(
                  0,
                  prev.shake -
                    0.5
                ),
            });
          }

          if (
            prev.paused
          ) {
            return prev;
          }

          // ------------------------------------------------------
          // SPEED DECAY
          // Vehicle keeps moving only while typing continues.
          // ------------------------------------------------------

          const idleTime =
            now -
            lastTypingTimeRef.current;

          let speed =
            prev.bikeSpeed;

          if (
            idleTime > 500
          ) {
            speed =
              Math.max(
                0,
                speed - 3.5
              );
          }

          if (
            idleTime > 1500
          ) {
            speed =
              Math.max(
                0,
                speed - 5
              );
          }

          // Road movement based directly on speed
          const road =
            prev.roadOffset +
            speed * 0.08;

          const background =
            prev.bgOffset +
            speed * 0.015;

          // Exhaust particles
          const particles =
            prev.particles
              .map((p) => ({
                ...p,

                x:
                  p.x -
                  Math.max(
                    1,
                    speed *
                      0.015
                  ),

                life:
                  p.life -
                  0.025,
              }))
              .filter(
                (p) =>
                  p.life > 0
              );

          // Add exhaust according to speed
          if (
            speed > 10
          ) {
            particles.push({
              x:
                prev.bikeX - 40,

              y:
                prev.bikeY + 10,

              size:
                2 +
                Math.random() *
                  4,

              life:
                0.4 +
                Math.random() *
                  0.4,

              color:
                prev.boostActive
                  ? "#ff6600"
                  : "#00ccff",

              type:
                prev.boostActive
                  ? "exhaust"
                  : "smoke",
            });
          }

          const floatingTexts =
            prev.floatingTexts
              .map((ft) => ({
                ...ft,

                y:
                  ft.y - 0.8,

                life:
                  ft.life - 0.025,
              }))
              .filter(
                (ft) =>
                  ft.life > 0
              );

          return updateState({
            ...prev,

            bikeSpeed:
              speed,

            roadOffset:
              road,

            bgOffset:
              background,

            elapsedTime:
              elapsed,

            // Tiny suspension movement.
            // NOT front/back movement.
            bikeY:
              Math.sin(
                now * 0.012
              ) *
              Math.min(
                2,
                speed / 100
              ),

            shake:
              Math.max(
                0,
                prev.shake -
                  0.8
              ),

            particles:
              particles.slice(
                -180
              ),

            floatingTexts:
              floatingTexts.slice(
                -25
              ),
          });
        });
      }, 30);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  return {
    state,
    startGame,
    togglePause,
    handleKeyInput,
  };
}
