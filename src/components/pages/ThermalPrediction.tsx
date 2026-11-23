import React, { useState } from 'react';
import { Flame, TrendingUp, AlertTriangle, Clock, Target, Shield } from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { useAppState } from '../../context/AppContext';
import { ThermalPrediction as ThermalPredictionType } from '../../types';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';

const RISK_CONFIG = {
  safe: { color: '#22c55e', bg: 'bg-mine-green/10', border: 'border-mine-green/30', label: 'SAFE' },
  warning: { color: '#eab308', bg: 'bg-mine-yellow/10', border: 'border-mine-yellow/30', label: 'WARNING' },
  high: { color: '#f97316', bg: 'bg-mine-orange/10', border: 'border-mine-orange/30', label: 'HIGH RISK' },
  critical: { color: '#ef4444', bg: 'bg-mine-red/10', border: 'border-mine-red/30', label: 'CRITICAL' },
};

function PredictionCard({ pred, zoneName, selected, onClick }: { pred: ThermalPredictionType; zoneName: string; selected: boolean; onClick: () => void }) {
  const cfg = RISK_CONFIG[pred.riskLevel];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded border transition-all ${selected ? 'border-mine-orange/50 bg-mine-orange/5' : `${cfg.border} ${cfg.bg} hover:opacity-80`}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-mine-text">{zoneName}</div>
        <StatusBadge level={pred.riskLevel} pulse={pred.riskLevel === 'critical'} />
      </div>
      <div className="font-mono text-xl font-bold" style={{ color: cfg.color }}>
        {pred.currentTemp.toFixed(1)}°C
      </div>
      <div className="text-[10px] text-mine-subtext mt-1">
        {pred.rateOfIncrease > 0.01
          ? `↑ ${(pred.rateOfIncrease * 60).toFixed(2)}°C/hr rising`
          : pred.rateOfIncrease < -0.01
          ? `↓ ${(Math.abs(pred.rateOfIncrease) * 60).toFixed(2)}°C/hr falling`
          : '→ Stable'}
      </div>
      <div className="flex gap-2 mt-2">
        {[
          { label: '5m', val: pred.predicted5min },
          { label: '15m', val: pred.predicted15min },
          { label: '30m', val: pred.predicted30min },
        ].map(p => (
          <div key={p.label} className="flex-1 text-center bg-mine-surface rounded p-1">
            <div className="font-mono text-xs font-bold" style={{ color: cfg.color }}>{p.val.toFixed(1)}°</div>
            <div className="text-[8px] text-mine-muted">{p.label}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <div className="text-[9px] text-mine-subtext">Risk Score</div>
        <div className="flex items-center gap-1">
          <div className="w-16 h-1 bg-mine-border rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pred.riskScore}%`, backgroundColor: cfg.color }} />
          </div>
          <span className="text-[9px] font-mono" style={{ color: cfg.color }}>{pred.riskScore}%</span>
        </div>
      </div>
    </button>
  );
}

function PredictionChart({ pred, settings }: { pred: ThermalPredictionType; settings: any }) {
  const chartData = pred.series.map(s => ({
    time: new Date(s.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    historical: s.type === 'historical' ? s.value : undefined,
    current: s.type === 'current' ? s.value : undefined,
    predicted: s.type === 'predicted' ? s.value : undefined,
  }));

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} interval={3} />
          <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ background: '#1a2030', border: '1px solid #1e2535', fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          <ReferenceLine y={settings.tempWarningThreshold} stroke="#eab308" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Warn ${settings.tempWarningThreshold}°C`, position: 'right', fontSize: 9, fill: '#eab308' }} />
          <ReferenceLine y={settings.tempCriticalThreshold} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Crit ${settings.tempCriticalThreshold}°C`, position: 'right', fontSize: 9, fill: '#ef4444' }} />
          <Area type="monotone" dataKey="historical" stroke="#06b6d4" strokeWidth={2} fill="url(#histGrad)" dot={false} name="Historical (°C)" connectNulls={false} />
          <Line type="monotone" dataKey="current" stroke="#ffffff" strokeWidth={3} dot={{ fill: '#ffffff', r: 5 }} name="Current (°C)" connectNulls={false} />
          <Area type="monotone" dataKey="predicted" stroke="#f97316" strokeWidth={2} fill="url(#predGrad)" strokeDasharray="5 3" dot={false} name="Predicted (°C)" connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ThermalPrediction() {
  const { state } = useAppState();
  const { predictions, zones, settings } = state;
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-c');

  const selectedPred = predictions.find(p => p.zoneId === selectedZoneId);
  const selectedZone = zones.find(z => z.id === selectedZoneId);

  const isCritical = selectedPred?.riskLevel === 'critical' || selectedPred?.riskLevel === 'warning';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-mine-text">Thermal Prediction Engine</h2>
          <p className="text-[11px] text-mine-subtext mt-0.5">
            Time-series trend analysis · Simulated prediction algorithm · Not an AI/ML model
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-mine-subtext">
          <div className="w-2 h-0.5 bg-mine-cyan rounded" /> Historical
          <div className="w-2 h-0.5 bg-mine-orange rounded" style={{ borderTop: '1px dashed' }} /> Predicted
          <div className="w-2 h-0.5 bg-mine-yellow rounded" style={{ borderTop: '1px dashed' }} /> Warn Threshold
        </div>
      </div>

      {/* Critical hazard banner */}
      {predictions.some(p => p.riskLevel === 'critical') && (
        <div className="p-3 rounded border border-mine-red/50 bg-mine-red/10 alert-blink">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-mine-red" />
            <span className="text-sm font-bold text-mine-red">⚠ THERMAL HAZARD PREDICTED</span>
          </div>
          {predictions.filter(p => p.riskLevel === 'critical').map(p => {
            const zone = zones.find(z => z.id === p.zoneId);
            return (
              <div key={p.zoneId} className="text-xs text-mine-subtext ml-6">
                <span className="text-mine-red font-medium">{zone?.fullName}</span>:
                Temperature {p.currentTemp.toFixed(1)}°C → Predicted {p.predicted30min.toFixed(1)}°C in 30 min.
                {p.estimatedTimeToCritical && ` Critical in ~${p.estimatedTimeToCritical}min.`}
                · <span className="text-mine-orange">Increase ventilation immediately.</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Zone prediction cards */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <div className="text-[11px] font-semibold text-mine-subtext uppercase tracking-wider">Zone Predictions</div>
          {predictions.map(pred => {
            const zone = zones.find(z => z.id === pred.zoneId);
            if (!zone) return null;
            return (
              <PredictionCard
                key={pred.zoneId}
                pred={pred}
                zoneName={`${zone.name} – ${zone.fullName}`}
                selected={selectedZoneId === pred.zoneId}
                onClick={() => setSelectedZoneId(pred.zoneId)}
              />
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {selectedPred && selectedZone ? (
            <>
              <Panel
                title={`Prediction Analysis – ${selectedZone.name}: ${selectedZone.fullName}`}
                subtitle="Trend-based extrapolation from recent sensor readings"
              >
                <PredictionChart pred={selectedPred} settings={settings} />
              </Panel>

              {/* Prediction metrics */}
              <div className="grid grid-cols-2 gap-3">
                <Panel title="Predicted Values">
                  <div className="space-y-2">
                    {[
                      { label: 'Current', value: `${selectedPred.currentTemp.toFixed(1)}°C`, color: 'text-mine-cyan' },
                      { label: 'In 5 minutes', value: `${selectedPred.predicted5min.toFixed(1)}°C`, color: 'text-mine-text' },
                      { label: 'In 15 minutes', value: `${selectedPred.predicted15min.toFixed(1)}°C`, color: 'text-mine-text' },
                      { label: 'In 30 minutes', value: `${selectedPred.predicted30min.toFixed(1)}°C`, color: selectedPred.predicted30min > settings.tempWarningThreshold ? 'text-mine-yellow' : 'text-mine-text' },
                      { label: 'In 60 minutes', value: `${selectedPred.predicted60min.toFixed(1)}°C`, color: selectedPred.predicted60min > settings.tempCriticalThreshold ? 'text-mine-red' : 'text-mine-text' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-1 border-b border-mine-border last:border-0">
                        <span className="text-[10px] text-mine-subtext">{item.label}</span>
                        <span className={`text-xs font-mono font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Risk Assessment">
                  <div className="space-y-3">
                    {/* Risk score gauge */}
                    <div className="text-center py-2">
                      <div className="relative w-20 h-20 mx-auto">
                        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e2535" strokeWidth="8" />
                          <circle
                            cx="40" cy="40" r="34" fill="none"
                            stroke={RISK_CONFIG[selectedPred.riskLevel].color}
                            strokeWidth="8"
                            strokeDasharray={`${selectedPred.riskScore * 2.136} ${213.6}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                          <div className="font-mono text-lg font-bold" style={{ color: RISK_CONFIG[selectedPred.riskLevel].color }}>
                            {selectedPred.riskScore}
                          </div>
                          <div className="text-[8px] text-mine-subtext">RISK</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Rise Rate', value: `${(selectedPred.rateOfIncrease * 60).toFixed(3)} °C/hr`, icon: TrendingUp },
                        { label: 'Time to Warning', value: selectedPred.estimatedTimeToWarning ? `~${selectedPred.estimatedTimeToWarning} min` : 'N/A', icon: Clock },
                        { label: 'Time to Critical', value: selectedPred.estimatedTimeToCritical ? `~${selectedPred.estimatedTimeToCritical} min` : 'N/A', icon: AlertTriangle },
                        { label: 'Confidence', value: `${selectedPred.confidence}%`, icon: Target },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center py-1 border-b border-mine-border last:border-0">
                          <div className="flex items-center gap-1.5 text-mine-subtext">
                            <item.icon className="w-3 h-3" />
                            <span className="text-[10px]">{item.label}</span>
                          </div>
                          <span className="text-xs font-mono text-mine-text">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Action recommendation */}
              {isCritical && (
                <div className={`p-3 rounded border ${RISK_CONFIG[selectedPred.riskLevel].border} ${RISK_CONFIG[selectedPred.riskLevel].bg}`}>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: RISK_CONFIG[selectedPred.riskLevel].color }} />
                    <div>
                      <div className="text-xs font-bold" style={{ color: RISK_CONFIG[selectedPred.riskLevel].color }}>
                        Recommended Action — {selectedZone.fullName}
                      </div>
                      <div className="text-[11px] text-mine-subtext mt-1 space-y-1">
                        {selectedPred.riskLevel === 'critical' ? (
                          <>
                            <p>• <strong>Immediate evacuation</strong> of {selectedZone.workers} workers in {selectedZone.name}</p>
                            <p>• Activate emergency ventilation at maximum capacity</p>
                            <p>• Contact mine safety officer — temperature at {selectedPred.currentTemp.toFixed(1)}°C (critical: {settings.tempCriticalThreshold}°C)</p>
                            <p>• Monitor CO₂ levels: currently {selectedZone.co2} ppm</p>
                          </>
                        ) : (
                          <>
                            <p>• Increase ventilation speed in {selectedZone.name}</p>
                            <p>• Reduce non-essential operations temporarily</p>
                            <p>• Monitor temperature trend — predicted to reach {selectedPred.predicted30min.toFixed(1)}°C in 30 min</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-mine-muted text-center">
                ℹ Prediction uses linear trend extrapolation from sensor history. Confidence indicator is an illustrative simulation metric.
              </div>
            </>
          ) : (
            <Panel title="Select a Zone">
              <div className="flex items-center justify-center py-16 text-mine-subtext">
                <Flame className="w-6 h-6 mr-2" />
                Select a zone card to view thermal prediction analysis
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
