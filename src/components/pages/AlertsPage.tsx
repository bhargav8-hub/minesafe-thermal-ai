import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, Filter, X } from 'lucide-react';
import { useAppState } from '../../context/AppContext';
import { Alert, AlertCategory } from '../../types';
import { Panel } from '../ui/Panel';

const CATEGORY_LABELS: Record<AlertCategory, string> = {
  'high-temperature': 'High Temperature',
  'rapid-temperature-increase': 'Rapid Temp Increase',
  'high-humidity': 'High Humidity',
  'poor-air-quality': 'Poor Air Quality',
  'high-co2': 'High CO₂',
  'low-airflow': 'Low Airflow',
  'sensor-disconnected': 'Sensor Disconnected',
  'thermal-hazard-prediction': 'Thermal Hazard Prediction',
  'ventilation-failure': 'Ventilation Failure',
  'evacuation': 'Evacuation Required',
};

function AlertRow({ alert, onAck, onResolve }: { alert: Alert; onAck: () => void; onResolve: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const severityColor = alert.severity === 'critical'
    ? 'border-mine-red/30 bg-mine-red/5'
    : alert.severity === 'warning'
    ? 'border-mine-yellow/30 bg-mine-yellow/5'
    : 'border-mine-border bg-mine-panel';

  const textColor = alert.severity === 'critical' ? 'text-mine-red' : alert.severity === 'warning' ? 'text-mine-yellow' : 'text-mine-subtext';

  return (
    <div className={`rounded border ${severityColor} ${alert.resolved ? 'opacity-50' : ''} transition-opacity`}>
      <div className="flex items-start gap-3 p-3">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'critical' ? 'bg-mine-red animate-pulse' : alert.severity === 'warning' ? 'bg-mine-yellow' : 'bg-mine-subtext'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-mine-text">{alert.title}</span>
                <span className={`text-[9px] font-bold uppercase ${textColor} border ${alert.severity === 'critical' ? 'border-mine-red/30' : 'border-mine-yellow/30'} rounded px-1`}>
                  {alert.severity}
                </span>
                {alert.resolved && <span className="text-[9px] text-mine-green border border-mine-green/30 rounded px-1">RESOLVED</span>}
                {alert.acknowledged && !alert.resolved && <span className="text-[9px] text-mine-subtext border border-mine-border rounded px-1">ACK'd</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-mine-subtext">{alert.id}</span>
                <span className="text-mine-muted">·</span>
                <span className="text-[10px] text-mine-subtext">{alert.zoneName}</span>
                <span className="text-mine-muted">·</span>
                <span className="text-[10px] text-mine-subtext">{CATEGORY_LABELS[alert.category]}</span>
                <span className="text-mine-muted">·</span>
                <span className="text-[10px] text-mine-muted flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{alert.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setExpanded(e => !e)} className="text-[9px] text-mine-subtext hover:text-mine-text border border-mine-border rounded px-1.5 py-0.5">
                {expanded ? '▲' : '▼'}
              </button>
              {!alert.acknowledged && !alert.resolved && (
                <button onClick={onAck} className="text-[9px] text-mine-yellow hover:text-mine-text border border-mine-yellow/30 rounded px-1.5 py-0.5">Ack</button>
              )}
              {!alert.resolved && (
                <button onClick={onResolve} className="text-[9px] text-mine-green hover:text-mine-text border border-mine-green/30 rounded px-1.5 py-0.5">Resolve</button>
              )}
            </div>
          </div>
          {expanded && (
            <div className="mt-2 space-y-1.5 pl-0">
              <div className="text-[11px] text-mine-subtext">{alert.description}</div>
              <div className="p-2 rounded bg-mine-surface border border-mine-border">
                <div className="text-[9px] font-semibold text-mine-subtext uppercase mb-0.5">Recommended Action</div>
                <div className="text-[11px] text-mine-text">{alert.recommendedAction}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AlertsPage() {
  const { state, dispatch } = useAppState();
  const { alerts } = state;
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filtered = alerts.filter(a => {
    const matchStatus = filter === 'all' ? true :
      filter === 'active' ? (!a.acknowledged && !a.resolved) :
      filter === 'acknowledged' ? (a.acknowledged && !a.resolved) :
      a.resolved;
    const matchSev = severityFilter === 'all' || a.severity === severityFilter;
    return matchStatus && matchSev;
  });

  const critical = alerts.filter(a => a.severity === 'critical' && !a.resolved && !a.acknowledged).length;
  const warning = alerts.filter(a => a.severity === 'warning' && !a.resolved && !a.acknowledged).length;
  const resolved = alerts.filter(a => a.resolved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-mine-text">Alerts & Notifications</h2>
          <p className="text-[11px] text-mine-subtext mt-0.5">Auto-generated alerts from simulated sensor thresholds and predictions</p>
        </div>
        <button
          onClick={() => { alerts.filter(a => !a.resolved && !a.acknowledged).forEach(a => dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: a.id })); }}
          className="px-3 py-1.5 rounded text-xs font-medium border border-mine-border text-mine-subtext hover:bg-mine-surface"
        >
          Acknowledge All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Critical Active', count: critical, color: 'text-mine-red', border: 'border-mine-red/30', bg: 'bg-mine-red/5' },
          { label: 'Warnings Active', count: warning, color: 'text-mine-yellow', border: 'border-mine-yellow/30', bg: 'bg-mine-yellow/5' },
          { label: 'Total Active', count: critical + warning, color: 'text-mine-orange', border: 'border-mine-orange/30', bg: 'bg-mine-orange/5' },
          { label: 'Resolved', count: resolved, color: 'text-mine-green', border: 'border-mine-green/30', bg: 'bg-mine-green/5' },
        ].map(item => (
          <div key={item.label} className={`p-3 rounded border ${item.border} ${item.bg}`}>
            <div className={`font-mono text-2xl font-bold ${item.color}`}>{item.count}</div>
            <div className="text-[10px] text-mine-subtext">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-1">
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors capitalize ${filter === f ? 'border-mine-orange text-mine-orange bg-mine-orange/10' : 'border-mine-border text-mine-subtext hover:bg-mine-surface'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'critical', 'warning', 'info'] as const).map(f => (
            <button key={f} onClick={() => setSeverityFilter(f)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors capitalize ${severityFilter === f ? 'border-mine-cyan text-mine-cyan bg-mine-cyan/10' : 'border-mine-border text-mine-subtext hover:bg-mine-surface'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="w-8 h-8 text-mine-green mb-3" />
            <div className="text-sm text-mine-subtext">No alerts in this category</div>
            <div className="text-[10px] text-mine-muted mt-1">Start simulation to generate alerts from sensor thresholds</div>
          </div>
        ) : (
          filtered.map(alert => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onAck={() => dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alert.id })}
              onResolve={() => dispatch({ type: 'RESOLVE_ALERT', payload: alert.id })}
            />
          ))
        )}
      </div>
    </div>
  );
}
