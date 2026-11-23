import React, { useMemo } from 'react';
import {
  Thermometer, Droplets, Wind, AlertTriangle, Activity, Zap,
  MapPin, Users, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import { useAppState } from '../../context/AppContext';
import { KPICard } from '../ui/KPICard';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

function getKPIStatus(value: number, warn: number, crit: number): 'safe' | 'warning' | 'critical' {
  if (value >= crit) return 'critical';
  if (value >= warn) return 'warning';
  return 'safe';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-mine-elevated border border-mine-border rounded p-2 text-xs shadow-lg">
      <div className="text-mine-subtext mb-1 font-mono">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }} className="flex gap-2 justify-between">
          <span>{p.name}:</span>
          <span className="font-mono font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function OverviewDashboard() {
  const { state, dispatch } = useAppState();
  const { kpi, zones, sensors, alerts, chartData, settings, simulation, predictions, fans, workers } = state;

  const tempHistory = useMemo(() =>
    sensors.filter(s => s.type === 'temperature').flatMap(s => s.history).slice(-10).map(h => h.value),
    [sensors]
  );
  const humidityHistory = useMemo(() =>
    sensors.filter(s => s.type === 'humidity').flatMap(s => s.history).slice(-10).map(h => h.value),
    [sensors]
  );
  const co2History = useMemo(() =>
    sensors.filter(s => s.type === 'co2').flatMap(s => s.history).slice(-10).map(h => h.value),
    [sensors]
  );

  const displayData = chartData.slice(-60);
  const unreadAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = unreadAlerts.filter(a => a.severity === 'critical');
  const mainFan = fans.find(f => f.type === 'main') || fans[0];
  const isFanRunning = mainFan?.status === 'on';

  // Zone getters
  const zoneA = zones.find(z => z.id === 'zone-a') || zones[0];
  const zoneB = zones.find(z => z.id === 'zone-b') || zones[1];
  const zoneC = zones.find(z => z.id === 'zone-c') || zones[2];
  const zoneD = zones.find(z => z.id === 'zone-d') || zones[3];
  const zoneE = zones.find(z => z.id === 'zone-e') || zones[4];

  // Helper colors
  const getZoneStroke = (lvl: string) => {
    switch (lvl) {
      case 'critical': return '#ef4444';
      case 'warning': return '#eab308';
      case 'high': return '#f97316';
      default: return '#22c55e';
    }
  };

  return (
    <div className="space-y-4">
      {/* Critical Thermal Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="p-3.5 rounded-lg border-2 border-mine-red bg-mine-red/15 flex items-center justify-between alert-blink">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-mine-red/25 border border-mine-red flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-mine-red" />
            </div>
            <div>
              <div className="text-sm font-bold text-mine-red uppercase tracking-wider flex items-center gap-2">
                <span>⚠ THERMAL HAZARD PREDICTED — IMMEDIATE ACTION REQUIRED</span>
                <span className="text-xs bg-mine-red text-white px-2 py-0.5 rounded font-mono">
                  {criticalAlerts.length} CRITICAL
                </span>
              </div>
              <div className="text-xs text-mine-text mt-0.5">
                {criticalAlerts[0].description} • Recommendation: {criticalAlerts[0].recommendedAction}
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_SECTION', payload: 'alerts' })}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-mine-red text-white hover:bg-red-600 transition-colors"
          >
            Manage Alerts →
          </button>
        </div>
      )}

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Avg Temperature"
          value={kpi.avgTemperature}
          unit="°C"
          safeRange={`<${settings.tempWarningThreshold}°C`}
          status={getKPIStatus(kpi.avgTemperature, settings.tempWarningThreshold, settings.tempCriticalThreshold)}
          icon={<Thermometer className="w-4 h-4" />}
          trend={tempHistory}
          lastUpdated={new Date()}
        />
        <KPICard
          title="Max Hotspot"
          value={kpi.maxTemperature}
          unit="°C"
          safeRange={`<${settings.tempCriticalThreshold}°C`}
          status={getKPIStatus(kpi.maxTemperature, settings.tempWarningThreshold, settings.tempCriticalThreshold)}
          icon={<Thermometer className="w-4 h-4" />}
          trend={tempHistory}
          lastUpdated={new Date()}
          subtitle={`Zone ${zones.find(z => z.temperature === kpi.maxTemperature)?.name ?? 'C'}`}
        />
        <KPICard
          title="Rel. Humidity"
          value={kpi.humidity}
          unit="%"
          safeRange={`<${settings.humidityThreshold}%`}
          status={kpi.humidity > settings.humidityThreshold ? 'warning' : 'safe'}
          icon={<Droplets className="w-4 h-4" />}
          trend={humidityHistory}
          lastUpdated={new Date()}
        />
        <KPICard
          title="CO₂ Concentration"
          value={kpi.co2}
          unit="ppm"
          safeRange={`<${settings.co2Threshold}ppm`}
          status={kpi.co2 > settings.co2Threshold * 1.3 ? 'critical' : kpi.co2 > settings.co2Threshold ? 'warning' : 'safe'}
          icon={<Activity className="w-4 h-4" />}
          trend={co2History}
          lastUpdated={new Date()}
        />
        <KPICard
          title="Ventilation Flow"
          value={kpi.ventilationStatus}
          status={kpi.ventilationStatus === 'Offline' ? 'critical' : kpi.ventilationStatus.startsWith('All') ? 'safe' : 'warning'}
          icon={<Wind className="w-4 h-4" />}
          lastUpdated={new Date()}
        />
        <KPICard
          title="Active Alerts"
          value={kpi.activeAlerts}
          status={kpi.activeAlerts === 0 ? 'safe' : kpi.activeAlerts <= 2 ? 'warning' : 'critical'}
          icon={<AlertTriangle className="w-4 h-4" />}
          lastUpdated={new Date()}
          subtitle={kpi.activeAlerts === 0 ? 'All Clear' : `${criticalAlerts.length} Critical`}
        />
      </div>

      {/* LARGE UNDERGROUND MINING TUNNEL VISUALIZATION */}
      <Panel
        title="Live Underground Mining Tunnel & Thermal Cross-Section"
        subtitle="Visual map of geological layers, vertical elevator shaft, continuous mining chambers & active ventilation flow"
        headerAction={
          <button
            onClick={() => dispatch({ type: 'SET_SECTION', payload: 'map' })}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-mine-cyan bg-mine-cyan/10 border border-mine-cyan/30 hover:bg-mine-cyan/20 transition-colors"
          >
            <span>Open Dedicated Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="relative bg-[#090b10] rounded-lg overflow-hidden border border-mine-border/80">
          <svg
            viewBox="0 0 1100 380"
            className="w-full h-auto select-none max-h-[380px]"
          >
            <defs>
              <linearGradient id="ovSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="ovSurface" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#3f2e1e" />
              </linearGradient>
              <linearGradient id="ovRock1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c2219" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
              <linearGradient id="ovRock2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
              <marker id="ovAirArr" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#06b6d4" />
              </marker>
            </defs>

            {/* Surface sky & grass */}
            <rect x="0" y="0" width="1100" height="70" fill="url(#ovSky)" />
            <path d="M 0 70 Q 300 50, 600 65 T 1100 60 L 1100 75 L 0 75 Z" fill="url(#ovSurface)" />

            {/* Surface buildings & truck */}
            <rect x="330" y="30" width="90" height="40" fill="#334155" stroke="#475569" strokeWidth="1.5" rx="2" />
            <text x="375" y="55" fontSize="7" fill="#cbd5e1" textAnchor="middle" fontWeight="bold">OPS CENTER</text>
            <rect x="940" y="15" width="35" height="55" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <text x="957" y="45" fontSize="6" fill="#38bdf8" textAnchor="middle" fontWeight="bold">EXHAUST</text>

            {/* Elevator Headframe */}
            <polygon points="120,70 140,15 160,70" stroke="#64748b" strokeWidth="2" fill="none" />
            <circle cx="140" cy="15" r="10" fill="#0f172a" stroke="#f97316" strokeWidth="2" />
            <text x="140" y="8" fontSize="7" fill="#f97316" textAnchor="middle" fontWeight="bold">SHAFT HOIST</text>

            {/* Ground line */}
            <line x1="0" y1="70" x2="1100" y2="70" stroke="#451a03" strokeWidth="2" />

            {/* Rock Layers */}
            <rect x="0" y="70" width="1100" height="150" fill="url(#ovRock1)" />
            <text x="15" y="88" fontSize="8" fill="#78716c" fontFamily="monospace">UPPER BEDROCK (-150m)</text>

            <rect x="0" y="220" width="1100" height="160" fill="url(#ovRock2)" />
            <text x="15" y="238" fontSize="8" fill="#52525b" fontFamily="monospace">DEEP SEAM (-450m)</text>

            {/* Vertical Elevator Shaft (Left) */}
            <rect x="120" y="70" width="40" height="300" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="140" y1="70" x2="140" y2="360" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 4" className="flow-anim" />

            {/* Vertical Exhaust Shaft (Right) */}
            <rect x="940" y="70" width="35" height="300" fill="#0f141c" stroke="#334155" strokeWidth="1.5" />
            <line x1="957" y1="360" x2="957" y2="70" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" className="flow-anim" />

            {/* Level 1 Drift Tunnel */}
            <rect x="160" y="115" width="780" height="80" fill="#0d1117" stroke="#27272a" strokeWidth="1.5" rx="3" />
            {/* Level 2 Deep Drift Tunnel */}
            <rect x="160" y="260" width="780" height="90" fill="#0d1117" stroke="#27272a" strokeWidth="1.5" rx="3" />

            {/* Airflow arrows */}
            {isFanRunning && (
              <g>
                <path d="M 160 155 L 420 155" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" className="flow-anim" markerEnd="url(#ovAirArr)" />
                <path d="M 420 155 L 680 155" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" className="flow-anim" markerEnd="url(#ovAirArr)" />
                <path d="M 680 195 L 680 260" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" className="flow-anim" markerEnd="url(#ovAirArr)" />
                <path d="M 380 305 L 440 305" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" className="flow-anim" markerEnd="url(#ovAirArr)" />
                <path d="M 690 305 L 750 305" stroke={zoneC.riskLevel === 'critical' ? '#f97316' : '#06b6d4'} strokeWidth="2.5" strokeDasharray="6 4" className="flow-anim" markerEnd="url(#ovAirArr)" />
                <path d="M 920 305 L 950 305 L 950 80" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" className="flow-anim" markerEnd="url(#ovAirArr)" />
              </g>
            )}

            {/* ---------------- ZONE A ---------------- */}
            <g
              onClick={() => { dispatch({ type: 'SELECT_ZONE', payload: 'zone-a' }); dispatch({ type: 'SET_SECTION', payload: 'map' }); }}
              className="cursor-pointer"
            >
              <rect x="175" y="125" width="220" height="60" fill="rgba(34, 197, 94, 0.15)" stroke={getZoneStroke(zoneA.riskLevel)} strokeWidth="1.5" rx="4" />
              <text x="185" y="142" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneA.riskLevel)} fontFamily="monospace">
                ZONE A – MAIN ENTRANCE
              </text>
              <text x="385" y="142" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneA.riskLevel)} textAnchor="end" fontFamily="monospace">
                {zoneA.temperature.toFixed(1)}°C
              </text>
              <text x="185" y="160" fontSize="8" fill="#94a3b8">Elevator Landing • {zoneA.workers} Miners 👷</text>
              <text x="185" y="174" fontSize="8" fill="#38bdf8" fontFamily="monospace">Air: {zoneA.airflow.toFixed(1)} m/s • CO₂: {zoneA.co2}ppm</text>
            </g>

            {/* ---------------- ZONE B ---------------- */}
            <g
              onClick={() => { dispatch({ type: 'SELECT_ZONE', payload: 'zone-b' }); dispatch({ type: 'SET_SECTION', payload: 'map' }); }}
              className="cursor-pointer"
            >
              <rect x="430" y="125" width="230" height="60" fill="rgba(234, 179, 8, 0.15)" stroke={getZoneStroke(zoneB.riskLevel)} strokeWidth="1.5" rx="4" />
              <text x="440" y="142" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneB.riskLevel)} fontFamily="monospace">
                ZONE B – EXCAVATION AREA
              </text>
              <text x="650" y="142" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneB.riskLevel)} textAnchor="end" fontFamily="monospace">
                {zoneB.temperature.toFixed(1)}°C
              </text>
              <text x="440" y="160" fontSize="8" fill="#94a3b8">Continuous Miner Face • {zoneB.workers} Miners 👷</text>
              <text x="440" y="174" fontSize="8" fill="#38bdf8" fontFamily="monospace">Air: {zoneB.airflow.toFixed(1)} m/s • CO₂: {zoneB.co2}ppm</text>
            </g>

            {/* ---------------- ZONE D ---------------- */}
            <g
              onClick={() => { dispatch({ type: 'SELECT_ZONE', payload: 'zone-d' }); dispatch({ type: 'SET_SECTION', payload: 'map' }); }}
              className="cursor-pointer"
            >
              <rect x="175" y="275" width="220" height="65" fill="rgba(34, 197, 94, 0.15)" stroke={getZoneStroke(zoneD.riskLevel)} strokeWidth="1.5" rx="4" />
              <text x="185" y="292" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneD.riskLevel)} fontFamily="monospace">
                ZONE D – EQUIPMENT ROOM
              </text>
              <text x="385" y="292" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneD.riskLevel)} textAnchor="end" fontFamily="monospace">
                {zoneD.temperature.toFixed(1)}°C
              </text>
              <text x="185" y="310" fontSize="8" fill="#94a3b8">Substation & Pumps ⚡ • {zoneD.workers} Miners 👷</text>
              <text x="185" y="324" fontSize="8" fill="#38bdf8" fontFamily="monospace">Air: {zoneD.airflow.toFixed(1)} m/s • CO₂: {zoneD.co2}ppm</text>
            </g>

            {/* ---------------- ZONE C (DEEP HOTSPOT) ---------------- */}
            <g
              onClick={() => { dispatch({ type: 'SELECT_ZONE', payload: 'zone-c' }); dispatch({ type: 'SET_SECTION', payload: 'map' }); }}
              className="cursor-pointer"
            >
              <rect
                x="430" y="275" width="270" height="65"
                fill={zoneC.riskLevel === 'critical' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(249, 115, 22, 0.2)'}
                stroke={getZoneStroke(zoneC.riskLevel)}
                strokeWidth={zoneC.riskLevel === 'critical' ? 2.5 : 1.5}
                rx="4"
              />
              <text x="440" y="292" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneC.riskLevel)} fontFamily="monospace">
                ZONE C – DEEP MINING SECTION {zoneC.riskLevel === 'critical' ? '🔥 CRITICAL' : ''}
              </text>
              <text x="690" y="292" fontSize="11" fontWeight="bold" fill={getZoneStroke(zoneC.riskLevel)} textAnchor="end" fontFamily="monospace">
                {zoneC.temperature.toFixed(1)}°C
              </text>
              <text x="440" y="310" fontSize="8" fill="#94a3b8">Deep Seam Geothermal • {zoneC.workers} Miners 👷</text>
              <text x="440" y="324" fontSize="8" fill="#38bdf8" fontFamily="monospace">Air: {zoneC.airflow.toFixed(1)} m/s • CO₂: {zoneC.co2}ppm</text>
            </g>

            {/* ---------------- ZONE E ---------------- */}
            <g
              onClick={() => { dispatch({ type: 'SELECT_ZONE', payload: 'zone-e' }); dispatch({ type: 'SET_SECTION', payload: 'map' }); }}
              className="cursor-pointer"
            >
              <rect x="735" y="275" width="190" height="65" fill="rgba(6, 182, 212, 0.15)" stroke={getZoneStroke(zoneE.riskLevel)} strokeWidth="1.5" rx="4" />
              <text x="745" y="292" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneE.riskLevel)} fontFamily="monospace">
                ZONE E – VENTILATION
              </text>
              <text x="915" y="292" fontSize="10" fontWeight="bold" fill={getZoneStroke(zoneE.riskLevel)} textAnchor="end" fontFamily="monospace">
                {zoneE.temperature.toFixed(1)}°C
              </text>
              {/* Fan Spinner */}
              <circle cx="895" cy="318" r="14" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x="895" y="322" fontSize="12" textAnchor="middle" fill="#38bdf8" className={isFanRunning ? 'spin-fan' : ''}>⟳</text>
              <text x="745" y="310" fontSize="8" fill="#94a3b8">Main Fan Station: {mainFan.speed}% Speed</text>
              <text x="745" y="324" fontSize="8" fill="#38bdf8" fontFamily="monospace">{mainFan.airflowCFM.toLocaleString()} CFM</text>
            </g>
          </svg>
        </div>
      </Panel>

      {/* CHARTS & HEALTH ROW */}
      <div className="grid grid-cols-12 gap-4">
        {/* Real-time temperature trend */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Panel
            title="Live Temperature Stream & Predictive Envelope"
            subtitle="Real-time multi-zone sensor average with safety threshold limits"
            headerAction={
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-1 bg-mine-cyan rounded" />
                  <span className="text-mine-subtext">Actual Temp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-1 bg-mine-yellow rounded" />
                  <span className="text-mine-subtext">Warn ({settings.tempWarningThreshold}°C)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-1 bg-mine-red rounded" />
                  <span className="text-mine-subtext">Critical ({settings.tempCriticalThreshold}°C)</span>
                </div>
              </div>
            }
          >
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={settings.tempWarningThreshold} stroke="#eab308" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: 'Warn', position: 'right', fontSize: 9, fill: '#eab308' }} />
                  <ReferenceLine y={settings.tempCriticalThreshold} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: 'Crit', position: 'right', fontSize: 9, fill: '#ef4444' }} />
                  <Area type="monotone" dataKey="temperature" stroke="#06b6d4" strokeWidth={2.5} fill="url(#tempGrad)" dot={false} name="Temp (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Humidity and CO2 Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Panel title="Humidity Timeline" subtitle="Average relative humidity (%)">
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} domain={[40, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={settings.humidityThreshold} stroke="#eab308" strokeDasharray="3 2" strokeWidth={1} />
                    <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} fill="url(#humGrad)" dot={false} name="Humidity (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="CO₂ Concentration Trend" subtitle="NDIR Sensor Readings (ppm)">
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={settings.co2Threshold} stroke="#ef4444" strokeDasharray="3 2" strokeWidth={1} />
                    <Area type="monotone" dataKey="co2" stroke="#f59e0b" strokeWidth={2} fill="url(#co2Grad)" dot={false} name="CO₂ (ppm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>

        {/* Right Column: 30-Min Forecast + System Health */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Thermal Prediction Spotlight */}
          <Panel
            title="30-Min Predictive Outlook"
            subtitle="Automated trend extrapolation for key hotspot"
            headerAction={
              <button
                onClick={() => dispatch({ type: 'SET_SECTION', payload: 'thermal' })}
                className="text-[11px] text-mine-cyan hover:underline font-semibold"
              >
                Deep Forecast →
              </button>
            }
          >
            <div className="space-y-3">
              {predictions.slice(0, 3).map(pred => {
                const z = zones.find(item => item.id === pred.zoneId);
                const isWarn = pred.riskLevel === 'warning' || pred.riskLevel === 'critical';
                return (
                  <div
                    key={pred.zoneId}
                    className={`p-2.5 rounded-lg border ${
                      pred.riskLevel === 'critical' ? 'bg-mine-red/10 border-mine-red/30' :
                      pred.riskLevel === 'warning' ? 'bg-mine-yellow/10 border-mine-yellow/30' :
                      'bg-mine-surface border-mine-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{z?.name} – {z?.fullName}</span>
                      <StatusBadge level={pred.riskLevel} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-mine-subtext">Current: <strong className="font-mono text-white">{pred.currentTemp.toFixed(1)}°C</strong></span>
                      <span className="text-mine-subtext">In 30m: <strong className={`font-mono ${isWarn ? 'text-mine-red' : 'text-mine-cyan'}`}>{pred.predicted30min.toFixed(1)}°C</strong></span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-mine-muted mt-1">
                      <span>Rate: {(pred.rateOfIncrease * 60).toFixed(2)}°C/hr</span>
                      <span>Risk: {pred.riskScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* System Health */}
          <Panel title="SCADA System Health">
            <div className="space-y-2">
              {[
                { label: 'IoT Sensor Mesh', value: `${sensors.filter(s => s.status === 'online').length}/${sensors.length} Nodes Active`, good: true },
                { label: 'Ventilation Telemetry', value: kpi.ventilationStatus, good: isFanRunning },
                { label: 'Predictive Horizon', value: `${settings.predictionWindowMinutes} Minutes`, good: true },
                { label: 'Automated Fans', value: settings.autoVentilation ? 'Closed-Loop Auto' : 'Manual', good: settings.autoVentilation },
                { label: 'Active Miners', value: `${workers.length} Personnel Monitored`, good: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-mine-border last:border-0 text-xs">
                  <span className="text-mine-subtext">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.good ? 'bg-mine-green' : 'bg-mine-yellow'}`} />
                    <span className="font-mono text-mine-text font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
