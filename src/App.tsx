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
    useState<GameSettings>(DEFAULT_GAME_SETTINGS);

  const [gameStarted, setGameStarted] = useState(false);

  const [highScores, setHighScores] =
    useState<HighScoreEntry[]>([]);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const {
    state,
    startGame,
    togglePause,
    handleKeyInput,
  } = useGameEngine();

  // Keep canvas size synced with browser window
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Start actual game when user clicks START RACE
  useEffect(() => {
    if (gameStarted) {
      startGame();
    }
  }, [gameStarted, startGame]);

  // Keyboard input
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        togglePause();
        return;
      }

      handleKeyInput(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted, handleKeyInput, togglePause]);

  const handleStart = (settings: GameSettings) => {
    setGameSettings(settings);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  const handleClearScores = () => {
    setHighScores([]);
  };

  // Menu
  if (!gameStarted) {
    return (
      <StartScreen
        onStart={handleStart}
        highScores={highScores}
        onClearScores={handleClearScores}
      />
    );
  }

  // Game
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
      <GameCanvas
        state={state}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Back to menu */}
      <button
        onClick={handleBackToMenu}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 100,
          padding: "10px 18px",
          borderRadius: "10px",
          border: "1px solid rgba(0,255,255,0.4)",
          background: "rgba(0,0,0,0.6)",
          color: "#00ffff",
          cursor: "pointer",
          fontFamily: "monospace",
          fontWeight: "bold",
          backdropFilter: "blur(10px)",
        }}
      >
        ← MENU
      </button>

      {/* Current settings */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 100,
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid rgba(0,255,255,0.3)",
          background: "rgba(0,0,0,0.55)",
          color: "#ffffff",
          fontFamily: "monospace",
          fontSize: "12px",
          backdropFilter: "blur(10px)",
        }}
      >
        {gameSettings.difficulty.toUpperCase()} ·{" "}
        {gameSettings.typingMode.toUpperCase()} ·{" "}
        {gameSettings.vehicle.toUpperCase()}
      </div>
    </div>
  );
}
