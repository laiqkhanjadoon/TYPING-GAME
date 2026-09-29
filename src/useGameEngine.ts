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

export interface GameEngineState {
  // Game
  gameStarted: boolean;
  gameOver: boolean;
  paused: boolean;

  // Settings
  difficulty: GameSettings["difficulty"];
  typingMode: GameSettings["typingMode"];
  vehicle: GameSettings["vehicle"];

  // Typing
  currentWord: string;
  typedText: string;
  wordQueue: string[];
  currentWordIndex: number;

  // Paragraph
  paragraph: string;
  paragraphProgress: number;

  // Score
  score: number;
  combo: number;
  maxCombo: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  mistakes: number;

  // Player
  lives: number;
  maxLives: number;
  health: number;
  maxHealth: number;

  // Racing
  bikeSpeed: number;
  roadOffset: number;
  bgOffset: number;
  bikeX: number;
  boostActive: boolean;
  level: number;

  // Effects
  shake: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
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
  boostActive: false,
  level: 1,

  shake: 0,
  particles: [],
  floatingTexts: [],
};

function createParagraph(
  level: number,
  wordCount: number
): string {
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    words.push(getWordForLevel(level));
  }

  return words.join(" ");
}

function createParticles(
  x: number,
  y: number,
  color: string,
  count: number,
  type: Particle["type"] = "spark"
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x:
        x +
        (Math.random() - 0.5) * 30,

      y:
        y +
        (Math.random() - 0.5) * 20,

      size:
        1.5 +
        Math.random() * 4,

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

  const updateState = useCallback(
    (
      updater:
        | GameEngineState
        | ((
            prev: GameEngineState
          ) => GameEngineState)
    ) => {
      setState((prev) => {
        const next =
          typeof updater === "function"
            ? updater(prev)
            : updater;

        stateRef.current = next;

        return next;
      });
    },
    []
  );

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

      const lives =
        difficulty.lives;

      const level = 1;

      const queue =
        generateWordQueue(
          50,
          level
        );

      const paragraph =
        createParagraph(
          level,
          45
        );

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
          settings.typingMode ===
          "word"
            ? queue[0]
            : "",

        typedText: "",

        wordQueue: queue,

        currentWordIndex: 0,

        paragraph,

        paragraphProgress: 0,

        lives,

        maxLives: lives,

        health: 100,

        maxHealth: 100,

        level,

        bikeSpeed:
          2 *
          difficulty.speedMultiplier,

        roadOffset: 0,

        bgOffset: 0,

        bikeX: 0,

        boostActive: false,

        particles:
          createParticles(
            0,
            0,
            "#00ffff",
            12,
            "star"
          ),

        floatingTexts: [],
      };

      stateRef.current =
        newState;

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

        const next = {
          ...prev,
          paused: !prev.paused,
        };

        stateRef.current =
          next;

        return next;
      });
    }, []);

  // ============================================================
  // COMPLETE WORD
  // ============================================================

  const completeWord = useCallback(
    (
      prev: GameEngineState
    ): GameEngineState => {
      const nextIndex =
        prev.currentWordIndex +
        1;

      const nextWord =
        prev.wordQueue[
          nextIndex
        ] ??
        getWordForLevel(
          prev.level
        );

      const newScore =
        prev.score +
        100 +
        prev.combo * 10;

      const newCombo =
        prev.combo + 1;

      const newLevel =
        Math.max(
          1,
          Math.floor(
            newScore / 1000
          ) + 1
        );

      const difficulty =
        DIFFICULTY_SETTINGS[
          prev.difficulty
        ];

      const newSpeed =
        Math.min(
          14,
          2 *
            difficulty.speedMultiplier +
            newLevel * 0.45
        );

      const boost =
        newCombo >= 5;

      const newParticles =
        createParticles(
          prev.bikeX,
          0,
          boost
            ? "#ff6600"
            : "#00ffff",
          10,
          boost
            ? "exhaust"
            : "spark"
        );

      const floatingText: FloatingText =
        {
          x: prev.bikeX,
          y: 120,
          text:
            newCombo >= 5
              ? `COMBO x${newCombo}!`
              : "+100",
          color:
            newCombo >= 5
              ? "#ff6600"
              : "#00ffff",
          life: 1,
        };

      return {
        ...prev,

        currentWord:
          nextWord,

        typedText: "",

        currentWordIndex:
          nextIndex,

        wordQueue:
          nextIndex >=
          prev.wordQueue.length - 10
            ? [
                ...prev.wordQueue,
                ...generateWordQueue(
                  30,
                  newLevel
                ),
              ]
            : prev.wordQueue,

        score: newScore,

        combo: newCombo,

        maxCombo:
          Math.max(
            prev.maxCombo,
            newCombo
          ),

        correctKeystrokes:
          prev.correctKeystrokes +
          prev.currentWord.length,

        level: newLevel,

        bikeSpeed: newSpeed,

        boostActive: boost,

        health: Math.min(
          prev.maxHealth,
          prev.health + 5
        ),

        roadOffset:
          prev.roadOffset + 20,

        bgOffset:
          prev.bgOffset + 8,

        particles: [
          ...prev.particles,
          ...newParticles,
        ].slice(-100),

        floatingTexts: [
          ...prev.floatingTexts,
          floatingText,
        ].slice(-20),
      };
    },
    []
  );

  // ============================================================
  // COMPLETE PARAGRAPH
  // ============================================================

  const completeParagraph =
    useCallback(
      (
        prev: GameEngineState
      ): GameEngineState => {
        const newScore =
          prev.score +
          1000 +
          prev.combo * 50;

        const newCombo =
          prev.combo + 1;

        const newLevel =
          Math.max(
            1,
            Math.floor(
              newScore / 1000
            ) + 1
          );

        const difficulty =
          DIFFICULTY_SETTINGS[
            prev.difficulty
          ];

        const newSpeed =
          Math.min(
            14,
            2 *
              difficulty.speedMultiplier +
              newLevel * 0.45
          );

        const newParagraph =
          createParagraph(
            newLevel,
            45
          );

        return {
          ...prev,

          paragraph:
            newParagraph,

          paragraphProgress: 0,

          typedText: "",

          score: newScore,

          combo: newCombo,

          maxCombo:
            Math.max(
              prev.maxCombo,
              newCombo
            ),

          level: newLevel,

          bikeSpeed:
            newSpeed,

          boostActive:
            newCombo >= 3,

          health: Math.min(
            prev.maxHealth,
            prev.health + 15
          ),

          roadOffset:
            prev.roadOffset + 80,

          bgOffset:
            prev.bgOffset + 30,

          particles: [
            ...prev.particles,
            ...createParticles(
              prev.bikeX,
              0,
              "#00ffff",
              25,
              "star"
            ),
          ].slice(-100),

          floatingTexts: [
            ...prev.floatingTexts,
            {
              x: prev.bikeX,
              y: 120,
              text: "PARAGRAPH COMPLETE!",
              color: "#00ffff",
              life: 1,
            },
          ].slice(-20),
        };
      },
      []
    );

  // ============================================================
  // HANDLE TYPING
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

          // ----------------------------------------------------
          // BACKSPACE
          // ----------------------------------------------------

          if (key === "Backspace") {
            if (
              prev.typedText.length ===
              0
            ) {
              return prev;
            }

            const next = {
              ...prev,

              typedText:
                prev.typedText.slice(
                  0,
                  -1
                ),

              totalKeystrokes:
                prev.totalKeystrokes +
                1,

              combo: 0,

              boostActive: false,
            };

            stateRef.current =
              next;

            return next;
          }

          // Ignore modifier/special keys
          if (
            key.length !== 1 &&
            key !== " "
          ) {
            return prev;
          }

          // ====================================================
          // WORD MODE
          // ====================================================

          if (
            prev.typingMode ===
            "word"
          ) {
            const expected =
              prev.currentWord;

            // Space submits word
            if (key === " ") {
              if (
                prev.typedText ===
                expected
              ) {
                const next =
                  completeWord(
                    {
                      ...prev,
                      totalKeystrokes:
                        prev.totalKeystrokes +
                        1,
                    }
                  );

                stateRef.current =
                  next;

                return next;
              }

              // Wrong space
              const newHealth =
                Math.max(
                  0,
                  prev.health - 15
                );

              const newLives =
                newHealth <= 0
                  ? prev.lives - 1
                  : prev.lives;

              const gameOver =
                newLives <= 0;

              const next = {
                ...prev,

                totalKeystrokes:
                  prev.totalKeystrokes +
                  1,

                mistakes:
                  prev.mistakes + 1,

                combo: 0,

                boostActive: false,

                health: gameOver
                  ? 0
                  : newHealth,

                lives:
                  gameOver
                    ? 0
                    : newLives,

                gameOver,
              };

              stateRef.current =
                next;

              return next;
            }

            // Normal character
            const expectedChar =
              expected[
                prev.typedText
                  .length
              ];

            const correct =
              key ===
              expectedChar;

            if (correct) {
              const newTyped =
                prev.typedText +
                key;

              const next = {
                ...prev,

                typedText:
                  newTyped,

                totalKeystrokes:
                  prev.totalKeystrokes +
                  1,

                correctKeystrokes:
                  prev.correctKeystrokes +
                  1,

                health: Math.min(
                  prev.maxHealth,
                  prev.health + 0.5
                ),

                bikeSpeed:
                  Math.min(
                    14,
                    prev.bikeSpeed +
                      0.03
                  ),

                roadOffset:
                  prev.roadOffset +
                  2,

                bgOffset:
                  prev.bgOffset +
                  1,
              };

              stateRef.current =
                next;

              return next;
            }

            // Wrong character
            const newHealth =
              Math.max(
                0,
                prev.health - 8
              );

            const newLives =
              newHealth <= 0
                ? prev.lives - 1
                : prev.lives;

            const gameOver =
              newLives <= 0;

            const next = {
              ...prev,

              typedText:
                prev.typedText,

              totalKeystrokes:
                prev.totalKeystrokes +
                1,

              mistakes:
                prev.mistakes + 1,

              combo: 0,

              boostActive: false,

              health: gameOver
                ? 0
                : newHealth,

              lives:
                gameOver
                  ? 0
                  : newLives,

              shake: 8,

              particles: [
                ...prev.particles,
                ...createParticles(
                  prev.bikeX,
                  0,
                  "#ff3333",
                  6,
                  "spark"
                ),
              ].slice(-100),

              floatingTexts: [
                ...prev.floatingTexts,
                {
                  x: prev.bikeX,
                  y: 130,
                  text: "MISS!",
                  color: "#ff3333",
                  life: 1,
                },
              ].slice(-20),

              gameOver,
            };

            stateRef.current =
              next;

            return next;
          }

          // ====================================================
          // PARAGRAPH MODE
          // ====================================================

          const paragraph =
            prev.paragraph;

          const position =
            prev.paragraphProgress;

          const expected =
            paragraph[position];

          // Correct character
          if (key === expected) {
            const newProgress =
              position + 1;

            const completed =
              newProgress >=
              paragraph.length;

            if (completed) {
              const next =
                completeParagraph(
                  {
                    ...prev,
                    totalKeystrokes:
                      prev.totalKeystrokes +
                      1,

                    correctKeystrokes:
                      prev.correctKeystrokes +
                      1,
                  }
                );

              stateRef.current =
                next;

              return next;
            }

            const next = {
              ...prev,

              typedText:
                paragraph.slice(
                  0,
                  newProgress
                ),

              paragraphProgress:
                newProgress,

              totalKeystrokes:
                prev.totalKeystrokes +
                1,

              correctKeystrokes:
                prev.correctKeystrokes +
                1,

              health: Math.min(
                prev.maxHealth,
                prev.health + 0.25
              ),

              bikeSpeed:
                Math.min(
                  14,
                  prev.bikeSpeed +
                    0.015
                ),

              roadOffset:
                prev.roadOffset +
                1.5,

              bgOffset:
                prev.bgOffset +
                0.7,
            };

            stateRef.current =
              next;

            return next;
          }

          // Wrong paragraph character
          const newHealth =
            Math.max(
              0,
              prev.health - 5
            );

          const newLives =
            newHealth <= 0
              ? prev.lives - 1
              : prev.lives;

          const gameOver =
            newLives <= 0;

          const next = {
            ...prev,

            totalKeystrokes:
              prev.totalKeystrokes +
              1,

            mistakes:
              prev.mistakes + 1,

            combo: 0,

            boostActive: false,

            health: gameOver
              ? 0
              : newHealth,

            lives:
              gameOver
                ? 0
                : newLives,

            shake: 7,

            particles: [
              ...prev.particles,
              ...createParticles(
                prev.bikeX,
                0,
                "#ff3333",
                5,
                "spark"
              ),
            ].slice(-100),

            floatingTexts: [
              ...prev.floatingTexts,
              {
                x: prev.bikeX,
                y: 130,
                text: "MISS!",
                color: "#ff3333",
                life: 1,
              },
            ].slice(-20),

            gameOver,
          };

          stateRef.current =
            next;

          return next;
        });
      },
      [
        completeWord,
        completeParagraph,
      ]
    );

  // ============================================================
  // GAME ANIMATION / PHYSICS
  // ============================================================

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setState((prev) => {
          if (
            !prev.gameStarted ||
            prev.gameOver ||
            prev.paused
          ) {
            return prev;
          }

          const difficulty =
            DIFFICULTY_SETTINGS[
              prev.difficulty
            ];

          const baseSpeed =
            2 *
            difficulty.speedMultiplier;

          // Gradually increase speed
          const targetSpeed =
            Math.min(
              14,
              baseSpeed +
                prev.level * 0.45
            );

          const nextSpeed =
            prev.boostActive
              ? Math.min(
                  16,
                  prev.bikeSpeed +
                    0.12
                )
              : Math.max(
                  baseSpeed,
                  prev.bikeSpeed -
                    0.025
                );

          const nextParticles =
            prev.particles
              .map((p) => ({
                ...p,

                x:
                  p.x +
                  (Math.random() -
                    0.5) *
                    2,

                y:
                  p.y +
                  (Math.random() -
                    0.5) *
                    2,

                life:
                  p.life -
                  0.025,

                size:
                  p.size *
                  1.01,
              }))
              .filter(
                (p) =>
                  p.life > 0
              );

          // Add exhaust while moving
          if (
            nextSpeed > 2
          ) {
            nextParticles.push({
              x:
                prev.bikeX - 35,

              y:
                0 +
                (Math.random() -
                  0.5) *
                  20,

              size:
                2 +
                Math.random() * 4,

              life:
                0.5 +
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

          const nextFloatingTexts =
            prev.floatingTexts
              .map((ft) => ({
                ...ft,

                y:
                  ft.y - 0.7,

                life:
                  ft.life -
                  0.025,
              }))
              .filter(
                (ft) =>
                  ft.life > 0
              );

          const nextShake =
            Math.max(
              0,
              prev.shake - 0.6
            );

          const nextRoadOffset =
            prev.roadOffset +
            nextSpeed;

          const nextBgOffset =
            prev.bgOffset +
            nextSpeed *
              0.25;

          const nextBikeX =
            prev.bikeX === 0
              ? 0
              : prev.bikeX;

          const next = {
            ...prev,

            bikeSpeed:
              Math.min(
                targetSpeed,
                nextSpeed
              ),

            roadOffset:
              nextRoadOffset,

            bgOffset:
              nextBgOffset,

            bikeX:
              nextBikeX,

            shake:
              nextShake,

            particles:
              nextParticles.slice(
                -120
              ),

            floatingTexts:
              nextFloatingTexts.slice(
                -25
              ),
          };

          stateRef.current =
            next;

          return next;
        });
      }, 50);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    state,
    startGame,
    togglePause,
    handleKeyInput,
  };
}
