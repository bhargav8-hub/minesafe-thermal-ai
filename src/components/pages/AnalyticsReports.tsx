import React, { useState, useMemo } from 'react';
import { Download, FileText, Activity, AlertTriangle, ShieldCheck, TrendingUp, Layers } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useAppState } from '../../context/AppContext';
import { Panel } from '../ui/Panel';
import { generateHistoricalData } from '../../data/initialData';

const ZONE_COLORS = ['#06b6d4', '#f97316', '#eab308', '#22c55e', '#a78bfa'];

export function AnalyticsReports() {
  const { state } = useAppState();
  const { chartData, zones, alerts, sensors, settings } = state;
  const [timeRange, setTimeRange] = useState<'live' | '24h' | '7d'>('live');

  const displayData = useMemo(() => {
    if (timeRange === 'live') return chartData.slice(-60);
    if (timeRange === '24h') return generateHistoricalData(24);
    return generateHistoricalData(168);
  }, [timeRange, chartData]);

  const alertsByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    alerts.forEach(a => {
      const clean = a.category.replace(/-/g, ' ');
      cats[clean] = (cats[clean] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  const zoneComparison = zones.map((z, i) => ({
    name: z.name,
    fullName: z.fullName,
    temperature: z.temperature,
    humidity: z.humidity,
    co2: z.co2,
    airflow: z.airflow,
    color: ZONE_COLORS[i % ZONE_COLORS.length],
  }));

  const riskDist = useMemo(() => {
    const counts = { safe: 0, warning: 0, high: 0, critical: 0 };
    zones.forEach(z => {
      counts[z.riskLevel] = (counts[z.riskLevel] || 0) + 1;
    });
    return [
      { name: 'Safe', value: counts.safe, color: '#22c55e' },
      { name: 'Warning', value: counts.warning, color: '#eab308' },
      { name: 'High Risk', value: counts.high, color: '#f97316' },
      { name: 'Critical', value: counts.critical, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [zones]);

  const exportCSV = () => {
    const rows = [['Timestamp', 'Avg Temperature (°C)', 'Humidity (%)', 'CO2 (ppm)', 'Airflow (m/s)']];
    displayData.forEach(d => {
      rows.push([d.time, String(d.temperature), String(d.humidity), String(d.co2), String(d.airflow)]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MineGuard_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-mine-panel p-3.5 rounded-lg border border-mine-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-mine-text tracking-wide uppercase">Historical Analytics & Compliance Reports</h2>
            <span className="text-[10px] bg-mine-cyan/10 text-mine-cyan border border-mine-cyan/30 px-2 py-0.5 rounded font-mono">
              SCADA-EXPORT READY
            </span>
          </div>
          <p className="text-[11px] text-mine-subtext mt-0.5">
            Statistical regression of mine thermal dynamics, air quality trends, and safety threshold compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter */}
          <div className="flex bg-mine-surface border border-mine-border rounded p-0.5">
            {(['live', '24h', '7d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  timeRange === r
                    ? 'bg-mine-orange text-white shadow-sm'
                    : 'text-mine-subtext hover:text-mine-text'
                }`}
              >
                {r === 'live' ? 'Live Stream' : r === '24h' ? '24 Hours' : '7 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface hover:bg-mine-elevated border border-mine-cyan/40 text-mine-cyan transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Temperature vs Humidity Multi-axis Line Chart */}
      <Panel
        title="Thermal & Humidity Timeline Regression"
        subtitle={`Displaying ${displayData.length} timeline points with interactive cursor inspection`}
      >
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={[30, 100]} />
              <Tooltip
                contentStyle={{ background: '#141822', border: '1px solid #1e2535', borderRadius: 4, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Temperature (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Humidity (%)" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Secondary Graphs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CO2 & Airflow */}
        <Panel title="CO₂ Concentration & Ventilation Airflow Correlation">
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="co2" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} />
                <YAxis yAxisId="flow" orientation="right" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} domain={[0, 8]} />
                <Tooltip contentStyle={{ background: '#141822', border: '1px solid #1e2535', borderRadius: 4, fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                <Line yAxisId="co2" type="monotone" dataKey="co2" stroke="#eab308" strokeWidth={1.8} dot={false} name="CO₂ (ppm)" />
                <Line yAxisId="flow" type="monotone" dataKey="airflow" stroke="#06b6d4" strokeWidth={1.8} dot={false} name="Airflow (m/s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Zone Temperature Comparison */}
        <Panel title="Zone-by-Zone Current Temperature Delta">
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneComparison} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}°C`, 'Temperature']}
                  contentStyle={{ background: '#141822', border: '1px solid #1e2535', borderRadius: 4, fontSize: 11 }}
                />
                <Bar dataKey="temperature" radius={[4, 4, 0, 0]}>
                  {zoneComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Tertiary Grid: Risk Breakdown & Alert Frequency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <Panel title="Mine Hazard Classification Distribution">
          <div style={{ height: 160 }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDist.length > 0 ? riskDist : [{ name: 'Safe', value: 5, color: '#22c55e' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(riskDist.length > 0 ? riskDist : [{ name: 'Safe', value: 5, color: '#22c55e' }]).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141822', border: '1px solid #1e2535', borderRadius: 4, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Historical Alert Frequency */}
        <Panel title="Historical Alert Frequency by Type">
          <div style={{ height: 160 }}>
            {alertsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertsByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8' }} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: '#141822', border: '1px solid #1e2535', borderRadius: 4, fontSize: 10 }} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} name="Trigger Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-mine-subtext text-xs">
                <ShieldCheck className="w-6 h-6 text-mine-green mb-1.5 opacity-80" />
                <span>Zero alert trigger anomalies registered</span>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Safety Summary Sheet */}
      <Panel title="System-Generated Mine Thermal Safety Summary Sheet">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-2 p-3 bg-mine-surface rounded border border-mine-border">
            <div className="text-[10px] font-bold text-mine-cyan uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Thermal Index Status
            </div>
            <div className="flex justify-between py-1 border-b border-mine-border/50">
              <span className="text-mine-subtext">Mean Mine Temperature:</span>
              <span className="font-mono text-mine-text font-semibold">{state.kpi.avgTemperature}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-mine-border/50">
              <span className="text-mine-subtext">Peak Hotspot:</span>
              <span className="font-mono text-mine-orange font-semibold">{state.kpi.maxTemperature}°C</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-mine-subtext">Configured Safe Limit:</span>
              <span className="font-mono text-mine-green font-semibold">&lt; {settings.tempWarningThreshold}°C</span>
            </div>
          </div>

          <div className="space-y-2 p-3 bg-mine-surface rounded border border-mine-border">
            <div className="text-[10px] font-bold text-mine-amber uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Atmospheric & Gas Status
            </div>
            <div className="flex justify-between py-1 border-b border-mine-border/50">
              <span className="text-mine-subtext">Relative Humidity:</span>
              <span className="font-mono text-mine-text font-semibold">{state.kpi.humidity}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-mine-border/50">
              <span className="text-mine-subtext">CO₂ Concentration:</span>
              <span className="font-mono text-mine-text font-semibold">{state.kpi.co2} ppm</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-mine-subtext">CO₂ Safety Threshold:</span>
              <span className="font-mono text-mine-yellow font-semibold">&lt; {settings.co2Threshold} ppm</span>
            </div>
          </div>

          <div className="space-y-2 p-3 bg-mine-surface rounded border border-mine-border">
            <div className="text-[10px] font-bold text-mine-green uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Operations & Personnel
            </div>
            <div className="flex justify-between py-1 border-b border-mine-border/50">
              <span className="text-mine-subtext">Personnel Subterranean:</span>
              <span className="font-mono text-mine-text font-semibold">{state.workers.length} Miners</span>
            </div>
            <div className="flex justify-between py-1 border-b border-mine-border/50">
              <span className="text-mine-subtext">Ventilation Operational:</span>
              <span className="font-mono text-mine-cyan font-semibold">{state.kpi.ventilationStatus}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-mine-subtext">Active Critical Incidents:</span>
              <span className={`font-mono font-semibold ${alerts.filter(a => a.severity === 'critical' && !a.resolved).length > 0 ? 'text-mine-red' : 'text-mine-green'}`}>
                {alerts.filter(a => a.severity === 'critical' && !a.resolved).length} Critical
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
