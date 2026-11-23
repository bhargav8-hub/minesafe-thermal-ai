import React from 'react';
import { 
  MineZone, 
  ZoneId 
} from './types';
import { 
  Fan, 
  Thermometer, 
  Droplets, 
  Flame, 
  Wind, 
  Sparkles, 
  ArrowDown, 
  ShieldAlert,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface MineCrossSectionProps {
  zones: MineZone[];
  selectedZoneId: ZoneId;
  onSelectZone: (id: ZoneId) => void;
  isSimulatingHeat: boolean;
  autoAiCooling: boolean;
}

export const MineCrossSection: React.FC<MineCrossSectionProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  isSimulatingHeat,
  autoAiCooling,
}) => {
  const zoneA = zones.find((z) => z.id === 'zone-a')!;
  const zoneB = zones.find((z) => z.id === 'zone-b')!;
  const zoneC = zones.find((z) => z.id === 'zone-c')!;

  // Helper for fan spin speed class
  const getFanSpinClass = (speed: number) => {
    if (speed === 0) return '';
    if (speed <= 30) return 'spin-slow';
    if (speed <= 60) return 'spin-medium';
    return 'spin-fast';
  };

  // Helper for tunnel ambient glow
  const getZoneGlowStyle = (temp: number) => {
    if (temp < 28) {
      return {
        background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.85) 0%, rgba(209, 250, 229, 0.6) 100%)',
        borderColor: '#a7f3d0',
      };
    } else if (temp < 33) {
      return {
        background: 'linear-gradient(135deg, rgba(254, 252, 232, 0.9) 0%, rgba(254, 240, 138, 0.6) 100%)',
        borderColor: '#fde047',
      };
    } else {
      return {
        background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 202, 202, 0.75) 100%)',
        borderColor: '#fca5a5',
      };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Visual Top Bar / Legend */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-bold text-slate-800">
            Interactive Underground Cross-Section
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            (Click any zone to focus)
          </span>
        </div>

        {/* Child-friendly status color pill guide */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe (&lt;28°C)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warming (28-33°C)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Danger (&gt;33°C)
          </span>
        </div>
      </div>

      {/* Surface Terrain Illustration (Kid-friendly mine entrance) */}
      <div className="relative bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 px-6 pt-4 pb-2 border-b-4 border-amber-800/40 select-none">
        <div className="flex items-end justify-between">
          {/* Surface Scenery */}
          <div className="flex items-center gap-3">
            {/* Sun */}
            <div className="w-9 h-9 rounded-full bg-amber-400 border-2 border-amber-300 shadow-lg shadow-amber-300/50 flex items-center justify-center">
              <span className="text-sm">☀️</span>
            </div>
            {/* Cloud */}
            <div className="bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-medium text-slate-600 shadow-2xs">
              ☁️ Fresh Surface Air (21°C)
            </div>
          </div>

          {/* Mine Headframe & Radio Tower */}
          <div className="flex items-end gap-5">
            {/* IoT Base Station Tower */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/90 rounded-md text-[11px] font-bold text-emerald-700 shadow-2xs border border-emerald-200 mb-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                IoT Surface Gateway
              </div>
              <div className="w-1.5 h-7 bg-slate-500 rounded-t"></div>
            </div>

            {/* Hoist Frame / Mine Tower */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-4 border-dashed border-amber-900 bg-amber-700/20 spin-slow flex items-center justify-center text-[10px] text-amber-950 font-bold">
                ⚙️
              </div>
              <div className="w-12 h-6 border-b-4 border-l-4 border-r-4 border-amber-900/60 bg-amber-950/20 rounded-t-sm"></div>
            </div>

            {/* Ground Level Badge */}
            <div className="bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-t-lg shadow-sm">
              Surface: 0 Meters
            </div>
          </div>
        </div>

        {/* Grass / Ground Line */}
        <div className="absolute -bottom-1 left-0 right-0 h-2 bg-emerald-600"></div>
      </div>

      {/* Subterranean Cross-Section Area */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-stone-100 via-amber-50/50 to-stone-200 flex-1 flex flex-col gap-5">
        
        {/* Top Level: Zone A (Entrance) & Zone C (Machine Room) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* ZONE A: Tunnel Entrance */}
          <div
            onClick={() => onSelectZone('zone-a')}
            style={getZoneGlowStyle(zoneA.temp)}
            className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${
              selectedZoneId === 'zone-a' ? 'ring-4 ring-emerald-400 ring-offset-2' : ''
            }`}
          >
            {/* Zone Tag & Depth */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  A
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                    Zone A: Tunnel Entrance
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Fresh Air Inlet • Depth: {zoneA.depth}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Safe & Cool
              </span>
            </div>

            {/* Tunnel Interior Visuals */}
            <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 mb-3 grid grid-cols-2 gap-3 items-center">
              {/* IoT Sensor Card */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    IoT Sensor
                  </span>
                  <div className="text-xl font-black text-slate-800 leading-none">
                    {zoneA.temp.toFixed(1)}°C
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                    <Droplets className="w-3 h-3 text-cyan-500" />
                    {zoneA.humidity}% Humidity
                  </div>
                </div>
              </div>

              {/* Fan Card */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 ${getFanSpinClass(zoneA.fanSpeed)}`}>
                    <Fan className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Intake Fan
                  </span>
                  <div className="text-base font-bold text-cyan-800 leading-none">
                    {zoneA.fanSpeed}%
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                    Eco Mode
                  </span>
                </div>
              </div>
            </div>

            {/* Animated Tunnel Floor & Cartoon Miner */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-base">👷‍♂️</span>
                <span className="bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                  "Fresh surface air flowing in!"
                </span>
              </div>
              <div className="text-slate-400 font-bold tracking-widest text-[10px]">
                ═ ═ ═ ═ TRACK
              </div>
            </div>
          </div>

          {/* ZONE C: Machine Room */}
          <div
            onClick={() => onSelectZone('zone-c')}
            style={getZoneGlowStyle(zoneC.temp)}
            className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${
              selectedZoneId === 'zone-c' ? 'ring-4 ring-emerald-400 ring-offset-2' : ''
            }`}
          >
            {/* Zone Tag & Depth */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  C
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                    Zone C: Machine Room
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Power Generators & Pumps • Depth: {zoneC.depth}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                Normal Operations
              </span>
            </div>

            {/* Tunnel Interior Visuals */}
            <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 mb-3 grid grid-cols-2 gap-3 items-center">
              {/* IoT Sensor Card */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    IoT Sensor
                  </span>
                  <div className="text-xl font-black text-slate-800 leading-none">
                    {zoneC.temp.toFixed(1)}°C
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                    <Droplets className="w-3 h-3 text-cyan-500" />
                    {zoneC.humidity}% Humidity
                  </div>
                </div>
              </div>

              {/* Fan Card */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 ${getFanSpinClass(zoneC.fanSpeed)}`}>
                    <Fan className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Cooling Fan
                  </span>
                  <div className="text-base font-bold text-blue-800 leading-none">
                    {zoneC.fanSpeed}%
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                    Auto-Regulated
                  </span>
                </div>
              </div>
            </div>

            {/* Animated Machine Room Details */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-base">⚡</span>
                <span className="bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                  Generators steady, cooling fans optimal
                </span>
              </div>
              <div className="text-xs">
                🔧 Maintenance OK
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Level: ZONE B (Deep Digging Area - THE MAIN STAR OF THE DEMO) */}
        <div
          onClick={() => onSelectZone('zone-b')}
          style={getZoneGlowStyle(zoneB.temp)}
          className={`relative rounded-3xl p-5 sm:p-6 border-3 transition-all duration-500 cursor-pointer shadow-md hover:shadow-lg overflow-hidden ${
            zoneB.temp >= 33 
              ? 'border-rose-400 ring-4 ring-rose-400/50 animate-pulse' 
              : zoneB.temp >= 28 
              ? 'border-amber-400 ring-2 ring-amber-300' 
              : 'border-emerald-300'
          } ${selectedZoneId === 'zone-b' ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}`}
        >
          {/* Subtle Heat Wave / Air Shimmer Effect in Zone B when hot */}
          {zoneB.temp >= 30 && (
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-rose-500/10 to-transparent"></div>
          )}

          {/* Header of Zone B */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                B
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                    Zone B: Deep Digging Area
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 text-[11px] font-extrabold tracking-wide uppercase">
                    Primary Demo Cavern
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Deep Excavation Front • Depth: {zoneB.depth} • Heavy Rock Boring
                </p>
              </div>
            </div>

            {/* Dynamic Zone B Status Badge */}
            <div className="flex items-center gap-2">
              {zoneB.temp >= 33 ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-md animate-bounce">
                  <Flame className="w-4 h-4" />
                  HIGH HEAT DETECTED ({zoneB.temp.toFixed(1)}°C)
                </span>
              ) : zoneB.temp >= 28 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm">
                  <Flame className="w-4 h-4" />
                  WARMING UP ({zoneB.temp.toFixed(1)}°C)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  SAFE & OPTIMAL ({zoneB.temp.toFixed(1)}°C)
                </span>
              )}
            </div>
          </div>

          {/* Zone B Interactive Hardware Showcase (Sensor & Fan) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            {/* IoT Temperature & Humidity Sensor Pod */}
            <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
                  zoneB.temp >= 33 
                    ? 'bg-rose-100 text-rose-600' 
                    : zoneB.temp >= 28 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Thermometer className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      IoT Temp Sensor
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {zoneB.temp.toFixed(1)}<span className="text-xl font-bold text-slate-500">°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 text-cyan-600">
                      <Droplets className="w-3.5 h-3.5" />
                      {zoneB.humidity}% RH
                    </span>
                    <span>•</span>
                    <span className={
                      zoneB.temp >= 33 ? 'text-rose-600 font-bold' : zoneB.temp >= 28 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'
                    }>
                      {zoneB.temp >= 33 ? 'High Heat Risk' : zoneB.temp >= 28 ? 'Moderate Temp' : 'Comfortable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini visual gauge / thermometer bar */}
              <div className="hidden sm:flex flex-col items-center pl-4 border-l border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 mb-1">SAFETY</span>
                <div className="w-4 h-16 bg-slate-100 rounded-full p-0.5 flex flex-col justify-end overflow-hidden border border-slate-200">
                  <div 
                    className={`w-full rounded-full transition-all duration-500 ${
                      zoneB.temp >= 33 ? 'bg-rose-500' : zoneB.temp >= 28 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ height: `${Math.min(100, Math.max(10, ((zoneB.temp - 20) / 20) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Industrial Cooling Fan Unit */}
            <div className={`rounded-2xl p-4 border transition-all duration-300 shadow-xs flex items-center justify-between ${
              zoneB.fanSpeed === 100
                ? 'bg-cyan-50/90 border-cyan-300'
                : 'bg-white/95 border-slate-200/90'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  {/* Glowing wind aura when running 100% */}
                  {zoneB.fanSpeed === 100 && (
                    <div className="absolute inset-0 rounded-2xl bg-cyan-400/30 animate-ping"></div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-600 ${getFanSpinClass(zoneB.fanSpeed)}`}>
                    <Fan className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Industrial Cooling Fan
                    </span>
                    {zoneB.fanSpeed === 100 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-600 text-white animate-pulse">
                        BOOST
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-cyan-900 tracking-tight flex items-baseline gap-1">
                    {zoneB.fanSpeed}%
                    <span className="text-xs font-bold text-cyan-600">
                      {zoneB.fanSpeed === 100 ? 'TURBO COOLING' : zoneB.fanSpeed === 0 ? 'STOPPED' : 'POWER'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {zoneB.fanSpeed === 100
                      ? 'Maximum airflow actively dissipating underground heat!'
                      : zoneB.fanSpeed === 0
                      ? 'Fan turned off by manual override.'
                      : 'Gentle energy-saving speed (Eco mode).'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Cavern Environment Scene (Miners, Rocks, Cool Wind Gusts) */}
          <div className="relative bg-slate-900/5 rounded-2xl p-4 border border-slate-300/40 flex flex-wrap items-center justify-between gap-4">
            
            {/* Friendly Cartoon Miner State */}
            <div className="flex items-center gap-3">
              <div className="text-3xl filter drop-shadow">
                {zoneB.temp >= 34 ? '🥵' : zoneB.temp >= 28 ? '😅' : zoneB.fanSpeed === 100 ? '😌' : '⛏️ 👷'}
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Miners in Zone B:
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {zoneB.temp >= 34 ? (
                    <span className="text-rose-600">"Phew, it's very hot down here! Waiting for cooling fans!"</span>
                  ) : zoneB.temp >= 28 ? (
                    <span className="text-amber-700">"Noticeable heat building up from drilling..."</span>
                  ) : zoneB.fanSpeed === 100 ? (
                    <span className="text-cyan-700">"Cold breeze feels great! Temperature dropping back down!"</span>
                  ) : (
                    <span className="text-emerald-700">"Air temperature is comfortable. Digging safely."</span>
                  )}
                </div>
              </div>
            </div>

            {/* Cool air gusts indicator or heat waves */}
            <div className="flex items-center gap-2">
              {zoneB.fanSpeed === 100 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-100 text-cyan-800 font-extrabold text-xs border border-cyan-300 shadow-xs">
                  <Wind className="w-4 h-4 text-cyan-600 animate-bounce" />
                  <span className="cool-breeze-1">Cold Airflow</span>
                  <span className="cool-breeze-2">➔ ➔</span>
                </div>
              ) : zoneB.temp >= 32 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-300 shadow-xs">
                  <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Heat Pocket Rising</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                  <span>⛏️ Drilling Progress: 84%</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
