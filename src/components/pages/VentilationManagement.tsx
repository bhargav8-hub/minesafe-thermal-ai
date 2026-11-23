import React from 'react';
import { Wind, Power, ChevronUp, ChevronDown, Zap, Settings2 } from 'lucide-react';
import { useAppState } from '../../context/AppContext';
import { Fan } from '../../types';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

function FanCard({ fan, zones, onUpdate }: { fan: Fan; zones: any[]; onUpdate: (id: string, changes: Partial<Fan>) => void }) {
  const zone = zones.find(z => z.id === fan.zoneId);
  const isOn = fan.status === 'on';

  return (
    <div className={`p-4 rounded border transition-all ${isOn ? 'border-mine-cyan/30 bg-mine-cyan/5' : 'border-mine-border bg-mine-panel'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${isOn ? 'bg-mine-cyan/20' : 'bg-mine-muted/10'}`}>
            <Wind className={`w-4 h-4 ${isOn ? 'text-mine-cyan' : 'text-mine-muted'}`} />
          </div>
          <div>
            <div className="text-xs font-bold text-mine-text">{fan.name}</div>
            <div className="text-[9px] text-mine-subtext">{fan.id} · {fan.type === 'main' ? 'Main Fan' : 'Auxiliary'}</div>
          </div>
        </div>
        <StatusBadge level={isOn ? 'online' : 'offline'} label={isOn ? 'Running' : 'Stopped'} />
      </div>

      {/* Zone */}
      {zone && (
        <div className="mb-3 p-2 rounded bg-mine-surface text-[10px] text-mine-subtext">
          Zone: <span className="text-mine-text font-medium">{zone.name} – {zone.fullName}</span>
          · Temp: <span className={`font-mono ${zone.temperature > 32 ? 'text-mine-red' : 'text-mine-cyan'}`}>{zone.temperature.toFixed(1)}°C</span>
        </div>
      )}

      {/* Speed display */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-mine-subtext">Fan Speed</span>
        <span className={`font-mono text-lg font-bold ${isOn ? 'text-mine-cyan' : 'text-mine-muted'}`}>{fan.speed}%</span>
      </div>
      <div className="w-full h-2 bg-mine-border rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isOn ? 'bg-mine-cyan' : 'bg-mine-muted'}`}
          style={{ width: `${fan.speed}%` }}
        />
      </div>

      {/* Airflow */}
      <div className="flex justify-between text-[10px] text-mine-subtext mb-3">
        <span>Airflow: <span className="font-mono text-mine-text">{fan.airflowCFM.toLocaleString()} CFM</span></span>
        <span>Mode: <span className={`font-medium ${fan.mode === 'auto' ? 'text-mine-green' : 'text-mine-orange'}`}>{fan.mode.toUpperCase()}</span></span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => onUpdate(fan.id, { status: 'on', speed: Math.max(10, fan.speed) })}
          disabled={isOn}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium border transition-colors ${
            isOn ? 'border-mine-border text-mine-muted cursor-default' : 'border-mine-green/30 bg-mine-green/10 text-mine-green hover:bg-mine-green/20'
          }`}
        >
          <Power className="w-3 h-3" /> Turn ON
        </button>
        <button
          onClick={() => onUpdate(fan.id, { status: 'off', speed: 0, airflowCFM: 0 })}
          disabled={!isOn}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium border transition-colors ${
            !isOn ? 'border-mine-border text-mine-muted cursor-default' : 'border-mine-red/30 bg-mine-red/10 text-mine-red hover:bg-mine-red/20'
          }`}
        >
          <Power className="w-3 h-3" /> Turn OFF
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => {
            const newSpeed = Math.min(100, fan.speed + 10);
            onUpdate(fan.id, { speed: newSpeed, status: 'on', airflowCFM: Math.round(fan.airflowCFM * (newSpeed / Math.max(1, fan.speed))) });
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium border border-mine-cyan/30 bg-mine-cyan/10 text-mine-cyan hover:bg-mine-cyan/20"
        >
          <ChevronUp className="w-3 h-3" /> Increase
        </button>
        <button
          onClick={() => {
            const newSpeed = Math.max(0, fan.speed - 10);
            onUpdate(fan.id, { speed: newSpeed, status: newSpeed === 0 ? 'off' : 'on', airflowCFM: Math.round(fan.airflowCFM * (newSpeed / Math.max(1, fan.speed))) });
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium border border-mine-border text-mine-subtext hover:bg-mine-surface"
        >
          <ChevronDown className="w-3 h-3" /> Decrease
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onUpdate(fan.id, { mode: 'auto' })}
          className={`py-1.5 rounded text-xs font-medium border transition-colors ${fan.mode === 'auto' ? 'border-mine-green/30 bg-mine-green/10 text-mine-green' : 'border-mine-border text-mine-subtext hover:bg-mine-surface'}`}
        >
          <Zap className="w-3 h-3 inline mr-1" />Auto
        </button>
        <button
          onClick={() => onUpdate(fan.id, { mode: 'manual' })}
          className={`py-1.5 rounded text-xs font-medium border transition-colors ${fan.mode === 'manual' ? 'border-mine-orange/30 bg-mine-orange/10 text-mine-orange' : 'border-mine-border text-mine-subtext hover:bg-mine-surface'}`}
        >
          <Settings2 className="w-3 h-3 inline mr-1" />Manual
        </button>
      </div>
    </div>
  );
}

export function VentilationManagement() {
  const { state, dispatch } = useAppState();
  const { fans, zones, settings } = state;

  const handleFanUpdate = (id: string, changes: Partial<Fan>) => {
    dispatch({ type: 'UPDATE_FAN', payload: { id, changes } });
  };

  const activeFans = fans.filter(f => f.status === 'on');
  const totalAirflow = fans.reduce((a, f) => a + f.airflowCFM, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-mine-text">Ventilation Management</h2>
          <p className="text-[11px] text-mine-subtext mt-0.5">
            SIMULATED ventilation controls — not connected to physical fan hardware
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fans.forEach(f => dispatch({ type: 'UPDATE_FAN', payload: { id: f.id, changes: { status: 'on', speed: 100, airflowCFM: f.type === 'main' ? 15000 : 7000 } } }))}
            className="px-3 py-1.5 rounded text-xs font-medium border border-mine-green/30 bg-mine-green/10 text-mine-green hover:bg-mine-green/20"
          >
            Emergency Max Ventilation
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Fans', value: `${activeFans.length}/${fans.length}`, color: 'text-mine-cyan' },
          { label: 'Total Airflow', value: `${totalAirflow.toLocaleString()} CFM`, color: 'text-mine-blue' },
          { label: 'Auto Mode', value: `${fans.filter(f => f.mode === 'auto').length} fans`, color: 'text-mine-green' },
          { label: 'Auto Ventilation', value: settings.autoVentilation ? 'Enabled' : 'Disabled', color: settings.autoVentilation ? 'text-mine-green' : 'text-mine-muted' },
        ].map(item => (
          <div key={item.label} className="p-3 rounded border border-mine-border bg-mine-panel">
            <div className="text-[10px] text-mine-subtext">{item.label}</div>
            <div className={`font-mono text-sm font-bold mt-1 ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Fan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fans.map(fan => (
          <FanCard key={fan.id} fan={fan} zones={zones} onUpdate={handleFanUpdate} />
        ))}
      </div>

      {/* Airflow diagram */}
      <Panel title="Mine Airflow Circulation Diagram" subtitle="Simulated air movement through mining zones">
        <div className="relative overflow-hidden rounded" style={{ background: '#080a0e', height: 200 }}>
          <svg viewBox="0 0 760 200" className="w-full h-full">
            {/* Zones as blocks */}
            {[
              { x: 20, y: 60, w: 100, h: 80, label: 'Zone A', temp: zones.find(z => z.id === 'zone-a')?.temperature || 24.5 },
              { x: 160, y: 40, w: 110, h: 80, label: 'Zone B', temp: zones.find(z => z.id === 'zone-b')?.temperature || 27.8 },
              { x: 320, y: 20, w: 110, h: 80, label: 'Zone C', temp: zones.find(z => z.id === 'zone-c')?.temperature || 31.2 },
              { x: 160, y: 140, w: 110, h: 50, label: 'Zone D', temp: zones.find(z => z.id === 'zone-d')?.temperature || 26.1 },
              { x: 480, y: 60, w: 110, h: 80, label: 'Zone E', temp: zones.find(z => z.id === 'zone-e')?.temperature || 22.8 },
            ].map(zn => {
              const color = zn.temp >= 38 ? '#ef4444' : zn.temp >= 32 ? '#eab308' : zn.temp >= 29 ? '#f97316' : '#22c55e';
              return (
                <g key={zn.label}>
                  <rect x={zn.x} y={zn.y} width={zn.w} height={zn.h} fill={color} fillOpacity="0.1" stroke={color} strokeOpacity="0.4" strokeWidth="1" rx="3" />
                  <text x={zn.x + 6} y={zn.y + 16} fontSize="9" fill={color} fontFamily="monospace">{zn.label}</text>
                  <text x={zn.x + 6} y={zn.y + 30} fontSize="11" fontWeight="bold" fill={color} fontFamily="monospace">{zn.temp.toFixed(1)}°C</text>
                </g>
              );
            })}

            {/* Airflow arrows */}
            {fans.filter(f => f.status === 'on').map((fan, i) => (
              <g key={fan.id}>
                <line x1={120 + i * 50} y1={100} x2={160 + i * 50} y2={100}
                  stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.6"
                  strokeDasharray="6 4" className="flow-anim"
                  markerEnd="url(#arr)" />
              </g>
            ))}

            <defs>
              <marker id="arr" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#06b6d4" fillOpacity="0.7" />
              </marker>
            </defs>

            {/* Fan symbols */}
            {fans.map((fan, i) => (
              <g key={fan.id}>
                <circle cx={620 + i * 30} cy={80 + i * 20} r="12" fill={fan.status === 'on' ? '#06b6d4' : '#374151'} fillOpacity="0.3" stroke={fan.status === 'on' ? '#06b6d4' : '#374151'} strokeWidth="1" />
                <text x={620 + i * 30} y={84 + i * 20} fontSize="10" textAnchor="middle" fill={fan.status === 'on' ? '#06b6d4' : '#64748b'}>⟳</text>
                <text x={620 + i * 30} y={97 + i * 20} fontSize="7" textAnchor="middle" fill="#64748b" fontFamily="monospace">{fan.speed}%</text>
              </g>
            ))}

            <text x="10" y="195" fontSize="8" fill="#374151" fontFamily="monospace">
              ── Simulated airflow direction ── Total: {totalAirflow.toLocaleString()} CFM
            </text>
          </svg>
        </div>
      </Panel>
    </div>
  );
}
