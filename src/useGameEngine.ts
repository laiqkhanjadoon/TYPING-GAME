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

// ============================================================
// TYPES
// ============================================================

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
  completedWords: number;

  lives: number;
  maxLives: number;

  health: number;
  maxHealth: number;

  bikeSpeed: number;
  maxSpeed: number;

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

  wpm: number;
  accuracy: number;

  keyStats: Record<string, KeyStat>;
}

// ============================================================
// INITIAL STATE
// ============================================================

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
  completedWords: 0,

  lives: 3,
  maxLives: 3,

  health: 100,
  maxHealth: 100,

  bikeSpeed: 0,
  maxSpeed: 0,

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

  wpm: 0,
  accuracy: 100,

  keyStats: {},
};

// ============================================================
// HELPERS
// ============================================================

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
        (Math.random() - 0.5) *
          35,

      y:
        y +
        (Math.random() - 0.5) *
          20,

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

function calculateAccuracy(
  correct: number,
  total: number
) {
  if (total <= 0) return 100;

  return Math.round(
    (correct / total) * 100
  );
}

function calculateWPM(
  correct: number,
  seconds: number
) {
  const minutes =
    Math.max(
      seconds / 60,
      1 / 60
    );

  return Math.round(
    correct / 5 / minutes
  );
}

