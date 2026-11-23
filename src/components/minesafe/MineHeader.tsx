import React from 'react';
import { HardHat, Play, Pause, CheckCircle2, Flame, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { DemoMode } from './types';

interface MineHeaderProps {
  demoMode: DemoMode;
  isStoryPlaying: boolean;
  onToggleStory: () => void;
  onSetNormal: () => void;
  onSimulateHeatSpike: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenExplainer: () => void;
}

export const MineHeader: React.FC<MineHeaderProps> = ({
  demoMode,
  isStoryPlaying,
  onToggleStory,
  onSetNormal,
  onSimulateHeatSpike,
  soundEnabled,
  onToggleSound,
  onOpenExplainer,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        
        {/* LEFT: Title, Subtitle & Live Status */}
        <div className="space-y-0.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              MineSafe <span className="text-emerald-600">Thermal AI</span>
            </h1>

            {/* Green Live Status Pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              IoT Sensors Online
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Smart IoT sensors predict cave heat early and turn on cooling automatically
          </p>
        </div>

        {/* RIGHT: The 3 Main Interactive Buttons + Sound */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          
          {/* Button 1: Play Live Story Demo (Blue Primary Button) */}
          <button
            onClick={onToggleStory}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-sm ${
              isStoryPlaying
                ? 'bg-amber-500 text-white ring-4 ring-amber-200 scale-102 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
            }`}
          >
            {isStoryPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Story</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>▶ Play Live Story Demo</span>
              </>
            )}
          </button>

          {/* Button 2: Normal Mode (Green Button) */}
          <button
            onClick={onSetNormal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
              demoMode === 'normal' && !isStoryPlaying
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-3 ring-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Normal Mode (25°C)</span>
          </button>

          {/* Button 3: Simulate Heat Spike (Orange/Red Button) */}
          <button
            onClick={onSimulateHeatSpike}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
              demoMode === 'heat_spike' && !isStoryPlaying
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-rose-600 ring-3 ring-rose-200 animate-pulse'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Simulate Heat Spike</span>
          </button>

          {/* Sound & Explainer */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title={soundEnabled ? 'Mute Sound Effects' : 'Turn On Audio Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenExplainer}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 transition-colors cursor-pointer"
              title="How It Works Guide"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
