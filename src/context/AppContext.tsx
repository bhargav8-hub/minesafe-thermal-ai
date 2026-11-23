import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import {
  Zone, Sensor, Alert, Fan, Worker, ThermalPrediction, SystemSettings,
  SimulationState, KPIData, ChartDataPoint, SimulationScenario, RiskLevel
} from '../types';
import {
  INITIAL_ZONES, INITIAL_SENSORS, INITIAL_FANS, INITIAL_WORKERS,
  DEFAULT_SETTINGS, generateHistoricalData
} from '../data/initialData';

// ─── STATE ───────────────────────────────────────────────────────────────────

interface AppState {
  zones: Zone[];
  sensors: Sensor[];
  alerts: Alert[];
  fans: Fan[];
  workers: Worker[];
  predictions: ThermalPrediction[];
  settings: SystemSettings;
  simulation: SimulationState;
  kpi: KPIData;
  chartData: ChartDataPoint[];
  selectedZoneId: string | null;
  selectedSensorId: string | null;
  activeSection: string;
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SECTION'; payload: string }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SELECT_SENSOR'; payload: string | null }
  | { type: 'START_SIMULATION' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'SET_SPEED'; payload: 1 | 2 | 5 }
  | { type: 'SET_SCENARIO'; payload: SimulationScenario }
  | { type: 'TICK' }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'RESOLVE_ALERT'; payload: string }
  | { type: 'UPDATE_FAN'; payload: { id: string; changes: Partial<Fan> } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SystemSettings> }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'RESET_STATE' };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

let alertCounter = 1;

function generateAlertId(): string {
  return `ALT-${String(alertCounter++).padStart(4, '0')}`;
}

function getRiskLevel(temp: number, warnThresh: number, critThresh: number): RiskLevel {
  if (temp >= critThresh) return 'critical';
  if (temp >= warnThresh) return 'warning';
  if (temp >= warnThresh - 3) return 'high';
  return 'safe';
}

function computeKPI(zones: Zone[], alerts: Alert[], fans: Fan[]): KPIData {
  const temps = zones.map(z => z.temperature);
  const activeFans = fans.filter(f => f.status === 'on').length;
  return {
    avgTemperature: +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
    maxTemperature: +Math.max(...temps).toFixed(1),
    humidity: +(zones.reduce((a, z) => a + z.humidity, 0) / zones.length).toFixed(1),
    co2: Math.round(zones.reduce((a, z) => a + z.co2, 0) / zones.length),
    ventilationStatus: activeFans === fans.length ? 'All Active' : activeFans === 0 ? 'Offline' : `${activeFans}/${fans.length} Active`,
    activeAlerts: alerts.filter(a => !a.acknowledged && !a.resolved).length,
  };
}

function computeHeatIndex(tempC: number, rh: number): number {
  const T = tempC * 9 / 5 + 32; // convert to F
  const HI = -42.379 + 2.04901523 * T + 10.14333127 * rh
    - 0.22475541 * T * rh - 0.00683783 * T * T
    - 0.05481717 * rh * rh + 0.00122874 * T * T * rh
    + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
  return +((HI - 32) * 5 / 9).toFixed(1); // back to C
}

