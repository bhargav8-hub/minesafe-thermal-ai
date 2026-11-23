import React from 'react';
import { MineZone, DeviceId } from './types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Fan, 
  Wind, 
  Flame, 
  Thermometer, 
  Droplets,
  Zap, 
  Eye
} from 'lucide-react';

interface AnimatedCaveSceneProps {
  zoneB: MineZone;
  isSimulatingHeat: boolean;
  autoAiCooling: boolean;
  isStoryPlaying: boolean;
  storyTime: number;
  onToggleStory: () => void;
  onResetStory: () => void;
  selectedDeviceId: DeviceId | null;
  onSelectDevice: (id: DeviceId | null) => void;
}

export const AnimatedCaveScene: React.FC<AnimatedCaveSceneProps> = ({
  zoneB,
  isSimulatingHeat,
  autoAiCooling,
  isStoryPlaying,
  storyTime,
  onToggleStory,
  onResetStory,
  selectedDeviceId,
  onSelectDevice,
}) => {
  // Dynamic live values
  const airTemp = zoneB.temp;
  const humidity = zoneB.humidity;
  const fanSpeed = zoneB.fanSpeed;
  const isHighFan = fanSpeed === 100;
  
  // Rock temperature reacts faster
  const rockTemp = isSimulatingHeat
    ? (autoAiCooling ? Math.min(41.0, airTemp + 5.2) : Math.min(47.5, airTemp + 9.0))
    : Number((airTemp + 1.8).toFixed(1));

  // Determine current Story Phase (0-24s)
  let currentSubtitle = "Miners are working safely underground in fresh, cool air (25°C).";
  let storyStepNumber = 1;

  if (isStoryPlaying) {
    if (storyTime < 6) {
      storyStepNumber = 1;
      currentSubtitle = "1. Miners are working deep underground where heavy drilling creates heat.";
    } else if (storyTime < 12) {
      storyStepNumber = 2;
      currentSubtitle = "2. IoT Sensors (DHT22 & IR Thermal) detect rising rock heat and beam signals to the AI Tower.";
    } else if (storyTime < 18) {
      storyStepNumber = 3;
      currentSubtitle = "3. Predictive AI forecasts a danger spike 10 minutes early—before miners get harmed!";
    } else {
      storyStepNumber = 4;
      currentSubtitle = "4. AI triggers the Smart Relay! Cooling fans boost to 100%, blowing cool blue air to keep workers safe.";
    }
  } else if (isSimulatingHeat) {
    if (isHighFan) {
      currentSubtitle = "💨 AI Turbo Cooling Active! Cold air streams are pushing heat away from miners.";
    } else {
      currentSubtitle = "⚠️ Heat Spike Detected! Rock friction is heating up the cavern face.";
    }
  }

  // Is cave currently hot?
  const isHot = airTemp >= 30 || (isStoryPlaying && storyTime >= 6 && storyTime < 18);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden flex flex-col">
      
      {/* ============================================================== */}
      {/* 1. SCENE TOP BAR WITH STORY MODE CONTROLS */}
      {/* ============================================================== */}
      <div className="px-5 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-lg shadow-inner">
            🎬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Live 2D Cave Cutaway Simulation
              </h2>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wider animate-pulse">
                60fps Live
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium">
              Watch miners work, sensors measure heat, and AI automatically cool the tunnel
            </p>
          </div>
        </div>

        {/* Story Mode Player Controls */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20">
          <button
            onClick={onToggleStory}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm ${
              isStoryPlaying
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isStoryPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>▶ Play Story</span>
              </>
            )}
          </button>

          <button
            onClick={onResetStory}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Reset Story"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timeline counter */}
          <div className="text-[11px] font-mono font-bold text-indigo-200 min-w-10 text-right">
            {storyTime}s / 24s
          </div>
        </div>
      </div>

      {/* Video Progress Bar */}
      <div className="w-full bg-slate-800 h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${(storyTime / 24) * 100}%` }}
        ></div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE 2D ANIMATED CAVE & SURFACE CUTAWAY (SVG CANVAS) */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden select-none bg-gradient-to-b from-sky-200 via-sky-100 to-stone-200">
        
        {/* ============================================================== */}
        {/* TOP 25%: ABOVE GROUND - SKY, HILL, TREES & AI CLOUD HUB */}
        {/* ============================================================== */}
        <div className="relative pt-4 px-5 pb-1 min-h-[120px] flex items-end justify-between border-b-4 border-amber-900/50">
          
          {/* Sky & Sun */}
          <div className="absolute top-2 left-5 flex items-center gap-3 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-300 shadow-md shadow-amber-300/60 flex items-center justify-center text-lg">
              ☀️
            </div>
            <div className="bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-700 shadow-2xs">
              ☁️ Fresh Surface Air: 21°C
            </div>
          </div>

          {/* Grassy Hill with Pine Trees */}
          <div className="flex items-end gap-2 z-0">
            <div className="text-2xl filter drop-shadow">🌲</div>
            <div className="text-xl filter drop-shadow">🌲</div>
            <div className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-t shadow-xs">
              Surface Level (0m)
            </div>
          </div>

          {/* SURFACE CENTER: MINE SHAFT PULLEY TOWER */}
          <div className="flex flex-col items-center justify-end z-10 px-3">
            <div className="w-8 h-8 rounded-full border-3 border-dashed border-amber-900 bg-amber-800/20 spin-slow flex items-center justify-center text-[9px] text-amber-950 font-bold shadow-xs">
              ⚙️
            </div>
            <div className="w-11 h-9 border-b-4 border-l-4 border-r-4 border-amber-950/70 bg-amber-900/20 rounded-t flex items-center justify-center">
              <span className="text-[8px] font-black text-amber-950 bg-amber-200/90 px-1 rounded">
                SHAFT
              </span>
            </div>
          </div>

          {/* SURFACE RIGHT: "AI CLOUD CONTROL HUB" (Blinking Antenna) */}
          <div 
            onClick={() => onSelectDevice(selectedDeviceId === 'ai-hub' ? null : 'ai-hub')}
            className={`z-10 rounded-xl p-2.5 bg-white/95 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2.5 ${
              selectedDeviceId === 'ai-hub' ? 'border-purple-600 ring-3 ring-purple-200 scale-102' : 'border-purple-300'
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-xl dish-swivel shadow-xs">
                📡
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white animate-ping"></div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-black text-purple-950 uppercase tracking-wider">
                  AI Cloud Control Hub
                </span>
                <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-purple-100 text-purple-800">
                  SURFACE
                </span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                <span>🧠 AI Brain:</span>
                <span className="text-purple-700">Predicting 10m Ahead</span>
              </div>
            </div>
          </div>

          {/* Grass Line */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-emerald-600 z-0"></div>
        </div>

        {/* ============================================================== */}
        {/* VERTICAL ELEVATOR SHAFT & RISING RADIO WAVES */}
        {/* ============================================================== */}
        <div className="relative h-11 bg-stone-700 flex items-center justify-between px-8 border-b border-stone-800">
          <div className="w-1 h-full bg-amber-900 border-x border-amber-950 border-dashed opacity-50"></div>
          
          {/* Rising Wireless Radio Waves */}
          <div className="flex items-center gap-2 bg-indigo-950/80 px-3 py-0.5 rounded-full border border-indigo-400 text-indigo-200 text-[11px] font-bold shadow-inner">
            <span className="radio-wave-1 text-sm text-cyan-400">📶</span>
            <span>Wireless Signals Rising: <strong>ESP32 ➔ AI Cloud Hub</strong></span>
            <span className="radio-wave-2 text-sm text-cyan-400">📶</span>
          </div>

          <div className="w-1 h-full bg-amber-900 border-x border-amber-950 border-dashed opacity-50"></div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM 75%: DEEP UNDERGROUND CAVE TUNNEL (-180m) */}
        {/* ============================================================== */}
        <div className={`relative p-4 sm:p-5 transition-all duration-700 overflow-hidden ${
          isHot
            ? 'bg-gradient-to-r from-amber-950 via-rose-950 to-stone-900'
            : 'bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950/80'
        }`}>

          {/* Glowing Ambient Tunnel Atmosphere */}
          {isHot && (
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-rose-500/25 via-amber-500/15 to-transparent animate-pulse"></div>
          )}

          {/* Timber Roof Beams */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-stone-950 flex items-center justify-around opacity-80 z-0">
            <div className="w-5 h-3 bg-amber-900 rounded-b"></div>
            <div className="w-5 h-3 bg-amber-900 rounded-b"></div>
            <div className="w-5 h-3 bg-amber-900 rounded-b"></div>
            <div className="w-5 h-3 bg-amber-900 rounded-b"></div>
            <div className="w-5 h-3 bg-amber-900 rounded-b"></div>
          </div>

          {/* ============================================================== */}
          {/* TWO CLEAR ZONES: ZONE A (ENTRANCE) & ZONE B (DIGGING AREA) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch relative z-10 pt-1">
            
            {/* ------------------------------------------------------------ */}
            {/* ZONE A: TUNNEL ENTRANCE & CONTROL CHAMBER (Left 5 Cols) */}
            {/* ------------------------------------------------------------ */}
            <div className="md:col-span-5 bg-stone-900/90 rounded-2xl p-3.5 border-2 border-cyan-500/30 shadow-md flex flex-col justify-between gap-3">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-900/80 text-cyan-300 border border-cyan-400/50 uppercase tracking-wider">
                    Zone A: Tunnel Entrance
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">
                    Control Chamber
                  </span>
                </div>

                {/* IoT Hardware: ESP32 LoRa Gateway */}
                <div 
                  onClick={() => onSelectDevice('esp32')}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer mb-2 flex items-center justify-between ${
                    selectedDeviceId === 'esp32'
                      ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-300'
                      : 'bg-stone-800/90 border-indigo-500/40 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📡</span>
                    <div>
                      <div className="text-xs font-black text-white">ESP32 LoRa Gateway</div>
                      <div className="text-[9px] text-indigo-300 font-semibold">Collecting 3 Sensor Streams</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                </div>

                {/* IoT Hardware: Smart Relay & Giant Ventilation Fan */}
                <div 
                  onClick={() => onSelectDevice('smart-relay-fan')}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedDeviceId === 'smart-relay-fan'
                      ? 'bg-teal-900/60 border-teal-400 ring-2 ring-teal-300'
                      : 'bg-stone-800/90 border-teal-500/40 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center ${
                        isHighFan ? 'spin-ultra' : fanSpeed === 0 ? '' : 'spin-slow'
                      }`}>
                        <Fan className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">Smart Relay & Fan</div>
                        <div className="text-[9px] text-teal-300 font-bold">
                          Speed: {fanSpeed}% {isHighFan ? '⚡ MAX BOOST' : 'Eco'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cold air waves blowing when fan active */}
                  {isHighFan ? (
                    <div className="flex items-center gap-1 text-[9px] font-black text-teal-300 bg-teal-950/70 px-1.5 py-0.5 rounded border border-teal-500/40">
                      <Wind className="w-3 h-3 text-cyan-400 animate-bounce" />
                      <span className="cool-wind-stream-1">Cooling Wind Waves ➔ ➔</span>
                    </div>
                  ) : (
                    <div className="text-[9px] text-stone-400 font-medium">
                      🍃 Normal Fresh Air Intake
                    </div>
                  )}
                </div>
              </div>

              {/* MINER 3: Standing near humming machine checking clipboard */}
              <div className="bg-stone-800/80 rounded-xl p-2 border border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative text-2xl">
                    👷‍♂️
                    <div className="absolute top-0 -right-1 w-3 h-1.5 bg-yellow-300/50 blur-xs rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-1">
                      <span>Miner 3 (Control)</span>
                      <span>📋</span>
                    </div>
                    <div className="text-[9px] text-stone-300">
                      "Checking power generator & fan relays."
                    </div>
                  </div>
                </div>
                <div className="text-xs text-cyan-400 font-mono font-bold animate-pulse">
                  ⚡ 240V
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* ZONE B: DEEP DIGGING AREA (Right 7 Cols - Dynamic Glow!) */}
            {/* ------------------------------------------------------------ */}
            <div className={`md:col-span-7 rounded-2xl p-3.5 border-2 transition-all duration-500 shadow-md flex flex-col justify-between gap-3 ${
              isHot 
                ? 'bg-gradient-to-r from-amber-900/80 via-rose-950 to-rose-900/80 border-rose-400 ring-2 ring-rose-400/50' 
                : 'bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950/60 border-emerald-500/30'
            }`}>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider transition-colors ${
                    isHot 
                      ? 'bg-rose-900 text-rose-200 border-rose-400 animate-pulse' 
                      : 'bg-emerald-900/80 text-emerald-300 border-emerald-400/50'
                  }`}>
                    Zone B: Deep Digging Area {isHot ? '🔥 (HEAT SPIKE)' : '✅ (SAFE)'}
                  </span>
                  <span className="text-[10px] text-stone-300 font-bold">
                    Depth: -180m
                  </span>
                </div>

                {/* SENSORS INSIDE ZONE B: DHT22 & IR THERMAL ROCK SENSOR */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  
                  {/* DHT22 Temp & Humidity */}
                  <div 
                    onClick={() => onSelectDevice('dht22')}
                    className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedDeviceId === 'dht22'
                        ? 'bg-emerald-900/60 border-emerald-400 ring-2 ring-emerald-300'
                        : 'bg-stone-800/90 border-emerald-500/40 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">🌡️</span>
                      <span className="text-[11px] font-black text-white">DHT22 Sensor</span>
                    </div>
                    <div className="bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40 text-[11px] font-black text-emerald-300">
                      {airTemp.toFixed(1)}°C | {humidity}% RH
                    </div>
                  </div>

                  {/* IR Thermal Rock Sensor with Laser Beam */}
                  <div 
                    onClick={() => onSelectDevice('ir-thermal')}
                    className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedDeviceId === 'ir-thermal'
                        ? 'bg-amber-900/60 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-stone-800/90 border-amber-500/40 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">🔥</span>
                      <span className="text-[11px] font-black text-white">IR Rock Sensor</span>
                    </div>
                    <div className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                      rockTemp >= 35 ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      Rock: {rockTemp.toFixed(1)}°C {isHot ? '▲' : ''}
                    </div>
                    {/* Laser Beam */}
                    <div className="text-[8px] font-bold text-amber-300 mt-1 flex items-center gap-1">
                      <span className="text-rose-500 ir-beam-anim">🔴══►</span>
                      <span>Scanning Face</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* MINER 1 & MINER 2 WORKING INSIDE ZONE B */}
              <div className="grid grid-cols-2 gap-2">
                
                {/* MINER 2 (Middle Tunnel): Pushing Coal Minecart */}
                <div className="bg-stone-800/80 rounded-xl p-2 border border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="relative text-xl">
                      {isHot ? '😓' : '👷‍♂️'}
                      {isHot && <span className="absolute -top-1 -right-1 text-xs sweat-drop-anim">💧</span>}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white">Miner 2 (Cart)</div>
                      <div className="text-[9px] text-stone-300">
                        {isHot ? <span className="text-rose-400">"Warming up!"</span> : <span>"Pushing ore."</span>}
                      </div>
                    </div>
                  </div>
                  <div className="cart-rock-anim text-base">🛒 💎</div>
                </div>

                {/* MINER 1 (Deep Digging): Jackhammering with sparks/dust particles */}
                <div className="bg-stone-800/80 rounded-xl p-2 border border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="relative text-xl drill-active">
                      {isHot ? '🥵' : '👷‍♂️'}
                      {isHot && <span className="absolute -top-1 -right-1 text-xs sweat-drop-anim">💧</span>}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white">Miner 1 (Drill)</div>
                      <div className="text-[9px] text-stone-300">
                        {isHot ? <span className="text-rose-400">"Drill is hot!"</span> : <span>"Excavating rock."</span>}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center text-sm drill-active">
                    🔨 🪨
                    <span className="absolute -top-2 right-0 text-[9px] spark-particle-1 text-amber-300">✨</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Cave Track Floor */}
          <div className="mt-3 pt-1.5 border-t border-stone-700 flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>═ ═ STEEL RAILROAD TRACK ═ ═</span>
            <span className="text-amber-400 font-bold">Deep Underground (-180m)</span>
            <span>═ ═ STEEL RAILROAD TRACK ═ ═</span>
          </div>

          {/* Video Subtitle Banner at bottom of scene */}
          <div className="mt-3 bg-slate-950/90 rounded-xl p-3 border border-indigo-400/50 shadow-lg flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              {storyStepNumber}
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 block leading-none mb-0.5">
                Video Subtitles:
              </span>
              <p className="text-xs font-bold text-white leading-tight">
                "{currentSubtitle}"
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 4 Sleek Compact Sensor Guide Pills Below Scene */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'dht22' ? null : 'dht22')}
            className={`rounded-xl p-2 border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              selectedDeviceId === 'dht22' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <span className="text-lg shrink-0">🌡️</span>
            <div className="min-w-0">
              <div className="text-[11px] font-black text-slate-900 truncate">DHT22 Sensor</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">Cave air temp & humidity</div>
            </div>
          </div>

          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'ir-thermal' ? null : 'ir-thermal')}
            className={`rounded-xl p-2 border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              selectedDeviceId === 'ir-thermal' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <span className="text-lg shrink-0">🔥</span>
            <div className="min-w-0">
              <div className="text-[11px] font-black text-slate-900 truncate">IR Rock Sensor</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">Rock & drill surface heat</div>
            </div>
          </div>

          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'esp32' ? null : 'esp32')}
            className={`rounded-xl p-2 border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              selectedDeviceId === 'esp32' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'
            }`}
          >
            <span className="text-lg shrink-0">📡</span>
            <div className="min-w-0">
              <div className="text-[11px] font-black text-slate-900 truncate">ESP32 Gateway</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">Wireless LoRa messenger</div>
            </div>
          </div>

          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'smart-relay-fan' ? null : 'smart-relay-fan')}
            className={`rounded-xl p-2 border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              selectedDeviceId === 'smart-relay-fan' ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200' : 'bg-white border-slate-200 hover:border-teal-300'
            }`}
          >
            <span className="text-lg shrink-0">🌀</span>
            <div className="min-w-0">
              <div className="text-[11px] font-black text-slate-900 truncate">Smart Relay & Fan</div>
              <div className="text-[9px] text-slate-500 font-medium truncate">Automated cool airflow</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
