import React, { useState } from 'react';
import { Cpu, Thermometer, Droplets, Wind, Activity, Zap, Wifi, WifiOff, Battery, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppState } from '../../context/AppContext';
import { Sensor } from '../../types';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

const SENSOR_TYPE_ICONS: Record<string, React.ElementType> = {
  temperature: Thermometer,
  humidity: Droplets,
  airflow: Wind,
  co2: Activity,
  gas: Zap,
  'heat-index': Thermometer,
};

const SENSOR_TYPE_COLORS: Record<string, string> = {
  temperature: '#f97316',
  humidity: '#3b82f6',
  airflow: '#06b6d4',
  co2: '#eab308',
  gas: '#a78bfa',
  'heat-index': '#ef4444',
};

function SensorCard({ sensor, onClick, selected }: { sensor: Sensor; onClick: () => void; selected: boolean }) {
  const Icon = SENSOR_TYPE_ICONS[sensor.type] || Cpu;
  const color = SENSOR_TYPE_COLORS[sensor.type] || '#94a3b8';
  const pct = ((sensor.value - sensor.minSafe) / (sensor.maxSafe - sensor.minSafe)) * 100;
  const clampedPct = Math.min(100, Math.max(0, pct));
  const isOutOfRange = sensor.value > sensor.maxSafe || sensor.value < sensor.minSafe;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded border transition-all ${
        selected
          ? 'border-mine-orange/50 bg-mine-orange/5'
          : isOutOfRange
          ? 'border-mine-yellow/30 bg-mine-yellow/5 hover:bg-mine-yellow/10'
          : 'border-mine-border bg-mine-panel hover:bg-mine-surface'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div>
            <div className="text-xs font-semibold text-mine-text leading-none">{sensor.name}</div>
            <div className="text-[9px] text-mine-subtext mt-0.5">{sensor.id} · {sensor.zoneName}</div>
          </div>
        </div>
        <StatusBadge level={sensor.status} />
      </div>

      <div className="flex items-end justify-between mb-2">
        <div className="font-mono text-xl font-bold" style={{ color }}>
          {sensor.value.toFixed(sensor.type === 'co2' || sensor.type === 'gas' ? 0 : 1)}
          <span className="text-sm font-normal text-mine-subtext ml-1">{sensor.unit}</span>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-mine-subtext">Safe: {sensor.minSafe}–{sensor.maxSafe}</div>
        </div>
      </div>

      {/* Range bar */}
      <div className="relative w-full h-1 bg-mine-border rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${clampedPct}%`, backgroundColor: isOutOfRange ? '#ef4444' : color }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <Battery className={`w-3 h-3 ${sensor.battery < 25 ? 'text-mine-red' : sensor.battery < 50 ? 'text-mine-yellow' : 'text-mine-green'}`} />
          <span className="text-[9px] text-mine-subtext">{sensor.battery}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-mine-muted" />
          <span className="text-[9px] text-mine-muted">{sensor.lastCommunication.toLocaleTimeString()}</span>
        </div>
      </div>
    </button>
  );
}