function buildPredictions(zones: Zone[], sensors: Sensor[], settings: SystemSettings): ThermalPrediction[] {
  return zones.map(zone => {
    const history = sensors
      .filter(s => s.zoneId === zone.id && s.type === 'temperature')
      .flatMap(s => s.history)
      .slice(-20);

    let rate = 0;
    if (history.length >= 2) {
      const oldest = history[0];
      const newest = history[history.length - 1];
      const dtMin = (newest.time - oldest.time) / 60000;
      if (dtMin > 0) rate = (newest.value - oldest.value) / dtMin;
    }

    const p5 = +(zone.temperature + rate * 5).toFixed(1);
    const p15 = +(zone.temperature + rate * 15).toFixed(1);
    const p30 = +(zone.temperature + rate * 30).toFixed(1);
    const p60 = +(zone.temperature + rate * 60).toFixed(1);

    let timeToWarn: number | null = null;
    let timeToCrit: number | null = null;
    if (rate > 0.01) {
      const toWarn = (settings.tempWarningThreshold - zone.temperature) / rate;
      const toCrit = (settings.tempCriticalThreshold - zone.temperature) / rate;
      if (toWarn > 0 && toWarn < 120) timeToWarn = +toWarn.toFixed(0);
      if (toCrit > 0 && toCrit < 120) timeToCrit = +toCrit.toFixed(0);
    }

    const tempFactor = Math.min(100, Math.max(0,
      ((zone.temperature - 20) / (settings.tempCriticalThreshold - 20)) * 60));
    const rateFactor = Math.min(40, Math.max(0, rate * 300));
    const riskScore = Math.min(100, Math.round(tempFactor + rateFactor));

    const riskLevel = getRiskLevel(zone.temperature, settings.tempWarningThreshold, settings.tempCriticalThreshold);

    // Build series: last 15 historical points + 8 predicted
    const now = Date.now();
    const historicalSeries = history.slice(-15).map(h => ({
      time: h.time,
      value: h.value,
      type: 'historical' as const,
    }));
    if (historicalSeries.length === 0) {
      for (let i = 14; i >= 1; i--) {
        historicalSeries.push({ time: now - i * 60000, value: zone.temperature - rate * i, type: 'historical' });
      }
    }
    const predictedSeries = [5, 10, 15, 20, 30, 45, 60].map(min => ({
      time: now + min * 60000,
      value: +(zone.temperature + rate * min).toFixed(1),
      type: 'predicted' as const,
    }));

    return {
      zoneId: zone.id,
      currentTemp: zone.temperature,
      rateOfIncrease: +rate.toFixed(4),
      predicted5min: p5,
      predicted15min: p15,
      predicted30min: p30,
      predicted60min: p60,
      estimatedTimeToWarning: timeToWarn,
      estimatedTimeToCritical: timeToCrit,
      riskScore,
      riskLevel,
      confidence: Math.min(95, 50 + history.length * 2),
      series: [...historicalSeries, { time: now, value: zone.temperature, type: 'current' as const }, ...predictedSeries],
    };
  });
}

// ─── SCENARIO MODIFIERS ───────────────────────────────────────────────────────

type ZoneModifier = { [zoneId: string]: Partial<Zone> };
type SensorModifier = { [sensorId: string]: number };

function getScenarioModifiers(scenario: SimulationScenario, tick: number, settings: SystemSettings) {
  const t = tick;
  switch (scenario) {
    case 'temperature-increase': {
      const ramp = Math.min(8, t * 0.03);
      return {
        zones: { 'zone-c': { temperature: 29 + ramp, co2: 1100 + ramp * 30 } } as ZoneModifier,
      };
    }
    case 'critical-thermal': {
      const ramp = Math.min(12, t * 0.05);
      return {
        zones: {
          'zone-c': { temperature: 33 + ramp, co2: 1300 + ramp * 20, humidity: 82 },
          'zone-b': { temperature: 29 + ramp * 0.4 },
        } as ZoneModifier,
      };
    }
    case 'ventilation-failure': {
      const ramp = Math.min(10, t * 0.04);
      return {
        zones: {
          'zone-c': { temperature: 30 + ramp, airflow: Math.max(0.3, 1.9 - ramp * 0.1) },
          'zone-b': { temperature: 28 + ramp * 0.5, airflow: Math.max(0.5, 2.8 - ramp * 0.08) },
        } as ZoneModifier,
        fanOverrides: { 'FAN-AUX-02': { status: 'off' as const, speed: 0 } },
      };
    }
    case 'recovery': {
      const recover = Math.min(1, t * 0.01);
      return {
        zones: {
          'zone-c': { temperature: 36 - recover * 8, airflow: 1.9 + recover * 2 },
        } as ZoneModifier,
        fanOverrides: { 'FAN-AUX-02': { status: 'on' as const, speed: Math.min(100, 55 + recover * 45) } },
      };
    }
    default:
      return { zones: {} as ZoneModifier };
  }
}

// ─── TICK REDUCER ─────────────────────────────────────────────────────────────

