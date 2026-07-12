import React, { useState, useEffect } from "react";
import { RotateCcw, Undo2, Award, ChevronRight, HelpCircle, Trophy, Volume2, VolumeX } from "lucide-react";

interface BallSortPuzzleProps {
  onGameCompleted: (score: number, shareText: string) => void;
  onUpdateStreak: () => void;
  language: "en" | "zh";
  theme: "dark" | "light";
}

type Tube = string[];

interface LevelConfig {
  id: number;
  nameEn: string;
  nameZh: string;
  colorsCount: number;
  emptyTubes: number;
  descriptionEn: string;
  descriptionZh: string;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    nameEn: "Level 1: Lab Intern",
    nameZh: "关卡 1: 实验新手",
    colorsCount: 3,
    emptyTubes: 2,
    descriptionEn: "Sort 3 colors using 2 empty tubes. A warm-up challenge!",
    descriptionZh: "使用 2 个空瓶对 3 种颜色进行分类。热身挑战！"
  },
  {
    id: 2,
    nameEn: "Level 2: Research Assistant",
    nameZh: "关卡 2: 助理研究员",
    colorsCount: 4,
    emptyTubes: 2,
    descriptionEn: "4 colors of chemical compounds. Starting to get interesting.",
    descriptionZh: "4 种化学化合物颜色。开始变得有趣了。"
  },
  {
    id: 3,
    nameEn: "Level 3: Chemical Engineer",
    nameZh: "关卡 3: 化学工程师",
    colorsCount: 5,
    emptyTubes: 2,
    descriptionEn: "5 colors. Watch your sorting sequence carefully!",
    descriptionZh: "5 种颜色。仔细观察你的分类顺序！"
  },
  {
    id: 4,
    nameEn: "Level 4: Alchemy Master",
    nameZh: "关卡 4: 炼金宗师",
    colorsCount: 6,
    emptyTubes: 2,
    descriptionEn: "6 colors! Perfect logic is required to avoid getting stuck.",
    descriptionZh: "6 种颜色！需要完美的逻辑来避免陷入僵局。"
  }
];

const BALL_COLORS: Record<string, { bg: string; shadow: string; border: string; nameEn: string; nameZh: string }> = {
  red: {
    bg: "bg-red-500",
    shadow: "shadow-red-500/50 shadow-lg",
    border: "border-red-400",
    nameEn: "Rose",
    nameZh: "玫瑰红"
  },
  blue: {
    bg: "bg-blue-500",
    shadow: "shadow-blue-500/50 shadow-lg",
    border: "border-blue-400",
    nameEn: "Ocean",
    nameZh: "海洋蓝"
  },
  green: {
    bg: "bg-emerald-500",
    shadow: "shadow-emerald-500/50 shadow-lg",
    border: "border-emerald-400",
    nameEn: "Emerald",
    nameZh: "祖母绿"
  },
  yellow: {
    bg: "bg-amber-400",
    shadow: "shadow-amber-400/50 shadow-lg",
    border: "border-amber-300",
    nameEn: "Amber",
    nameZh: "琥珀黄"
  },
  purple: {
    bg: "bg-purple-500",
    shadow: "shadow-purple-500/50 shadow-lg",
    border: "border-purple-400",
    nameEn: "Amethyst",
    nameZh: "紫水晶"
  },
  orange: {
    bg: "bg-orange-500",
    shadow: "shadow-orange-500/50 shadow-lg",
    border: "border-orange-400",
    nameEn: "Coral",
    nameZh: "珊瑚橙"
  }
};

const COLOR_KEYS = ["red", "blue", "green", "yellow", "purple", "orange"];

