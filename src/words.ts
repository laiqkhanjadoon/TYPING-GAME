// Tiered word lists for increasing difficulty
export const EASY_WORDS = [
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
  "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
  "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did",
  "its", "let", "put", "say", "she", "too", "use", "run", "fly", "try",
  "big", "hot", "red", "top", "win", "fun", "joy", "sky", "car", "map",
];

export const MEDIUM_WORDS = [
  "about", "above", "after", "again", "along", "began", "below", "black",
  "blood", "break", "bring", "build", "carry", "catch", "cause", "chain",
  "check", "child", "clean", "clear", "click", "close", "could", "count",
  "cover", "crash", "cross", "dance", "death", "doubt", "draft", "drive",
  "earth", "eight", "empty", "enter", "every", "exist", "extra", "false",
  "field", "final", "first", "fixed", "flame", "flash", "float", "floor",
  "focus", "force", "found", "fresh", "front", "frost", "fully", "given",
  "glass", "grace", "grade", "grand", "grant", "grass", "great", "green",
  "group", "guard", "guide", "heart", "heavy", "honor", "horse", "hotel",
  "house", "human", "ideal", "image", "index", "inner", "input", "issue",
  "jones", "judge", "juice", "large", "laser", "later", "layer", "learn",
  "least", "legal", "level", "light", "limit", "local", "logic", "lower",
  "lucky", "march", "match", "metal", "might", "money", "month", "motor",
  "mount", "music", "nerve", "night", "noise", "north", "noted", "novel",
  "ocean", "offer", "often", "order", "other", "outer", "paint", "paper",
  "party", "peace", "phase", "phone", "photo", "pilot", "place", "plane",
  "plant", "plate", "point", "power", "press", "price", "prime", "print",
  "proof", "proud", "prove", "quick", "quiet", "quite", "quote", "radio",
  "raise", "range", "rapid", "reach", "ready", "right", "river", "robot",
  "rough", "round", "route", "royal", "ruled", "scale", "scene", "score",
  "sense", "serve", "setup", "seven", "shall", "shape", "share", "sharp",
  "shift", "shock", "short", "sight", "since", "skill", "sleep", "small",
  "smart", "smoke", "solar", "solid", "solve", "sound", "south", "space",
  "spark", "speak", "speed", "spend", "split", "stand", "start", "state",
  "steel", "stick", "still", "stone", "store", "storm", "story", "study",
  "style", "super", "surge", "sweet", "sword", "table", "teach", "tears",
  "their", "theme", "there", "think", "three", "throw", "tiger", "timer",
  "title", "token", "total", "touch", "tough", "tower", "track", "trade",
  "trail", "train", "trend", "trial", "trick", "trust", "truth", "under",
  "union", "until", "upper", "urban", "usual", "value", "video", "virus",
  "vital", "voice", "voter", "waste", "watch", "water", "where", "which",
  "white", "whole", "whose", "width", "world", "worth", "would", "write",
  "wrong", "yield", "young", "yours", "youth", "zones",
];

export const HARD_WORDS = [
  "absolute", "abstract", "achieve", "advance", "against", "aligned",
  "ancient", "another", "anxiety", "applied", "archive", "arrange",
  "balance", "barrier", "battery", "beneath", "binding", "blazing",
  "blizzard", "breathe", "brigade", "burning", "capture", "cascade",
  "certain", "chapter", "circuit", "climate", "cluster", "command",
  "complex", "compute", "concept", "connect", "contest", "control",
  "convert", "correct", "courage", "current", "custom", "declare",
  "defense", "defined", "deliver", "deserve", "destroy", "develop",
  "digital", "disable", "discuss", "display", "disrupt", "distant",
  "dynamic", "eclipse", "element", "enhance", "entropy", "examine",
  "example", "execute", "exhaust", "exhibit", "explore", "express",
  "extreme", "factory", "failure", "feature", "fiction", "fighter",
  "finally", "finding", "focused", "foreign", "formula", "forward",
  "freedom", "freeway", "friction", "funding", "general", "genesis",
  "genuine", "glowing", "gravity", "greater", "healthy", "highway",
  "history", "horizon", "hunting", "imagine", "improve", "include",
  "initial", "install", "instead", "intense", "invader", "journey",
  "justice", "keeping", "kingdom", "knowing", "landing", "language",
  "leading", "leaving", "library", "limited", "linking", "literal",
  "loading", "machine", "maximum", "meaning", "measure", "message",
  "minimum", "mission", "mixture", "monitor", "morning", "mounted",
  "natural", "network", "nothing", "observe", "outside", "package",
  "parking", "passion", "pattern", "perfect", "perform", "pioneer",
  "platform", "popular", "possess", "present", "primary", "private",
  "process", "produce", "program", "promise", "promote", "protect",
  "provide", "publish", "qualify", "quantum", "radical", "rapidly",
  "reactor", "reading", "receive", "recover", "reflect", "release",
  "replace", "require", "resolve", "restore", "results", "revenue",
  "reverse", "routing", "sandbox", "scandal", "science", "segment",
  "session", "setting", "shallow", "similar", "skilled", "society",
  "solving", "someone", "speaker", "special", "spinner", "stadium",
  "station", "storage", "strange", "streams", "stretch", "student",
  "subject", "success", "suggest", "summary", "support", "surface",
  "survive", "suspend", "sustain", "systems", "tactics", "targets",
  "tension", "terminal", "testing", "thought", "through", "thunder",
  "tonight", "toolkit", "totally", "trading", "traffic", "trained",
  "triumph", "trouble", "typical", "uncover", "unified", "unleash",
  "upgrade", "various", "venture", "vibrant", "virtual", "visible",
  "voltage", "warning", "warrior", "website", "welcome", "whether",
  "without", "working", "wrapper", "writing", "victory",
];

export function getWordForLevel(level: number): string {
  const rand = Math.random();
  if (level < 3) {
    // Mostly easy
    const pool = rand < 0.7 ? EASY_WORDS : MEDIUM_WORDS;
    return pool[Math.floor(Math.random() * pool.length)];
  } else if (level < 7) {
    // Mix of easy/medium
    if (rand < 0.2) return EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)];
    if (rand < 0.8) return MEDIUM_WORDS[Math.floor(Math.random() * MEDIUM_WORDS.length)];
    return HARD_WORDS[Math.floor(Math.random() * HARD_WORDS.length)];
  } else {
    // Mostly hard
    if (rand < 0.1) return EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)];
    if (rand < 0.4) return MEDIUM_WORDS[Math.floor(Math.random() * MEDIUM_WORDS.length)];
    return HARD_WORDS[Math.floor(Math.random() * HARD_WORDS.length)];
  }
}

export function generateWordQueue(count: number, level: number): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(getWordForLevel(level));
  }
  return words;
}
