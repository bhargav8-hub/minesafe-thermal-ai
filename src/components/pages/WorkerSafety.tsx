import React from 'react';
import { Users, AlertTriangle, Shield, MapPin } from 'lucide-react';
import { useAppState } from '../../context/AppContext';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

export function WorkerSafety() {
  const { state } = useAppState();
  const { workers, zones } = state;

  const totalWorkers = workers.length;
  const safeWorkers = workers.filter(w => w.status === 'safe').length;
  const warningWorkers = workers.filter(w => w.status === 'warning').length;
  const criticalWorkers = workers.filter(w => w.status === 'critical').length;
  const criticalZones = zones.filter(z => z.riskLevel === 'critical');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-mine-text">Worker Safety Monitoring</h2>
          <p className="text-[11px] text-mine-subtext mt-0.5">
            SIMULATED worker tracking — no real GPS or wearable devices connected
          </p>
        </div>
      </div>

      {/* Critical evacuation banner */}
      {criticalZones.length > 0 && (
        <div className="p-3 rounded border border-mine-red/50 bg-mine-red/10 alert-blink">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-mine-red" />
            <span className="text-sm font-bold text-mine-red">⚠ EVACUATION RECOMMENDATION</span>
          </div>
          {criticalZones.map(zone => {
            const zoneWorkers = workers.filter(w => w.zoneId === zone.id);
            return (
              <div key={zone.id} className="ml-6 text-xs text-mine-subtext">
                <span className="text-mine-red font-medium">{zone.fullName}</span>:
                {' '}{zoneWorkers.length} worker{zoneWorkers.length !== 1 ? 's' : ''} in critical thermal zone.
                Temperature: <span className="font-mono text-mine-red">{zone.temperature.toFixed(1)}°C</span>.
                {' '}<span className="text-mine-orange font-medium">Initiate evacuation immediately.</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Underground', count: totalWorkers, color: 'text-mine-text', border: 'border-mine-border', bg: 'bg-mine-panel' },
          { label: 'In Safe Zones', count: safeWorkers, color: 'text-mine-green', border: 'border-mine-green/30', bg: 'bg-mine-green/5' },
          { label: 'In Warning Zones', count: warningWorkers, color: 'text-mine-yellow', border: 'border-mine-yellow/30', bg: 'bg-mine-yellow/5' },
          { label: 'In Critical Zones', count: criticalWorkers, color: 'text-mine-red', border: 'border-mine-red/30', bg: 'bg-mine-red/5' },
        ].map(item => (
          <div key={item.label} className={`p-3 rounded border ${item.border} ${item.bg}`}>
            <div className={`font-mono text-3xl font-bold ${item.color}`}>{item.count}</div>
            <div className="text-[10px] text-mine-subtext">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Zone breakdown */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {zones.map(zone => {
            const zoneWorkers = workers.filter(w => w.zoneId === zone.id);
            const cfg = {
              safe: { border: 'border-mine-green/20', bg: 'bg-mine-green/5', text: 'text-mine-green' },
              warning: { border: 'border-mine-yellow/20', bg: 'bg-mine-yellow/5', text: 'text-mine-yellow' },
              high: { border: 'border-mine-orange/20', bg: 'bg-mine-orange/5', text: 'text-mine-orange' },
              critical: { border: 'border-mine-red/30', bg: 'bg-mine-red/10', text: 'text-mine-red' },
            }[zone.riskLevel];
            return (
              <div key={zone.id} className={`p-3 rounded border ${cfg.border} ${cfg.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-bold text-mine-text">{zone.name} – {zone.fullName}</div>
                    <div className="text-[10px] text-mine-subtext">Temp: <span className={`font-mono ${cfg.text}`}>{zone.temperature.toFixed(1)}°C</span></div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-xl font-bold ${cfg.text}`}>{zoneWorkers.length}</div>
                    <StatusBadge level={zone.riskLevel} />
                  </div>
                </div>
                {zone.riskLevel === 'critical' && (
                  <div className="mt-1 p-1.5 rounded bg-mine-red/10 border border-mine-red/20 text-[10px] text-mine-red font-medium">
                    ⚠ EVACUATE — {zoneWorkers.length} worker{zoneWorkers.length !== 1 ? 's' : ''} at risk
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {zoneWorkers.map(w => (
                    <div key={w.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-mine-surface border border-mine-border text-[9px] text-mine-subtext">
                      <div className={`w-1.5 h-1.5 rounded-full ${w.status === 'critical' ? 'bg-mine-red' : w.status === 'warning' ? 'bg-mine-yellow' : 'bg-mine-green'}`} />
                      {w.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Worker list */}
        <div className="col-span-12 lg:col-span-7">
          <Panel title="Worker Registry" subtitle={`${totalWorkers} personnel underground — simulated tracking`}>
            <div className="space-y-1">
              {workers.map(worker => {
                const zone = zones.find(z => z.id === worker.zoneId);
                return (
                  <div key={worker.id} className={`flex items-center gap-3 px-2 py-2 rounded border transition-colors ${
                    worker.status === 'critical' ? 'border-mine-red/20 bg-mine-red/5' :
                    worker.status === 'warning' ? 'border-mine-yellow/20 bg-mine-yellow/5' :
                    'border-mine-border hover:bg-mine-surface'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      worker.status === 'critical' ? 'bg-mine-red/20 text-mine-red' :
                      worker.status === 'warning' ? 'bg-mine-yellow/20 text-mine-yellow' :
                      'bg-mine-green/20 text-mine-green'
                    }`}>
                      {worker.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-mine-text">{worker.name}</div>
                      <div className="text-[9px] text-mine-subtext flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {zone?.name} – {zone?.fullName}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge level={worker.status as any} label={worker.status.charAt(0).toUpperCase() + worker.status.slice(1)} />
                      {zone && <div className="text-[9px] text-mine-muted mt-0.5 font-mono">{zone.temperature.toFixed(1)}°C</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
