export type ZoneId = 'zone-a' | 'zone-b' | 'zone-c';

export type ZoneStatus = 'safe' | 'warning' | 'danger';

export interface MineZone {
  id: ZoneId;
  name: string;
  shortLabel: string;
  tagline: string;
  depth: string;
  temp: number;
  humidity: number;
  fanSpeed: number; // 0, 30, 60, 100
  fanState: 'eco' | 'normal' | 'boost' | 'off';
  status: ZoneStatus;
  minerMood: 'happy' | 'warm' | 'sweating' | 'relieved';
  statusMessage: string;
}

export interface TempHistoryPoint {
  time: string;
  actual: number;
  predicted: number;
}

export type DemoMode = 'normal' | 'heat_spike';

export type DeviceId = 'dht22' | 'ir-thermal' | 'mq135' | 'esp32' | 'smart-relay-fan' | 'ai-hub';

export interface DeviceInfo {
  id: DeviceId;
  name: string;
  hardwareModel: string;
  icon: string;
  locationLabel: string;
  simpleExplanation: string;
  whyPlacedHere: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
}

