import React, { useState } from 'react';
import { 
  DeviceId, 
  DeviceInfo, 
  MineZone 
} from './types';
import { 
  Thermometer, 
  Flame, 
  Wind, 
  Radio, 
  Fan, 
  CloudLightning, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  Info, 
  X,
  Eye,
  Layers,
  ArrowUp,
  Cpu
} from 'lucide-react';

interface InsideCaveHardwareMapProps {
  zoneB: MineZone;
  isSimulatingHeat: boolean;
  autoAiCooling: boolean;
  selectedDeviceId: DeviceId | null;
  onSelectDevice: (id: DeviceId | null) => void;
}

export const InsideCaveHardwareMap: React.FC<InsideCaveHardwareMapProps> = ({
  zoneB,
  isSimulatingHeat,
  autoAiCooling,
  selectedDeviceId,
  onSelectDevice,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | null>(null);

  // Live dynamic values based on simulation state
  const airTemp = zoneB.temp;
  const humidity = zoneB.humidity;
  
  // Rock temperature: in real mining, the rock face and drilling friction heat up FIRST before air does!
  // When heat spike happens, rock temp surges first (e.g. 42°C+), showing the predictive advantage of IR!
  const rockTemp = isSimulatingHeat 
    ? (autoAiCooling ? Math.min(39.5, airTemp + 4.2) : Math.min(46.0, airTemp + 7.8))
    : Number((airTemp + 1.8).toFixed(1));

  const fanSpeed = zoneB.fanSpeed;
  const isHighSpeed = fanSpeed === 100;
  const dataFlowClass = isSimulatingHeat ? 'data-flow-fast' : 'data-flow-line';

  // Device catalog with kid-friendly information
  const devices: Record<DeviceId, DeviceInfo> = {
    'dht22': {
      id: 'dht22',
      name: 'Air Temp & Humidity Sensor',
      hardwareModel: 'DHT22 Digital Probe',
      icon: '🌡️',
      locationLabel: 'Cave Ceiling & Wall (-180m)',
      simpleExplanation: 'Measures how hot and sweaty the cave air feels for the workers.',
      whyPlacedHere: 'Mounted at head-height on the tunnel wall right where miners work and breathe the air.',
      colorScheme: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        text: 'text-emerald-900',
        accent: '#10b981',
      },
    },
    'ir-thermal': {
      id: 'ir-thermal',
      name: 'Rock Heat Sensor',
      hardwareModel: 'Infrared (IR) Thermal Sensor',
      icon: '🔥',
      locationLabel: 'Pointed at Deep Digging Face',
      simpleExplanation: 'Spots hot machines and warm rocks early—before the whole tunnel heats up.',
      whyPlacedHere: 'Aimed directly at the excavation rock wall and drill bits. Rocks get hot before the air does!',
      colorScheme: {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-900',
        accent: '#f59e0b',
      },
    },
    'mq135': {
      id: 'mq135',
      name: 'Airflow & Gas Safety Sensor',
      hardwareModel: 'MQ-135 Gas & Air Velocity Sensor',
      icon: '💨',
      locationLabel: 'Tunnel Ventilation Center',
      simpleExplanation: 'Checks if fresh air is moving properly through the cave so miners have plenty of clean air.',
      whyPlacedHere: 'Installed in the middle of the tunnel airflow path to detect stagnant air pockets.',
      colorScheme: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-300',
        text: 'text-cyan-900',
        accent: '#06b6d4',
      },
    },
    'esp32': {
      id: 'esp32',
      name: 'Smart Gateway Box',
      hardwareModel: 'ESP32 Wi-Fi / LoRa Long-Range Microcontroller',
      icon: '📡',
      locationLabel: 'Tunnel Entrance Substation',
      simpleExplanation: "Acts like the cave's Wi-Fi messenger, sending sensor numbers up to the AI computer.",
      whyPlacedHere: 'Mounted near the shaft entrance to bridge wireless radio signals from deep underground to the surface.',
      colorScheme: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-300',
        text: 'text-indigo-900',
        accent: '#6366f1',
      },
    },
    'smart-relay-fan': {
      id: 'smart-relay-fan',
      name: 'Smart Fan Controller & Turbo Fan',
      hardwareModel: 'IoT Solid-State Relay & Industrial Duct Blower',
      icon: '🌀',
      locationLabel: 'Fresh Air Duct Vent',
      simpleExplanation: 'Acts like an automatic light switch that turns cooling fans up or down on its own.',
      whyPlacedHere: 'Connected to the fresh air intake duct to blast cold surface air into the cave when instructed by the AI.',
      colorScheme: {
        bg: 'bg-teal-50',
        border: 'border-teal-300',
        text: 'text-teal-900',
        accent: '#0d9488',
      },
    },
    'ai-hub': {
      id: 'ai-hub',
      name: 'AI Cloud & Control Hub',
      hardwareModel: 'Above-Ground Neural Predictive Server',
      icon: '🧠',
      locationLabel: 'Surface Control Center (Ground Level)',
      simpleExplanation: 'The super-smart brain that calculates temperature 10 minutes into the future.',
      whyPlacedHere: 'Located above ground with unlimited power and cloud connectivity to process predictive AI algorithms.',
      colorScheme: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-900',
        accent: '#8b5cf6',
      },
    },
  };

  const selectedDevice = selectedDeviceId ? devices[selectedDeviceId] : null;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md overflow-hidden flex flex-col mb-8">
      
      {/* 1. Header Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-xl shadow-inner">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Inside the Cave: Live IoT Hardware Map
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider animate-pulse">
                Live Interactive View
              </span>
            </div>
            <p className="text-xs text-indigo-200 font-medium">
              See exact sensor locations underground and watch glowing signals travel to the AI brain!
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            All 5 Cave Devices Connected & Transmitting
          </span>
        </div>
      </div>

      {/* 2. Step-by-Step "How IoT Works" Visual Breadcrumb Bar */}
      <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-700">
        <span className="text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          The 3-Step IoT Loop:
        </span>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Step 1 */}
          <button
            onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 1 
                ? 'bg-amber-500 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] flex items-center justify-center font-black">1</span>
            <span>Sense Heat (Sensors)</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />

          {/* Step 2 */}
          <button
            onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 2 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-900 text-[10px] flex items-center justify-center font-black">2</span>
            <span>Send Data (ESP32 ➔ Cloud)</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />

          {/* Step 3 */}
          <button
            onClick={() => setActiveStep(activeStep === 3 ? null : 3)}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 3 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 text-[10px] flex items-center justify-center font-black">3</span>
            <span>Predict & Cool (Relay ➔ Fan)</span>
          </button>
        </div>
      </div>

      {/* 3. The Main Visual 2D Cave Cutaway (Interactive Graphic) */}
      <div className="relative bg-gradient-to-b from-sky-100 via-stone-100 to-stone-200 p-4 sm:p-6 overflow-hidden select-none">
        
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
          {isSimulatingHeat && (
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-400 rounded-full blur-3xl animate-pulse"></div>
          )}
        </div>

        {/* ============================================================== */}
        {/* TOP LEVEL: ABOVE-GROUND SURFACE & AI CLOUD HUB */}
        {/* ============================================================== */}
        <div className="relative z-10 bg-gradient-to-r from-sky-200 via-sky-100 to-emerald-100 rounded-2xl p-4 border-2 border-emerald-300 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Surface Scenery */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-amber-300 shadow-md flex items-center justify-center text-xl">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  Ground Level (Surface: 0 Meters)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                  Fresh Air: 21°C
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Surface antenna tower receives underground LoRa/Wi-Fi radio packets.
              </p>
            </div>
          </div>

          {/* Above-Ground Device: IoT Cloud & AI Control Hub */}
          <div 
            onClick={() => onSelectDevice(selectedDeviceId === 'ai-hub' ? null : 'ai-hub')}
            className={`relative rounded-2xl p-3 sm:px-4 bg-white/95 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-3 ${
              selectedDeviceId === 'ai-hub' ? 'border-purple-500 ring-4 ring-purple-200 scale-105' : 'border-purple-200'
            }`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-2xl">
                🧠
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping"></div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
                  IoT Cloud & AI Control Hub
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  Surface
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                Predictive Model: <span className="text-purple-700 font-extrabold">Online (10m Ahead)</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Click to inspect AI logic ➔
              </div>
            </div>
          </div>
        </div>

        {/* Underground Shaft & Elevator Wire Graphic */}
        <div className="relative z-0 h-8 flex items-center justify-between px-16">
          <div className="w-1 h-full bg-slate-400 border-x border-slate-500 border-dashed"></div>
          {/* Animated Glowing Signal Traveling UP to Cloud */}
          <div className="flex items-center gap-2 bg-indigo-900/10 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-800 border border-indigo-200">
            <ArrowUp className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
            <span>Wireless Data Rising: Sensors ➔ ESP32 ➔ Surface AI Cloud</span>
          </div>
          <div className="w-1 h-full bg-slate-400 border-x border-slate-500 border-dashed"></div>
        </div>

        {/* ============================================================== */}
        {/* UNDERGROUND CAVE CROSS-SECTION */}
        {/* ============================================================== */}
        <div className={`relative z-10 rounded-3xl p-5 sm:p-6 border-3 transition-all duration-500 shadow-lg ${
          isSimulatingHeat
            ? 'bg-gradient-to-r from-amber-50 via-rose-50 to-amber-100/90 border-rose-300'
            : 'bg-gradient-to-r from-slate-100 via-stone-100 to-amber-50/70 border-amber-800/40'
        }`}>
          
          {/* Cave Ceiling Rocks & Timber Beams */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-stone-700 rounded-t-2xl flex items-center justify-around opacity-60">
            <div className="w-8 h-4 bg-amber-900/80 rounded-b"></div>
            <div className="w-8 h-4 bg-amber-900/80 rounded-b"></div>
            <div className="w-8 h-4 bg-amber-900/80 rounded-b"></div>
            <div className="w-8 h-4 bg-amber-900/80 rounded-b"></div>
          </div>

          {/* Depth Marker Badge */}
          <div className="flex items-center justify-between mb-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-stone-800 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
                ⛏️ Deep Cave Chamber (-180 Meters)
              </span>
              <span className="text-xs text-slate-600 font-semibold hidden md:inline">
                Natural Rock Tunnel with 5 Visual IoT Devices
              </span>
            </div>

            {/* Click any sensor hint */}
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              Click any device to learn what it does
            </span>
          </div>

          {/* ============================================================== */}
          {/* CAVE INTERIOR: 3 ZONES WITH HARDWARE PLACED PHYSICALLY */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            
            {/* ------------------------------------------------------------ */}
            {/* LEFT SECTION (Entrance & Air Vent): ESP32 + Relay & Fan */}
            {/* ------------------------------------------------------------ */}
            <div className="md:col-span-4 bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  1. Tunnel Entrance & Vent Shaft
                </span>

                {/* DEVICE 4: ESP32 Smart Gateway Box */}
                <div
                  onClick={() => onSelectDevice(selectedDeviceId === 'esp32' ? null : 'esp32')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer mb-3 shadow-2xs hover:shadow-sm ${
                    selectedDeviceId === 'esp32' 
                      ? 'bg-indigo-50 border-indigo-500 ring-3 ring-indigo-200' 
                      : 'bg-white border-indigo-200 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-base">
                        📡
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          ESP32 Smart Gateway
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Microcontroller Hub
                        </div>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <div className="text-[11px] text-indigo-900 font-bold bg-indigo-100/60 px-2 py-0.5 rounded">
                    Wi-Fi/LoRa: Transmitting to Cloud ⬆️
                  </div>
                </div>

                {/* DEVICE 5: Smart Relay & Industrial Cooling Fan */}
                <div
                  onClick={() => onSelectDevice(selectedDeviceId === 'smart-relay-fan' ? null : 'smart-relay-fan')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                    selectedDeviceId === 'smart-relay-fan' 
                      ? 'bg-teal-50 border-teal-500 ring-3 ring-teal-200' 
                      : 'bg-white border-teal-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center ${
                        fanSpeed === 100 ? 'spin-fast' : fanSpeed === 0 ? '' : 'spin-slow'
                      }`}>
                        <Fan className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          Smart Relay & Cooling Fan
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Speed: <strong className="text-teal-700">{fanSpeed}% Power</strong>
                        </div>
                      </div>
                    </div>
                    {fanSpeed === 100 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-600 text-white animate-pulse">
                        BOOST
                      </span>
                    )}
                  </div>

                  {/* Fan blowing cold air waves into tunnel */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-1 rounded">
                    <Wind className="w-3.5 h-3.5 text-teal-600 animate-bounce" />
                    <span>{fanSpeed === 100 ? 'Blowing Turbo Cold Air! 💨' : 'Eco Breeze Flowing 🍃'}</span>
                  </div>
                </div>
              </div>

              {/* Entrance Graphic */}
              <div className="bg-stone-100 rounded-xl p-2.5 text-center text-xs text-stone-600 font-bold border border-stone-200">
                🚪 Cave Entrance Support Arch
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* MIDDLE SECTION (Main Tunnel Airway): DHT22 + MQ-135 */}
            {/* ------------------------------------------------------------ */}
            <div className="md:col-span-4 bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  2. Tunnel Center (Airway & Ceiling)
                </span>

                {/* DEVICE 1: DHT22 Temp & Humidity Sensor */}
                <div
                  onClick={() => onSelectDevice(selectedDeviceId === 'dht22' ? null : 'dht22')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer mb-3 shadow-2xs hover:shadow-sm ${
                    selectedDeviceId === 'dht22' 
                      ? 'bg-emerald-50 border-emerald-500 ring-3 ring-emerald-200' 
                      : 'bg-white border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
                        🌡️
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          DHT22 Sensor (Air Heat)
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Wall / Ceiling Mount
                        </div>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-100/70 px-2.5 py-1 rounded">
                    <span className="text-xs font-black text-emerald-950">
                      Air: {airTemp.toFixed(1)}°C
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800">
                      {humidity}% RH
                    </span>
                  </div>
                </div>

                {/* DEVICE 3: MQ-135 Airflow & Gas Safety Sensor */}
                <div
                  onClick={() => onSelectDevice(selectedDeviceId === 'mq135' ? null : 'mq135')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                    selectedDeviceId === 'mq135' 
                      ? 'bg-cyan-50 border-cyan-500 ring-3 ring-cyan-200' 
                      : 'bg-white border-cyan-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-base">
                        💨
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          MQ-135 Airflow & Gas
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Air Movement Probe
                        </div>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                  </div>
                  <div className="text-[11px] text-cyan-950 font-bold bg-cyan-100/70 px-2 py-0.5 rounded">
                    Air Velocity: {fanSpeed > 50 ? '3.8 m/s (Fast Flow)' : '1.2 m/s (Normal)'}
                  </div>
                </div>
              </div>

              {/* Tunnel Floor Scene */}
              <div className="bg-amber-100/70 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold text-amber-900 border border-amber-200">
                <span>⛏️ Rails & Safety Line</span>
                <span>Worker Air Zone</span>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* RIGHT SECTION (Deep Digging Face): IR Rock Sensor & Miners */}
            {/* ------------------------------------------------------------ */}
            <div className={`md:col-span-4 rounded-2xl p-4 border-2 transition-all shadow-xs flex flex-col justify-between gap-4 ${
              isSimulatingHeat ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-200' : 'bg-white/90 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    3. Deep Rock Excavation Face
                  </span>
                  {isSimulatingHeat && (
                    <span className="px-2 py-0.2 rounded text-[10px] font-black bg-rose-600 text-white animate-pulse">
                      HOT ROCK SPIKE
                    </span>
                  )}
                </div>

                {/* DEVICE 2: Infrared (IR) Thermal Rock Sensor */}
                <div
                  onClick={() => onSelectDevice(selectedDeviceId === 'ir-thermal' ? null : 'ir-thermal')}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                    selectedDeviceId === 'ir-thermal' 
                      ? 'bg-amber-50 border-amber-500 ring-3 ring-amber-200' 
                      : 'bg-white border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-base">
                        🔥
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          IR Thermal Rock Sensor
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Non-Contact Optical Beam
                        </div>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${isSimulatingHeat ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`}></span>
                  </div>

                  <div className={`flex items-center justify-between px-2.5 py-1 rounded text-xs font-black ${
                    rockTemp >= 35 ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-950'
                  }`}>
                    <span>Rock Surface: {rockTemp.toFixed(1)}°C</span>
                    <span className="text-[10px] font-bold">
                      {isSimulatingHeat ? '▲ Heats up 1st!' : 'Normal'}
                    </span>
                  </div>

                  {/* Visual Laser/IR Optical Beam Cone aimed at the rock */}
                  <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-[10px] font-bold text-amber-800">
                    <span className="text-rose-500 font-black ir-beam-anim">🔴════►</span>
                    <span>Aiming IR Beam at Rock Face</span>
                  </div>
                </div>
              </div>

              {/* Cartoon Miners & Heavy Drill at Excavation Face */}
              <div className="bg-stone-200/80 rounded-xl p-2.5 border border-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {isSimulatingHeat && airTemp > 32 ? '🥵' : '👷‍♂️'}
                  </span>
                  <div className="text-[11px] font-bold text-stone-800 leading-tight">
                    {isSimulatingHeat && airTemp > 32 ? (
                      <span className="text-rose-700">"Rock drill friction generating heat!"</span>
                    ) : (
                      <span>"Digging tunnel safe & sound."</span>
                    )}
                  </div>
                </div>
                <div className="text-base">
                  🪨 🛒
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* SVG DATA PACKET WIRES (The Visual IoT Loops) */}
          {/* ============================================================== */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 bg-slate-900/5 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Live IoT Network Activity:</span>
            </div>

            {/* Visual Wire Indicators */}
            <div className="flex flex-wrap items-center gap-3 font-semibold text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                DHT22 ➔ ESP32 (Air Data)
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                IR Sensor ➔ ESP32 (Rock Heat)
              </span>
              <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                ESP32 ➔ AI Hub (Cloud Stream)
              </span>
              <span className="inline-flex items-center gap-1.5 text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                AI Hub ➔ Relay (Fan Boost Command)
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. CLICK-TO-INSPECT POP-UP / DETAIL CARD */}
      {/* ============================================================== */}
      {selectedDevice && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border-t-2 border-indigo-200 relative animate-fadeIn">
          <button
            onClick={() => onSelectDevice(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white text-slate-500 hover:text-slate-800 shadow-2xs cursor-pointer"
            title="Close inspection badge"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-indigo-200 flex items-center justify-center text-2xl shrink-0">
                {selectedDevice.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900">
                    {selectedDevice.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-indigo-800 border border-indigo-200">
                    Model: {selectedDevice.hardwareModel}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-900">
                    📍 {selectedDevice.locationLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                  "{selectedDevice.simpleExplanation}"
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  <strong>Why it's placed here:</strong> {selectedDevice.whyPlacedHere}
                </p>
              </div>
            </div>

            {/* Current Value Pill */}
            <div className="bg-white rounded-xl p-3 border border-indigo-200 shadow-2xs shrink-0 text-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Live Sensor Reading
              </span>
              <div className="text-lg font-black text-indigo-900">
                {selectedDevice.id === 'dht22' && `${airTemp.toFixed(1)}°C | ${humidity}% RH`}
                {selectedDevice.id === 'ir-thermal' && `${rockTemp.toFixed(1)}°C Surface Heat`}
                {selectedDevice.id === 'mq135' && `Fresh Air OK (Normal)`}
                {selectedDevice.id === 'esp32' && `98.4% Signal RSSI (Online)`}
                {selectedDevice.id === 'smart-relay-fan' && `${fanSpeed}% Power (${fanSpeed === 100 ? 'Turbo Boost' : 'Eco Mode'})`}
                {selectedDevice.id === 'ai-hub' && `10-Min Prediction: ${(airTemp + (isSimulatingHeat ? 4.5 : 0.2)).toFixed(1)}°C`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. "WHAT EACH SENSOR DOES" 4-CARD GRID (Kid-Friendly Explanations) */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200/90">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
              What Each IoT Part Does (Easy 1-Sentence Guide)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Click any card to highlight it on the map above
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: DHT22 */}
          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'dht22' ? null : 'dht22')}
            className={`rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
              selectedDeviceId === 'dht22'
                ? 'bg-emerald-50 border-emerald-500 ring-3 ring-emerald-200 scale-102'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">🌡️</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Temp & Humidity Sensor
                </h4>
                <span className="text-[10px] font-extrabold text-emerald-700">
                  Model: DHT22
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              "Measures how hot and sweaty the cave air feels for the workers."
            </p>
          </div>

          {/* Card 2: IR Thermal */}
          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'ir-thermal' ? null : 'ir-thermal')}
            className={`rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
              selectedDeviceId === 'ir-thermal'
                ? 'bg-amber-50 border-amber-500 ring-3 ring-amber-200 scale-102'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">🔥</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Rock Heat Sensor
                </h4>
                <span className="text-[10px] font-extrabold text-amber-700">
                  Model: IR Thermal Optical
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              "Spots hot machines and warm rocks early—before the whole tunnel heats up."
            </p>
          </div>

          {/* Card 3: ESP32 Smart Gateway */}
          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'esp32' ? null : 'esp32')}
            className={`rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
              selectedDeviceId === 'esp32'
                ? 'bg-indigo-50 border-indigo-500 ring-3 ring-indigo-200 scale-102'
                : 'bg-white border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">📡</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Smart Gateway
                </h4>
                <span className="text-[10px] font-extrabold text-indigo-700">
                  Model: ESP32 Wi-Fi/LoRa
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              "Acts like the cave's Wi-Fi messenger, sending sensor numbers up to the AI computer."
            </p>
          </div>

          {/* Card 4: Smart Fan Controller */}
          <div
            onClick={() => onSelectDevice(selectedDeviceId === 'smart-relay-fan' ? null : 'smart-relay-fan')}
            className={`rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
              selectedDeviceId === 'smart-relay-fan'
                ? 'bg-teal-50 border-teal-500 ring-3 ring-teal-200 scale-102'
                : 'bg-white border-slate-200 hover:border-teal-300'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">🌀</span>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Smart Fan Controller
                </h4>
                <span className="text-[10px] font-extrabold text-teal-700">
                  Model: IoT Relay & Blower
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              "Acts like an automatic light switch that turns cooling fans up or down on its own."
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
