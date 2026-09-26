import { useEffect, useRef } from "react";

interface Props {
  wordQueue: string[];
  currentWordIndex: number;
  typedSoFar: string;
  isError: boolean;
  combo: number;
}

export default function WordDisplay({
  wordQueue,
  currentWordIndex,
  typedSoFar,
  isError,
  combo,
}: Props) {
  const currentWord = wordQueue[currentWordIndex] ?? "";
  const nextWords = wordQueue.slice(currentWordIndex + 1, currentWordIndex + 4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Shake on error
  useEffect(() => {
    if (isError && containerRef.current) {
      containerRef.current.classList.add("animate-shake");
      setTimeout(() => containerRef.current?.classList.remove("animate-shake"), 300);
    }
  }, [isError]);

  const comboColor =
    combo >= 10
      ? "text-yellow-300"
      : combo >= 5
      ? "text-cyan-300"
      : combo >= 3
      ? "text-green-400"
      : "text-white";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Combo indicator */}
      {combo >= 2 && (
        <div
          className={`text-sm font-bold tracking-widest uppercase ${comboColor} transition-all`}
          style={{
            textShadow:
              combo >= 5
                ? "0 0 20px currentColor"
                : undefined,
            animation: combo >= 3 ? "pulse 0.5s ease-in-out infinite alternate" : undefined,
          }}
        >
          {combo >= 10
            ? "🔥 LEGENDARY COMBO"
            : combo >= 7
            ? "⚡ INSANE COMBO"
            : combo >= 5
            ? "🌟 SUPER COMBO"
            : combo >= 3
            ? "✨ COMBO"
            : "COMBO"}{" "}
          ×{combo}
        </div>
      )}

      {/* Current word */}
      <div ref={containerRef} className="relative">
        <div
          className={`text-4xl md:text-5xl font-bold tracking-wider transition-all duration-100 select-none`}
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          {currentWord.split("").map((char, i) => {
            let color: string;
            let shadow: string = "none";
            if (i < typedSoFar.length) {
              color = "#00FF88";
              shadow = "0 0 12px #00FF88";
            } else if (i === typedSoFar.length && isError) {
              color = "#FF4444";
              shadow = "0 0 12px #FF4444";
            } else if (i === typedSoFar.length) {
              color = "#FFFFFF";
              shadow = "0 0 8px rgba(255,255,255,0.5)";
            } else {
              color = "rgba(255,255,255,0.35)";
            }
            return (
              <span
                key={i}
                style={{
                  color,
                  textShadow: shadow,
                  transition: "color 0.05s, text-shadow 0.05s",
                  display: "inline-block",
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Typing cursor */}
        <span
          className="absolute bottom-0 bg-white"
          style={{
            left: `${(typedSoFar.length / Math.max(currentWord.length, 1)) * 100}%`,
            width: "2px",
            height: "4px",
            animation: "blink 1s step-end infinite",
            boxShadow: "0 0 6px white",
          }}
        />
      </div>

      {/* Next words preview */}
      <div className="flex gap-4 text-sm opacity-50">
        {nextWords.map((w, i) => (
          <span
            key={i}
            className="text-white tracking-wide"
            style={{
              fontFamily: "'Orbitron', monospace",
              opacity: 0.5 - i * 0.12,
              fontSize: `${14 - i * 2}px`,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Touch keyboard hint */}
      <div className="text-xs text-white/30 mt-1 tracking-wider uppercase">
        type the word above
      </div>
    </div>
  );
}