function tickState(state: AppState): AppState {
  const { simulation, settings } = state;
  const mods = getScenarioModifiers(simulation.scenario, simulation.tick, settings);

  // Update zones
  const updatedZones = state.zones.map(zone => {
    const baseMod = mods.zones?.[zone.id] || {};
    const noise = (v: number, mag: number) => +(v + (Math.random() - 0.5) * mag).toFixed(2);
    const newTemp = +(((baseMod.temperature ?? zone.temperature) + (Math.random() - 0.5) * 0.3)).toFixed(1);
    const newHumidity = +(((baseMod.humidity ?? zone.humidity) + (Math.random() - 0.5) * 0.8)).toFixed(1);
    const newCO2 = Math.round((baseMod.co2 ?? zone.co2) + (Math.random() - 0.5) * 20);
    const newAirflow = +(noise(baseMod.airflow ?? zone.airflow, 0.1)).toFixed(2);
    return {
      ...zone,
      temperature: newTemp,
      humidity: Math.min(99, Math.max(20, newHumidity)),
      co2: Math.max(400, Math.min(5000, newCO2)),
      airflow: Math.max(0, newAirflow),
      riskLevel: getRiskLevel(newTemp, settings.tempWarningThreshold, settings.tempCriticalThreshold),
      lastUpdated: new Date(),
    };
  });

  // Update fans
  const updatedFans = state.fans.map(fan => {
    const override = (mods as any).fanOverrides?.[fan.id];
    if (override) return { ...fan, ...override, airflowCFM: fan.airflowCFM * ((override.speed ?? fan.speed) / Math.max(1, fan.speed)) };
    // Auto ventilation: if a zone is critical, ramp up fans
    if (settings.autoVentilation && fan.mode === 'auto') {
      const zone = updatedZones.find(z => z.id === fan.zoneId);
      if (zone && zone.riskLevel === 'critical' && fan.status === 'off') {
        return { ...fan, status: 'on' as const, speed: 85, airflowCFM: fan.type === 'main' ? 15000 : 7000 };
      }
      if (zone && zone.riskLevel === 'critical' && fan.speed < 90) {
        return { ...fan, speed: Math.min(100, fan.speed + 2), airflowCFM: fan.airflowCFM * 1.02 };
      }
    }
    return fan;
  });

  // Update sensors
  const updatedSensors = state.sensors.map(sensor => {
    const zone = updatedZones.find(z => z.id === sensor.zoneId);
    if (!zone) return sensor;
    let newValue = sensor.value;
    switch (sensor.type) {
      case 'temperature': newValue = zone.temperature; break;
      case 'humidity': newValue = zone.humidity; break;
      case 'co2': newValue = zone.co2; break;
      case 'gas': newValue = +(zone.co2 / 10 + (Math.random() - 0.5) * 5).toFixed(0); break;
      case 'airflow': newValue = zone.airflow; break;
      case 'heat-index': newValue = computeHeatIndex(zone.temperature, zone.humidity); break;
    }
    const now = Date.now();
    const newHistory = [...sensor.history.slice(-59), { time: now, value: newValue }];
    return { ...sensor, value: newValue, history: newHistory, lastCommunication: new Date() };
  });

  // Update workers
  const updatedWorkers = state.workers.map(w => {
    const zone = updatedZones.find(z => z.id === w.zoneId);
    return { ...w, status: zone ? (zone.riskLevel === 'critical' ? 'critical' : zone.riskLevel === 'warning' ? 'warning' : 'safe') as Worker['status'] : w.status };
  });

  // Build predictions
  const predictions = buildPredictions(updatedZones, updatedSensors, settings);

  // Auto-generate alerts
  const newAlerts: Alert[] = [];
  const now = new Date();
  updatedZones.forEach(zone => {
    const existing = state.alerts.find(
      a => a.zoneId === zone.id && !a.resolved && !a.acknowledged &&
        (a.category === 'high-temperature' || a.category === 'thermal-hazard-prediction')
    );
    if (zone.riskLevel === 'critical' && !existing) {
      newAlerts.push({
        id: generateAlertId(),
        timestamp: now,
        zoneId: zone.id,
        zoneName: zone.fullName,
        category: 'high-temperature',
        severity: 'critical',
        title: `Critical Temperature in ${zone.name}`,
        description: `Temperature has reached ${zone.temperature.toFixed(1)}°C in ${zone.fullName}, exceeding the critical threshold of ${settings.tempCriticalThreshold}°C.`,
        recommendedAction: 'Evacuate zone immediately. Activate emergency ventilation. Contact mine safety officer.',
        acknowledged: false,
        resolved: false,
      });
    } else if (zone.riskLevel === 'warning' && !existing) {
      const pred = predictions.find(p => p.zoneId === zone.id);
      if (pred && pred.riskScore > 50) {
        newAlerts.push({
          id: generateAlertId(),
          timestamp: now,
          zoneId: zone.id,
          zoneName: zone.fullName,
          category: 'thermal-hazard-prediction',
          severity: 'warning',
          title: `Thermal Hazard Predicted – ${zone.name}`,
          description: `Rising temperature trend detected in ${zone.fullName}. Current: ${zone.temperature.toFixed(1)}°C. Predicted to reach ${pred.predicted30min.toFixed(1)}°C in 30 minutes.`,
          recommendedAction: 'Increase ventilation, reduce worker exposure. Monitor temperature closely.',
          acknowledged: false,
          resolved: false,
        });
      }
    }
    // CO2 alert
    if (zone.co2 > settings.co2Threshold) {
      const co2Existing = state.alerts.find(a => a.zoneId === zone.id && !a.resolved && a.category === 'high-co2');
      if (!co2Existing) {
        newAlerts.push({
          id: generateAlertId(),
          timestamp: now,
          zoneId: zone.id,
          zoneName: zone.fullName,
          category: 'high-co2',
          severity: zone.co2 > settings.co2Threshold * 1.3 ? 'critical' : 'warning',
          title: `High CO₂ in ${zone.name}`,
          description: `CO₂ concentration is ${zone.co2} ppm in ${zone.fullName}, exceeding the safe limit of ${settings.co2Threshold} ppm.`,
          recommendedAction: 'Increase fresh air supply. Check ventilation ducts. Consider zone evacuation.',
          acknowledged: false,
          resolved: false,
        });
      }
    }
  });

  // Check for resolved alerts (temperature dropped below threshold)
  const updatedAlerts = state.alerts.map(alert => {
    if (alert.resolved || alert.acknowledged) return alert;
    const zone = updatedZones.find(z => z.id === alert.zoneId);
    if (!zone) return alert;
    if (alert.category === 'high-temperature' && zone.riskLevel === 'safe') {
      return { ...alert, resolved: true };
    }
    return alert;
  });

  const allAlerts = [...newAlerts, ...updatedAlerts].slice(0, 200);

  // Update chart data
  const timeLabel = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const avgTemp = +(updatedZones.reduce((a, z) => a + z.temperature, 0) / updatedZones.length).toFixed(1);
  const avgHumidity = +(updatedZones.reduce((a, z) => a + z.humidity, 0) / updatedZones.length).toFixed(1);
  const avgCO2 = Math.round(updatedZones.reduce((a, z) => a + z.co2, 0) / updatedZones.length);
  const avgAirflow = +(updatedZones.reduce((a, z) => a + z.airflow, 0) / updatedZones.length).toFixed(2);
  const newChartPoint: ChartDataPoint = {
    time: timeLabel,
    temperature: avgTemp,
    humidity: avgHumidity,
    co2: avgCO2,
    airflow: avgAirflow,
  };
  const updatedChart = [...state.chartData.slice(-288), newChartPoint];

  const kpi = computeKPI(updatedZones, allAlerts, updatedFans);

  return {
    ...state,
    zones: updatedZones,
    sensors: updatedSensors,
    fans: updatedFans,
    workers: updatedWorkers,
    alerts: allAlerts,
    predictions,
    kpi,
    chartData: updatedChart,
    simulation: { ...simulation, tick: simulation.tick + 1 },
  };
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function getScenarioDefaults(scenario: SimulationScenario): Partial<{ zones: Zone[]; fans: Fan[] }> {
  const zones = INITIAL_ZONES.map(z => ({ ...z, lastUpdated: new Date() }));
  const fans = INITIAL_FANS.map(f => ({ ...f }));
  switch (scenario) {
    case 'critical-thermal':
      return {
        zones: zones.map(z => z.id === 'zone-c' ? { ...z, temperature: 36, co2: 1600, humidity: 85, riskLevel: 'critical' } : z),
      };
    case 'ventilation-failure':
      return {
        fans: fans.map(f => f.id === 'FAN-AUX-02' ? { ...f, status: 'off' as const, speed: 0 } : f),
      };
    case 'recovery':
      return {
        zones: zones.map(z => z.id === 'zone-c' ? { ...z, temperature: 37, co2: 1550, humidity: 83, riskLevel: 'critical' } : z),
        fans: fans.map(f => f.id === 'FAN-AUX-02' ? { ...f, status: 'on' as const, speed: 95, airflowCFM: 8000 } : f),
      };
    default:
      return {};
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, activeSection: action.payload };
    case 'SELECT_ZONE':
      return { ...state, selectedZoneId: action.payload };
    case 'SELECT_SENSOR':
      return { ...state, selectedSensorId: action.payload };
    case 'START_SIMULATION':
      return { ...state, simulation: { ...state.simulation, running: true } };
    case 'PAUSE_SIMULATION':
      return { ...state, simulation: { ...state.simulation, running: false } };
    case 'RESET_SIMULATION': {
      const defs = getScenarioDefaults(state.simulation.scenario);
      return {
        ...state,
        zones: defs.zones || INITIAL_ZONES.map(z => ({ ...z, lastUpdated: new Date() })),
        sensors: INITIAL_SENSORS.map(s => ({ ...s, history: [], lastCommunication: new Date() })),
        fans: defs.fans || INITIAL_FANS.map(f => ({ ...f })),
        workers: INITIAL_WORKERS.map(w => ({ ...w })),
        alerts: [],
        simulation: { ...state.simulation, tick: 0, running: false },
        chartData: generateHistoricalData(2),
      };
    }
    case 'SET_SPEED':
      return { ...state, simulation: { ...state.simulation, speed: action.payload } };
    case 'SET_SCENARIO': {
      const defs = getScenarioDefaults(action.payload);
      return {
        ...state,
        simulation: { ...state.simulation, scenario: action.payload, tick: 0, running: false },
        zones: defs.zones || INITIAL_ZONES.map(z => ({ ...z, lastUpdated: new Date() })),
        fans: defs.fans || INITIAL_FANS.map(f => ({ ...f })),
        sensors: INITIAL_SENSORS.map(s => ({ ...s, history: [], lastCommunication: new Date() })),
        alerts: [],
        chartData: generateHistoricalData(2),
      };
    }
    case 'TICK':
      return tickState(state);
    case 'ACKNOWLEDGE_ALERT':
      return { ...state, alerts: state.alerts.map(a => a.id === action.payload ? { ...a, acknowledged: true } : a) };
    case 'RESOLVE_ALERT':
      return { ...state, alerts: state.alerts.map(a => a.id === action.payload ? { ...a, resolved: true } : a) };
    case 'UPDATE_FAN':
      return { ...state, fans: state.fans.map(f => f.id === action.payload.id ? { ...f, ...action.payload.changes } : f) };
    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      try { localStorage.setItem('mineguard-settings', JSON.stringify(newSettings)); } catch {}
      return { ...state, settings: newSettings };
    }
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

function loadSettings(): SystemSettings {
  try {
    const stored = localStorage.getItem('mineguard-settings');
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

const initialState: AppState = {
  zones: INITIAL_ZONES.map(z => ({ ...z, lastUpdated: new Date() })),
  sensors: INITIAL_SENSORS.map(s => ({ ...s, history: [] })),
  alerts: [],
  fans: INITIAL_FANS.map(f => ({ ...f })),
  workers: INITIAL_WORKERS.map(w => ({ ...w })),
  predictions: [],
  settings: loadSettings(),
  simulation: { running: false, speed: 1, scenario: 'normal', tick: 0 },
  kpi: { avgTemperature: 26.5, maxTemperature: 31.2, humidity: 68, co2: 820, ventilationStatus: '3/4 Active', activeAlerts: 0 },
  chartData: generateHistoricalData(2),
  selectedZoneId: null,
  selectedSensorId: null,
  activeSection: 'overview',
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.simulation.running) {
      const ms = (state.settings.updateIntervalSeconds * 1000) / state.simulation.speed;
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), ms);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.simulation.running, state.simulation.speed, state.settings.updateIntervalSeconds]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