export function SensorMonitoring() {
  const { state, dispatch } = useAppState();
  const { sensors, simulation } = state;
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');

  const zones = [...new Set(sensors.map(s => s.zoneId))];
  const types = [...new Set(sensors.map(s => s.type))];

  const filtered = sensors.filter(s =>
    (filterType === 'all' || s.type === filterType) &&
    (filterZone === 'all' || s.zoneId === filterZone)
  );

  const online = sensors.filter(s => s.status === 'online').length;
  const warning = sensors.filter(s => s.status === 'warning').length;
  const offline = sensors.filter(s => s.status === 'offline').length;

  const selectedHistory = selectedSensor
    ? sensors.find(s => s.id === selectedSensor.id)?.history.slice(-30).map((h, i) => ({
        t: i,
        value: h.value,
      })) || []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-mine-text">Live Sensor Monitoring</h2>
          <p className="text-[11px] text-mine-subtext mt-0.5">SOFTWARE-SIMULATED IoT sensors — no physical hardware connected</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: simulation.running ? 'PAUSE_SIMULATION' : 'START_SIMULATION' })}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${simulation.running ? 'bg-mine-orange/10 text-mine-orange border-mine-orange/30' : 'bg-mine-green/10 text-mine-green border-mine-green/30'}`}
          >
            {simulation.running ? '⏸ Pause Simulation' : '▶ Start Simulation'}
          </button>
          <button
            onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
            className="px-3 py-1.5 rounded text-xs font-medium border border-mine-border text-mine-subtext hover:bg-mine-surface"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Connectivity summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Online', count: online, color: 'text-mine-green', bg: 'bg-mine-green/10', border: 'border-mine-green/30', icon: Wifi },
          { label: 'Warning', count: warning, color: 'text-mine-yellow', bg: 'bg-mine-yellow/10', border: 'border-mine-yellow/30', icon: Wifi },
          { label: 'Offline', count: offline, color: 'text-mine-muted', bg: 'bg-mine-muted/10', border: 'border-mine-muted/30', icon: WifiOff },
        ].map(item => (
          <div key={item.label} className={`flex items-center gap-3 p-3 rounded border ${item.bg} ${item.border}`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <div>
              <div className={`text-2xl font-mono font-bold ${item.color}`}>{item.count}</div>
              <div className="text-[10px] text-mine-subtext">{item.label} Sensors</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-mine-subtext">Type:</span>
          {['all', ...types].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${filterType === t ? 'bg-mine-surface border-mine-orange text-mine-orange' : 'border-mine-border text-mine-subtext hover:bg-mine-surface'}`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-mine-subtext">Zone:</span>
          {['all', ...zones].map(z => (
            <button key={z} onClick={() => setFilterZone(z)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${filterZone === z ? 'bg-mine-surface border-mine-cyan text-mine-cyan' : 'border-mine-border text-mine-subtext hover:bg-mine-surface'}`}>
              {z === 'all' ? 'All' : z.replace('zone-', 'Zone ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sensor grid */}
        <div className="col-span-12 lg:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(sensor => (
              <SensorCard
                key={sensor.id}
                sensor={sensors.find(s => s.id === sensor.id) || sensor}
                onClick={() => setSelectedSensor(s => s?.id === sensor.id ? null : sensor)}
                selected={selectedSensor?.id === sensor.id}
              />
            ))}
          </div>
        </div>

        {/* Detail + Chart */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {selectedSensor ? (
            <>
              <Panel title={`${selectedSensor.name} – Live History`} subtitle={`${selectedSensor.id} · ${selectedSensor.model}`}>
                <div className="text-center py-2">
                  <div className="font-mono text-3xl font-bold" style={{ color: SENSOR_TYPE_COLORS[selectedSensor.type] }}>
                    {(sensors.find(s => s.id === selectedSensor.id)?.value || selectedSensor.value).toFixed(selectedSensor.type === 'co2' ? 0 : 1)}
                    <span className="text-sm text-mine-subtext ml-1">{selectedSensor.unit}</span>
                  </div>
                  <StatusBadge level={selectedSensor.status} size="md" />
                </div>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                      <XAxis dataKey="t" hide />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), selectedSensor.unit]} contentStyle={{ background: '#1a2030', border: '1px solid #1e2535', fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" stroke={SENSOR_TYPE_COLORS[selectedSensor.type]} strokeWidth={2} dot={false} name={selectedSensor.unit} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[10px] text-mine-subtext text-center">
                  Showing last {selectedHistory.length} readings · Updates every {state.settings.updateIntervalSeconds}s
                </div>
              </Panel>
              <Panel title="Sensor Specifications">
                <div className="space-y-2">
                  {[
                    { label: 'Sensor ID', value: selectedSensor.id },
                    { label: 'Model', value: selectedSensor.model },
                    { label: 'Type', value: selectedSensor.type },
                    { label: 'Zone', value: selectedSensor.zoneName },
                    { label: 'Unit', value: selectedSensor.unit },
                    { label: 'Min Safe', value: `${selectedSensor.minSafe} ${selectedSensor.unit}` },
                    { label: 'Max Safe', value: `${selectedSensor.maxSafe} ${selectedSensor.unit}` },
                    { label: 'Battery', value: `${selectedSensor.battery}%` },
                    { label: 'Connectivity', value: selectedSensor.status },
                    { label: 'Last Comm', value: selectedSensor.lastCommunication.toLocaleTimeString() },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-1 border-b border-mine-border last:border-0">
                      <span className="text-[10px] text-mine-subtext">{item.label}</span>
                      <span className="text-[10px] font-mono text-mine-text">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          ) : (
            <Panel title="Sensor Detail">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Cpu className="w-8 h-8 text-mine-subtext mb-3" />
                <div className="text-sm text-mine-subtext">Select a sensor to view live readings and historical data</div>
                <div className="text-[10px] text-mine-muted mt-2">All sensors update every {state.settings.updateIntervalSeconds} seconds</div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
