export enum GameCategory {
  DAILY = "Daily Games",
  QUICK = "Quick Play",
  PUZZLE = "Puzzle & Logic",
  WORD = "Word & Trivia",
  REACTION = "Reaction & Arcade",
  PARTY = "Party & Friends"
}

export interface Game {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  playTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  players: string;
  tags: string[];
  mobileFriendly: boolean;
  isPopular: boolean;
  isNew: boolean;
  icon: string; // Name of Lucide icon
  howToPlay: string;
  whyYouWillLikeIt: string;
}

export interface UserProgress {
  streak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  recentlyPlayedIds: string[];
  favoriteIds: string[];
  highScores: Record<string, number>;
}

export interface DailyCuriosityData {
  title: string;
  scenario: string;
  clues: string[];
  question: string;
  options: string[];
  correctOptionIndex: number;
  solution: string;
  explanation: string;
  isMock?: boolean;
}
