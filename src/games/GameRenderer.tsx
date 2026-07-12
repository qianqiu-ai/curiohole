import type { ComponentType } from "react";
import ComingSoon from "../components/ComingSoon";
import BallSortPuzzle from "./ball-sort/BallSortPuzzle";

export interface GameComponentProps {
  onGameCompleted: (score: number, shareText: string) => void;
  onUpdateStreak: () => void;
  language: "en" | "zh";
  theme: "dark" | "light";
}

interface GameRendererProps extends GameComponentProps {
  gameId: string;
  gameName: string;
  onPlayFallback: () => void;
}

// Add a finished game here after creating its own folder under src/games/.
const GAME_COMPONENTS: Record<string, ComponentType<GameComponentProps>> = {
  "ball-sort-puzzle": BallSortPuzzle,
};

export default function GameRenderer({
  gameId,
  gameName,
  onPlayFallback,
  ...gameProps
}: GameRendererProps) {
  const GameComponent = GAME_COMPONENTS[gameId];

  if (!GameComponent) {
    return (
      <ComingSoon
        gameName={gameName}
        onBack={onPlayFallback}
        language={gameProps.language}
        theme={gameProps.theme}
      />
    );
  }

  return <GameComponent {...gameProps} />;
}
