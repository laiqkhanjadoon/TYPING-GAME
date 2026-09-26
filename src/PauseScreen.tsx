interface Props {
  onResume: () => void;
  onHome: () => void;
  score: number;
  wpm: number;
}

export default function PauseScreen({ onResume, onHome, score, wpm }: Props) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,20,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div className="text-center space-y-6 px-6">
        <div
          className="text-4xl font-black text-white tracking-widest"
          style={{
            fontFamily: "'Orbitron', monospace",
            textShadow: "0 0 30px rgba(0,200,255,0.8)",
          }}
        >
          PAUSED
        </div>

        <div className="flex gap-6 justify-center text-center">
          <div>
            <div
              className="text-2xl font-black text-yellow-400"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              {score.toLocaleString()}
            </div>
            <div className="text-xs text-white/40 tracking-widest uppercase">Score</div>
          </div>
          <div>
            <div
              className="text-2xl font-black text-green-400"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              {wpm}
            </div>
            <div className="text-xs text-white/40 tracking-widest uppercase">WPM</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-4 font-black text-black text-lg tracking-widest uppercase rounded-xl transition-all active:scale-95"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(135deg, #00FF88, #00CCFF)",
              boxShadow: "0 0 30px rgba(0,255,136,0.5)",
            }}
          >
            ▶ RESUME
          </button>
          <button
            onClick={onHome}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all active:scale-95"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            🏠 QUIT TO MENU
          </button>
        </div>

        <div className="text-xs text-white/30 tracking-widest">
          Press ESC or P to resume
        </div>
      </div>
    </div>
  );
}
