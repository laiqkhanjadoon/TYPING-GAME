import { useState } from "react";
import StartScreen from "./StartScreen";
import GameCanvas from "./GameCanvas";
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

  /*
   * Keep these states here for now so we don't
   * break your existing high-score flow.
   *
   * If your current App.tsx already gets highScores
   * from useHighScores, we will reconnect that exact
   * logic in the next step if necessary.
   */

  const [highScores, setHighScores] =
    useState<HighScoreEntry[]>([]);

  const handleStart = (
    settings: GameSettings
  ) => {
    setGameSettings(settings);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  const handleClearScores = () => {
    setHighScores([]);
  };

  if (!gameStarted) {
    return (
      <StartScreen
        onStart={handleStart}
        highScores={highScores}
        onClearScores={handleClearScores}
      />
    );
  }

  return (
    <GameCanvas
      settings={gameSettings}
      onBackToMenu={handleBackToMenu}
    />
  );
}
