import { useState, useCallback } from "react";

export interface HighScoreEntry {
  name: string;
  score: number;
  wpm: number;
  date: string;
}

const STORAGE_KEY = "moto-type-racer-highscores";
const MAX_ENTRIES = 10;

export function useHighScores() {
  const [scores, setScores] = useState<HighScoreEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addScore = useCallback((entry: HighScoreEntry) => {
    setScores((prev) => {
      const next = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearScores = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setScores([]);
  }, []);

  const isHighScore = useCallback(
    (score: number) => {
      if (scores.length < MAX_ENTRIES) return true;
      return score > (scores[scores.length - 1]?.score ?? 0);
    },
    [scores]
  );

  return { scores, addScore, clearScores, isHighScore };
}
