interface Props {
  score: number;
  wpm: number;
  combo: number;
  health: number;
  maxHealth: number;
  level: number;
  accuracy: number;
  bikeSpeed: number;
  boostActive: boolean;
  boostTimer: number;
  onPause: () => void;
}

function SpeedMeter({ speed, boost }: { speed: number; boost: boolean }) {
  const maxSpeed = 12;
  const pct = Math.min(speed / maxSpeed, 1);
  const angle = -135 + pct * 270;

  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 15 80 A 40 40 0 1 1 85 80"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Speed arc */}
        <path
          d="M 15 80 A 40 40 0 1 1 85 80"
          fill="none"
          stroke={boost ? "#FF6600" : pct > 0.7 ? "#FF4444" : pct > 0.4 ? "#FFAA00" : "#00FF88"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${pct * 188.5} 188.5`}
          style={{
            filter: `drop-shadow(0 0 4px ${boost ? "#FF6600" : pct > 0.7 ? "#FF4444" : "#00FF88"})`,
            transition: "stroke-dasharray 0.1s ease",
          }}
        />
        {/* Needle */}
        <line
          x1="50"
          y1="50"
          x2={50 + Math.cos(((angle - 90) * Math.PI) / 180) * 30}
          y2={50 + Math.sin(((angle - 90) * Math.PI) / 180) * 30}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 3px white)" }}
        />
        {/* Center dot */}
        <circle cx="50" cy="50" r="4" fill="white" />
        {/* Speed text */}
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontFamily="Orbitron, monospace"
          fontWeight="bold"
        >
          {Math.round(speed * 10)} km/h
        </text>
      </svg>
    </div>
  );
}

function HealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: maxHealth }, (_, i) => (
        <div
          key={i}
          className="relative"
          style={{ width: 28, height: 28 }}
        >
          <svg viewBox="0 0 28 28" width="28" height="28">
            <path
              d="M14 24 L4 14 A7 7 0 0 1 14 4 A7 7 0 0 1 24 14 Z"
              fill={i < health ? "#FF4444" : "rgba(255,68,68,0.15)"}
              stroke={i < health ? "#FF6666" : "rgba(255,68,68,0.3)"}
              strokeWidth="1.5"
              style={{
                filter: i < health ? "drop-shadow(0 0 4px #FF4444)" : undefined,
                transition: "fill 0.3s",
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

export default function HUD({
  score,
  wpm,
  combo,
  health,
  maxHealth,
  level,
  accuracy,
  bikeSpeed,
  boostActive,
  boostTimer,
  onPause,
}: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Top bar */}
      <div className="flex items-start justify-between px-3 pt-3 gap-2">
        {/* Left: Score + Level */}
        <div className="flex flex-col gap-1">
          <div
            className="text-2xl md:text-3xl font-black text-white tracking-wider"
            style={{
              fontFamily: "'Orbitron', monospace",
              textShadow: "0 0 20px rgba(0,255,136,0.5)",
            }}
          >
            {score.toLocaleString()}
          </div>
          <div
            className="text-xs text-cyan-400 tracking-widest uppercase"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            LVL {level}
          </div>
        </div>

        {/* Center: WPM */}
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="text-xl md:text-2xl font-bold"
            style={{
              fontFamily: "'Orbitron', monospace",
              color: wpm > 80 ? "#FFD700" : wpm > 50 ? "#00FF88" : "#FFFFFF",
              textShadow: wpm > 80 ? "0 0 15px #FFD700" : undefined,
            }}
          >
            {wpm}
          </div>
          <div className="text-xs text-white/50 tracking-widest uppercase">WPM</div>
        </div>

        {/* Right: Pause + Accuracy */}
        <div className="flex flex-col items-end gap-1">
          <button
            className="pointer-events-auto bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs tracking-wider uppercase transition-all active:scale-95"
            onClick={onPause}
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            ⏸ Pause
          </button>
          <div className="text-xs text-white/50">
            <span className="text-white/70">{accuracy}%</span> acc
          </div>
        </div>
      </div>

      {/* Health */}
      <div className="absolute left-3 top-20 md:top-24">
        <HealthBar health={health} maxHealth={maxHealth} />
      </div>

      {/* Speedometer */}
      <div className="absolute right-2 bottom-44 md:bottom-52">
        <SpeedMeter speed={bikeSpeed} boost={boostActive} />
      </div>

      {/* Boost indicator */}
      {boostActive && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-16"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          <div
            className="text-sm font-black tracking-widest text-orange-400 uppercase"
            style={{
              textShadow: "0 0 20px #FF6600, 0 0 40px #FF6600",
              animation: "pulse 0.3s ease-in-out infinite alternate",
            }}
          >
            ⚡ TURBO BOOST ⚡
          </div>
          <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{
                width: `${(boostTimer / 180) * 100}%`,
                boxShadow: "0 0 8px #FF6600",
              }}
            />
          </div>
        </div>
      )}

      {/* Combo flames */}
      {combo >= 5 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-52 text-2xl"
          style={{ animation: "pulse 0.5s ease-in-out infinite alternate" }}
        >
          {combo >= 10 ? "🔥🔥🔥" : combo >= 7 ? "🔥🔥" : "🔥"}
        </div>
      )}
    </div>
  );
}
