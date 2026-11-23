import React from 'react';
import { Play, Pause, RotateCcw, Zap, Thermometer, AlertTriangle, Wind, TrendingDown, Gauge, Presentation } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { SimulationScenario } from '../types';

const SCENARIOS: {
  id: SimulationScenario;
  step: string;
  label: string;
  icon: React.ElementType;
  color: string;
  activeBg: string;
  teacherExplainer: string;
}[] = [
  {
    id: 'normal',
    step: 'Step 1',
    label: 'Normal Operations',
    icon: Zap,
    color: 'text-mine-green',
    activeBg: 'bg-mine-green/20 border-mine-green text-mine-green',
    teacherExplainer: '🟢 NORMAL STATE: All 5 underground zones are safe (<32°C). Fresh cool air is flowing down the shaft at 3.2 m/s. All 21 miners are working safely with zero hazards.',
  },
  {
    id: 'temperature-increase',
    step: 'Step 2',
    label: 'Heat Rising in Zone C',
    icon: Thermometer,
    color: 'text-mine-yellow',
    activeBg: 'bg-mine-yellow/20 border-mine-yellow text-mine-yellow',
    teacherExplainer: '🟡 THERMAL WARNING: Heavy continuous mining drills in deep Zone C are generating heat. The IoT predictive algorithm detects a rising slope (+0.5°C/min) and warns operators 20 minutes before danger!',
  },
  {
    id: 'critical-thermal',
    step: 'Step 3',
    label: 'Critical Hazard & Evacuation',
    icon: AlertTriangle,
    color: 'text-mine-red',
    activeBg: 'bg-mine-red/25 border-mine-red text-mine-red',
    teacherExplainer: '🔴 CRITICAL EMERGENCY: Temperature in Zone C crossed the critical safety limit (38°C)! MineGuard sounds the siren, orders immediate evacuation of 8 miners to Exit B, and automatically boosts ventilation fans to 100%!',
  },
  {
    id: 'ventilation-failure',
    step: 'Step 4',
    label: 'Fan Failure Simulation',
    icon: Wind,
    color: 'text-mine-orange',
    activeBg: 'bg-mine-orange/20 border-mine-orange text-mine-orange',
    teacherExplainer: '🟠 VENTILATION FAILURE: The main exhaust fan has tripped offline. Stagnant air is trapping heat and CO₂ in the deep chambers. Watch how temperature rapidly builds up without ventilation!',
  },
  {
    id: 'recovery',
    step: 'Step 5',
    label: 'Automatic Recovery',
    icon: TrendingDown,
    color: 'text-mine-cyan',
    activeBg: 'bg-mine-cyan/20 border-mine-cyan text-mine-cyan',
    teacherExplainer: '🔵 RECOVERY COMPLETE: Ventilation restored to maximum capacity (100% turbo). Cool surface air flushes through the tunnels, bringing Zone C back down to safe temperatures.',
  },
];

export function DemoScenarios() {
  const { state, dispatch } = useAppState();
  const { simulation } = state;
  const currentScenario = SCENARIOS.find(s => s.id === simulation.scenario) || SCENARIOS[0];

  return (
    <div className="border-b border-mine-border bg-mine-panel shadow-sm">
      {/* Step Buttons Row */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-mine-orange/15 border border-mine-orange/40 rounded-md">
            <Presentation className="w-4 h-4 text-mine-orange" />
            <span className="text-xs font-bold text-mine-orange uppercase tracking-wider">Viva Presentation</span>
          </div>

          {/* Play / Pause / Reset */}
          <button
            onClick={() => dispatch({ type: simulation.running ? 'PAUSE_SIMULATION' : 'START_SIMULATION' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${
              simulation.running
                ? 'bg-mine-orange text-white hover:bg-orange-600'
                : 'bg-mine-green text-white hover:bg-green-600'
            }`}
          >
            {simulation.running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simulation.running ? 'Pause Live' : 'Start Live'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-mine-subtext border border-mine-border bg-mine-surface hover:text-white transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-mine-border bg-mine-surface">
            <Gauge className="w-3.5 h-3.5 text-mine-subtext" />
            <select
              value={simulation.speed}
              onChange={e => dispatch({ type: 'SET_SPEED', payload: Number(e.target.value) as 1 | 2 | 5 })}
              className="bg-transparent text-xs text-mine-text outline-none cursor-pointer font-bold"
            >
              <option value={1}>1x Speed</option>
              <option value={2}>2x Speed</option>
              <option value={5}>5x Turbo</option>
            </select>
          </div>
        </div>

        {/* 1-Click Presentation Step Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {SCENARIOS.map(sc => {
            const Icon = sc.icon;
            const isActive = simulation.scenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => dispatch({ type: 'SET_SCENARIO', payload: sc.id })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isActive
                    ? `${sc.activeBg} shadow-md scale-105 ring-2 ring-mine-orange/50`
                    : 'bg-mine-surface text-mine-subtext border-mine-border/80 hover:bg-mine-elevated hover:text-white'
                }`}
              >
                <span className="text-[10px] bg-mine-panel/80 px-1.5 py-0.5 rounded font-mono border border-mine-border/50">
                  {sc.step}
                </span>
                <Icon className="w-3.5 h-3.5" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIVA LIVE EXPLAINER BANNER (Tell Mam exactly what is happening) */}
      <div className="px-4 py-2 bg-[#0c121e] border-t border-mine-border flex items-center gap-3">
        <span className="text-[11px] font-bold text-mine-cyan bg-mine-cyan/15 border border-mine-cyan/40 px-2.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wide">
          👉 What to Tell Mam:
        </span>
        <p className="text-xs font-medium text-mine-text leading-relaxed">
          {currentScenario.teacherExplainer}
        </p>
      </div>
    </div>
  );
}
