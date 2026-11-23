import React, { useState } from 'react';
import {
  Thermometer, Droplets, Wind, Activity, Users, Clock,
  Flame, AlertTriangle, ShieldCheck, CheckCircle, ArrowDown,
  ArrowRight, ArrowUp, RefreshCw, X, Zap, Info, Sparkles
} from 'lucide-react';
import { useAppState } from '../../context/AppContext';
import { Zone, Sensor } from '../../types';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

export function MineMap() {
  const { state, dispatch } = useAppState();
  const { zones, sensors, workers, fans, settings } = state;
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-c');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  // Active fans
  const mainFan = fans.find(f => f.type === 'main') || fans[0];
  const isFanRunning = mainFan?.status === 'on';

  // Zone instances
  const zoneA = zones.find(z => z.id === 'zone-a') || zones[0];
  const zoneB = zones.find(z => z.id === 'zone-b') || zones[1];
  const zoneC = zones.find(z => z.id === 'zone-c') || zones[2];
  const zoneD = zones.find(z => z.id === 'zone-d') || zones[3];
  const zoneE = zones.find(z => z.id === 'zone-e') || zones[4];

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zoneC;
  const isZoneCCritical = zoneC.riskLevel === 'critical';
  const isZoneCWarn = zoneC.riskLevel === 'warning';

  return (
    <div className="space-y-4">
      {/* VIVA PRESENTATION CHEAT SHEET (How to explain to Mam in 20 seconds) */}
      <div className="bg-gradient-to-r from-mine-panel via-mine-surface to-mine-panel border border-mine-cyan/40 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mine-cyan/15 border border-mine-cyan/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-mine-cyan" />
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Underground Mine Interactive Model</span>
                <span className="text-[10px] bg-mine-cyan text-black font-extrabold px-2 py-0.5 rounded">
                  COLLEGE DEMO MODE
                </span>
              </div>
              <p className="text-xs text-mine-subtext mt-0.5">
                Explain this to Mam: <strong>Zone A</strong> takes in fresh air from the surface. <strong>Zone C</strong> is 450m deep and overheats from drills. <strong>Zone E</strong> has the emergency fan that saves lives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-mine-subtext">Click any zone below to inspect:</span>
            {(['zone-a', 'zone-b', 'zone-c', 'zone-d', 'zone-e'] as const).map(zid => {
              const z = zones.find(item => item.id === zid);
              if (!z) return null;
              return (
                <button
                  key={zid}
                  onClick={() => setSelectedZoneId(zid)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${
                    selectedZoneId === zid
                      ? 'bg-mine-orange text-white border-mine-orange shadow-sm scale-105'
                      : 'bg-mine-surface text-mine-subtext border-mine-border hover:text-white'
                  }`}
                >
                  {z.name} ({z.temperature.toFixed(0)}°)
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CRITICAL ALARM BANNER (When Zone C Overheats) */}
      {isZoneCCritical && (
        <div className="p-4 rounded-xl border-2 border-mine-red bg-mine-red/20 flex flex-col sm:flex-row items-center justify-between gap-3 alert-blink shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-mine-red flex items-center justify-center text-white text-2xl animate-bounce shadow-md">
              🚨
            </div>
            <div>
              <div className="text-base font-extrabold text-white uppercase tracking-wide flex items-center gap-2">
                <span>DANGER: THERMAL OVERHEATING IN ZONE C! ({zoneC.temperature.toFixed(1)}°C)</span>
                <span className="text-xs bg-mine-red text-white font-mono px-2 py-0.5 rounded border border-white/40">
                  CRITICAL THRESHOLD: {settings.tempCriticalThreshold}°C
                </span>
              </div>
              <div className="text-xs text-mine-text mt-1">
                MineGuard IoT predicted this overheating! Evacuating <strong>{zoneC.workers} miners to Exit B</strong>. Main ventilation fan automatically ramped to <strong>100% Turbo Speed</strong>!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => dispatch({ type: 'SET_SCENARIO', payload: 'recovery' })}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-mine-green text-white hover:bg-green-600 transition-colors shadow flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Click to Start Cool Down</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* THE MAIN VISUAL UNDERGROUND MINE LAYOUT                  */}
      {/* ======================================================== */}
      <div className="bg-[#0b0e14] border-2 border-mine-border rounded-2xl p-5 shadow-2xl space-y-4">

        {/* 1. SURFACE LEVEL (Above Ground: Green Hill, Surface Plant & Exhaust Stack) */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-800/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="text-lg">🏔️</span>
            <div>
              <div className="uppercase tracking-wider">GROUND LEVEL (SURFACE ELEVATION: 0m)</div>
              <div className="text-[11px] text-emerald-200/70 font-normal">Fresh atmospheric air, trees, and mine surface support facility</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Fresh Air Intake */}
            <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-500/40 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-400">
              <span className="text-base">🏗️</span>
              <span>Headframe Hoist (Fresh Air Intake: 21°C)</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </div>

            {/* Surface Hauler Truck */}
            <div className="hidden lg:flex items-center gap-1.5 bg-amber-950/60 border border-amber-600/30 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400">
              <span className="text-base">🚚</span>
              <span>Surface Ore Stockpile</span>
            </div>

            {/* Exhaust Chimney */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-mine-cyan/50 px-3 py-1.5 rounded-lg text-xs font-bold text-mine-cyan">
              <span className="text-base">🏭</span>
              <span>Ventilation Chimney (Exhaust Outflow)</span>
              <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>
        </div>

        {/* 2. LEVEL 1: UPPER HORIZONTAL DRIFT TUNNEL (Depth: -150m) */}
        <div className="border border-mine-border/80 rounded-xl p-4 bg-mine-panel/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-mine-subtext border-b border-mine-border/60 pb-2">
            <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-mine-surface border border-mine-border text-mine-cyan font-mono">
                LEVEL 1 (DEPTH: -150 METERS)
              </span>
              <span>Upper Mine Drift Corridor & Continuous Coal Extraction</span>
            </div>
            <div className="flex items-center gap-1.5 text-mine-cyan font-mono">
              <Wind className="w-3.5 h-3.5" />
              <span>Airflow: 3.2 m/s Left → Right</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ZONE A: MAIN ENTRANCE & HOIST LANDING */}
            <div
              onClick={() => setSelectedZoneId('zone-a')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative overflow-hidden ${
                selectedZoneId === 'zone-a'
                  ? 'border-mine-green bg-mine-green/10 ring-2 ring-mine-green/40 shadow-lg'
                  : 'border-mine-border bg-mine-surface hover:border-mine-green/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-mine-green" />
                    <h3 className="text-base font-extrabold text-white">ZONE A: MAIN ENTRANCE</h3>
                  </div>
                  <div className="text-xs text-mine-subtext mt-0.5">Shaft Landing & Personnel Intake</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-mine-green">
                    {zoneA.temperature.toFixed(1)}°C
                  </div>
                  <span className="text-[10px] font-bold text-mine-green bg-mine-green/20 px-2 py-0.5 rounded border border-mine-green/40 uppercase">
                    SAFE
                  </span>
                </div>
              </div>

              {/* Visual badges */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Humidity</div>
                  <div className="text-mine-cyan font-bold">{zoneA.humidity.toFixed(0)}%</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">CO₂ Level</div>
                  <div className="text-mine-yellow font-bold">{zoneA.co2} ppm</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Miners</div>
                  <div className="text-white font-bold">{zoneA.workers} Miners 👷</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-mine-subtext">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ⬇ Fresh Air Inflow from Hoist Shaft
                </span>
                <span className="text-mine-cyan underline font-medium">Click to inspect →</span>
              </div>
            </div>

            {/* ZONE B: EXCAVATION AREA (CONTINUOUS MINER) */}
            <div
              onClick={() => setSelectedZoneId('zone-b')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative overflow-hidden ${
                selectedZoneId === 'zone-b'
                  ? 'border-mine-yellow bg-mine-yellow/10 ring-2 ring-mine-yellow/40 shadow-lg'
                  : 'border-mine-border bg-mine-surface hover:border-mine-yellow/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-mine-yellow" />
                    <h3 className="text-base font-extrabold text-white">ZONE B: EXCAVATION FACE</h3>
                  </div>
                  <div className="text-xs text-mine-subtext mt-0.5">Continuous Mining Drills & Coal Cutting</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-mine-yellow">
                    {zoneB.temperature.toFixed(1)}°C
                  </div>
                  <span className="text-[10px] font-bold text-mine-yellow bg-mine-yellow/20 px-2 py-0.5 rounded border border-mine-yellow/40 uppercase">
                    MODERATE
                  </span>
                </div>
              </div>

              {/* Visual badges */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Humidity</div>
                  <div className="text-mine-cyan font-bold">{zoneB.humidity.toFixed(0)}%</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">CO₂ Level</div>
                  <div className="text-mine-yellow font-bold">{zoneB.co2} ppm</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Miners</div>
                  <div className="text-white font-bold">{zoneB.workers} Miners 👷</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-mine-subtext">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  ⛏️ Heavy Drills Cutting Coal Seam
                </span>
                <span className="text-mine-cyan underline font-medium">Click to inspect →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connecting Airflow Chute between Level 1 and Level 2 */}
        <div className="flex items-center justify-center gap-3 text-xs font-bold text-mine-cyan py-1 bg-mine-surface/60 rounded-lg border border-dashed border-mine-border">
          <span>⬇ VERTICAL CHUTE: AIRFLOW DROPS FROM LEVEL 1 TO DEEP LEVEL 2 ⬇</span>
        </div>

        {/* 3. LEVEL 2: DEEP MINING & GEOTHERMAL HOTSPOT (Depth: -450m) */}
        <div className="border border-mine-border/80 rounded-xl p-4 bg-mine-panel/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-mine-subtext border-b border-mine-border/60 pb-2">
            <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-mine-surface border border-mine-border text-mine-orange font-mono">
                LEVEL 2 (DEPTH: -450 METERS)
              </span>
              <span>Deep Geothermal Extraction Chamber & Main Exhaust Fans</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-mine-red/20 text-mine-red border border-mine-red/40 px-2 py-0.5 rounded font-bold">
                HIGH THERMAL RISK ZONE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ZONE D: EQUIPMENT & SUBSTATION */}
            <div
              onClick={() => setSelectedZoneId('zone-d')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative overflow-hidden ${
                selectedZoneId === 'zone-d'
                  ? 'border-mine-green bg-mine-green/10 ring-2 ring-mine-green/40 shadow-lg'
                  : 'border-mine-border bg-mine-surface hover:border-mine-green/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-mine-green" />
                    <h3 className="text-base font-extrabold text-white">ZONE D: POWER ROOM</h3>
                  </div>
                  <div className="text-xs text-mine-subtext mt-0.5">Substation & Drainage Pumps</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-mine-green">
                    {zoneD.temperature.toFixed(1)}°C
                  </div>
                  <span className="text-[10px] font-bold text-mine-green bg-mine-green/20 px-2 py-0.5 rounded border border-mine-green/40 uppercase">
                    SAFE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Voltage</div>
                  <div className="text-mine-cyan font-bold">4160 V ⚡</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Miners</div>
                  <div className="text-white font-bold">{zoneD.workers} Miners 👷</div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-mine-subtext flex justify-between">
                <span>⚡ Electrical transformers</span>
                <span className="text-mine-cyan underline font-medium">Click to inspect →</span>
              </div>
            </div>

            {/* ZONE C: DEEP MINING SECTION (HOTSPOT!) */}
            <div
              onClick={() => setSelectedZoneId('zone-c')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative overflow-hidden ${
                isZoneCCritical
                  ? 'border-mine-red bg-mine-red/25 ring-4 ring-mine-red alert-blink shadow-2xl scale-102'
                  : isZoneCWarn
                  ? 'border-mine-yellow bg-mine-yellow/15 ring-2 ring-mine-yellow shadow-lg'
                  : selectedZoneId === 'zone-c'
                  ? 'border-mine-orange bg-mine-orange/15 ring-2 ring-mine-orange shadow-lg'
                  : 'border-mine-border bg-mine-surface hover:border-mine-orange/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${isZoneCCritical ? 'bg-mine-red animate-ping' : isZoneCWarn ? 'bg-mine-yellow' : 'bg-mine-orange'}`} />
                    <h3 className="text-base font-extrabold text-white">ZONE C: DEEP CHAMBER</h3>
                  </div>
                  <div className="text-xs text-mine-subtext mt-0.5">🔥 Primary Hotspot Target (450m Deep)</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-2xl font-black ${isZoneCCritical ? 'text-mine-red animate-pulse' : isZoneCWarn ? 'text-mine-yellow' : 'text-mine-orange'}`}>
                    {zoneC.temperature.toFixed(1)}°C
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isZoneCCritical ? 'bg-mine-red text-white border-white animate-bounce' :
                    isZoneCWarn ? 'bg-mine-yellow/20 text-mine-yellow border-mine-yellow/40' :
                    'bg-mine-orange/20 text-mine-orange border-mine-orange/40'
                  }`}>
                    {isZoneCCritical ? '🚨 CRITICAL' : isZoneCWarn ? '⚠️ WARNING' : 'ELEVATED'}
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">CO₂ Level</div>
                  <div className="text-mine-yellow font-bold">{zoneC.co2} ppm</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Airflow</div>
                  <div className="text-mine-cyan font-bold">{zoneC.airflow.toFixed(1)} m/s</div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Personnel</div>
                  <div className="text-white font-bold">{zoneC.workers} Miners 👷</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                <span className={isZoneCCritical ? 'text-mine-red' : 'text-mine-orange'}>
                  {isZoneCCritical ? '🚨 EVACUATION ORDER ISSUED' : '♨️ Geothermal + Drill Friction Heat'}
                </span>
                <span className="text-mine-cyan underline font-medium">Click to inspect →</span>
              </div>
            </div>

            {/* ZONE E: VENTILATION STATION */}
            <div
              onClick={() => setSelectedZoneId('zone-e')}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative overflow-hidden ${
                selectedZoneId === 'zone-e'
                  ? 'border-mine-cyan bg-mine-cyan/10 ring-2 ring-mine-cyan/40 shadow-lg'
                  : 'border-mine-border bg-mine-surface hover:border-mine-cyan/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-mine-cyan" />
                    <h3 className="text-base font-extrabold text-white">ZONE E: VENTILATION</h3>
                  </div>
                  <div className="text-xs text-mine-subtext mt-0.5">Primary Exhaust Fan Station</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-mine-cyan">
                    {zoneE.temperature.toFixed(1)}°C
                  </div>
                  <span className="text-[10px] font-bold text-mine-cyan bg-mine-cyan/20 px-2 py-0.5 rounded border border-mine-cyan/40 uppercase">
                    ACTIVE
                  </span>
                </div>
              </div>

              {/* Fan graphic */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Fan Speed</div>
                  <div className="text-mine-cyan font-bold flex items-center justify-center gap-1">
                    <span className={`text-sm ${isFanRunning ? 'animate-spin' : ''}`}>🌀</span>
                    <span>{mainFan.speed}%</span>
                  </div>
                </div>
                <div className="p-2 rounded bg-mine-panel border border-mine-border text-center">
                  <div className="text-[10px] text-mine-subtext font-sans">Air Volume</div>
                  <div className="text-white font-bold">{mainFan.airflowCFM.toLocaleString()} CFM</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-mine-subtext">
                <span className="text-mine-cyan font-semibold">
                  ⬆ Blowing hot air out to surface
                </span>
                <span className="text-mine-cyan underline font-medium">Click to inspect →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Air Circulation Summary Bar */}
        <div className="bg-[#0f141e] border border-mine-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span className="text-base">🔄</span>
            <span>VENTILATION LOOP:</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-mine-subtext flex-wrap">
            <span className="text-emerald-400">Surface Intake (21°C)</span>
            <ArrowRight className="w-3.5 h-3.5 text-mine-cyan" />
            <span className="text-emerald-400">Zone A (24.5°C)</span>
            <ArrowRight className="w-3.5 h-3.5 text-mine-cyan" />
            <span className="text-yellow-400">Zone B (27.8°C)</span>
            <ArrowRight className="w-3.5 h-3.5 text-mine-cyan" />
            <span className={isZoneCCritical ? 'text-red-400 font-bold' : 'text-orange-400'}>
              Zone C Hotspot ({zoneC.temperature.toFixed(1)}°C)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-mine-cyan" />
            <span className="text-cyan-400">Zone E Exhaust Fan</span>
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300">Surface Chimney</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CHAMBER INSPECTION & TEACHER Q&A ACCORDION               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Selected Zone Live Inspector */}
        <div className="md:col-span-8 bg-mine-panel border border-mine-border rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div>
              <div className="text-xs font-bold text-mine-cyan uppercase tracking-wider">Detailed Diagnostic Chamber</div>
              <h3 className="text-lg font-black text-white">{selectedZone.name} – {selectedZone.fullName}</h3>
            </div>
            <StatusBadge level={selectedZone.riskLevel} size="md" pulse={selectedZone.riskLevel === 'critical'} />
          </div>

          {/* 4 Big Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-mine-surface border border-mine-border">
              <div className="flex items-center justify-center gap-1 text-mine-orange text-xs font-semibold mb-1">
                <Thermometer className="w-4 h-4" />
                <span>Temperature</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">{selectedZone.temperature.toFixed(1)}°C</div>
              <div className="text-[10px] text-mine-subtext mt-1">Safe: &lt; {settings.tempWarningThreshold}°C</div>
            </div>

            <div className="p-3 rounded-xl bg-mine-surface border border-mine-border">
              <div className="flex items-center justify-center gap-1 text-mine-blue text-xs font-semibold mb-1">
                <Droplets className="w-4 h-4" />
                <span>Humidity</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">{selectedZone.humidity.toFixed(0)}%</div>
              <div className="text-[10px] text-mine-subtext mt-1">Safe: &lt; {settings.humidityThreshold}%</div>
            </div>

            <div className="p-3 rounded-xl bg-mine-surface border border-mine-border">
              <div className="flex items-center justify-center gap-1 text-mine-yellow text-xs font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>CO₂ Level</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">{selectedZone.co2} ppm</div>
              <div className="text-[10px] text-mine-subtext mt-1">Limit: {settings.co2Threshold} ppm</div>
            </div>

            <div className="p-3 rounded-xl bg-mine-surface border border-mine-border">
              <div className="flex items-center justify-center gap-1 text-mine-cyan text-xs font-semibold mb-1">
                <Wind className="w-4 h-4" />
                <span>Airflow</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">{selectedZone.airflow.toFixed(1)} m/s</div>
              <div className="text-[10px] text-mine-subtext mt-1">Ventilation flow</div>
            </div>
          </div>

          {/* What Mam Will Ask / Plain English Explanation */}
          <div className="p-3.5 rounded-xl bg-mine-surface border border-mine-border text-xs leading-relaxed space-y-2">
            <div className="font-bold text-mine-text flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-mine-cyan" />
              <span>Explanation for Teacher / Mam:</span>
            </div>
            {selectedZone.id === 'zone-c' ? (
              <p className="text-mine-subtext">
                "Mam, <strong>Zone C is our deep mining section at -450 meters</strong>. It has the highest risk of overheating because of rock strata heat and continuous drill friction. When we trigger <em>Step 2 (Heat Rising)</em> or <em>Step 3 (Critical)</em>, our DHT22 sensors and predictive trend algorithm detect the danger ahead of time, sounding the alarm and starting the Zone E ventilation fan automatically."
              </p>
            ) : selectedZone.id === 'zone-a' ? (
              <p className="text-mine-subtext">
                "Mam, <strong>Zone A is the main entrance at -150 meters</strong> where miners exit the elevator hoist. It receives fresh surface air first, which is why temperature here stays around 24°C."
              </p>
            ) : selectedZone.id === 'zone-b' ? (
              <p className="text-mine-subtext">
                "Mam, <strong>Zone B is where 8 miners operate continuous drilling machinery</strong>. Machine friction creates warm air and dust, which is measured by our simulated MQ-135 and airflow sensors."
              </p>
            ) : selectedZone.id === 'zone-d' ? (
              <p className="text-mine-subtext">
                "Mam, <strong>Zone D is our electrical power room</strong> at -450m with high-voltage transformers and backup pumps powering the mine."
              </p>
            ) : (
              <p className="text-mine-subtext">
                "Mam, <strong>Zone E houses the primary industrial ventilation fan</strong>. It pulls hot air from Zone C and pushes it up the exhaust chimney to the surface."
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Miners & Quick Controls */}
        <div className="md:col-span-4 bg-mine-panel border border-mine-border rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-mine-border pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-mine-cyan" />
              <span>Personnel in {selectedZone.name}</span>
            </h4>
            <span className="text-xs font-bold text-mine-cyan font-mono">{selectedZone.workers} Miners</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {workers.filter(w => w.zoneId === selectedZone.id).map(w => (
              <div
                key={w.id}
                className="flex items-center justify-between p-2 rounded-lg bg-mine-surface border border-mine-border text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👷</span>
                  <div>
                    <div className="font-semibold text-white">{w.name}</div>
                    <div className="text-[10px] text-mine-subtext">ID: {w.id}</div>
                  </div>
                </div>
                <StatusBadge level={w.status as any} label={w.status.toUpperCase()} />
              </div>
            ))}
          </div>

          {/* Quick jump to prediction */}
          <button
            onClick={() => dispatch({ type: 'SET_SECTION', payload: 'thermal' })}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-mine-orange hover:bg-orange-600 text-white transition-colors flex items-center justify-center gap-2 shadow"
          >
            <Flame className="w-4 h-4" />
            <span>Open Thermal Prediction Engine →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
