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
  type: Particle["type"]
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

  const updateRef = (
    next: GameEngineState
  ) => {
    stateRef.current = next;
    return next;
  };

  // ============================================================
  // START
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

      const queue =
        generateWordQueue(
          60,
          1
        );

      const paragraph =
        createParagraph(
          1,
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
          queue[0],

        typedText: "",

        wordQueue: queue,

        currentWordIndex: 0,

        paragraph,

        paragraphProgress: 0,

        lives,

        maxLives: lives,

        health: 100,
        maxHealth: 100,

        bikeSpeed:
          3 *
          difficulty.speedMultiplier,

        roadOffset: 0,
        bgOffset: 0,

        bikeX: 0,
        bikeY: 0,

        boostActive: false,

        level: 1,

        shake: 0,

        particles: [],
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

        return updateRef({
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
  ): GameEngineState => {
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

    const nextWordValue =
      queue[nextIndex] ??
      getWordForLevel(
        prev.level
      );

    const newCombo =
      prev.combo + 1;

    const newScore =
      prev.score +
      100 +
      newCombo * 10;

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

    const speed =
      Math.min(
        16,
        3 *
          difficulty.speedMultiplier +
          newLevel * 0.35
      );

    const boost =
      newCombo >= 3;

    return {
      ...prev,

      currentWord:
        nextWordValue,

      typedText: "",

      currentWordIndex:
        nextIndex,

      wordQueue: queue,

      score: newScore,

      combo: newCombo,

      maxCombo:
        Math.max(
          prev.maxCombo,
          newCombo
        ),

      level: newLevel,

      bikeSpeed: speed,

      boostActive: boost,

      health: Math.min(
        100,
        prev.health + 3
      ),

      roadOffset:
        prev.roadOffset + 15,

      bgOffset:
        prev.bgOffset + 5,

      particles: [
        ...prev.particles,
        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          boost
            ? "#ff6600"
            : "#00ffff",
          boost ? 12 : 5,
          boost
            ? "exhaust"
            : "spark"
        ),
      ].slice(-120),

      floatingTexts: [
        ...prev.floatingTexts,
        {
          x: prev.bikeX,
          y: prev.bikeY - 50,
          text:
            boost
              ? `BOOST x${newCombo}`
              : "+100",
          color:
            boost
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
  ): GameEngineState => {
    const newCombo =
      prev.combo + 1;

    const newScore =
      prev.score +
      1000 +
      newCombo * 50;

    const newLevel =
      Math.max(
        1,
        Math.floor(
          newScore / 1000
        ) + 1
      );

    const paragraph =
      createParagraph(
        newLevel,
        45
      );

    return {
      ...prev,

      paragraph,

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
        Math.min(
          16,
          prev.bikeSpeed + 1
        ),

      boostActive: true,

      health: 100,

      roadOffset:
        prev.roadOffset + 80,

      bgOffset:
        prev.bgOffset + 30,

      particles: [
        ...prev.particles,
        ...createParticles(
          prev.bikeX,
          prev.bikeY,
          "#00ffff",
          25,
          "star"
        ),
      ].slice(-120),

      floatingTexts: [
        ...prev.floatingTexts,
        {
          x: prev.bikeX,
          y: prev.bikeY - 50,
          text: "PARAGRAPH COMPLETE!",
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

          // BACKSPACE
          if (
            key === "Backspace"
          ) {
            if (
              prev.typedText
                .length === 0
            ) {
              return prev;
            }

            return updateRef({
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
            });
          }

          // Ignore special keys
          if (
            key.length !== 1
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

            const position =
              prev.typedText
                .length;

            const expectedChar =
              expected[position];

            // Wrong character
            if (
              key !==
              expectedChar
            ) {
              const health =
                Math.max(
                  0,
                  prev.health -
                    8
                );

              const lives =
                health <= 0
                  ? prev.lives -
                    1
                  : prev.lives;

              const gameOver =
                lives <= 0;

              return updateRef({
                ...prev,

                totalKeystrokes:
                  prev.totalKeystrokes +
                  1,

                mistakes:
                  prev.mistakes +
                  1,

                combo: 0,

                boostActive:
                  false,

                health:
                  gameOver
                    ? 0
                    : health,

                lives:
                  gameOver
                    ? 0
                    : lives,

                shake: 8,

                gameOver,

                particles: [
                  ...prev.particles,
                  ...createParticles(
                    prev.bikeX,
                    prev.bikeY,
                    "#ff3333",
                    8,
                    "spark"
                  ),
                ].slice(-120),

                floatingTexts: [
                  ...prev.floatingTexts,
                  {
                    x: prev.bikeX,
                    y:
                      prev.bikeY -
                      50,
                    text: "MISS!",
                    color:
                      "#ff3333",
                    life: 1,
                  },
                ].slice(-20),
              });
            }

            // Correct character
            const newTyped =
              prev.typedText +
              key;

            const newCorrect =
              prev.correctKeystrokes +
              1;

            const newTotal =
              prev.totalKeystrokes +
              1;

            // ==================================================
            // IMPORTANT:
            // LAST LETTER AUTO COMPLETES WORD
            // NO SPACE REQUIRED
            // ==================================================

            if (
              newTyped.length >=
              expected.length
            ) {
              return updateRef({
                ...nextWord({
                  ...prev,

                  typedText:
                    newTyped,

                  correctKeystrokes:
                    newCorrect,

                  totalKeystrokes:
                    newTotal,
                }),
              });
            }

            return updateRef({
              ...prev,

              typedText:
                newTyped,

              correctKeystrokes:
                newCorrect,

              totalKeystrokes:
                newTotal,

              bikeSpeed:
                Math.min(
                  16,
                  prev.bikeSpeed +
                    0.03
                ),

              roadOffset:
                prev.roadOffset +
                2,

              bgOffset:
                prev.bgOffset +
                1,

              health:
                Math.min(
                  100,
                  prev.health +
                    0.2
                ),
            });
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

          // Wrong
          if (
            key !== expected
          ) {
            const health =
              Math.max(
                0,
                prev.health -
                  5
              );

            const lives =
              health <= 0
                ? prev.lives -
                  1
                : prev.lives;

            const gameOver =
              lives <= 0;

            return updateRef({
              ...prev,

              totalKeystrokes:
                prev.totalKeystrokes +
                1,

              mistakes:
                prev.mistakes +
                1,

              combo: 0,

              boostActive:
                false,

              health:
                gameOver
                  ? 0
                  : health,

              lives:
                gameOver
                  ? 0
                  : lives,

              shake: 7,

              gameOver,

              particles: [
                ...prev.particles,
                ...createParticles(
                  prev.bikeX,
                  prev.bikeY,
                  "#ff3333",
                  6,
                  "spark"
                ),
              ].slice(-120),
            });
          }

          // Correct
          const newProgress =
            position + 1;

          const complete =
            newProgress >=
            paragraph.length;

          if (complete) {
            return updateRef(
              completeParagraph({
                ...prev,

                totalKeystrokes:
                  prev.totalKeystrokes +
                  1,

                correctKeystrokes:
                  prev.correctKeystrokes +
                  1,
              })
            );
          }

          return updateRef({
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

            bikeSpeed:
              Math.min(
                16,
                prev.bikeSpeed +
                  0.015
              ),

            roadOffset:
              prev.roadOffset +
              1.5,

            bgOffset:
              prev.bgOffset +
              0.7,

            health:
              Math.min(
                100,
                prev.health +
                  0.15
              ),
          });
        });
      },
      []
    );

  // ============================================================
  // ANIMATION ENGINE
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

          // Smooth speed
          const target =
            3 +
            prev.level *
              0.35;

          const speed =
            prev.bikeSpeed <
            target
              ? Math.min(
                  target,
                  prev.bikeSpeed +
                    0.08
                )
              : Math.max(
                  target,
                  prev.bikeSpeed -
                    0.03
                );

          // Horizontal vehicle movement
          const newBikeX =
            prev.bikeX +
            speed * 1.2;

          // Keep vehicle moving across track
          const wrappedX =
            newBikeX > 900
              ? -150
              : newBikeX;

          // Vehicle vertical bounce
          const newBikeY =
            Math.sin(
              performance.now() *
                0.008
            ) *
              Math.min(
                speed * 0.8,
                8
              );

          // Road animation
          const roadOffset =
            prev.roadOffset +
            speed * 2;

          const bgOffset =
            prev.bgOffset +
            speed * 0.35;

          // Particles
          const particles =
            prev.particles
              .map((p) => ({
                ...p,

                x:
                  p.x -
                  speed *
                  0.5,

                y:
                  p.y +
                  (Math.random() -
                    0.5),

                life:
                  p.life -
                  0.025,

                size:
                  p.size * 1.01,
              }))
              .filter(
                (p) =>
                  p.life > 0
              );

          // Exhaust
          if (speed > 2) {
            particles.push({
              x:
                wrappedX -
                45,

              y:
                newBikeY +
                20,

              size:
                2 +
                Math.random() * 4,

              life:
                0.45 +
                Math.random() *
                  0.35,

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

          // Floating text
          const floatingTexts =
            prev.floatingTexts
              .map((ft) => ({
                ...ft,

                y:
                  ft.y - 0.8,

                life:
                  ft.life -
                  0.025,
              }))
              .filter(
                (ft) =>
                  ft.life > 0
              );

          // Shake recovery
          const shake =
            Math.max(
              0,
              prev.shake - 0.7
            );

          // Slowly reduce boost
          const boostActive =
            prev.boostActive &&
            Math.random() > 0.035;

          return updateRef({
            ...prev,

            bikeSpeed:
              speed,

            bikeX:
              wrappedX,

            bikeY:
              newBikeY,

            roadOffset,

            bgOffset,

            shake,

            boostActive,

            particles:
              particles.slice(
                -150
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