// ============================================================
// ENGINE
// ============================================================

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

  const targetSpeedRef =
    useRef(0);

  // ==========================================================
  // STATE HELPER
  // ==========================================================

  const updateState = (
    next: GameEngineState
  ) => {
    stateRef.current = next;
    return next;
  };

  // ==========================================================
  // START GAME
  // ==========================================================

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
          100,
          1
        );

      const paragraph =
        createParagraph(
          1,
          80
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
          queue[0] ??
          "start",

        typedText: "",

        wordQueue:
          queue,

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
        maxSpeed: 0,

        roadOffset: 0,
        bgOffset: 0,

        bikeX: 0,
        bikeY: 0,

        boostActive: false,
        level: 1,
        shake: 0,

        score: 0,
        combo: 0,
        maxCombo: 0,

        totalKeystrokes: 0,
        correctKeystrokes: 0,
        mistakes: 0,
        completedWords: 0,

        particles: [],
        floatingTexts: [],

        startTime: now,
        elapsedTime: 0,

        wpm: 0,
        accuracy: 100,

        keyStats: {},
      };

      stateRef.current =
        newState;

      lastTypingTimeRef.current =
        now;

      targetSpeedRef.current =
        0;

      setState(newState);
    },
    []
  );

  // ==========================================================
  // PAUSE
  // ==========================================================

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

  // ==========================================================
  // NEXT WORD
  // ==========================================================

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
          40,
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

      currentWord:
        next,

      typedText: "",

      currentWordIndex:
        nextIndex,

      wordQueue:
        queue,

      completedWords:
        prev.completedWords + 1,

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
          prev.maxHealth,
          prev.health + 1
        ),

      particles: [
        ...prev.particles,

        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          combo >= 3
            ? "#ff6600"
            : "#00ffff",
          combo >= 3
            ? 12
            : 5,
          combo >= 3
            ? "exhaust"
            : "spark"
        ),
      ].slice(-180),

      floatingTexts: [
        ...prev.floatingTexts,

        {
          x: prev.bikeX,

          y:
            prev.bikeY -
            50,

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

  // ==========================================================
  // PARAGRAPH COMPLETE
  // ==========================================================

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
          80
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

      health:
        prev.maxHealth,

      particles: [
        ...prev.particles,

        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          "#00ffff",
          30,
          "star"
        ),
      ].slice(-180),

      floatingTexts: [
        ...prev.floatingTexts,

        {
          x: prev.bikeX,

          y:
            prev.bikeY -
            50,

          text:
            "PARAGRAPH COMPLETE!",

          color:
            "#00ffff",

          life: 1,
        },
      ].slice(-20),
    };
  };

  // ==========================================================
  // WRONG KEY / DAMAGE
  // ==========================================================

  const applyMistake = (
    prev: GameEngineState,
    keyName: string,
    damage: number,
    oldKeyStat: KeyStat
  ) => {
    const health =
      Math.max(
        0,
        prev.health - damage
      );

    let lives =
      prev.lives;

    let gameOver =
      false;

    let finalHealth =
      health;

    if (health <= 0) {
      lives =
        Math.max(
          0,
          prev.lives - 1
        );

      if (lives <= 0) {
        gameOver = true;
        finalHealth = 0;
      } else {
        finalHealth =
          prev.maxHealth;
      }
    }

    const total =
      prev.totalKeystrokes + 1;

    const mistakes =
      prev.mistakes + 1;

    const accuracy =
      calculateAccuracy(
        prev.correctKeystrokes,
        total
      );

    if (gameOver) {
      targetSpeedRef.current = 0;
    }

    return updateState({
      ...prev,

      totalKeystrokes:
        total,

      mistakes,

      combo: 0,

      boostActive: false,

      health:
        finalHealth,

      lives,

      gameOver,

      shake:
        gameOver
          ? 24
          : 14,

      bikeSpeed:
        gameOver
          ? 0
          : Math.max(
              0,
              prev.bikeSpeed - 30
            ),

      maxSpeed:
        prev.maxSpeed,

      keyStats: {
        ...prev.keyStats,

        [keyName]: {
          correct:
            oldKeyStat.correct,

          wrong:
            oldKeyStat.wrong + 1,
        },
      },

      accuracy,

      wpm:
        calculateWPM(
          prev.correctKeystrokes,
          Math.max(
            0,
            (performance.now() -
              prev.startTime) /
              1000
          )
        ),

      particles: [
        ...prev.particles,

        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          "#ff2222",
          gameOver
            ? 35
            : 12,
          gameOver
            ? "smoke"
            : "spark"
        ),
      ].slice(-200),

      floatingTexts: [
        ...prev.floatingTexts,

        {
          x: prev.bikeX,

          y:
            prev.bikeY -
            55,

          text:
            gameOver
              ? "CRASH!"
              : lives <
                  prev.lives
              ? "LIFE LOST!"
              : "WRONG!",

          color:
            "#ff2222",

          life: 1,
        },
      ].slice(-25),
    });
  };

  // ==========================================================
  // KEY INPUT
  // ==========================================================

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

          // ----------------------------------------------------
          // BACKSPACE
          // ----------------------------------------------------

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

          // Ignore Shift, Ctrl, Alt, arrows, etc.
          if (
            key.length !== 1
          ) {
            return prev;
          }

          const now =
            performance.now();

          const keyName =
            key.toLowerCase();

          const oldKeyStat =
            prev.keyStats[
              keyName
            ] ?? {
              correct: 0,
              wrong: 0,
            };

          // ====================================================
          // WORD MODE
          // ====================================================

          if (
            prev.typingMode ===
            "word"
          ) {
            const expected =
              prev.currentWord[
                prev.typedText.length
              ];

            // WRONG CHARACTER
            if (
              key !== expected
            ) {
              return applyMistake(
                prev,
                keyName,
                18,
                oldKeyStat
              );
            }

            // CORRECT CHARACTER
            const interval =
              lastTypingTimeRef.current >
              0
                ? now -
                  lastTypingTimeRef.current
                : 250;

            lastTypingTimeRef.current =
              now;

            const cadenceCPM =
              Math.min(
                600,
                Math.max(
                  30,
                  60000 /
                    Math.max(
                      interval,
                      70
                    )
                )
              );

            const difficultyMultiplier =
              DIFFICULTY_SETTINGS[
                prev.difficulty
              ].speedMultiplier;

            const targetSpeed =
              Math.min(
                280,
                cadenceCPM *
                  0.48 *
                  difficultyMultiplier
              );

            targetSpeedRef.current =
              targetSpeed;

            const typed =
              prev.typedText +
              key;

            const total =
              prev.totalKeystrokes +
              1;

            const correct =
              prev.correctKeystrokes +
              1;

            const elapsed =
              Math.max(
                0,
                (now -
                  prev.startTime) /
                  1000
              );

            const stat: KeyStat = {
              correct:
                oldKeyStat.correct +
                1,

              wrong:
                oldKeyStat.wrong,
            };

            const nextState: GameEngineState =
              {
                ...prev,

                typedText:
                  typed,

                totalKeystrokes:
                  total,

                correctKeystrokes:
                  correct,

                accuracy:
                  calculateAccuracy(
                    correct,
                    total
                  ),

                wpm:
                  calculateWPM(
                    correct,
                    elapsed
                  ),

                keyStats: {
                  ...prev.keyStats,

                  [keyName]:
                    stat,
                },

                // Immediate speed response on every correct keystroke.
                bikeSpeed:
                  Math.min(
                    targetSpeed,
                    prev.bikeSpeed +
                      Math.max(
                        10,
                        (targetSpeed -
                          prev.bikeSpeed) *
                          0.35
                      )
                  ),

                health:
                  Math.min(
                    prev.maxHealth,
                    prev.health +
                      0.2
                  ),
              };

            // WORD COMPLETE
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

          // ====================================================
          // PARAGRAPH MODE
          // ====================================================

          const expected =
            prev.paragraph[
              prev.paragraphProgress
            ];

          if (
            key !== expected
          ) {
            return applyMistake(
              prev,
              keyName,
              14,
              oldKeyStat
            );
          }

          const interval =
            lastTypingTimeRef.current >
            0
              ? now -
                lastTypingTimeRef.current
              : 250;

          lastTypingTimeRef.current =
            now;

          const cadenceCPM =
            Math.min(
              600,
              Math.max(
                30,
                60000 /
                  Math.max(
                    interval,
                    70
                  )
              )
            );

          const difficultyMultiplier =
            DIFFICULTY_SETTINGS[
              prev.difficulty
            ].speedMultiplier;

          targetSpeedRef.current =
            Math.min(
              280,
              cadenceCPM *
                0.48 *
                difficultyMultiplier
            );

          const progress =
            prev.paragraphProgress +
            1;

          const completed =
            progress >=
            prev.paragraph.length;

          const total =
            prev.totalKeystrokes +
            1;

          const correct =
            prev.correctKeystrokes +
            1;

          const elapsed =
            Math.max(
              0,
              (now -
                prev.startTime) /
                1000
            );

          const nextState: GameEngineState =
            {
              ...prev,

              paragraphProgress:
                progress,

              typedText:
                prev.paragraph.slice(
                  0,
                  progress
                ),

              totalKeystrokes:
                total,

              correctKeystrokes:
                correct,

              accuracy:
                calculateAccuracy(
                  correct,
                  total
                ),

              wpm:
                calculateWPM(
                  correct,
                  elapsed
                ),

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

              // Immediate speed response on every correct keystroke.
              bikeSpeed:
                Math.min(
                  targetSpeedRef.current,
                  prev.bikeSpeed +
                    Math.max(
                      10,
                      (targetSpeedRef.current -
                        prev.bikeSpeed) *
                        0.35
                    )
                ),

              health:
                Math.min(
                  prev.maxHealth,
                  prev.health +
                    0.15
                ),
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

  // ==========================================================
  // ANIMATION / PHYSICS
  // ==========================================================

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setState((prev) => {
          if (
            !prev.gameStarted
          ) {
            return prev;
          }

          // IMPORTANT:
          // Once game is over, freeze gameplay stats.
          // Only particles/shake are allowed to finish.
          if (
            prev.gameOver
          ) {
            const particles =
              prev.particles
                .map((p) => ({
                  ...p,

                  x:
                    p.x -
                    Math.max(
                      1,
                      prev.bikeSpeed *
                        0.01
                    ),

                  life:
                    p.life -
                    0.025,
                }))
                .filter(
                  (p) =>
                    p.life > 0
                );

            const floatingTexts =
              prev.floatingTexts
                .map((ft) => ({
                  ...ft,

                  y:
                    ft.y -
                    0.8,

                  life:
                    ft.life -
                    0.025,
                }))
                .filter(
                  (ft) =>
                    ft.life > 0
                );

            return updateState({
              ...prev,

              bikeSpeed: 0,

              particles:
                particles.slice(
                  -180
                ),

              floatingTexts:
                floatingTexts.slice(
                  -25
                ),

              shake:
                Math.max(
                  0,
                  prev.shake -
                    0.8
                ),
            });
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

          // ====================================================
          // PAUSED
          // ====================================================

          if (
            prev.paused
          ) {
            return prev;
          }

          // ====================================================
          // TYPING IDLE
          // ====================================================

          const idleTime =
            now -
            lastTypingTimeRef.current;

          if (
            idleTime > 700
          ) {
            targetSpeedRef.current =
              Math.max(
                0,
                targetSpeedRef.current -
                  5
              );
          }

          if (
            idleTime > 1600
          ) {
            targetSpeedRef.current =
              0;
          }

          // ====================================================
          // SPEED
          // ====================================================

          const difficultyMultiplier =
            DIFFICULTY_SETTINGS[
              prev.difficulty
            ].speedMultiplier;

          const maxAllowedSpeed =
            280 *
            difficultyMultiplier;

          const targetSpeed =
            Math.min(
              maxAllowedSpeed,
              Math.max(
                0,
                targetSpeedRef.current
              )
            );

          const acceleration =
            targetSpeed >
            prev.bikeSpeed
              ? 4.5
              : 7;

          let speed =
            prev.bikeSpeed;

          if (
            speed <
            targetSpeed
          ) {
            speed =
              Math.min(
                targetSpeed,
                speed +
                  acceleration
              );
          } else if (
            speed >
            targetSpeed
          ) {
            speed =
              Math.max(
                targetSpeed,
                speed -
                  acceleration
              );
          }

          // ====================================================
          // ROAD / BACKGROUND
          // ====================================================

          const road =
            prev.roadOffset +
            speed * 0.08;

          const background =
            prev.bgOffset +
            speed * 0.015;

          // ====================================================
          // WPM / ACCURACY
          // ====================================================

          const wpm =
            calculateWPM(
              prev.correctKeystrokes,
              elapsed
            );

          const accuracy =
            calculateAccuracy(
              prev.correctKeystrokes,
              prev.totalKeystrokes
            );

          // ====================================================
          // PARTICLES
          // ====================================================

          const particles =
            prev.particles
              .map((p) => ({
                ...p,

                x:
                  p.x -
                  Math.max(
                    1,
                    speed * 0.015
                  ),

                life:
                  p.life -
                  0.025,
              }))
              .filter(
                (p) =>
                  p.life > 0
              );

          if (
            speed > 12
          ) {
            particles.push({
              x:
                prev.bikeX -
                40,

              y:
                prev.bikeY +
                10,

              size:
                2 +
                Math.random() * 4,

              life:
                0.4 +
                Math.random() * 0.4,

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

          // ====================================================
          // FLOATING TEXT
          // ====================================================

          const floatingTexts =
            prev.floatingTexts
              .map((ft) => ({
                ...ft,

                y:
                  ft.y -
                  0.8,

                life:
                  ft.life -
                  0.025,
              }))
              .filter(
                (ft) =>
                  ft.life > 0
              );

          // ====================================================
          // SUSPENSION
          // ====================================================

          const suspension =
            Math.sin(
              now * 0.012
            ) *
            Math.min(
              2,
              speed / 100
            );

          return updateState({
            ...prev,

            bikeSpeed:
              speed,

            maxSpeed:
              Math.max(
                prev.maxSpeed,
                speed
              ),

            roadOffset:
              road,

            bgOffset:
              background,

            elapsedTime:
              elapsed,

            wpm,

            accuracy,

            bikeY:
              suspension,

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

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    state,
    startGame,
    togglePause,
    handleKeyInput,
  };
}
