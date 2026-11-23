import React, { useState } from 'react';
import { Layers, Cpu, Wifi, Cloud, Database, Brain, AlertTriangle, Wind, Monitor, ChevronRight } from 'lucide-react';
import { Panel } from '../ui/Panel';

const ARCHITECTURE_NODES = [
  {
    id: 'sensors',
    icon: Cpu,
    title: 'IoT Sensors',
    color: 'text-mine-cyan',
    border: 'border-mine-cyan/30',
    bg: 'bg-mine-cyan/5',
    description: 'Physical sensors in real deployment',
    components: [
      'DHT22 Temperature & Humidity Sensor',
      'MQ-135 Gas / Air Quality Sensor',
      'NDIR CO₂ Sensor (SCD30 / T6713)',
      'Anemometer / Airflow Velocity Sensor',
      'Industrial heat index calculation module',
    ],
    simulation: 'SOFTWARE SIMULATION: All sensors are simulated in TypeScript. Data is generated using random walk algorithms with scenario-based modifiers.',
  },
  {
    id: 'acquisition',
    icon: Wifi,
    title: 'Data Acquisition',
    color: 'text-mine-blue',
    border: 'border-mine-blue/30',
    bg: 'bg-mine-blue/5',
    description: 'Data collection and transmission layer',
    components: [
      'ESP32 / Industrial IoT Gateway',
      'MQTT Protocol (Message Queuing Telemetry Transport)',
      'Wi-Fi / LoRa / RS-485 industrial communication',
      'Data serialization (JSON / CBOR)',
      'Edge buffering for intermittent connectivity',
    ],
    simulation: 'SOFTWARE SIMULATION: Data transmission is emulated by JavaScript state updates at configurable intervals (1–10 seconds).',
  },
  {
    id: 'cloud',
    icon: Cloud,
    title: 'Cloud / Edge Processing',
    color: 'text-mine-orange',
    border: 'border-mine-orange/30',
    bg: 'bg-mine-orange/5',
    description: 'Processing and aggregation layer',
    components: [
      'MQTT Broker (Mosquitto / AWS IoT Core)',
      'Stream processing (Apache Kafka / Node-RED)',
      'Time-series database (InfluxDB / TimescaleDB)',
      'Data normalization and validation',
      'Real-time anomaly detection rules',
    ],
    simulation: 'SOFTWARE SIMULATION: Processing is handled in-memory using React state and the useReducer hook. No external services are used.',
  },
  {
    id: 'storage',
    icon: Database,
    title: 'Data Storage',
    color: 'text-mine-green',
    border: 'border-mine-green/30',
    bg: 'bg-mine-green/5',
    description: 'Persistent data management',
    components: [
      'Time-series database for sensor readings',
      'Relational database for alerts and worker records',
      'Cold storage for historical reports',
      'Settings persistence (localStorage / Redis)',
      'Backup and redundancy systems',
    ],
    simulation: 'SOFTWARE SIMULATION: Data is stored in React component state (in-memory). Settings are persisted in browser localStorage.',
  },
  {
    id: 'prediction',
    icon: Brain,
    title: 'Thermal Prediction Engine',
    color: 'text-mine-yellow',
    border: 'border-mine-yellow/30',
    bg: 'bg-mine-yellow/5',
    description: 'Predictive analytics module',
    components: [
      'Time-series trend analysis (linear regression)',
      'Multi-factor thermal model (temp, humidity, CO₂, airflow)',
      'Configurable prediction horizons (5–60 minutes)',
      'Risk scoring algorithm (0–100 scale)',
      'Confidence estimation based on data availability',
    ],
    simulation: 'SOFTWARE SIMULATION: Prediction uses a simple linear extrapolation based on sensor history. This is NOT a trained ML/AI model. It is an illustrative algorithm for educational demonstration.',
  },
  {
    id: 'classification',
    icon: AlertTriangle,
    title: 'Risk Classification',
    color: 'text-mine-orange',
    border: 'border-mine-orange/30',
    bg: 'bg-mine-orange/5',
    description: 'Automated risk assessment',
    components: [
      'Four-level risk classification: Safe / Warning / High / Critical',
      'Zone-based aggregation of sensor data',
      'Threshold-based rule engine',
      'Worker exposure risk calculation',
      'Time-to-threshold estimation',
    ],
    simulation: 'SOFTWARE SIMULATION: Classification uses configurable temperature thresholds. Thresholds can be adjusted in System Settings.',
  },
  {
    id: 'alerts',
    icon: AlertTriangle,
    title: 'Alert Generation',
    color: 'text-mine-red',
    border: 'border-mine-red/30',
    bg: 'bg-mine-red/5',
    description: 'Automated notification system',
    components: [
      'Automated alert generation on threshold crossing',
      'Alert severity classification (Info / Warning / Critical)',
      'Alert deduplication to avoid flood',
      'Alert acknowledgement and resolution workflow',
      'Alert history and audit trail',
    ],
    simulation: 'SOFTWARE SIMULATION: Alerts are auto-generated during simulation ticks when sensor values exceed configured thresholds.',
  },
  {
    id: 'ventilation',
    icon: Wind,
    title: 'Automatic Ventilation',
    color: 'text-mine-cyan',
    border: 'border-mine-cyan/30',
    bg: 'bg-mine-cyan/5',
    description: 'Preventive response system',
    components: [
      'PLC / Industrial controller integration',
      'Modbus / BACnet fan control protocol',
      'Automatic speed adjustment based on thermal risk',
      'Manual override capability for operators',
      'Fan health monitoring and fault detection',
    ],
    simulation: 'SOFTWARE SIMULATION: Fan controls update simulated state. Auto-ventilation increases fan speed in response to critical zone temperatures when auto-mode is enabled.',
  },
  {
    id: 'dashboard',
    icon: Monitor,
    title: 'Monitoring Dashboard',
    color: 'text-mine-green',
    border: 'border-mine-green/30',
    bg: 'bg-mine-green/5',
    description: 'Operator interface layer',
    components: [
      'Real-time web dashboard (React.js)',
      'Interactive underground mine map (SVG)',
      'Live sensor data visualization (Recharts)',
      'Multi-zone thermal prediction display',
      'Alert management console',
      'Analytics and reporting module',
      'Worker safety tracking interface',
    ],
    simulation: 'THIS IS THE CURRENT APPLICATION. The dashboard runs entirely in the browser as a software simulation of the complete IoT monitoring system.',
  },
];

