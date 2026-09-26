export type Difficulty = "easy" | "medium" | "hard";

export type TypingMode = "word" | "paragraph";

export type VehicleType =
  | "bike"
  | "sports-car"
  | "supercar"
  | "truck";

export interface GameSettings {
  difficulty: Difficulty;
  typingMode: TypingMode;
  vehicle: VehicleType;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: "medium",
  typingMode: "word",
  vehicle: "bike",
};

export const DIFFICULTY_SETTINGS = {
  easy: {
    label: "Easy",
    description: "Relaxed speed and more lives",
    lives: 4,
    speedMultiplier: 0.8,
  },

  medium: {
    label: "Medium",
    description: "Balanced challenge",
    lives: 3,
    speedMultiplier: 1,
  },

  hard: {
    label: "Hard",
    description: "Fast speed and fewer lives",
    lives: 2,
    speedMultiplier: 1.3,
  },
} as const;

export const VEHICLE_SETTINGS = {
  bike: {
    label: "Bike",
    icon: "🏍️",
  },

  "sports-car": {
    label: "Sports Car",
    icon: "🏎️",
  },

  supercar: {
    label: "Supercar",
    icon: "🚗",
  },

  truck: {
    label: "Truck",
    icon: "🚚",
  },
} as const;
