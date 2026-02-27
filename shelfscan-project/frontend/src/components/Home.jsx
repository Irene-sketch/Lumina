import React from 'react';
import { Play, Shield, Cpu } from 'lucide-react';

const Home = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in duration-1000">
      
      {/* 1. Value Proposition */}
      <div className="space-y-6 max-w-sm">
        <p className="text-2xl font-light italic leading-relaxed text-amber-950">
          "Be your own eyes."
        </p>
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-800/60 font-bold leading-loose px-4">
          Empowering independence through real-time audio identification of your surroundings.
        </p>
      </div>

      {/* 2. The "Aura" Launch Button */}
      <div className="relative group">
        {/* Animated outer rings for visual depth */}
        <div className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="absolute -inset-4 rounded-full border border-amber-400/30 animate-pulse duration-[3000ms]" />
        
        <button
          onClick={onStart}
          className="relative flex items-center justify-center w-36 h-36 bg-amber-950 rounded-full text-white shadow-[0_20px_50px_rgba(69,39,0,0.3)] hover:scale-105 hover:bg-black transition-all duration-500 active:scale-95 z-10"
        >
          <Play size={44} fill="currentColor" className="ml-2" />
          
          {/* Floating Label */}
          <span className="absolute -bottom-10 text-[9px] uppercase tracking-[0.5em] text-amber-900 font-black opacity-40 group-hover:opacity-100 transition-opacity">
            Launch System
          </span>
        </button>
      </div>

      {/* 3. Minimalist Feature Trust-Badges */}
      <div className="flex gap-16 pt-12 border-t border-amber-900/10 w-full justify-center">
        <div className="flex flex-col items-center space-y-3 group">
          <div className="p-3 rounded-full bg-white/50 border border-white group-hover:bg-white transition-colors">
            <Shield size={18} strokeWidth={1} className="text-amber-800" />
          </div>
          <span className="text-[8px] uppercase tracking-[0.3em] font-black text-amber-900/40 group-hover:text-amber-900 transition-colors">
            Private
          </span>
        </div>

        <div className="flex flex-col items-center space-y-3 group">
          <div className="p-3 rounded-full bg-white/50 border border-white group-hover:bg-white transition-colors">
            <Cpu size={18} strokeWidth={1} className="text-amber-800" />
          </div>
          <span className="text-[8px] uppercase tracking-[0.3em] font-black text-amber-900/40 group-hover:text-amber-900 transition-colors">
            Edge AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;