export function ArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState<string | null>('sensors');
  const sel = ARCHITECTURE_NODES.find(n => n.id === selectedNode);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-mine-text">System Architecture</h2>
        <p className="text-[11px] text-mine-subtext mt-0.5">
          Complete IoT pipeline — physical deployment design and software simulation mapping
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Flow diagram */}
        <div className="col-span-12 lg:col-span-7">
          <Panel title="IoT Data Flow Pipeline">
            <div className="space-y-1">
              {ARCHITECTURE_NODES.map((node, i) => {
                const Icon = node.icon;
                const isSelected = selectedNode === node.id;
                return (
                  <React.Fragment key={node.id}>
                    <button
                      onClick={() => setSelectedNode(node.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded border transition-all text-left ${
                        isSelected ? `${node.border} ${node.bg}` : 'border-mine-border hover:bg-mine-surface'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${node.bg} ${node.border} border flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${node.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSelected ? node.color : 'text-mine-text'}`}>{node.title}</span>
                          {node.id === 'dashboard' && (
                            <span className="text-[9px] bg-mine-green/10 text-mine-green border border-mine-green/30 rounded px-1">CURRENT APP</span>
                          )}
                        </div>
                        <div className="text-[10px] text-mine-subtext truncate">{node.description}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? node.color : 'text-mine-muted'}`} />
                    </button>
                    {i < ARCHITECTURE_NODES.length - 1 && (
                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-px h-3 bg-mine-border" />
                          <div className="text-mine-muted text-xs">↓</div>
                          <div className="w-px h-1 bg-mine-border" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Detail panel */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {sel ? (
            <>
              <Panel title={sel.title} subtitle={sel.description}>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold text-mine-subtext uppercase tracking-wider mb-2">Components (Real Deployment)</div>
                    <div className="space-y-1">
                      {sel.components.map(c => (
                        <div key={c} className="flex items-start gap-2 text-[11px] text-mine-subtext">
                          <span className={`${sel.color} flex-shrink-0 mt-0.5`}>•</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded border ${sel.border} ${sel.bg}`}>
                    <div className={`text-[10px] font-bold ${sel.color} uppercase mb-1`}>Simulation Note</div>
                    <div className="text-[10px] text-mine-subtext leading-relaxed">{sel.simulation}</div>
                  </div>
                </div>
              </Panel>
              <Panel title="Deployment Technologies">
                <div className="space-y-1.5 text-[10px] text-mine-subtext">
                  {[
                    ['Microcontroller', 'ESP32 / Raspberry Pi / Industrial Gateway'],
                    ['Communication', 'MQTT / HTTP / WebSocket / LoRa'],
                    ['Cloud Platform', 'AWS IoT / Google Cloud IoT / Azure IoT Hub'],
                    ['Database', 'InfluxDB / TimescaleDB / PostgreSQL'],
                    ['Frontend', 'React.js + TypeScript + Recharts (this app)'],
                    ['Deployment', 'Docker / Kubernetes / Edge computing nodes'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-mine-border last:border-0">
                      <span className="text-mine-muted">{k}</span>
                      <span className="text-mine-text text-right max-w-[55%]">{v}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          ) : (
            <Panel title="Architecture Detail">
              <div className="flex items-center justify-center py-12 text-mine-subtext text-sm">
                Select a component to view details
              </div>
            </Panel>
          )}

          {/* Simulation disclaimer */}
          <div className="p-3 rounded border border-mine-yellow/30 bg-mine-yellow/5">
            <div className="text-[10px] font-bold text-mine-yellow mb-1">⚠ College Project Disclaimer</div>
            <div className="text-[10px] text-mine-subtext leading-relaxed">
              MineGuard is a software-only simulation built for the IoT course project demonstration.
              No physical sensors, hardware, or IoT devices are connected. All readings, predictions, alerts,
              and ventilation responses are generated by algorithms running in the browser.
              The architecture diagram represents the proposed real-world deployment design.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
