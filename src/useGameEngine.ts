import { useState, useEffect, useRef, useCallback } from "react";
import { generateWordQueue } from "./words";

export type GameState = "start" | "playing" | "paused" | "gameover";

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: "spark" | "smoke" | "star" | "exhaust";
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export interface GameEngineState {
  gameState: GameState;
  score: number;
  wpm: number;
  combo: number;
  maxCombo: number;
  level: number;
  health: number;
  maxHealth: number;
  bikeX: number;
  bikeY: number;
  bikeSpeed: number;
  targetSpeed: number;
  wordQueue: string[];
  currentWordIndex: number;
  typedSoFar: string;
  isError: boolean;
  particles: Particle[];
  floatingTexts: FloatingText[];
  trailPoints: TrailPoint[];
  roadOffset: number;
  bgOffset: number;
  shake: number;
  wordsCompleted: number;
  accuracy: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  timeElapsed: number;
  boostActive: boolean;
  boostTimer: number;
}

const INITIAL_HEALTH = 3;
const MAX_HEALTH = 3;
const WORD_QUEUE_SIZE = 8;

function createParticle(
  x: number,
  y: number,
  type: Particle["type"],
  idCounter: number
): Particle {
  const colors = {
    spark: ["#FFD700", "#FF6B00", "#FF4500", "#FFA500", "#FFFF00"],
    smoke: ["#888", "#aaa", "#666", "#999", "#bbb"],
    star: ["#00FFFF", "#FF00FF", "#FFD700", "#00FF88", "#FF6B6B"],
    exhaust: ["#555", "#777", "#444", "#666"],
  };
  const colorArr = colors[type];
  const color = colorArr[Math.floor(Math.random() * colorArr.length)];

  if (type === "spark") {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    return {
      id: idCounter,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color,
      size: 3 + Math.random() * 4,
      life: 1,
      maxLife: 1,
      type,
    };
  } else if (type === "smoke") {
    return {
      id: idCounter,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 10,
      vx: -1 - Math.random() * 2,
      vy: -0.5 - Math.random() * 1.5,
      color,
      size: 8 + Math.random() * 12,
      life: 1,
      maxLife: 1,
      type,
    };
  } else if (type === "star") {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 4;
    return {
      id: idCounter,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      color,
      size: 4 + Math.random() * 6,
      life: 1,
      maxLife: 1,
      type,
    };
  } else {
    return {
      id: idCounter,
      x,
      y,
      vx: -2 - Math.random() * 3,
      vy: (Math.random() - 0.5) * 1,
      color,
      size: 6 + Math.random() * 8,
      life: 1,
      maxLife: 1,
      type,
    };
  }
}

