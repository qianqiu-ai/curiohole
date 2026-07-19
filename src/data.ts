import { Game, GameCategory } from "./types";

export const GAMES_DB: Game[] = [
  {
    id: "ball-sort-puzzle",
    name: "Ball Sort Puzzle",
    description: "Sort colorful compound balls in chemistry bottles until each bottle contains only one color.",
    category: GameCategory.PUZZLE,
    playTime: "2 min",
    difficulty: "Medium",
    players: "Solo",
    tags: ["Logic", "Sorting", "Colors", "Classic"],
    mobileFriendly: true,
    isPopular: true,
    isNew: true,
    icon: "FlaskConical",
    howToPlay: "Tap a tube to select its top-most ball. Tap another tube to pour the ball. You can only place a ball on top of another ball of the exact same color, or into an empty tube. Group all colors to solve!",
    whyYouWillLikeIt: "Highly relaxing, beautiful visual aesthetics, and extremely satisfying when you successfully clean and group every color chemistry tube.",
    seoContent: {
      overview:
        "Ball Sort Puzzle is a free online logic puzzle game where your goal is to organize mixed colored balls into matching tubes. Each tube can hold a limited number of balls, and only the top ball can move. The challenge is simple to understand but satisfying to master: move one ball at a time until every tube contains balls of only one color. You can play instantly in your browser with no download, no account, and no app install.",
      rules: [
        "Select a tube to pick the top ball from that tube.",
        "Move the selected ball into an empty tube or onto a ball with the same color.",
        "A tube can only hold a limited stack of balls, so not every move is legal.",
        "Use the empty tubes as temporary space while you uncover hidden colors.",
        "The level is solved when every non-empty tube contains one color only."
      ],
      tips: [
        "Keep at least one empty tube available whenever possible.",
        "Do not bury a color underneath too many different colors.",
        "Try to complete one color group early, then use that finished tube as stable space.",
        "Undo a move as soon as it blocks your next useful transfer.",
        "Look at the top two balls in each tube before moving, not only the current top ball."
      ],
      sections: [
        {
          title: "What is Ball Sort Puzzle?",
          body:
            "Ball Sort Puzzle is a sorting and strategy game built around color recognition, planning, and small reversible moves. Unlike fast reaction games, this puzzle does not require speed. You can slow down, inspect each tube, and choose the cleanest move. That makes it a good browser game for a short break, a light brain warm-up, or a quiet moment when you want something relaxing but still logical."
        },
        {
          title: "How to Play Ball Sort Puzzle Online",
          body:
            "Start by tapping or clicking a tube that contains balls. The game selects the top ball from that tube. Then choose a destination tube. If the destination is empty, the ball can move there. If the destination has a ball on top, the selected ball can only move there when both balls have the same color. Keep transferring balls until each color has its own tube."
        },
        {
          title: "Why this Ball Sort game works well in a browser",
          body:
            "This version is designed for quick browser play. It loads directly on desktop and mobile, saves no required account data, and gives you undo and reset controls for low-pressure play. The visual layout keeps the puzzle area clear, while the guide text explains the rules without hiding the game board. It is meant to be easy to start and comfortable to revisit."
        },
        {
          title: "Best strategy for beginners",
          body:
            "Beginners should focus on creating space first. Empty tubes are powerful because they let you separate mixed stacks and reveal blocked colors. When you see two or three balls of the same color close to the top, try to gather them into one tube. Avoid moving a ball just because the move is legal. A good move either creates space, reveals a useful color, or makes a color group more complete."
        }
      ],
      faqs: [
        {
          question: "Is Ball Sort Puzzle free?",
          answer:
            "Yes. You can play Ball Sort Puzzle online for free in your browser."
        },
        {
          question: "Do I need to download anything?",
          answer:
            "No. The game works directly in the browser, so you do not need to download an app or create an account."
        },
        {
          question: "Can I play Ball Sort Puzzle on mobile?",
          answer:
            "Yes. The game supports tapping on mobile screens as well as clicking on desktop."
        },
        {
          question: "What should I do if I get stuck?",
          answer:
            "Use undo, keep one tube empty, and focus on freeing the color that appears most often near the top of the tubes."
        },
        {
          question: "Is Ball Sort Puzzle a logic game?",
          answer:
            "Yes. It is a logic puzzle based on planning, color grouping, and using temporary space efficiently."
        }
      ]
    }
  },
  {
    id: "pattern-panic",
    name: "Pattern Panic",
    description: "Spot the hidden odd shape or color aberration before the shrinking timer runs out.",
    category: GameCategory.PUZZLE,
    playTime: "30s",
    difficulty: "Medium",
    players: "Solo",
    tags: ["Visual", "Reflex", "Speed", "Colors"],
    mobileFriendly: true,
    isPopular: true,
    isNew: true,
    icon: "Grid",
    howToPlay: "A grid of custom shapes will appear. One block is slightly different in color, rotation, or scale. Tap the odd block as fast as possible to gain time and advance to next level. Don't make wrong taps or you'll lose valuable seconds!",
    whyYouWillLikeIt: "Fast-paced, satisfying sound cues, and escalating grid complexity (up to 7x7) that perfectly tests and sharpens your peripheral vision."
  },
  {
    id: "odd-one-out",
    name: "Odd One Out",
    description: "Who doesn't fit the group? A local pass-and-play party game of associations.",
    category: GameCategory.PARTY,
    playTime: "2 min",
    difficulty: "Easy",
    players: "1-4 Players",
    tags: ["Party", "Words", "Local Play", "Humorous"],
    mobileFriendly: true,
    isPopular: false,
    isNew: true,
    icon: "Users",
    howToPlay: "Four words or emojis are presented. One is logically or contextually different. Can you find it? Supports Solo practice or Local Multiplayer mode where up to 4 friends take turns and compete for the highest speed and score!",
    whyYouWillLikeIt: "Hilarious category combinations and direct competition make it the perfect icebreaker game when you're hanging out with friends."
  },
  {
    id: "tiny-oracle",
    name: "Tiny Oracle",
    description: "Ask the Cosmic Oracle anything and receive magical, witty, or sarcastic predictions.",
    category: GameCategory.PARTY,
    playTime: "1 min",
    difficulty: "Easy",
    players: "Solo",
    tags: ["AI", "Mystic", "Humorous", "Magic"],
    mobileFriendly: true,
    isPopular: true,
    isNew: false,
    icon: "Sparkles",
    howToPlay: "Enter a burning question about your life, career, or code. Tap the magical orb to channel cosmic energy. The Oracle will generate a custom, funny prediction, assign a cosmic Vibe Score, and give you a lucky emoji symbol!",
    whyYouWillLikeIt: "Powered by Gemini, its answers are uniquely generated, witty, and wonderfully cosmic, giving you a quick smile anytime of day."
  },
  {
    id: "reaction-speed",
    name: "Neon Aim Trainer",
    description: "Test your reaction speed and hand-eye coordination by tapping active neon nodes.",
    category: GameCategory.REACTION,
    playTime: "30s",
    difficulty: "Hard",
    players: "Solo",
    tags: ["Reflex", "Neon", "Clicker", "Arcade"],
    mobileFriendly: true,
    isPopular: false,
    isNew: true,
    icon: "Zap",
    howToPlay: "Neon circular target nodes will rapidly expand and shrink in the dark playground. Click or tap them as fast as possible before they disappear. Missing a node or letting it decay will end your streak. Rack up points in 30 seconds!",
    whyYouWillLikeIt: "A highly responsive arcade playground featuring custom particle splash effects, neon glow visual styling, and instant high-score logging."
  }
];
