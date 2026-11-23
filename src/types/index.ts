// Core types for MineGuard application

export type RiskLevel = 'safe' | 'warning' | 'high' | 'critical';
export type SensorStatus = 'online' | 'offline' | 'warning';
export type SimulationScenario = 'normal' | 'temperature-increase' | 'critical-thermal' | 'ventilation-failure' | 'recovery';
export type SimulationSpeed = 1 | 2 | 5;

export interface Zone {
  id: string;
  name: string;
  fullName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  riskLevel: RiskLevel;
  temperature: number;
  humidity: number;
  co2: number;
  airflow: number;
  workers: number;
  lastUpdated: Date;
}

export interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'gas' | 'co2' | 'airflow' | 'heat-index';
  model: string;
  zoneId: string;
  zoneName: string;
  value: number;
  unit: string;
  status: SensorStatus;
  battery: number;
  lastCommunication: Date;
  minSafe: number;
  maxSafe: number;
  history: { time: number; value: number }[];
}

export interface Alert {
  id: string;
  timestamp: Date;
  zoneId: string;
  zoneName: string;
  category: AlertCategory;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendedAction: string;
  acknowledged: boolean;
  resolved: boolean;
}

export type AlertCategory =
  | 'high-temperature'
  | 'rapid-temperature-increase'
  | 'high-humidity'
  | 'poor-air-quality'
  | 'high-co2'
  | 'low-airflow'
  | 'sensor-disconnected'
  | 'thermal-hazard-prediction'
  | 'ventilation-failure'
  | 'evacuation';

export interface Fan {
  id: string;
  name: string;
  zoneId: string;
  type: 'main' | 'auxiliary';
  status: 'on' | 'off';
  speed: number; // 0-100
  airflowCFM: number;
  mode: 'auto' | 'manual';
}

export interface Worker {
  id: string;
  name: string;
  zoneId: string;
  x: number;
  y: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface ThermalPrediction {
  zoneId: string;
  currentTemp: number;
  rateOfIncrease: number; // °C/min
  predicted5min: number;
  predicted15min: number;
  predicted30min: number;
  predicted60min: number;
  estimatedTimeToWarning: number | null; // minutes
  estimatedTimeToCritical: number | null; // minutes
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  series: { time: number; value: number; type: 'historical' | 'current' | 'predicted' }[];
}

export interface SystemSettings {
  tempWarningThreshold: number;
  tempCriticalThreshold: number;
  humidityThreshold: number;
  co2Threshold: number;
  predictionWindowMinutes: number;
  autoVentilation: boolean;
  alertSoundEnabled: boolean;
  updateIntervalSeconds: number;
}

export interface SimulationState {
  running: boolean;
  speed: SimulationSpeed;
  scenario: SimulationScenario;
  tick: number;
}

export interface KPIData {
  avgTemperature: number;
  maxTemperature: number;
  humidity: number;
  co2: number;
  ventilationStatus: string;
  activeAlerts: number;
}

export interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  co2: number;
  airflow: number;
  predicted?: number;
}
