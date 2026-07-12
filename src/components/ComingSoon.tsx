import React from "react";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";

interface ComingSoonProps {
  gameName: string;
  onBack: () => void;
  language: "en" | "zh";
  theme: "dark" | "light";
}

export default function ComingSoon({ gameName, onBack, language, theme }: ComingSoonProps) {
  const isZh = language === "zh";

  const text = {
    title: isZh ? "很快就做好" : "Coming Soon",
    subtitle: isZh 
      ? `我们正在加紧打磨游戏《${gameName}》。它很快就会在 CurioHole 实验室更新上线，敬请期待！` 
      : `We are polishing the game "${gameName}" with care. It will be released very soon on CurioHole, stay tuned!`,
    tag: isZh ? "沙盒实验中" : "Under Construction",
    backBtn: isZh ? "去玩瓶子分类游戏" : "Play Ball Sort Puzzle instead",
    hint: isZh 
      ? "您可以先游玩我们完全成型、关卡丰富的“瓶子分类”游戏。" 
      : "In the meantime, feel free to try our fully-featured, challenging 'Ball Sort Puzzle'!"
  };

  return (
    <div className={`p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] ${
      theme === "light" 
        ? "bg-white border-slate-200 shadow-xl" 
        : "bg-[#141519] border-gray-800 shadow-2xl shadow-black/40"
    }`}>
      {/* Background soft glowing accent */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 to-transparent pointer-events-none" />

      {/* Decorative rotating lab atom/gear */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 border-2 border-dashed border-amber-500/20 rounded-full animate-spin [animation-duration:10s]" />
        <div className="absolute w-14 h-14 border border-dashed border-amber-400/40 rounded-full animate-spin [animation-duration:6s] reverse" />
        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 text-lg shadow-lg shadow-amber-500/10">
          🧪
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Tag */}
      <span className="inline-flex bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold mb-4">
        {text.tag}
      </span>

      {/* Heading */}
      <h3 className={`text-2xl md:text-3xl font-display font-black tracking-tight ${
        theme === "light" ? "text-slate-900" : "text-white"
      }`}>
        {text.title}
      </h3>

      {/* Description */}
      <p className={`text-sm max-w-md mt-3 leading-relaxed ${
        theme === "light" ? "text-slate-500" : "text-gray-400"
      }`}>
        {text.subtitle}
      </p>

      {/* Friendly Guide */}
      <div className={`p-4 rounded-xl border max-w-sm mt-8 text-xs ${
        theme === "light" ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-gray-950/40 border-gray-900 text-gray-500"
      }`}>
        {text.hint}
      </div>

      {/* CTA Button */}
      <button
        onClick={onBack}
        className="mt-6 bg-[#00ffcc] hover:bg-[#00e6b8] text-gray-950 font-display font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-md shadow-[#00ffcc]/10 hover:scale-[1.02] cursor-pointer flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{text.backBtn}</span>
      </button>
    </div>
  );
}
