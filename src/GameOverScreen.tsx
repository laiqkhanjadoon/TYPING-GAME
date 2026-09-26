import { useState, useEffect } from "react";
import type { HighScoreEntry } from "./useHighScores";

interface Props {
  score: number;
  wpm: number;
  maxCombo: number;
  accuracy: number;
  wordsCompleted: number;
  level: number;
  isHighScore: boolean;
  onRestart: () => void;
  onHome: () => void;
  onSaveScore: (entry: HighScoreEntry) => void;
  highScores: HighScoreEntry[];
}

export default function GameOverScreen({
  score,
  wpm,
  maxCombo,
  accuracy,
  wordsCompleted,
  level,
  isHighScore,
  onRestart,
  onHome,
  onSaveScore,
  highScores,
}: Props) {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    onSaveScore({
      name: name.trim().slice(0, 12),
      score,
      wpm,
      date: new Date().toLocaleDateString(),
    });
    setSaved(true);
  };

  const rating =
    wpm > 80
      ? { label: "LEGENDARY", color: "#FFD700", emoji: "🏆" }
      : wpm > 60
      ? { label: "AMAZING", color: "#FF6600", emoji: "🔥" }
      : wpm > 40
      ? { label: "GREAT", color: "#00FF88", emoji: "⚡" }
      : wpm > 25
      ? { label: "GOOD", color: "#00CCFF", emoji: "👍" }
      : { label: "KEEP TRYING", color: "#AAAAAA", emoji: "💪" };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at center, rgba(20,0,40,0.95) 0%, rgba(0,0,20,0.98) 100%)",
      }}
    >
      <div
        className={`relative w-full max-w-md transition-all duration-500 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        {/* Glow bg */}
        <div
          className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
          style={{ background: "linear-gradient(135deg, #FF6600, #FF3300, #CC0000)" }}
        />

        <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
          {/* Title */}
          <div className="text-center">
            <div
              className="text-3xl font-black text-red-500 tracking-widest"
              style={{
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 30px #FF0000",
              }}
            >
              GAME OVER
            </div>
            {isHighScore && !saved && (
              <div
                className="text-sm font-bold text-yellow-400 mt-1 tracking-wider"
                style={{ animation: "pulse 1s ease-in-out infinite" }}
              >
                🏆 NEW HIGH SCORE!
              </div>
            )}
          </div>

          {/* Rating */}
          <div
            className="text-center py-3 rounded-xl border"
            style={{
              borderColor: `${rating.color}40`,
              background: `${rating.color}10`,
            }}
          >
            <div className="text-3xl mb-1">{rating.emoji}</div>
            <div
              className="text-xl font-black tracking-widest"
              style={{
                fontFamily: "'Orbitron', monospace",
                color: rating.color,
                textShadow: `0 0 20px ${rating.color}`,
              }}
            >
              {rating.label}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "SCORE", value: score.toLocaleString(), color: "#FFD700" },
              { label: "WPM", value: wpm.toString(), color: "#00FF88" },
              { label: "MAX COMBO", value: `×${maxCombo}`, color: "#00CCFF" },
              { label: "ACCURACY", value: `${accuracy}%`, color: "#FF9900" },
              { label: "WORDS", value: wordsCompleted.toString(), color: "#FF66FF" },
              { label: "LEVEL", value: level.toString(), color: "#FF6600" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 rounded-xl p-3 text-center border border-white/5"
              >
                <div
                  className="text-xl font-black"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    color: stat.color,
                    textShadow: `0 0 10px ${stat.color}50`,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-0.5 tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Save score */}
          {isHighScore && !saved ? (
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">
                Enter your name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  maxLength={12}
                  placeholder="Your name..."
                  autoFocus
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400/50 transition-colors"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                />
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="px-4 py-2 bg-yellow-400 text-black font-black text-sm rounded-lg disabled:opacity-40 transition-all active:scale-95"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  SAVE
                </button>
              </div>
            </div>
          ) : saved ? (
            <div className="text-center text-green-400 text-sm">✅ Score saved!</div>
          ) : null}

          {/* Leaderboard preview */}
          {highScores.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
                Top Scores
              </div>
              <div className="space-y-1">
                {highScores.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/60">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {s.name}
                    </span>
                    <span
                      className="text-yellow-400 font-bold"
                      style={{ fontFamily: "'Orbitron', monospace", fontSize: 13 }}
                    >
                      {s.score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 py-3 font-black text-black text-sm tracking-widest uppercase rounded-xl transition-all active:scale-95"
              style={{
                fontFamily: "'Orbitron', monospace",
                background: "linear-gradient(135deg, #00FF88, #00CCFF)",
                boxShadow: "0 0 20px rgba(0,255,136,0.4)",
              }}
            >
              ⚡ RESTART
            </button>
            <button
              onClick={onHome}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all active:scale-95"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              🏠 HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
