import { useEffect, useRef, useCallback, useState } from "react";
import { useGameEngine } from "./useGameEngine";
import { useHighScores } from "./useHighScores";
import GameCanvas from "./GameCanvas";
import WordDisplay from "./WordDisplay";
import HUD from "./HUD";
import StartScreen from "./StartScreen";
import PauseScreen from "./PauseScreen";
import GameOverScreen from "./GameOverScreen";

// Countdown overlay component
function CountdownOverlay({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count <= 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 700);
    return () => clearTimeout(t);
  }, [count, onDone]);
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
      style={{ background: "rgba(0,0,20,0.6)", backdropFilter: "blur(2px)" }}>
      <div
        key={count}
        className="text-white font-black"
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: count === 0 ? "5rem" : "8rem",
          textShadow: count > 0 ? "0 0 40px #FF6600, 0 0 80px #FF3300" : "0 0 40px #00FF88",
          color: count > 0 ? "#FF6600" : "#00FF88",
          animation: "countIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {count > 0 ? count : "GO!"}
      </div>
      <style>{`
        @keyframes countIn {
          from { transform: scale(2); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

export default function App() {
  const { state, startGame, togglePause, handleKeyInput } = useGameEngine();
  const { scores, addScore, clearScores, isHighScore } = useHighScores();
  const { width, height } = useWindowSize();
  const inputRef = useRef<HTMLInputElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showScoreSaved, setShowScoreSaved] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [healthFlash, setHealthFlash] = useState(false);
  const prevHealthRef = useRef(state.health);

  // Flash red when health decreases
  useEffect(() => {
    if (state.health < prevHealthRef.current) {
      setHealthFlash(true);
      setTimeout(() => setHealthFlash(false), 400);
    }
    prevHealthRef.current = state.health;
  }, [state.health]);

  const handleStartGame = useCallback(() => {
    setShowCountdown(true);
    setPendingStart(true);
  }, []);

  const handleCountdownDone = useCallback(() => {
    setShowCountdown(false);
    setPendingStart(false);
    startGame();
  }, [startGame]);

  // Focus hidden input on game start for mobile keyboard
  useEffect(() => {
    if (state.gameState === "playing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state.gameState]);

  // Keyboard input
  useEffect(() => {
    if (state.gameState !== "playing") return;

    const handler = (e: KeyboardEvent) => {
      // Don't process modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Pause on Escape or P (but P still processes as a letter if not alone)
      if (e.key === "Escape") {
        togglePause();
        return;
      }

      if (e.key === "Backspace" || e.key.length === 1) {
        e.preventDefault();
        handleKeyInput(e.key);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.gameState, handleKeyInput, togglePause]);

  // Also listen for Escape during pause
  useEffect(() => {
    if (state.gameState !== "paused") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        togglePause();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.gameState, togglePause]);

  // Mobile: hidden input for touch keyboard
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      e.target.value = ""; // clear immediately
      if (val.length > 0) {
        handleKeyInput(val[val.length - 1]);
      }
    },
    [handleKeyInput]
  );

  const handleTouchArea = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const goHome = useCallback(() => {
    // We'll call startGame to reset state but immediately override gameState
    // by re-initializing — simplest is to reload
    window.location.reload();
  }, []);

  const handleSaveScore = useCallback(
    (entry: Parameters<typeof addScore>[0]) => {
      addScore(entry);
      setShowScoreSaved(true);
      setTimeout(() => setShowScoreSaved(false), 2000);
    },
    [addScore]
  );

  const canvasH = Math.round(height * 0.52);
  const bikeScreenX = Math.min(width * 0.22, 180);
  const bikeScreenY = Math.round(canvasH * 0.62);

  return (
    <div
      ref={gameContainerRef}
      className="relative overflow-hidden select-none"
      style={{
        width: "100vw",
        height: "100dvh",
        background: "#050010",
        fontFamily: "'Inter', sans-serif",
        touchAction: "none",
      }}
      onClick={handleTouchArea}
    >
      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        style={{ top: -100, left: 0, width: 1, height: 1 }}
        onChange={handleInputChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* ===== START SCREEN ===== */}
      {state.gameState === "start" && (
        <>
          <StartScreen
            onStart={handleStartGame}
            highScores={scores}
            onClearScores={clearScores}
          />
          {showCountdown && pendingStart && (
            <CountdownOverlay onDone={handleCountdownDone} />
          )}
        </>
      )}

      {/* ===== GAME ===== */}
      {(state.gameState === "playing" || state.gameState === "paused") && (
        <>
          {/* Game canvas - top portion */}
          <div
            className="relative w-full"
            style={{ height: canvasH }}
          >
            <GameCanvas
              state={{ ...state, bikeX: bikeScreenX, bikeY: bikeScreenY }}
              width={width}
              height={canvasH}
            />
            <HUD
              score={state.score}
              wpm={state.wpm}
              combo={state.combo}
              health={state.health}
              maxHealth={state.maxHealth}
              level={state.level}
              accuracy={state.accuracy}
              bikeSpeed={state.bikeSpeed}
              boostActive={state.boostActive}
              boostTimer={state.boostTimer}
              onPause={togglePause}
            />
          </div>

          {/* Typing area - bottom portion */}
          <div
            className="relative flex flex-col items-center justify-center gap-4 px-4 py-4"
            style={{
              height: `calc(100dvh - ${canvasH}px)`,
              background: healthFlash
                ? "linear-gradient(180deg, rgba(80,0,0,0.95) 0%, rgba(40,0,0,0.98) 100%)"
                : "linear-gradient(180deg, rgba(5,0,16,0.95) 0%, rgba(10,0,30,0.98) 100%)",
              borderTop: healthFlash ? "1px solid rgba(255,0,0,0.5)" : "1px solid rgba(0,255,255,0.15)",
              boxShadow: "0 -20px 60px rgba(0,0,40,0.8)",
              transition: "background 0.3s ease, border-top 0.3s ease",
            }}
          >
            {/* Neon divider line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, #00FFFF, #FF00FF, transparent)",
                boxShadow: "0 0 10px #00FFFF",
              }}
            />

            {/* Word display */}
            <WordDisplay
              wordQueue={state.wordQueue}
              currentWordIndex={state.currentWordIndex}
              typedSoFar={state.typedSoFar}
              isError={state.isError}
              combo={state.combo}
            />

            {/* Stats bar */}
            <div className="flex gap-6 text-center">
              <div>
                <div
                  className="text-lg font-black text-white/90"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  {state.wordsCompleted}
                </div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Words</div>
              </div>
              <div>
                <div
                  className="text-lg font-black"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    color: state.wpm > 60 ? "#00FF88" : "#FFFFFF",
                    textShadow: state.wpm > 60 ? "0 0 12px #00FF88" : undefined,
                  }}
                >
                  {state.wpm}
                </div>
                <div className="text-xs text-white/30 uppercase tracking-widest">WPM</div>
              </div>
              <div>
                <div
                  className="text-lg font-black text-white/90"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  ×{state.combo}
                </div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Combo</div>
              </div>
              <div>
                <div
                  className="text-lg font-black"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    color: state.accuracy >= 90 ? "#00FF88" : state.accuracy >= 70 ? "#FFAA00" : "#FF4444",
                  }}
                >
                  {state.accuracy}%
                </div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Acc</div>
              </div>
            </div>

            {/* Keyboard hint / mobile tap button */}
            <div className="flex items-center gap-3">
              {state.typedSoFar.length === 0 && state.wordsCompleted === 0 && (
                <div
                  className="text-xs text-white/25 tracking-widest animate-pulse"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  START TYPING TO RACE...
                </div>
              )}
              {/* Mobile keyboard button */}
              <button
                className="pointer-events-auto md:hidden flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-white/60 text-xs tracking-wider uppercase transition-all active:scale-95"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                ⌨️ Keyboard
              </button>
            </div>
          </div>

          {/* PAUSE OVERLAY */}
          {state.gameState === "paused" && (
            <PauseScreen
              onResume={togglePause}
              onHome={goHome}
              score={state.score}
              wpm={state.wpm}
            />
          )}
        </>
      )}

      {/* ===== GAME OVER ===== */}
      {state.gameState === "gameover" && (
        <GameOverScreen
          score={state.score}
          wpm={state.wpm}
          maxCombo={state.maxCombo}
          accuracy={state.accuracy}
          wordsCompleted={state.wordsCompleted}
          level={state.level}
          isHighScore={isHighScore(state.score)}
          onRestart={startGame}
          onHome={goHome}
          onSaveScore={handleSaveScore}
          highScores={scores}
        />
      )}

      {/* Score saved toast */}
      {showScoreSaved && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500/90 text-white text-sm font-bold px-4 py-2 rounded-full z-50 tracking-wider"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          ✅ SCORE SAVED!
        </div>
      )}

      {/* Global CSS animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        * { -webkit-tap-highlight-color: transparent; }
        body { overflow: hidden; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}
