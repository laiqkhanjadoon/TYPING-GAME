<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Moto Type Racer - Start Screen Redesign</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              orbitron: ["Orbitron", "sans-serif"],
              inter: ["Inter", "sans-serif"],
            },
            colors: {
              cyber: {
                dark: "#050010",
                cyan: "#00f0ff",
                pink: "#ff007f",
                orange: "#ff6600",
                green: "#00ff88",
                yellow: "#ffd700",
              },
            },
          },
        },
      };
    </script>
    <style>
      @keyframes flareSweep {
        0% { transform: translateX(-150%) skewX(-25deg); }
        100% { transform: translateX(250%) skewX(-25deg); }
      }
      @keyframes pulseGlow {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.6)) drop-shadow(0 0 35px rgba(255, 0, 127, 0.4)); }
        50% { filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.9)) drop-shadow(0 0 50px rgba(255, 0, 127, 0.7)); }
      }
      @keyframes floatAnim {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes badgePulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.04); }
      }
      .anim-pulse-glow {
        animation: pulseGlow 3s ease-in-out infinite;
      }
      .anim-float {
        animation: floatAnim 4s ease-in-out infinite;
      }
      .anim-badge {
        animation: badgePulse 2s ease-in-out infinite;
      }
      .cyber-card {
        background: linear-gradient(135deg, rgba(20, 10, 45, 0.72) 0%, rgba(5, 0, 25, 0.85) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 240, 255, 0.25);
        box-shadow: 0 0 35px rgba(0, 240, 255, 0.12), inset 0 0 20px rgba(255, 0, 127, 0.08);
      }
      .cyber-card:hover {
        border-color: rgba(0, 240, 255, 0.45);
      }
      .flare-sweep:hover::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 60%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
        animation: flareSweep 0.85s ease forwards;
        pointer-events: none;
      }
      /* Custom scrollbars */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: rgba(5, 0, 16, 0.6); }
      ::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.4); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.8); }
    </style>
  </head>
  <body class="bg-[#050010] text-white font-inter overflow-hidden select-none m-0 p-0 w-screen h-screen">
    <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
      <!-- Animated Background Canvas -->
      <canvas id="bgCanvas" class="absolute inset-0 w-full h-full block pointer-events-none z-0"></canvas>

      <!-- Grid Cyber Overlay Pattern -->
      <div
        class="absolute inset-0 pointer-events-none z-0 opacity-20"
        style="background-image: radial-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 0); background-size: 32px 32px;"
      ></div>

      <!-- Top Utility Bar: Audio Toggle & Code Inspector Button -->
      <div class="absolute top-4 right-4 z-40 flex items-center gap-3">
        <button
          id="btnViewCode"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan font-orbitron text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
          <span>EXPORT TSX CODE</span>
        </button>

        <button
          id="btnAudioToggle"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 text-xs font-orbitron transition-all active:scale-95"
          title="Toggle UI Sound Effects"
        >
          <span id="audioIcon">🔊</span>
          <span id="audioStatus">SFX ON</span>
        </button>
      </div>

      <main class="relative z-10 w-full max-w-xl px-4 py-6 flex flex-col items-center max-h-[96vh] overflow-y-auto">
        <!-- Floating Animated Brand Header -->
        <div class="text-center anim-float mb-5">
          <!-- Animated Cyber Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-pink/15 border border-cyber-pink/50 text-cyber-pink text-[11px] font-orbitron font-bold tracking-widest uppercase mb-3 anim-badge shadow-[0_0_20px_rgba(255,0,127,0.35)]">
            <span class="w-2 h-2 rounded-full bg-cyber-pink animate-ping"></span>
            <span>CYBER RACER • EXPANSION V2.0</span>
          </div>

          <!-- Main Futuristic Title -->
          <h1
            class="text-5xl sm:text-6xl md:text-7xl font-black font-orbitron tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_0_35px_rgba(0,240,255,0.6)]"
          >
            MOTO
          </h1>
          <h2
            class="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-green to-cyber-yellow drop-shadow-[0_0_25px_rgba(0,255,136,0.6)] -mt-1"
          >
            TYPE RACER
          </h2>

          <p class="text-xs sm:text-sm font-orbitron tracking-[0.25em] text-cyan-200/60 mt-2 uppercase">
            ⚡ TYPE FAST • RIDE FASTER ⚡
          </p>
        </div>

        <!-- Central Glassmorphism Control Hub -->
        <div class="cyber-card rounded-2xl w-full p-5 sm:p-6 space-y-5 relative overflow-hidden transition-all duration-300">
          <!-- Corner Cyber Neon Accents -->
          <div class="absolute -top-10 -left-10 w-24 h-24 bg-cyber-cyan/20 rounded-full blur-xl pointer-events-none"></div>
          <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-cyber-pink/20 rounded-full blur-xl pointer-events-none"></div>

          <!-- Difficulty Selector Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-orbitron tracking-widest text-cyber-cyan uppercase font-bold flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-cyber-cyan" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"/>
                </svg>
                SELECT DIFFICULTY
              </span>
              <span id="difficultyBadge" class="text-[11px] font-orbitron font-semibold text-cyber-green px-2 py-0.5 rounded bg-cyber-green/10 border border-cyber-green/30">
                PRO RACER (3 HP)
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2.5" id="difficultyGroup">
              <!-- Easy Button -->
              <button
                data-diff="easy"
                data-hp="5"
                class="diff-btn relative flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <span class="text-xs font-orbitron font-black text-white group-hover:text-cyber-green transition-colors">ROOKIE</span>
                <span class="text-[10px] text-white/50 tracking-wider font-mono mt-0.5">5 HEARTS</span>
                <div class="mt-1 flex gap-0.5 text-emerald-400 text-[10px]">♥♥♥♥♥</div>
              </button>

              <!-- Medium Button (Default Active) -->
              <button
                data-diff="medium"
                data-hp="3"
                class="diff-btn active-diff relative flex flex-col items-center justify-center p-2.5 rounded-xl border border-cyber-cyan bg-cyber-cyan/15 transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <span class="text-xs font-orbitron font-black text-cyber-cyan group-hover:text-cyber-cyan transition-colors">PRO</span>
                <span class="text-[10px] text-cyber-cyan/80 tracking-wider font-mono mt-0.5">3 HEARTS</span>
                <div class="mt-1 flex gap-0.5 text-cyan-300 text-[10px]">♥♥♥</div>
              </button>

              <!-- Hard Button -->
              <button
                data-diff="hard"
                data-hp="1"
                class="diff-btn relative flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <span class="text-xs font-orbitron font-black text-white group-hover:text-cyber-pink transition-colors">NITRO</span>
                <span class="text-[10px] text-white/50 tracking-wider font-mono mt-0.5">1 HEART</span>
                <div class="mt-1 flex gap-0.5 text-rose-500 text-[10px]">♥</div>
              </button>
            </div>
          </div>

          <div class="space-y-3 pt-1">
            <!-- Pulsing Start Race Button -->
            <button
              id="btnStartGame"
              class="flare-sweep relative w-full py-4 rounded-xl font-orbitron font-black text-base sm:text-lg tracking-widest uppercase overflow-hidden transition-all duration-200 active:scale-[0.98] cursor-pointer group shadow-[0_0_30px_rgba(0,255,136,0.4)]"
              style="background: linear-gradient(135deg, #00f0ff 0%, #00ff88 50%, #ffd700 100%); color: #050010;"
            >
              <div class="relative z-10 flex items-center justify-center gap-2">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>IGNITE ENGINE • START RACE</span>
              </div>
            </button>

            <!-- Secondary Actions: Instructions & Reset High Scores -->
            <div class="grid grid-cols-2 gap-2.5">
              <button
                id="btnHowToPlay"
                class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyber-cyan/40 text-white font-orbitron text-xs tracking-wider transition-all cursor-pointer active:scale-95"
              >
                <svg class="w-3.5 h-3.5 text-cyber-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>HOW TO PLAY</span>
              </button>

              <button
                id="btnScoresToggle"
                class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyber-yellow/40 text-white font-orbitron text-xs tracking-wider transition-all cursor-pointer active:scale-95"
              >
                <svg class="w-3.5 h-3.5 text-cyber-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span>TOP RACERS (<span id="scoreCountLabel">3</span>)</span>
              </button>
            </div>
          </div>

          <div id="highScoresPanel" class="border-t border-white/10 pt-3.5 space-y-2">
            <div class="flex items-center justify-between text-xs font-orbitron tracking-widest text-white/50">
              <span class="flex items-center gap-1">
                <span>🏆</span>
                <span>HALL OF FAME</span>
              </span>
              <button id="btnClearScores" class="text-white/30 hover:text-rose-400 text-[11px] tracking-wider transition-colors cursor-pointer">
                RESET SCORES
              </button>
            </div>

            <div id="scoresList" class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <!-- Dynamically populated scores -->
            </div>
          </div>
        </div>

        <!-- Footnote credits -->
        <footer class="mt-4 text-center">
          <p class="text-xs font-orbitron text-white/40 tracking-wider">
            CREATED BY <span class="text-cyber-cyan font-bold">LAEEQ KHAN JADOON</span>
          </p>
        </footer>
      </main>

      <div id="modalInstructions" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-200">
        <div class="cyber-card rounded-2xl max-w-md w-full p-6 space-y-4 border border-cyber-cyan/40">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="font-orbitron font-black text-lg text-cyber-cyan tracking-wider flex items-center gap-2">
              <span>⚡</span> PILOT INSTRUCTIONS
            </h3>
            <button id="btnCloseModal" class="text-white/40 hover:text-white p-1 text-lg">✕</button>
          </div>

          <div class="space-y-3 text-sm text-slate-300">
            <div class="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-xl">⌨️</span>
              <div>
                <strong class="text-white font-orbitron block text-xs tracking-wider">TYPING ACCELERATION</strong>
                <p class="text-xs text-white/70">Type the displayed words letter-by-letter to rev engine RPM and gain speed.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-xl">🔥</span>
              <div>
                <strong class="text-white font-orbitron block text-xs tracking-wider">COMBO & TURBO BOOST</strong>
                <p class="text-xs text-white/70">Chain 5 consecutive perfect words without error to trigger nitro speed lines!</p>
              </div>
            </div>

            <div class="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-xl">❤️</span>
              <div>
                <strong class="text-white font-orbitron block text-xs tracking-wider">HEALTH & DAMAGE</strong>
                <p class="text-xs text-white/70">Typing incorrect keys deals direct engine damage. Run out of hearts and you wipe out!</p>
              </div>
            </div>

            <div class="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-xl">📱</span>
              <div>
                <strong class="text-white font-orbitron block text-xs tracking-wider">MOBILE SUPPORT</strong>
                <p class="text-xs text-white/70">Tap anywhere on the track or the keyboard toggle to prompt on-screen keyboards.</p>
              </div>
            </div>
          </div>

          <button id="btnGotIt" class="w-full py-3 rounded-xl bg-cyber-cyan text-black font-orbitron font-black text-xs tracking-widest uppercase transition-all hover:bg-cyan-300 active:scale-95 cursor-pointer">
            SYSTEMS READY • CLOSE
          </button>
        </div>
      </div>

      <div id="modalCode" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-200">
        <div class="cyber-card rounded-2xl max-w-3xl w-full p-5 space-y-3 border border-cyber-cyan/50 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 class="font-orbitron font-black text-sm text-cyber-cyan tracking-wider">src/StartScreen.tsx</h3>
              <p class="text-[11px] text-white/50">Replace your existing StartScreen.tsx with this upgraded code.</p>
            </div>
            <div class="flex items-center gap-2">
              <button id="btnCopyCode" class="px-3 py-1 bg-cyber-green text-black font-orbitron font-black text-xs rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer">
                <span>📋</span> COPY TSX
              </button>
              <button id="btnCloseCodeModal" class="text-white/40 hover:text-white p-1 text-lg">✕</button>
            </div>
          </div>

          <div class="flex-1 overflow-auto bg-black/70 rounded-xl p-3 border border-white/10 font-mono text-xs text-emerald-400">
            <pre><code id="tsxCodeBlock"></code></pre>
          </div>
        </div>
      </div>

      <!-- Simulated Game Start Countdown Overlay -->
      <div id="simulatedOverlay" class="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 hidden">
        <div id="countdownNumber" class="text-8xl font-orbitron font-black text-cyber-orange drop-shadow-[0_0_50px_#ff6600]">
          3
        </div>
        <p class="text-sm font-orbitron tracking-widest text-cyan-300 mt-4 animate-pulse">PREPARING MOTORCYCLE...</p>
      </div>
    </div>

    <script>
      // Sound synthesizer with Web Audio API (No external assets required)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      let soundEnabled = true;

      function playTone(freq, type = "sine", duration = 0.08, vol = 0.15) {
        if (!soundEnabled) return;
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(vol, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
      }

      // High scores mock data
      let highScores = [
        { name: "CYBER_ACE", score: 4850, wpm: 92 },
        { name: "NEO_RIDER", score: 3720, wpm: 76 },
        { name: "LAEEQ_KHAN", score: 3100, wpm: 68 },
      ];

      function renderScores() {
        const list = document.getElementById("scoresList");
        const countLabel = document.getElementById("scoreCountLabel");
        countLabel.textContent = highScores.length;

        if (highScores.length === 0) {
          list.innerHTML = `<div class="text-center py-3 text-xs text-white/30 font-orbitron">NO HIGH SCORES RECORDED</div>`;
          return;
        }

        list.innerHTML = highScores
          .slice(0, 5)
          .map((item, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            const color = i === 0 ? "text-cyber-yellow" : i === 1 ? "text-slate-200" : "text-amber-500";
            return `
              <div class="flex items-center justify-between py-1 px-2.5 rounded-lg bg-white/5 border border-white/5 text-xs hover:border-cyber-cyan/30 transition-all">
                <div class="flex items-center gap-2">
                  <span class="w-5 text-center font-bold font-orbitron ${color}">${medal}</span>
                  <span class="font-orbitron text-white/90 font-medium">${item.name}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-orbitron font-bold text-cyber-yellow">${item.score.toLocaleString()}</span>
                  <span class="text-[11px] text-white/40 font-mono">${item.wpm} WPM</span>
                </div>
              </div>
            `;
          })
          .join("");
      }

      const canvas = document.getElementById("bgCanvas");
      const ctx = canvas.getContext("2d");
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });

      // Procedural Stars
      const stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.65),
        size: Math.random() * 2 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.05 + 0.01,
      }));

      // Buildings
      const buildings = [
        { w: 50, h: 140 }, { w: 35, h: 90 }, { w: 60, h: 170 }, { w: 45, h: 110 },
        { w: 30, h: 150 }, { w: 55, h: 80 }, { w: 40, h: 130 }, { w: 50, h: 190 },
      ];

      let tick = 0;
      let bikeX = -80;

      function renderFrame() {
        tick++;
        ctx.clearRect(0, 0, width, height);

        // 1. Sky Gradient
        const skyGrd = ctx.createLinearGradient(0, 0, 0, height * 0.7);
        skyGrd.addColorStop(0, "#050012");
        skyGrd.addColorStop(0.5, "#150030");
        skyGrd.addColorStop(1, "#28004f");
        ctx.fillStyle = skyGrd;
        ctx.fillRect(0, 0, width, height);

        // 2. Stars
        stars.forEach((st) => {
          const a = Math.sin(tick * st.twinkleSpeed) * 0.4 + 0.6;
          ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha * a})`;
          ctx.fillRect(st.x, st.y, st.size, st.size);
        });

        // 3. Neon City Skyline
        const roadY = height * 0.68;
        let curX = -((tick * 0.8) % 360);
        while (curX < width + 100) {
          buildings.forEach((b, idx) => {
            const by = roadY - b.h;
            ctx.fillStyle = "#0c0422";
            ctx.fillRect(curX, by, b.w, b.h);

            // Neon roof trim
            ctx.strokeStyle = idx % 2 === 0 ? "rgba(0, 240, 255, 0.4)" : "rgba(255, 0, 127, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(curX, by);
            ctx.lineTo(curX + b.w, by);
            ctx.stroke();

            // Windows
            ctx.fillStyle = "rgba(0, 240, 255, 0.35)";
            for (let wy = by + 12; wy < roadY - 10; wy += 14) {
              for (let wx = curX + 6; wx < curX + b.w - 6; wx += 10) {
                if (Math.sin(wx * 2 + wy + tick * 0.02) > 0.3) {
                  ctx.fillRect(wx, wy, 4, 6);
                }
              }
            }
            curX += b.w + 6;
          });
        }

        // 4. Highway Surface
        const roadGrd = ctx.createLinearGradient(0, roadY, 0, height);
        roadGrd.addColorStop(0, "#100828");
        roadGrd.addColorStop(0.4, "#0a0418");
        roadGrd.addColorStop(1, "#030009");
        ctx.fillStyle = roadGrd;
        ctx.fillRect(0, roadY, width, height - roadY);

        // Neon Highway boundary lines
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, roadY);
        ctx.lineTo(width, roadY);
        ctx.stroke();

        ctx.shadowColor = "#ff007f";
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height - 8);
        ctx.lineTo(width, height - 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated Highway dashes
        ctx.save();
        ctx.setLineDash([35, 45]);
        ctx.lineDashOffset = -(tick * 7);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, roadY + (height - roadY) * 0.45);
        ctx.lineTo(width, roadY + (height - roadY) * 0.45);
        ctx.stroke();
        ctx.restore();

        // 5. Animated Racing Motorcycle
        bikeX = ((tick * 3.5) % (width + 250)) - 100;
        const bY = roadY + (height - roadY) * 0.42;

        ctx.save();
        ctx.translate(bikeX, bY);

        // Exhaust flame / sparks
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = i % 2 === 0 ? "rgba(0, 240, 255, 0.8)" : "rgba(255, 0, 127, 0.8)";
          ctx.beginPath();
          ctx.arc(-35 - i * 8, 12 + Math.sin(tick * 0.4 + i) * 3, 3 + (6 - i) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bike Wheels
        ctx.fillStyle = "#151515";
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2.5;
        // Rear wheel
        ctx.beginPath();
        ctx.arc(-26, 16, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Front wheel
        ctx.beginPath();
        ctx.arc(26, 16, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Neon Spokes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1;
        for (let a = 0; a < 4; a++) {
          const ang = tick * 0.2 + (a * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(-26, 16);
          ctx.lineTo(-26 + Math.cos(ang) * 11, 16 + Math.sin(ang) * 11);
          ctx.stroke();
        }

        // Chassis & Body
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(-26, 16);
        ctx.lineTo(-10, 2);
        ctx.lineTo(12, -2);
        ctx.lineTo(26, 16);
        ctx.stroke();

        // Engine & Tank
        ctx.fillStyle = "#ff6600";
        ctx.fillRect(-12, -3, 20, 14);

        // Rider Silhouette
        ctx.fillStyle = "#00f0ff";
        ctx.beginPath();
        ctx.arc(2, -18, 7, 0, Math.PI * 2); // Helmet
        ctx.fill();
        ctx.fillRect(-8, -12, 14, 12); // Torso

        // Headlight Beam
        const headGrd = ctx.createRadialGradient(30, 2, 2, 85, 2, 45);
        headGrd.addColorStop(0, "rgba(0, 240, 255, 0.8)");
        headGrd.addColorStop(1, "transparent");
        ctx.fillStyle = headGrd;
        ctx.beginPath();
        ctx.arc(32, 2, 40, -0.4, 0.4);
        ctx.lineTo(32, 2);
        ctx.fill();

        ctx.restore();

        requestAnimationFrame(renderFrame);
      }
      renderFrame();
      renderScores();

      let selectedDiff = "medium";
      const diffButtons = document.querySelectorAll(".diff-btn");
      const badge = document.getElementById("difficultyBadge");

      diffButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          playTone(550, "sine", 0.05);
          diffButtons.forEach((b) => {
            b.classList.remove("active-diff", "border-cyber-cyan", "bg-cyber-cyan/15", "shadow-[0_0_15px_rgba(0,240,255,0.25)]");
            b.classList.add("border-white/10", "bg-white/5");
            const label = b.querySelector(".font-orbitron");
            label.classList.remove("text-cyber-cyan");
            label.classList.add("text-white");
          });

          btn.classList.add("active-diff", "border-cyber-cyan", "bg-cyber-cyan/15", "shadow-[0_0_15px_rgba(0,240,255,0.25)]");
          btn.classList.remove("border-white/10", "bg-white/5");
          const label = btn.querySelector(".font-orbitron");
          label.classList.remove("text-white");
          label.classList.add("text-cyber-cyan");

          selectedDiff = btn.dataset.diff;
          const hp = btn.dataset.hp;
          badge.textContent = `${btn.querySelector(".font-orbitron").textContent} RACER (${hp} HP)`;
          badge.className = `text-[11px] font-orbitron font-semibold px-2 py-0.5 rounded border ${
            selectedDiff === "easy"
              ? "text-cyber-green bg-cyber-green/10 border-cyber-green/30"
              : selectedDiff === "medium"
              ? "text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30"
              : "text-cyber-pink bg-cyber-pink/10 border-cyber-pink/30"
          }`;
        });
      });

      // Audio Toggle
      const btnAudio = document.getElementById("btnAudioToggle");
      btnAudio.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        document.getElementById("audioIcon").textContent = soundEnabled ? "🔊" : "🔇";
        document.getElementById("audioStatus").textContent = soundEnabled ? "SFX ON" : "SFX OFF";
        if (soundEnabled) playTone(600, "triangle");
      });

      // Modals
      const modalInst = document.getElementById("modalInstructions");
      const btnHowTo = document.getElementById("btnHowToPlay");
      const btnCloseModal = document.getElementById("btnCloseModal");
      const btnGotIt = document.getElementById("btnGotIt");

      function openModal(el) {
        playTone(400, "sine");
        el.classList.remove("hidden");
        setTimeout(() => el.classList.remove("opacity-0"), 10);
      }
      function closeModal(el) {
        el.classList.add("opacity-0");
        setTimeout(() => el.classList.add("hidden"), 200);
      }

      btnHowTo.addEventListener("click", () => openModal(modalInst));
      btnCloseModal.addEventListener("click", () => closeModal(modalInst));
      btnGotIt.addEventListener("click", () => closeModal(modalInst));

      // Reset High Scores
      document.getElementById("btnClearScores").addEventListener("click", () => {
        playTone(300, "sawtooth");
        highScores = [];
        renderScores();
      });

      // Start Game Simulation with Countdown
      const btnStart = document.getElementById("btnStartGame");
      const simOverlay = document.getElementById("simulatedOverlay");
      const numElem = document.getElementById("countdownNumber");

      btnStart.addEventListener("click", () => {
        playTone(700, "square", 0.15, 0.25);
        simOverlay.classList.remove("hidden");
        let count = 3;
        numElem.textContent = count;

        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            playTone(750, "square", 0.15, 0.25);
            numElem.textContent = count;
          } else if (count === 0) {
            playTone(1100, "square", 0.35, 0.35);
            numElem.textContent = "GO!";
            numElem.className = "text-8xl font-orbitron font-black text-cyber-green drop-shadow-[0_0_60px_#00ff88]";
          } else {
            clearInterval(interval);
            simOverlay.classList.add("hidden");
            numElem.className = "text-8xl font-orbitron font-black text-cyber-orange drop-shadow-[0_0_50px_#ff6600]";
          }
        }, 700);
      });

      // Code Exporter Modal
      const modalCode = document.getElementById("modalCode");
      const btnViewCode = document.getElementById("btnViewCode");
      const btnCloseCode = document.getElementById("btnCloseCodeModal");
      const btnCopyCode = document.getElementById("btnCopyCode");
      const tsxBlock = document.getElementById("tsxCodeBlock");

      const tsxTemplate = `import { useEffect, useRef, useState } from "react";
import type { HighScoreEntry } from "./useHighScores";

export type Difficulty = "easy" | "medium" | "hard";

interface Props {
  onStart: (difficulty: Difficulty) => void;
  highScores: HighScoreEntry[];
  onClearScores: () => void;
}

export default function StartScreen({ onStart, highScores, onClearScores }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showHowTo, setShowHowTo] = useState(false);

  // Animated background track with neon horizon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const draw = () => {
      t++;
      const W = (canvas.width = window.innerWidth);
      const H = (canvas.height = window.innerHeight);

      // Sky
      const skyGrd = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      skyGrd.addColorStop(0, "#050012");
      skyGrd.addColorStop(0.5, "#150030");
      skyGrd.addColorStop(1, "#28004f");
      ctx.fillStyle = skyGrd;
      ctx.fillRect(0, 0, W, H);

      // Road
      const roadY = H * 0.68;
      ctx.fillStyle = "#0c0422";
      ctx.fillRect(0, roadY, W, H - roadY);

      // Neon road border
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, roadY);
      ctx.lineTo(W, roadY);
      ctx.stroke();

      // Dashed lane
      ctx.setLineDash([30, 40]);
      ctx.lineDashOffset = -t * 6;
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, roadY + (H - roadY) * 0.45);
      ctx.lineTo(W, roadY + (H - roadY) * 0.45);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl px-4 py-6 flex flex-col items-center">
        {/* Title & Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/50 text-pink-400 text-[11px] font-black tracking-widest uppercase mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            EXPANSION V2.0 RACER
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight" style={{ fontFamily: "'Orbitron', monospace", textShadow: "0 0 35px rgba(0,240,255,0.7)" }}>
            MOTO
          </h1>
          <h2 className="text-4xl md:text-5xl font-black text-cyan-400 tracking-widest" style={{ fontFamily: "'Orbitron', monospace", textShadow: "0 0 25px rgba(0,255,200,0.6)" }}>
            TYPE RACER
          </h2>
        </div>

        {/* Glass Card */}
        <div className="w-full bg-slate-950/75 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 space-y-5 shadow-[0_0_35px_rgba(0,240,255,0.15)]">
          {/* Difficulty Buttons */}
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>
              SELECT DIFFICULTY
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={\`py-2.5 px-3 rounded-xl border text-xs font-black tracking-wider transition-all \${
                    difficulty === lvl
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }\`}
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => onStart(difficulty)}
            className="w-full py-4 rounded-xl font-black text-black text-lg tracking-widest uppercase transition-all active:scale-95 shadow-[0_0_30px_rgba(0,255,136,0.4)]"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(135deg, #00f0ff 0%, #00ff88 50%, #ffd700 100%)",
            }}
          >
            ⚡ START RACE
          </button>
        </div>
      </div>
    </div>
  );
}`;

      tsxBlock.textContent = tsxTemplate;

      btnViewCode.addEventListener("click", () => openModal(modalCode));
      btnCloseCode.addEventListener("click", () => closeModal(modalCode));

      btnCopyCode.addEventListener("click", () => {
        playTone(900, "sine");
        const area = document.createElement("textarea");
        area.value = tsxTemplate;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);

        btnCopyCode.innerHTML = "<span>✓</span> COPIED!";
        setTimeout(() => {
          btnCopyCode.innerHTML = "<span>📋</span> COPY TSX";
        }, 2000);
      });
    </script>
  </body>
</html>