export default function BallSortPuzzle({ onGameCompleted, onUpdateStreak, language, theme }: BallSortPuzzleProps) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHowTo, setShowHowTo] = useState<boolean>(true);

  const level = LEVELS[currentLevelIdx];

  // Text resources
  const text = {
    titleEn: "Ball Sort Puzzle",
    titleZh: "瓶子颜色分类",
    subtitleEn: "Sort compound balls until each tube contains only one color.",
    subtitleZh: "移动试管里的彩色小球，使每个瓶子里只有同一种颜色。",
    movesEn: "Moves",
    movesZh: "步数",
    undoEn: "Undo",
    undoZh: "撤销",
    resetEn: "Reset",
    resetZh: "重置",
    howToEn: "Rules",
    howToZh: "玩法说明",
    selectLevelEn: "Select Challenge",
    selectLevelZh: "选择关卡",
    completedEn: "CONGRATULATIONS!",
    completedZh: "大功告成！",
    victoryTextEn: "You successfully sorted all elements with absolute logical precision!",
    victoryTextZh: "你以绝对精妙的逻辑思维，完美完成了颜色试剂分类！",
    nextLevelEn: "Next Challenge",
    nextLevelZh: "下一关卡",
    playAgainEn: "Play Again",
    playAgainZh: "再玩一次",
    sharePromptEn: "Share Score",
    sharePromptZh: "分享战绩",
    stuckEn: "Stuck? Tap Reset or Undo to try a different approach!",
    stuckZh: "遇到瓶颈？点击重置或撤销，换个思路试试看！",
    completedBadgeEn: "Solved!",
    completedBadgeZh: "已分类",
    rulesContentEn: [
      "1. Tap any tube to select its top-most ball.",
      "2. Tap another tube to pour the selected ball into it.",
      "3. You can only place a ball on top of another ball of the same color, OR into an empty tube.",
      "4. Each tube can hold a maximum of 4 balls. Sort all tubes to win!"
    ],
    rulesContentZh: [
      "1. 点击任意试管，可以选中其最顶部的一个小球。",
      "2. 点击另一个试管，将选中的小球倒入其中。",
      "3. 规则：小球只能落入相同颜色小球的上方，或者倒进完全为空的试管中。",
      "4. 每个试管最多容纳 4 个小球。将所有小球按颜色分装好即获胜！"
    ]
  };

  // Generate solvable level
  const generateLevel = (levelConfig: LevelConfig) => {
    const { colorsCount, emptyTubes } = levelConfig;
    const colorsUsed = COLOR_KEYS.slice(0, colorsCount);
    
    // Create sorted pool
    let pool: string[] = [];
    colorsUsed.forEach((c) => {
      for (let i = 0; i < 4; i++) {
        pool.push(c);
      }
    });

    // Simple robust shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Distribute into tubes of 4
    const newTubes: Tube[] = [];
    for (let i = 0; i < colorsCount; i++) {
      newTubes.push(pool.slice(i * 4, (i + 1) * 4));
    }

    // Add empty tubes
    for (let i = 0; i < emptyTubes; i++) {
      newTubes.push([]);
    }

    setTubes(newTubes);
    setSelectedTube(null);
    setHistory([]);
    setMoves(0);
    setIsWon(false);
  };

  // Initialize level
  useEffect(() => {
    generateLevel(level);
  }, [currentLevelIdx]);

  // Audio feedback emulator (visual / haptic fallback)
  const playSound = (type: "select" | "pour" | "error" | "win") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "select") {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === "pour") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (type === "error") {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else if (type === "win") {
        // Little victory arpeggio
        const now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start();
        osc.stop(now + 0.6);
      }
    } catch (e) {
      // Audio context might be blocked or unsupported, fail silently
    }
  };

  // Tube click handler
  const handleTubeClick = (tubeIdx: number) => {
    if (isWon) return;

    if (selectedTube === null) {
      // Selecting a tube
      if (tubes[tubeIdx].length === 0) {
        playSound("error");
        return; // Empty tube can't be selected
      }
      setSelectedTube(tubeIdx);
      playSound("select");
    } else {
      // Pouring from selectedTube to tubeIdx
      const fromIdx = selectedTube;
      const toIdx = tubeIdx;

      if (fromIdx === toIdx) {
        setSelectedTube(null);
        playSound("select");
        return;
      }

      const fromTube = tubes[fromIdx];
      const toTube = tubes[toIdx];

      if (toTube.length >= 4) {
        // Target is full. Smooth UX: Select this full tube instead!
        setSelectedTube(toIdx);
        playSound("select");
        return;
      }

      const ballToMove = fromTube[fromTube.length - 1];
      const targetTopBall = toTube[toTube.length - 1];

      // Move is valid if target tube is empty, or has same top color
      const isValidMove = toTube.length === 0 || targetTopBall === ballToMove;

      if (isValidMove) {
        // Save history for Undo
        setHistory([...history, tubes.map((t) => [...t])]);

        // Execute Move
        const nextTubes = tubes.map((t, idx) => {
          if (idx === fromIdx) {
            return t.slice(0, t.length - 1);
          }
          if (idx === toIdx) {
            return [...t, ballToMove];
          }
          return t;
        });

        const nextMoveCount = moves + 1;
        setTubes(nextTubes);
        setSelectedTube(null);
        setMoves(nextMoveCount);
        playSound("pour");

        // Check victory condition
        checkWinCondition(nextTubes, nextMoveCount);
      } else {
        // Invalid move. Select the clicked tube instead of resetting
        if (toTube.length > 0) {
          setSelectedTube(toIdx);
          playSound("select");
        } else {
          setSelectedTube(null);
          playSound("error");
        }
      }
    }
  };

  // Undo last move
  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const previousState = history[history.length - 1];
    setTubes(previousState);
    setHistory(history.slice(0, history.length - 1));
    setMoves(moves + 1);
    setSelectedTube(null);
    playSound("select");
  };

  // Reset current level
  const handleReset = () => {
    generateLevel(level);
    playSound("select");
  };

  // Check if solved
  const checkWinCondition = (currentTubes: Tube[], moveCount: number) => {
    const won = currentTubes.every((tube) => {
      if (tube.length === 0) return true;
      if (tube.length !== 4) return false;
      const firstColor = tube[0];
      return tube.every((ball) => ball === firstColor);
    });

    if (won) {
      setIsWon(true);
      playSound("win");
      onUpdateStreak();

      // Formulate share text
      const scoreValue = Math.max(100 - moveCount, 20) + (level.colorsCount * 50);
      const enShare = `🧪 CurioHole - Ball Sort Puzzle\n🏆 Solved: ${level.nameEn}\n⚡ Moves: ${moveCount}\n🧩 Score: ${scoreValue} pts\n\nCan you solve it in fewer moves? Play on CurioHole!`;
      const zhShare = `🧪 CurioHole - 瓶子颜色分类\n🏆 完成关卡: ${level.nameZh}\n⚡ 消耗步数: ${moveCount}\n🧩 综合得分: ${scoreValue} 分\n\n你能用更少的步数通关吗？快来 CurioHole 挑战！`;
      const shareText = language === "zh" ? zhShare : enShare;

      setTimeout(() => {
        onGameCompleted(scoreValue, shareText);
      }, 500);
    }
  };

  const isTubeComplete = (tube: Tube) => {
    return tube.length === 4 && tube.every((b) => b === tube[0]);
  };

  return (
    <div className={`space-y-6 ${theme === "light" ? "text-slate-800" : "text-gray-100"}`}>
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc] font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {language === "zh" ? level.nameZh : level.nameEn}
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold mt-1.5">
            {language === "zh" ? text.titleZh : text.titleEn}
          </h2>
          <p className={`text-xs mt-1 ${theme === "light" ? "text-slate-500" : "text-gray-400"}`}>
            {language === "zh" ? text.subtitleZh : text.subtitleEn}
          </p>
        </div>

        {/* Stats and Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className={`px-4 py-2 rounded-xl border font-mono flex flex-col items-center min-w-[70px] ${
            theme === "light" ? "bg-slate-100 border-slate-200" : "bg-gray-950 border-gray-800"
          }`}>
            <span className="text-[10px] text-gray-500 uppercase font-bold">{language === "zh" ? text.movesZh : text.movesEn}</span>
            <span className="text-lg font-bold text-[#00ffcc]">{moves}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || isWon}
              title={language === "zh" ? text.undoZh : text.undoEn}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                history.length === 0 || isWon
                  ? "opacity-40 cursor-not-allowed"
                  : theme === "light"
                  ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800 text-white"
              }`}
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "zh" ? text.undoZh : text.undoEn}</span>
            </button>

            <button
              onClick={handleReset}
              title={language === "zh" ? text.resetZh : text.resetEn}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                theme === "light"
                  ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800 text-white"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "zh" ? text.resetZh : text.resetEn}</span>
            </button>

            <button
              onClick={() => setShowHowTo(!showHowTo)}
              title={language === "zh" ? "显示或隐藏玩法说明" : "Show or hide the rules"}
              aria-label={language === "zh" ? "显示或隐藏玩法说明" : "Show or hide the rules"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800 text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={language === "zh" ? "开启或关闭声音" : "Turn sound on or off"}
              aria-label={language === "zh" ? "开启或关闭声音" : "Turn sound on or off"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800 text-white"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Rules Box */}
      {showHowTo && (
        <div className={`p-4 rounded-xl border animate-fade-in ${
          theme === "light" ? "bg-sky-50/50 border-sky-100 text-slate-700" : "bg-gray-950/50 border-gray-800/80 text-gray-300"
        }`}>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-[#00ffcc]" />
            <span>{language === "zh" ? text.howToZh : text.howToEn}</span>
          </h4>
          <ul className="text-xs space-y-1.5 list-none pl-1">
            {(language === "zh" ? text.rulesContentZh : text.rulesContentEn).map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Game Playground Grid */}
      <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center min-h-[340px] relative ${
        theme === "light" ? "bg-white/80 border-slate-200" : "bg-[#141517] border-gray-800"
      }`}>
        {/* Tubes container */}
        <div className="flex flex-wrap justify-center items-end gap-x-6 gap-y-12 max-w-full py-8">
          {tubes.map((tube, tubeIdx) => {
            const isSelected = selectedTube === tubeIdx;
            const complete = isTubeComplete(tube);
            
            return (
              <button
                type="button"
                key={tubeIdx}
                onClick={() => handleTubeClick(tubeIdx)}
                data-testid={`tube-${tubeIdx}`}
                aria-label={
                  language === "zh"
                    ? `试管 ${tubeIdx + 1}，${tube.length} 个小球${isSelected ? "，已选中" : ""}`
                    : `Tube ${tubeIdx + 1}, ${tube.length} balls${isSelected ? ", selected" : ""}`
                }
                className="flex flex-col items-center group cursor-pointer relative bg-transparent border-0 p-0"
              >
                {/* Complete glowing status badge */}
                {complete && (
                  <span className="absolute -top-7 bg-emerald-500 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full shadow-lg shadow-emerald-500/30 animate-bounce">
                    {language === "zh" ? text.completedBadgeZh : text.completedBadgeEn}
                  </span>
                )}

                {/* Glass Tube Container */}
                <div
                  className={`w-14 h-44 rounded-b-3xl border-2 flex flex-col-reverse justify-start items-center p-1 relative transition-all duration-300 ${
                    isSelected
                      ? "border-[#00ffcc] ring-4 ring-[#00ffcc]/10 -translate-y-2 bg-[#00ffcc]/5 shadow-lg shadow-[#00ffcc]/10"
                      : complete
                      ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5"
                      : theme === "light"
                      ? "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/50"
                      : "border-gray-700 bg-gray-900/60 hover:border-gray-500 hover:bg-gray-800/40"
                  }`}
                >
                  {/* Rounded lip of the test tube */}
                  <div className={`absolute -top-1 left-[-4px] right-[-4px] h-[5px] rounded-full border-b ${
                    isSelected
                      ? "bg-[#00ffcc] border-[#00ffcc]"
                      : complete
                      ? "bg-emerald-500 border-emerald-500"
                      : theme === "light"
                      ? "bg-slate-300 border-slate-300"
                      : "bg-gray-700 border-gray-700"
                  }`} />

                  {/* Balls in Tube */}
                  {tube.map((colorKey, ballIdx) => {
                    const colorDef = BALL_COLORS[colorKey];
                    // If selected and top ball, we float it up extra
                    const isTopBall = ballIdx === tube.length - 1;
                    const floatTopBall = isSelected && isTopBall;

                    return (
                      <div
                        key={ballIdx}
                        className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-[9px] text-white/90 relative transition-all duration-300 ${
                          colorDef?.bg
                        } ${colorDef?.border} ${colorDef?.shadow} ${
                          floatTopBall ? "-translate-y-12 scale-110 animate-pulse duration-200 z-10" : ""
                        }`}
                        style={{
                          marginBottom: ballIdx > 0 ? "-3px" : "0px",
                        }}
                      >
                        {/* Highlighting 3D radial reflection on sphere */}
                        <div className="absolute top-1 left-2 w-3 h-3 bg-white/20 rounded-full blur-[0.5px]" />
                        <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-black/10 rounded-full" />
                      </div>
                    );
                  })}
                </div>

                {/* Tube Number Label */}
                <span className="text-[10px] font-mono text-gray-500 font-bold mt-2 group-hover:text-gray-400">
                  #{tubeIdx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level Hints Helper */}
        {!isWon && moves > 12 && (
          <p className="text-[11px] text-gray-500 font-medium animate-pulse mt-4 text-center">
            {language === "zh" ? text.stuckZh : text.stuckEn}
          </p>
        )}

        {/* Won Overlay Screen */}
        {isWon && (
          <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 text-3xl mb-4 animate-bounce">
              🏆
            </div>
            <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight uppercase">
              {language === "zh" ? text.completedZh : text.completedEn}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mt-2 leading-relaxed">
              {language === "zh" ? text.victoryTextZh : text.victoryTextEn}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {currentLevelIdx < LEVELS.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentLevelIdx(currentLevelIdx + 1);
                  }}
                  className="bg-[#00ffcc] hover:bg-[#00ccaa] text-gray-950 font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00ffcc]/20 flex items-center gap-1.5"
                >
                  <span>{language === "zh" ? text.nextLevelZh : text.nextLevelEn}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    generateLevel(level);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{language === "zh" ? text.playAgainZh : text.playAgainEn}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Level Selection Bar */}
      <div className={`p-4 rounded-xl border ${
        theme === "light" ? "bg-slate-50 border-slate-200" : "bg-gray-950/40 border-gray-900"
      }`}>
        <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 font-bold mb-3 text-center md:text-left">
          {language === "zh" ? text.selectLevelZh : text.selectLevelEn}
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              onClick={() => {
                setCurrentLevelIdx(idx);
                setSelectedTube(null);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                idx === currentLevelIdx
                  ? "bg-[#00ffcc] border-[#00ffcc] text-gray-950 shadow-md shadow-[#00ffcc]/10"
                  : theme === "light"
                  ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {language === "zh" ? lvl.nameZh.split(":")[1] : lvl.nameEn.split(":")[1]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
