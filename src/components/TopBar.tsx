import React, { useState, useEffect } from 'react';
import { Bell, User, Radio, AlertTriangle } from 'lucide-react';
import { useAppState } from '../context/AppContext';

export function TopBar() {
  const { state, dispatch } = useAppState();
  const [time, setTime] = useState(new Date());
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unread = state.alerts.filter(a => !a.acknowledged && !a.resolved);
  const critical = unread.filter(a => a.severity === 'critical');

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-mine-border bg-mine-panel flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-sm font-semibold text-mine-text">DeepMine Operations</div>
          <div className="text-[10px] text-mine-subtext">Underground Mining Complex – Level 3 Facility</div>
        </div>
        <div className="h-6 w-px bg-mine-border" />
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-mine-surface border border-mine-border">
            <Radio className="w-3 h-3 text-mine-orange" />
            <span className="text-[10px] font-medium text-mine-orange">
              {state.simulation.running ? 'LIVE SIMULATION' : 'SIMULATION PAUSED'}
            </span>
          </div>
          <div className="text-[10px] text-mine-subtext px-2 py-0.5 rounded bg-mine-surface border border-mine-border">
            Scenario: <span className="text-mine-cyan capitalize">{state.simulation.scenario.replace(/-/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="text-right">
          <div className="font-mono text-sm text-mine-text">{time.toLocaleTimeString()}</div>
          <div className="text-[10px] text-mine-subtext">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>

        <div className="h-6 w-px bg-mine-border" />

        {/* Critical alert banner */}
        {critical.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-mine-red/10 border border-mine-red/30 alert-blink">
            <AlertTriangle className="w-3 h-3 text-mine-red" />
            <span className="text-[10px] font-bold text-mine-red">{critical.length} CRITICAL</span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(s => !s)}
            className="relative p-1.5 rounded hover:bg-mine-surface transition-colors"
          >
            <Bell className="w-4 h-4 text-mine-subtext" />
            {unread.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-mine-red text-white text-[8px] font-bold flex items-center justify-center">
                {unread.length > 9 ? '9+' : unread.length}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-mine-elevated border border-mine-border rounded shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 border-b border-mine-border flex items-center justify-between">
                <span className="text-xs font-semibold text-mine-text">Notifications</span>
                <span className="text-[10px] text-mine-subtext">{unread.length} unread</span>
              </div>
              {unread.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-mine-subtext">No active alerts</div>
              )}
              {unread.slice(0, 8).map(alert => (
                <div key={alert.id} className="px-3 py-2 border-b border-mine-border hover:bg-mine-surface transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'critical' ? 'bg-mine-red' : 'bg-mine-yellow'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-mine-text truncate">{alert.title}</div>
                      <div className="text-[10px] text-mine-subtext mt-0.5">{alert.zoneName} · {alert.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { dispatch({ type: 'SET_SECTION', payload: 'alerts' }); setShowNotifs(false); }}
                className="w-full py-2 text-center text-xs text-mine-cyan hover:text-mine-blue transition-colors"
              >
                View all alerts →
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-mine-surface transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded bg-mine-orange/20 border border-mine-orange/30 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-mine-orange" />
          </div>
          <div>
            <div className="text-xs font-medium text-mine-text">Mine Admin</div>
            <div className="text-[10px] text-mine-subtext">Supervisor</div>
          </div>
        </div>
      </div>
    </header>
  );
}
