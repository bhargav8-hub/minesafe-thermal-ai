import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  ToggleLeft, 
  ToggleRight, 
  RotateCcw, 
  Fan, 
  Zap, 
  Sparkles,
  FastForward,
  ShieldAlert
} from 'lucide-react';
import { DemoMode } from './types';

interface DemoControlBarProps {
  demoMode: DemoMode;
  onSetNormal: () => void;
  onSimulateHeatSpike: () => void;
  autoAiCooling: boolean;
  onToggleAutoAi: () => void;
  manualFanSpeed: number;
  onSetManualFanSpeed: (speed: number) => void;
  fastDemo: boolean;
  onToggleFastDemo: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  demoMode,
  onSetNormal,
  onSimulateHeatSpike,
  autoAiCooling,
  onToggleAutoAi,
  manualFanSpeed,
  onSetManualFanSpeed,
  fastDemo,
  onToggleFastDemo,
}) => {
  return (
    <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Live Demo Simulator
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              (Presenter Controls for Live Demonstration)
            </span>
          </div>

          {/* Speed multiplier toggle */}
          <button
            onClick={onToggleFastDemo}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              fastDemo
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Speed up simulation ticks for quick presentations"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{fastDemo ? '2x Fast Demo' : '1x Normal Speed'}</span>
          </button>
        </div>

        {/* The 3 Big Buttons / Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Button 1: Normal Operation (Green) */}
          <button
            onClick={onSetNormal}
            className={`flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-sm ${
              demoMode === 'normal'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-4 ring-emerald-200 scale-[1.01]'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-2 border-emerald-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              demoMode === 'normal' ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="leading-tight">1. Normal Operation</div>
              <div className="text-xs font-semibold opacity-90">All zones ~25°C • Eco Fans Safe</div>
            </div>
          </button>

          {/* Button 2: Simulate Heat Spike (Orange/Red) */}
          <button
            onClick={onSimulateHeatSpike}
            className={`flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-sm ${
              demoMode === 'heat_spike'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-rose-500/30 ring-4 ring-rose-200 scale-[1.01] animate-pulse'
                : 'bg-gradient-to-r from-amber-50 to-rose-50 text-rose-900 hover:from-amber-100 hover:to-rose-100 border-2 border-rose-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              demoMode === 'heat_spike' ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="leading-tight">2. Simulate Heat Spike</div>
              <div className="text-xs font-semibold opacity-90">Watch AI predict & auto-cool!</div>
            </div>
          </button>

          {/* Control 3: Manual Fan Override Toggle */}
          <div className="flex flex-col justify-between bg-slate-50 rounded-2xl p-2.5 sm:px-4 border-2 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  3. Auto-AI Cooling
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  autoAiCooling 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {autoAiCooling ? 'ACTIVE' : 'OFF (MANUAL)'}
                </span>
              </div>

              {/* The Toggle Switch */}
              <button
                onClick={onToggleAutoAi}
                className="flex items-center text-slate-800 hover:opacity-80 transition-opacity cursor-pointer"
                title={autoAiCooling ? 'Click to turn OFF predictive cooling' : 'Click to enable AI automatic cooling'}
              >
                {autoAiCooling ? (
                  <ToggleRight className="w-9 h-9 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>

            {/* When Auto-AI is OFF, show manual speed buttons */}
            {!autoAiCooling ? (
              <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-slate-500">Manual Fan:</span>
                <div className="flex items-center gap-1">
                  {[0, 30, 60, 100].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => onSetManualFanSpeed(speed)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        manualFanSpeed === speed
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {speed}%
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                AI controls fan speed automatically based on 10-min predictions.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