export function useGameEngine() {
  const [state, setState] = useState<GameEngineState>(() => ({
    gameState: "start",
    score: 0,
    wpm: 0,
    combo: 0,
    maxCombo: 0,
    level: 1,
    health: INITIAL_HEALTH,
    maxHealth: MAX_HEALTH,
    bikeX: 120,
    bikeY: 0,
    bikeSpeed: 0,
    targetSpeed: 0,
    wordQueue: generateWordQueue(WORD_QUEUE_SIZE, 1),
    currentWordIndex: 0,
    typedSoFar: "",
    isError: false,
    particles: [],
    floatingTexts: [],
    trailPoints: [],
    roadOffset: 0,
    bgOffset: 0,
    shake: 0,
    wordsCompleted: 0,
    accuracy: 100,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    timeElapsed: 0,
    boostActive: false,
    boostTimer: 0,
  }));

  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const particleIdRef = useRef<number>(0);
  const floatIdRef = useRef<number>(0);
  const stateRef = useRef<GameEngineState>(state);

  stateRef.current = state;

  const startGame = useCallback(() => {
    const queue = generateWordQueue(WORD_QUEUE_SIZE, 1);
    setState({
      gameState: "playing",
      score: 0,
      wpm: 0,
      combo: 0,
      maxCombo: 0,
      level: 1,
      health: INITIAL_HEALTH,
      maxHealth: MAX_HEALTH,
      bikeX: 120,
      bikeY: 0,
      bikeSpeed: 0,
      targetSpeed: 0,
      wordQueue: queue,
      currentWordIndex: 0,
      typedSoFar: "",
      isError: false,
      particles: [],
      floatingTexts: [],
      trailPoints: [],
      roadOffset: 0,
      bgOffset: 0,
      shake: 0,
      wordsCompleted: 0,
      accuracy: 100,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      timeElapsed: 0,
      boostActive: false,
      boostTimer: 0,
    });
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gameState: prev.gameState === "playing" ? "paused" : "playing",
    }));
  }, []);

  const handleKeyInput = useCallback((key: string) => {
    setState((prev) => {
      if (prev.gameState !== "playing") return prev;

      const currentWord = prev.wordQueue[prev.currentWordIndex];
      if (!currentWord) return prev;

      const newParticles = [...prev.particles];
      const newFloatingTexts = [...prev.floatingTexts];
      let newTyped = prev.typedSoFar;
      let newIsError = prev.isError;
      let newScore = prev.score;
      let newCombo = prev.combo;
      let newMaxCombo = prev.maxCombo;
      let newHealth = prev.health;
      let newShake = prev.shake;
      let newWordIndex = prev.currentWordIndex;
      let newWordQueue = [...prev.wordQueue];
      let newWordsCompleted = prev.wordsCompleted;
      let newTotalKeystrokes = prev.totalKeystrokes + 1;
      let newCorrectKeystrokes = prev.correctKeystrokes;
      let newBoostActive = prev.boostActive;
      let newBoostTimer = prev.boostTimer;
      let newLevel = prev.level;
      let newTargetSpeed = prev.targetSpeed;

      const expectedChar = currentWord[newTyped.length];

      if (key === "Backspace") {
        if (newTyped.length > 0) {
          newTyped = newTyped.slice(0, -1);
          newIsError = false;
        }
        newTotalKeystrokes = prev.totalKeystrokes;
        return { ...prev, typedSoFar: newTyped, isError: newIsError };
      }

      if (key.length !== 1) return prev;

      if (key === expectedChar) {
        newTyped = prev.typedSoFar + key;
        newIsError = false;
        newCorrectKeystrokes = prev.correctKeystrokes + 1;

        // Completed word!
        if (newTyped === currentWord) {
          newWordsCompleted += 1;
          newCombo += 1;
          newMaxCombo = Math.max(newMaxCombo, newCombo);

          // Level up every 10 words
          newLevel = Math.floor(newWordsCompleted / 10) + 1;

          // Score calculation
          const comboMultiplier = 1 + Math.floor(newCombo / 3) * 0.5;
          const lengthBonus = currentWord.length;
          const levelBonus = newLevel;
          const wordScore = Math.round(100 * lengthBonus * comboMultiplier * levelBonus / 5);
          newScore += wordScore;

          // Boost on 5-combo
          if (newCombo > 0 && newCombo % 5 === 0) {
            newBoostActive = true;
            newBoostTimer = 180;
          }

          newTargetSpeed = Math.min(12, 3 + newCombo * 0.5 + newLevel * 0.3);

          // Spawn sparks
          const bikeX = prev.bikeX;
          const bikeY = prev.bikeY;
          for (let i = 0; i < 12; i++) {
            newParticles.push(
              createParticle(bikeX, bikeY, "spark", ++particleIdRef.current)
            );
          }
          if (newCombo >= 3) {
            for (let i = 0; i < 6; i++) {
              newParticles.push(
                createParticle(bikeX, bikeY, "star", ++particleIdRef.current)
              );
            }
          }

          // Floating score text
          const comboText = newCombo > 1 ? ` ×${newCombo}` : "";
          newFloatingTexts.push({
            id: ++floatIdRef.current,
            text: `+${wordScore}${comboText}`,
            x: bikeX + 30,
            y: bikeY - 20,
            color: newCombo >= 5 ? "#FFD700" : newCombo >= 3 ? "#00FFFF" : "#00FF88",
            life: 1,
          });

          // Advance word
          newWordIndex = prev.currentWordIndex + 1;
          newTyped = "";

          // Refill queue
          if (newWordIndex >= newWordQueue.length - 3) {
            const extras = generateWordQueue(4, newLevel);
            newWordQueue = [...newWordQueue, ...extras];
          }
        }
      } else {
        // Wrong key
        newIsError = true;
        newCombo = 0;
        newTargetSpeed = Math.max(0, prev.targetSpeed - 1);
        newShake = 8;

        if (!prev.isError) {
          // Only damage on first wrong key of a word attempt
          newHealth = Math.max(0, prev.health - 1);
        }

        // Smoke on error
        for (let i = 0; i < 5; i++) {
          newParticles.push(
            createParticle(prev.bikeX, prev.bikeY, "smoke", ++particleIdRef.current)
          );
        }

        newFloatingTexts.push({
          id: ++floatIdRef.current,
          text: "MISS!",
          x: prev.bikeX + 30,
          y: prev.bikeY - 10,
          color: "#FF4444",
          life: 1,
        });
      }

      const newAccuracy =
        newTotalKeystrokes > 0
          ? Math.round((newCorrectKeystrokes / newTotalKeystrokes) * 100)
          : 100;

      const gameOver = newHealth <= 0;

      return {
        ...prev,
        typedSoFar: newTyped,
        isError: newIsError,
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        health: newHealth,
        shake: newShake,
        wordQueue: newWordQueue,
        currentWordIndex: newWordIndex,
        wordsCompleted: newWordsCompleted,
        particles: newParticles,
        floatingTexts: newFloatingTexts,
        accuracy: newAccuracy,
        totalKeystrokes: newTotalKeystrokes,
        correctKeystrokes: newCorrectKeystrokes,
        boostActive: newBoostActive,
        boostTimer: newBoostTimer,
        level: newLevel,
        targetSpeed: newTargetSpeed,
        gameState: gameOver ? "gameover" : prev.gameState,
      };
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (state.gameState !== "playing") {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = timestamp;

      setState((prev) => {
        if (prev.gameState !== "playing") return prev;

        // Physics
        const newBikeSpeed = prev.bikeSpeed + (prev.targetSpeed - prev.bikeSpeed) * 0.05 * dt;
        const newRoadOffset = (prev.roadOffset + newBikeSpeed * dt * 2) % 80;
        const newBgOffset = (prev.bgOffset + newBikeSpeed * dt * 0.3) % 600;
        const newShake = Math.max(0, prev.shake - 0.8 * dt);
        const newTimeElapsed = prev.timeElapsed + dt / 60;

        // WPM (words per minute)
        const newWpm =
          newTimeElapsed > 0
            ? Math.round((prev.wordsCompleted / newTimeElapsed) * 60)
            : 0;

        // Boost
        let newBoostActive = prev.boostActive;
        let newBoostTimer = prev.boostTimer - dt;
        if (newBoostTimer <= 0) {
          newBoostActive = false;
          newBoostTimer = 0;
        }

        // Slow down over time if not typing
        const newTargetSpeed = Math.max(
          0,
          prev.targetSpeed - 0.02 * dt
        );

        // Particles
        const newParticles: Particle[] = [];
        for (const p of prev.particles) {
          const lifeDecay = p.type === "smoke" ? 0.018 : p.type === "exhaust" ? 0.025 : 0.03;
          const newLife = p.life - lifeDecay * dt;
          if (newLife <= 0) continue;
          newParticles.push({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            vy: p.vy + (p.type === "spark" ? 0.15 * dt : p.type === "smoke" ? -0.05 * dt : 0),
            size: p.type === "smoke" ? p.size + 0.3 * dt : p.size,
            life: newLife,
          });
        }

        // Add exhaust particles while moving
        if (newBikeSpeed > 0.5 && Math.random() < 0.4) {
          newParticles.push(
            createParticle(prev.bikeX - 10, prev.bikeY + 15, "exhaust", ++particleIdRef.current)
          );
        }

        // Floating texts
        const newFloatingTexts: FloatingText[] = [];
        for (const ft of prev.floatingTexts) {
          const newLife = ft.life - 0.025 * dt;
          if (newLife <= 0) continue;
          newFloatingTexts.push({ ...ft, y: ft.y - 0.8 * dt, life: newLife });
        }

        return {
          ...prev,
          bikeSpeed: newBikeSpeed,
          roadOffset: newRoadOffset,
          bgOffset: newBgOffset,
          shake: newShake,
          timeElapsed: newTimeElapsed,
          wpm: newWpm,
          particles: newParticles,
          floatingTexts: newFloatingTexts,
          targetSpeed: newTargetSpeed,
          boostActive: newBoostActive,
          boostTimer: newBoostTimer,
        };
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state.gameState]);

  return { state, startGame, togglePause, handleKeyInput };
}
