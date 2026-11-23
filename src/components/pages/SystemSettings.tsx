import React from 'react';
import { Settings, Thermometer, Droplets, Activity, Wind, Bell, Save, RotateCcw } from 'lucide-react';
import { useAppState } from '../../context/AppContext';
import { DEFAULT_SETTINGS } from '../../data/initialData';
import { Panel } from '../ui/Panel';

function SettingRow({
  label, value, unit, min, max, step = 1, onChange, description
}: {
  label: string; value: number; unit: string; min: number; max: number; step?: number;
  onChange: (v: number) => void; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-mine-border last:border-0">
      <div className="flex-1 mr-4">
        <div className="text-xs font-medium text-mine-text">{label}</div>
        {description && <div className="text-[10px] text-mine-subtext mt-0.5">{description}</div>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-24 h-1 accent-orange-500 cursor-pointer"
        />
        <div className="flex items-center gap-1 w-20 justify-end">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-14 bg-mine-surface border border-mine-border rounded px-2 py-0.5 text-xs font-mono text-mine-text text-right outline-none focus:border-mine-orange"
          />
          <span className="text-[10px] text-mine-subtext">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange, description }: { label: string; value: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-mine-border last:border-0">
      <div className="flex-1 mr-4">
        <div className="text-xs font-medium text-mine-text">{label}</div>
        {description && <div className="text-[10px] text-mine-subtext mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-mine-green' : 'bg-mine-muted'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function SystemSettings() {
  const { state, dispatch } = useAppState();
  const { settings } = state;

  const update = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  };

  const reset = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: DEFAULT_SETTINGS });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-mine-text">System Settings</h2>
          <p className="text-[11px] text-mine-subtext mt-0.5">Configuration persisted in browser localStorage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-mine-border text-mine-subtext hover:bg-mine-surface">
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-mine-green/30 bg-mine-green/10 text-mine-green hover:bg-mine-green/20">
            <Save className="w-3 h-3" /> Settings Auto-Saved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature */}
        <Panel title="Temperature Thresholds" subtitle="Affects alert generation and risk classification">
          <div className="mb-2 p-2 rounded bg-mine-surface border border-mine-border text-[10px] text-mine-subtext">
            Changes take effect immediately and modify alert generation logic throughout the application.
          </div>
          <SettingRow
            label="Warning Threshold"
            value={settings.tempWarningThreshold}
            unit="°C"
            min={25} max={45} step={0.5}
            onChange={v => update('tempWarningThreshold', v)}
            description="Temperature at which a warning alert is generated"
          />
          <SettingRow
            label="Critical Threshold"
            value={settings.tempCriticalThreshold}
            unit="°C"
            min={30} max={55} step={0.5}
            onChange={v => update('tempCriticalThreshold', v)}
            description="Temperature at which a critical alert and evacuation recommendation are triggered"
          />
        </Panel>

        {/* Environment */}
        <Panel title="Environmental Thresholds">
          <SettingRow
            label="Humidity Alert Threshold"
            value={settings.humidityThreshold}
            unit="%"
            min={50} max={99} step={1}
            onChange={v => update('humidityThreshold', v)}
            description="Relative humidity level that triggers a high humidity alert"
          />
          <SettingRow
            label="CO₂ Alert Threshold"
            value={settings.co2Threshold}
            unit="ppm"
            min={800} max={5000} step={50}
            onChange={v => update('co2Threshold', v)}
            description="CO₂ concentration (ppm) that triggers an air quality alert"
          />
        </Panel>

        {/* Prediction */}
        <Panel title="Prediction Settings">
          <SettingRow
            label="Prediction Window"
            value={settings.predictionWindowMinutes}
            unit="min"
            min={5} max={120} step={5}
            onChange={v => update('predictionWindowMinutes', v)}
            description="How far ahead the thermal prediction algorithm projects"
          />
          <SettingRow
            label="Sensor Update Interval"
            value={settings.updateIntervalSeconds}
            unit="sec"
            min={1} max={10} step={1}
            onChange={v => update('updateIntervalSeconds', v)}
            description="How often simulated sensor readings are updated"
          />
        </Panel>

        {/* Automation */}
        <Panel title="Automation & Alerts">
          <ToggleRow
            label="Automatic Ventilation"
            value={settings.autoVentilation}
            onChange={v => update('autoVentilation', v)}
            description="Automatically increase fan speed when critical temperatures are detected in auto-mode fans"
          />
          <ToggleRow
            label="Alert Sound"
            value={settings.alertSoundEnabled}
            onChange={v => update('alertSoundEnabled', v)}
            description="Play audio notification for critical alerts (browser must support audio)"
          />
        </Panel>
      </div>

      {/* Current settings summary */}
      <Panel title="Active Configuration Summary">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {[
            { label: 'Warning Temperature', value: `${settings.tempWarningThreshold}°C` },
            { label: 'Critical Temperature', value: `${settings.tempCriticalThreshold}°C` },
            { label: 'Humidity Threshold', value: `${settings.humidityThreshold}%` },
            { label: 'CO₂ Threshold', value: `${settings.co2Threshold} ppm` },
            { label: 'Prediction Window', value: `${settings.predictionWindowMinutes} minutes` },
            { label: 'Update Interval', value: `${settings.updateIntervalSeconds} seconds` },
            { label: 'Auto Ventilation', value: settings.autoVentilation ? 'Enabled' : 'Disabled' },
            { label: 'Alert Sound', value: settings.alertSoundEnabled ? 'Enabled' : 'Disabled' },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-1.5 border-b border-mine-border last:border-0">
              <span className="text-[10px] text-mine-subtext">{item.label}</span>
              <span className="text-[10px] font-mono text-mine-text">{item.value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
