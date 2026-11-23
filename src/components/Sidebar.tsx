import React from 'react';
import {
  LayoutDashboard, Map, Cpu, Flame, Wind, Bell, Users,
  BarChart3, Settings, ChevronLeft, ChevronRight, Layers, Shield
} from 'lucide-react';
import { useAppState } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Underground Mine Map', icon: Map },
  { id: 'sensors', label: 'Live Sensor Monitoring', icon: Cpu },
  { id: 'thermal', label: 'Thermal Prediction', icon: Flame },
  { id: 'ventilation', label: 'Ventilation Management', icon: Wind },
  { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
  { id: 'workers', label: 'Worker Safety', icon: Users },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'architecture', label: 'System Architecture', icon: Layers },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { state, dispatch } = useAppState();
  const activeAlerts = state.alerts.filter(a => !a.acknowledged && !a.resolved).length;

  return (
    <aside
      className="flex flex-col border-r border-mine-border bg-mine-panel transition-all duration-300 relative"
      style={{ width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-mine-border">
        <div className="flex-shrink-0 w-8 h-8 rounded bg-mine-orange flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-none">MineGuard</div>
            <div className="text-mine-subtext text-[10px] leading-none mt-0.5">IoT Monitor v2.1</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = state.activeSection === item.id;
          const hasAlert = item.id === 'alerts' && activeAlerts > 0;
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_SECTION', payload: item.id })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 relative group
                ${isActive
                  ? 'bg-mine-orange/10 text-mine-orange border-r-2 border-mine-orange'
                  : 'text-mine-subtext hover:bg-mine-surface hover:text-mine-text'
                }`}
            >
              <div className="relative flex-shrink-0">
                <Icon className="w-4 h-4" />
                {hasAlert && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-mine-red animate-pulse" />
                )}
              </div>
              {!collapsed && (
                <span className="text-xs font-medium truncate">{item.label}</span>
              )}
              {!collapsed && hasAlert && (
                <span className="ml-auto bg-mine-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeAlerts > 9 ? '9+' : activeAlerts}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-14 bg-mine-elevated border border-mine-border text-mine-text text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-full py-2 border-t border-mine-border text-mine-subtext hover:text-mine-text hover:bg-mine-surface transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Sim status */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-mine-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.simulation.running ? 'bg-mine-green animate-pulse' : 'bg-mine-muted'}`} />
            <span className="text-[10px] text-mine-subtext">
              {state.simulation.running ? 'Simulation Active' : 'Simulation Paused'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
