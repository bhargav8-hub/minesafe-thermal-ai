import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Square,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Info,
  X,
  ShieldCheck,
  FileText
} from 'lucide-react';

// Hardware details dictionary for click-to-inspect across both the Cave and Tinkercad Wiring Bench
const HARDWARE_DETAILS = {
  mains: {
    title: '12V 5A Adapter + LiFePO4 UPS Battery',
    badge: 'Primary & Backup Power Supply',
    voltage: '12.0V DC (5A Max)',
    pin: 'DC Barrel Jack → 12V+ & GND Bus',
    protocol: 'Auto-Switchover DC UPS',
    whatItIs:
      'A low-cost dual power unit combining a standard 230V AC-to-12V DC adapter with an automatic LiFePO4 lithium backup battery pack.',
    howItMeasures:
      'Continuously monitors incoming mine power voltage and switches instantaneously (0ms latency) to battery power if main mine electricity drops.',
    workInProject:
      'Guarantees that underground gas/heat sensors and emergency ventilation fans never shut off during a tunnel power outage.',
    wires: [
      { from: 'UPS Battery (+12V)', to: 'LM2596 Buck VIN+', color: 'Red (#ef4444)', role: '12V Input to Step-Down Converter' },
      { from: 'UPS Battery (+12V)', to: '5V Relay COM Terminal', color: 'Red (#dc2626)', role: 'High-Current 12V Supply for Cooling Fan' },
      { from: 'UPS Battery (GND)', to: 'Breadboard Blue (-) Rail', color: 'Black (#1e293b)', role: 'Common System Ground Reference' }
    ],
    summary:
      'Supplies 12V DC power from the mine adapter and keeps a LiFePO4 battery charged so sensors and fans run uninterrupted during power outages.'
  },
  ups: {
    title: '12V 5A Adapter + LiFePO4 UPS Battery',
    badge: 'Primary & Backup Power Supply',
    voltage: '12.0V DC (5A Max)',
    pin: 'DC Barrel Jack → 12V+ & GND Bus',
    protocol: 'Auto-Switchover DC UPS',
    whatItIs:
      'A low-cost dual power unit combining a standard 230V AC-to-12V DC adapter with an automatic LiFePO4 lithium backup battery pack.',
    howItMeasures:
      'Continuously monitors incoming mine power voltage and switches instantaneously (0ms latency) to battery power if main mine electricity drops.',
    workInProject:
      'Guarantees that underground gas/heat sensors and emergency ventilation fans never shut off during a tunnel power outage.',
    wires: [
      { from: 'UPS Battery (+12V)', to: 'LM2596 Buck VIN+', color: 'Red (#ef4444)', role: '12V Input to Step-Down Converter' },
      { from: 'UPS Battery (+12V)', to: '5V Relay COM Terminal', color: 'Red (#dc2626)', role: 'High-Current 12V Supply for Cooling Fan' },
      { from: 'UPS Battery (GND)', to: 'Breadboard Blue (-) Rail', color: 'Black (#1e293b)', role: 'Common System Ground Reference' }
    ],
    summary:
      'Converts AC to 12V DC and keeps a lithium-iron-phosphate backup battery charged so sensors and emergency cooling fans keep running even during a mine power outage.'
  },
  buck: {
    title: 'LM2596 DC-DC Buck Converter',
    badge: '12V to 5V Step-Down Regulator',
    voltage: '12V IN → 5.0V Regulated OUT',
    pin: 'OUT+ → Breadboard Red (+) Rail',
    protocol: 'DC-DC Step-Down Regulation',
    whatItIs:
      'A high-efficiency, inexpensive DC-to-DC step-down voltage regulator module.',
    howItMeasures:
      'Uses high-frequency switching (150kHz) and feedback voltage sensing across its trim potentiometer to lock the output at exactly 5.0V DC.',
    workInProject:
      'Steps down the 12V fan battery power into clean, safe 5.0V power so the ESP32 microcontroller and MQ-135 gas sensor do not burn out.',
    wires: [
      { from: 'LM2596 VIN+ / VIN-', to: '12V UPS Battery (+ / -)', color: 'Red & Black', role: 'Receives 12V DC Raw Power' },
      { from: 'LM2596 OUT+', to: 'Breadboard Red (+) Power Rail', color: 'Red (#ef4444)', role: 'Feeds Regulated 5V to ESP32 VIN, Relay & MQ-135' },
      { from: 'LM2596 OUT-', to: 'Breadboard Blue (-) Ground Rail', color: 'Black (#1e293b)', role: 'Common 5V Ground Rail' }
    ],
    summary:
      'Safely steps down 12V battery voltage to clean 5.0V DC so the breadboard rails, ESP32-S3, and gas sensors receive stable, safe power.'
  },
  breadboard: {
    title: 'Half-Size Solderless Breadboard (400 Tie-Points)',
    badge: 'Modular Power & Signal Distribution',
    voltage: 'Top Rail: 3.3V Logic | Bottom Rail: 5.0V',
    pin: 'Red (+) Power Bus & Blue (-) Ground Bus',
    protocol: 'Modular Plug-and-Play Matrix',
    whatItIs:
      'A modular, solderless interconnection board with spring-clip metal strips underneath for rapid assembly and easy maintenance.',
    howItMeasures:
      'Routes electrical continuity horizontally along top/bottom power buses and vertically across 5-pin terminal strips without soldering.',
    workInProject:
      'Makes the hardware modular and easily retrofittable—any sensor can be plugged in or replaced in seconds in small or medium-scale mines.',
    wires: [
      { from: 'ESP32 3V3 Pin', to: 'Top Breadboard Red (+) Rail', color: 'Red (#ef4444)', role: '3.3V Clean Logic Power for DHT22 & MLX90614' },
      { from: 'LM2596 5V OUT+', to: 'Bottom Breadboard Red (+) Rail', color: 'Red (#ef4444)', role: '5V Power for ESP32 VIN, MQ-135 & Relay Coil' },
      { from: 'All GND Pins', to: 'Blue (-) Ground Rails', color: 'Black (#1e293b)', role: 'Shared Common Ground Across Every Module' }
    ],
    summary:
      'Distributes clean 3.3V and 5V power rails and common ground to every sensor without soldering, matching a real Tinkercad / lab prototype.'
  },
  dht: {
    title: 'DHT22 Temperature & Humidity Module',
    badge: 'Cave Air Climate Sensor',
    voltage: '3.3V DC (via Top Red Rail)',
    pin: 'DATA → ESP32 GPIO 4',
    protocol: '1-Wire Digital Signal',
    whatItIs:
      'A low-cost digital environmental sensor that measures both ambient air temperature (-40°C to 80°C) and relative humidity (0–100% RH).',
    howItMeasures:
      'Uses an internal NTC thermistor (resistance changes with heat) and a capacitive humidity element (moisture changes capacitance), sending calibrated digital pulses over 1 wire.',
    workInProject:
      'Tracks real-time heat-stress index for miners because high humidity stops sweat from evaporating—helping AI predict dangerous heatstroke conditions early.',
    wires: [
      { from: 'DHT22 VCC (+)', to: 'Breadboard 3.3V Red Rail', color: 'Red (#ef4444)', role: '3.3V Sensor Power' },
      { from: 'DHT22 DATA (Out)', to: 'ESP32-S3 GPIO 4', color: 'Green (#22c55e)', role: 'Digital Temp & Humidity Signal' },
      { from: 'DHT22 GND (-)', to: 'Breadboard Blue GND Rail', color: 'Black (#1e293b)', role: 'Common Ground' }
    ],
    summary:
      'Plugged directly into the breadboard to measure tunnel air temperature and humidity every second.'
  },
  ir: {
    title: 'MLX90614 Infrared (IR) Thermal Sensor',
    badge: 'Non-Contact Rock & Drill Sensor',
    voltage: '3.3V DC (via Top Red Rail)',
    pin: 'SDA → GPIO 21 | SCL → GPIO 22',
    protocol: 'I2C Digital Bus',
    whatItIs:
      'A medical/industrial-grade non-contact infrared thermometer chip inside a metal TO-39 optical package.',
    howItMeasures:
      'Focuses invisible infrared radiation (heat waves) emitted by rock walls and drilling machines onto a silicon thermopile detector—measuring surface temperature from a distance without touching it.',
    workInProject:
      'Provides the crucial early warning! Rocks and drill motors heat up minutes BEFORE the tunnel air warms up, allowing our AI to predict thermal hazards ahead of time.',
    wires: [
      { from: 'MLX90614 VIN', to: 'Breadboard 3.3V Red Rail', color: 'Red (#ef4444)', role: '3.3V Sensor Power' },
      { from: 'MLX90614 SDA', to: 'ESP32-S3 GPIO 21', color: 'Blue (#3b82f6)', role: 'I2C Serial Data Line' },
      { from: 'MLX90614 SCL', to: 'ESP32-S3 GPIO 22', color: 'Yellow (#eab308)', role: 'I2C Serial Clock Line' },
      { from: 'MLX90614 GND', to: 'Breadboard Blue GND Rail', color: 'Black (#1e293b)', role: 'Common Ground' }
    ],
    summary:
      'Uses an infrared thermopile lens to detect hot rock walls and drilling machinery before the surrounding air heats up.'
  },
  mq: {
    title: 'MQ-135 Air Quality & Hazardous Gas Sensor',
    badge: 'Tunnel Ventilation & Gas Monitor',
    voltage: '5.0V DC (via Bottom Red Rail)',
    pin: 'AO → ESP32 ADC1 (GPIO 34)',
    protocol: 'Analog Voltage (0–3.3V)',
    whatItIs:
      'A low-cost chemiresistive gas and airflow quality sensor capable of detecting CO2, ammonia, smoke, and stagnant toxic fumes.',
    howItMeasures:
      'Contains a heated Tin Dioxide (SnO2) sensing layer whose electrical resistance drops when hazardous gases contact it, outputting a proportional analog voltage to ESP32 ADC pin 34.',
    workInProject:
      'Monitors air freshness and detects gas accumulation or poor airflow early, triggering automatic ventilation before gas-related incidents harm miners.',
    wires: [
      { from: 'MQ-135 VCC', to: 'Breadboard 5V Red Rail', color: 'Red (#ef4444)', role: '5V Internal Heater Supply' },
      { from: 'MQ-135 AO (Analog)', to: 'ESP32-S3 GPIO 34 (ADC)', color: 'Orange (#f97316)', role: 'Analog Air Quality Signal' },
      { from: 'MQ-135 GND', to: 'Breadboard Blue GND Rail', color: 'Black (#1e293b)', role: 'Common Ground' }
    ],
    summary:
      'Monitors air freshness and detects stagnant air or harmful gases in the middle tunnel.'
  },
  esp: {
    title: 'ESP32-S3 DevKitC-1 Microcontroller',
    badge: 'Underground IoT Brain & Wi-Fi/LoRa Hub',
    voltage: '5V VIN / 3.3V Regulated Out',
    pin: 'GPIO 4, 21, 22, 26, 34',
    protocol: 'Wi-Fi / LoRa + MQTT JSON',
    whatItIs:
      'A powerful, low-cost dual-core 32-bit IoT microcontroller with built-in Wi-Fi, Bluetooth, and SPI/LoRa support for underground tunnels.',
    howItMeasures:
      'Samples digital signals (GPIO 4), I2C packets (GPIO 21/22), and 12-bit analog voltage readings (GPIO 34) every second, computes rate-of-rise trends, and transmits telemetry packets.',
    workInProject:
      'Acts as the underground edge-computing brain—running local predictive threshold checks with zero latency and streaming real-time data to the surface dashboard.',
    wires: [
      { from: 'ESP32 VIN & GND', to: '5V Red Rail & Blue GND Rail', color: 'Red & Black', role: 'Board Power & Ground' },
      { from: 'ESP32 3V3 Pin', to: 'Top Breadboard 3.3V Rail', color: 'Red (#ef4444)', role: 'Supplies 3.3V to DHT22 & IR Sensor' },
      { from: 'GPIO 4, 21, 22, 34', to: 'DHT22, MLX90614 & MQ-135', color: 'Green / Blue / Yellow / Orange', role: 'Reads All 3 Underground Sensors' },
      { from: 'ESP32 GPIO 26', to: '5V Relay IN Pin', color: 'Purple (#a855f7)', role: 'Triggers Cooling Fan ON/OFF' }
    ],
    summary:
      'The central microcontroller that reads all three sensors, streams live telemetry over Wi-Fi/MQTT to the Cloud AI, and controls the cooling relay.'
  },
  relay: {
    title: '1-Channel 5V Optocoupler Relay Module',
    badge: 'Zero-Latency Automated Actuator Switch',
    voltage: '5V Coil / 12V Contact Load',
    pin: 'IN ← GPIO 26 | COM & NO → 12V Fan',
    protocol: 'Opto-Isolated GPIO Trigger',
    whatItIs:
      'An electrically isolated electromagnetic switch that allows a tiny 3.3V microcontroller signal to safely turn high-power 12V/230V ventilation equipment ON or OFF.',
    howItMeasures:
      'Uses an internal infrared optocoupler LED to detect the HIGH/LOW logic signal from ESP32 GPIO 26 and snaps its mechanical copper contacts closed in under 10 milliseconds.',
    workInProject:
      'Eliminates human response delay by automatically actuating cooling and ventilation fans the instant a future thermal or gas hazard is predicted.',
    wires: [
      { from: 'Relay DC+ & DC-', to: '5V Red Rail & Blue GND Rail', color: 'Red & Black', role: 'Powers Relay Switching Coil' },
      { from: 'Relay IN Pin', to: 'ESP32-S3 GPIO 26', color: 'Purple (#a855f7)', role: 'Receives HIGH/LOW Control Signal' },
      { from: 'Relay COM & NO', to: '12V UPS (+) & Fan (+12V)', color: 'Red (#dc2626)', role: 'Closes 12V Circuit When AI Boosts Cooling' }
    ],
    summary:
      'Safely isolates the 3.3V ESP32 logic pin from the 12V high-current fan circuit. Watch its green LED light up whenever the fan is ON!'
  },
  fan: {
    title: '12V DC Brushless Ventilation Fan',
    badge: 'Active Thermal & Gas Dilution Actuator',
    voltage: '12.0V DC (2.5A)',
    pin: '+12V ← Relay NO | -GND ← UPS GND',
    protocol: 'Relay / PWM Speed Control',
    whatItIs:
      'A high-static-pressure brushless DC ventilation blower representing underground mine intake and exhaust fans.',
    howItMeasures:
      'Operates at 30% Eco speed during safe conditions to conserve energy, and ramps immediately to 100% maximum airflow (CFM) when triggered by the Predictive AI relay.',
    workInProject:
      'Flushes out trapped geothermal heat and hazardous gases before tunnel conditions become unsafe—preventing heatstroke and fatigue accidents.',
    wires: [
      { from: 'Fan Red Wire (+12V)', to: 'Relay NO (Normally Open)', color: 'Red (#dc2626)', role: 'Receives 12V When Relay Switches ON' },
      { from: 'Fan Black Wire (GND)', to: '12V UPS Common Ground', color: 'Black (#1e293b)', role: 'Return Ground Path' }
    ],
    summary:
      'Synchronized with the cave above: stops completely when Fan OFF mode is clicked, spins gently in 30% Eco mode, and spins at full speed during 100% AI Boost!'
  },
  cloud: {
    title: 'Cloud MQTT Broker & Safety Officer Dashboard',
    badge: 'Centralized Control Room & Compliance Hub',
    voltage: 'Wi-Fi / Cloud Server',
    pin: 'Topic: minesafe/zoneB/telemetry',
    protocol: 'MQTT + WebSockets + React UI',
    whatItIs:
      'A centralized cloud telemetry server and real-time web interface designed for mine safety officers and supervisors.',
    howItMeasures:
      'Ingests live JSON sensor streams every second, runs predictive slope-forecasting algorithms over a 10-minute lookahead window, and archives timestamped compliance logs.',
    workInProject:
      'Gives safety officers real-time visibility across all mine sections, historical trend analysis, early hazard alerts, and regulatory-compliance record-keeping.',
    wires: [
      { from: 'ESP32 Wi-Fi Antenna', to: 'Cloud MQTT & AI Engine', color: 'Cyan Dashed (#38bdf8)', role: 'Wireless Telemetry & 10-Min Heat Forecast' }
    ],
    summary:
      'Receives wireless JSON packets from the ESP32 every second, runs the 10-minute predictive thermal model, and displays this live web dashboard.'
  },
  dashboard: {
    title: 'Cloud MQTT Broker & Safety Officer Dashboard',
    badge: 'Centralized Control Room & Compliance Hub',
    voltage: 'Wi-Fi / Cloud Server',
    pin: 'Topic: minesafe/zoneB/telemetry',
    protocol: 'MQTT + WebSockets + React UI',
    whatItIs:
      'A centralized cloud telemetry server and real-time web interface designed for mine safety officers and supervisors.',
    howItMeasures:
      'Ingests live JSON sensor streams every second, runs predictive slope-forecasting algorithms over a 10-minute lookahead window, and archives timestamped compliance logs.',
    workInProject:
      'Gives safety officers real-time visibility across all mine sections, historical trend analysis, early hazard alerts, and regulatory-compliance record-keeping.',
    wires: [
      { from: 'ESP32 Wi-Fi Antenna', to: 'Cloud MQTT & AI Engine', color: 'Cyan Dashed (#38bdf8)', role: 'Wireless Telemetry & 10-Min Heat Forecast' }
    ],
    summary:
      'Displays live cave visuals, sensor health, 10-minute AI heat predictions, worker safety status, and manual emergency override controls for mine supervisors.'
  }
};

const PROJECT_OBJECTIVES = [
  {
    num: '01',
    title: 'Continuous Multi-Parameter IoT Monitoring',
    desc: 'Low-cost real-time tracking of temperature, humidity (DHT22), rock heat (MLX90614 IR), airflow & hazardous gases (MQ-135).'
  },
  {
    num: '02',
    title: 'Advance Predictive Hazard Forecasting',
    desc: 'Predicts thermal or gas hazards 10 minutes ahead using rate-of-rise trends—instead of waiting until after danger strikes.'
  },
  {
    num: '03',
    title: 'Zero-Latency Automated Ventilation Actuation',
    desc: 'Automatically triggers the 5V Relay & 12V fans based on predicted unsafe conditions, cutting cooling response delay.'
  },
  {
    num: '04',
    title: 'Worker Heat-Stress & Gas Incident Prevention',
    desc: 'Reduces heatstroke, fatigue-related errors, and toxic gas exposure among underground miners.'
  },
  {
    num: '05',
    title: 'Modular, Low-Cost & Retrofittable Hardware',
    desc: 'Built on solderless breadboard + ESP32-S3 (~$18 node cost), easily retrofitted into small and medium-scale mines.'
  },
  {
    num: '06',
    title: 'Centralized Officer Dashboard & Compliance Logs',
    desc: 'Provides real-time visibility, historical trend graphs, and automated safety record-keeping for regulatory compliance.'
  }
];

export default function App() {
  // Core Simulation States
  const [currentTemp, setCurrentTemp] = useState(25.3);
  const [rockTemp, setRockTemp] = useState(26.8);
  const [humidity, setHumidity] = useState(52);
  const [gasPpm, setGasPpm] = useState(380); // MQ-135 CO2/Gas concentration in PPM (Safe < 700 ppm)
  const [airflowMps, setAirflowMps] = useState(1.4); // Tunnel airflow m/s
  const [predictedTemp, setPredictedTemp] = useState(25.6);
  const [predictedGasPpm, setPredictedGasPpm] = useState(390);
  const [fanSpeed, setFanSpeed] = useState(30); // 0%, 30% Eco, 100% Boost
  const [fanPowerOn, setFanPowerOn] = useState(true);
  const [autoAiEnabled, setAutoAiEnabled] = useState(true);
  const [heatSpikeActive, setHeatSpikeActive] = useState(false);

  // Chart History (18 points)
  const [actualHistory, setActualHistory] = useState(Array(18).fill(25.3));
  const [predHistory, setPredHistory] = useState(Array(18).fill(25.6));

  // Centralized Safety Officer Compliance & Event Log
  const [complianceLogs, setComplianceLogs] = useState([
    {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SAFE',
      event: 'System Boot: Multi-parameter monitoring active (DHT22, MLX90614 IR, MQ-135). Eco Ventilation 30%.'
    }
  ]);

  // Story Demo State
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [subtitleText, setSubtitleText] = useState(
    'All 6 Objectives Active: Monitoring Temp, Humidity, Rock IR & Gas PPM in real time. Try "Simulate Hazard (AI ON)" or "Fan OFF"!'
  );

  // Hardware Inspector & Wiring Lab State
  const [selectedHardware, setSelectedHardware] = useState('esp');
  const [modalHardware, setModalHardware] = useState(null);
  const [wiringFilter, setWiringFilter] = useState('all');
  const [showPinLabels, setShowPinLabels] = useState(true);

  const storyTimersRef = useRef([]);
  const lastLogCategoryRef = useRef('SAFE');

  const addComplianceLog = (type, event) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setComplianceLogs((prev) => [{ time: nowStr, type, event }, ...prev].slice(0, 6));
  };

  // ================= LIVE SIMULATION LOOP (EVERY 0.9s) =================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemp((prevTemp) => {
        let nextTemp = prevTemp;
        let nextRock = rockTemp;
        let nextGas = gasPpm;

        if (!fanPowerOn) {
          // FAN IS OFF: Geothermal heat + stagnant hazardous gases accumulate together!
          nextRock = Math.min(52.0, prevTemp + 5.5);
          nextTemp = Math.min(46.2, prevTemp + 1.55);
          nextGas = Math.min(1650, gasPpm + 85);
        } else if (heatSpikeActive) {
          // Drilling & pocket gas release in Zone B -> Predictive AI boosts fan to 100% BEFORE danger!
          nextRock = Math.min(42.0, rockTemp + 1.3);
          if (autoAiEnabled && fanSpeed === 100) {
            nextTemp = prevTemp + (nextRock > 36 ? 0.2 : -0.45);
            nextGas = Math.max(460, gasPpm + (nextRock > 36 ? 12 : -35));
            if (nextTemp <= 26.8 && nextRock >= 38) {
              nextTemp = 26.6 + (Math.random() * 0.4 - 0.2);
            }
          } else {
            nextTemp = Math.min(45.0, prevTemp + 1.2);
            nextGas = Math.min(1500, gasPpm + 65);
          }
        } else {
          // Normal operation or post-rescue recovery
          const coolRate = prevTemp > 32 ? 1.85 : 0.35;
          nextRock = rockTemp + (26.5 - rockTemp) * 0.3 + (Math.random() * 0.2 - 0.1);
          nextGas = Math.max(375, gasPpm - (gasPpm > 450 ? 95 : 15) + (Math.random() * 10 - 5));
          if (prevTemp > 25.5) {
            nextTemp = Math.max(25.2, prevTemp - coolRate);
          } else {
            nextTemp = prevTemp + (25.2 - prevTemp) * 0.28 + (Math.random() * 0.2 - 0.1);
          }
        }

        const nextHumidity = Math.min(95, Math.round(50 + (nextTemp - 24) * 1.6));
        const rateOfRise = Math.max(0, nextTemp - prevTemp);
        const rockInfluence = Math.max(0, (nextRock - nextTemp) * 0.5);
        const nextPredTemp = Number((nextTemp + rockInfluence + rateOfRise * 4.2).toFixed(1));

        const gasRise = Math.max(0, nextGas - gasPpm);
        const nextPredGas = Math.round(nextGas + gasRise * 3.8 + (heatSpikeActive ? 140 : 0));

        // Decide Fan Speed & Airflow (Zero-latency actuation on predicted thermal OR gas hazard)
        let nextFan = 30;
        if (!fanPowerOn) {
          nextFan = 0;
        } else if (
          autoAiEnabled &&
          (nextPredTemp >= 29.0 || nextPredGas >= 650 || nextTemp >= 28.0 || heatSpikeActive)
        ) {
          nextFan = 100;
        } else {
          nextFan = 30;
        }

        const nextAirflow = nextFan === 100 ? 3.8 : nextFan === 30 ? 1.4 : 0.1;

        // Log major state transitions to Compliance Log
        const currentCategory = !fanPowerOn
          ? nextTemp >= 42
            ? 'CRITICAL'
            : 'WARNING'
          : nextFan === 100
          ? 'PREDICTED'
          : 'SAFE';

        if (currentCategory !== lastLogCategoryRef.current) {
          lastLogCategoryRef.current = currentCategory;
          if (currentCategory === 'CRITICAL') {
            addComplianceLog(
              'CRITICAL',
              `CRITICAL HAZARD: Temp ${nextTemp.toFixed(1)}°C & Gas ${Math.round(nextGas)} PPM! Workers collapsed — Ventilation OFF.`
            );
          } else if (currentCategory === 'WARNING') {
            addComplianceLog(
              'WARNING',
              `VENTILATION LOSS: Fan OFF! Predictive model forecasts ${nextPredTemp}°C & ${nextPredGas} PPM within 10 mins.`
            );
          } else if (currentCategory === 'PREDICTED') {
            addComplianceLog(
              'PREDICTED',
              `AI EARLY ACTUATION (<10ms): Predicted ${nextPredTemp}°C / ${nextPredGas} PPM hazard — Relay boosted Fan to 100%.`
            );
          } else {
            addComplianceLog(
              'SAFE',
              `HAZARD CLEARED: Air stabilized at ${nextTemp.toFixed(1)}°C & ${Math.round(nextGas)} PPM. Fan returned to 30% Eco.`
            );
          }
        }

        setRockTemp(nextRock);
        setHumidity(nextHumidity);
        setGasPpm(Math.round(nextGas));
        setAirflowMps(nextAirflow);
        setPredictedTemp(nextPredTemp);
        setPredictedGasPpm(nextPredGas);
        setFanSpeed(nextFan);

        setActualHistory((hist) => [...hist.slice(1), Number(nextTemp.toFixed(1))]);
        setPredHistory((hist) => [...hist.slice(1), nextPredTemp]);

        return nextTemp;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [fanPowerOn, heatSpikeActive, rockTemp, gasPpm, fanSpeed, autoAiEnabled]);

  // ================= STORY DEMO TIMERS =================
  const clearStoryTimers = () => {
    storyTimersRef.current.forEach((id) => clearTimeout(id));
    storyTimersRef.current = [];
  };

  const stopStoryDemo = () => {
    clearStoryTimers();
    setStoryPlaying(false);
    setStoryStep(0);
  };

  const handleNormalMode = () => {
    stopStoryDemo();
    setFanPowerOn(true);
    setAutoAiEnabled(true);
    setHeatSpikeActive(false);
    setCurrentTemp(25.3);
    setRockTemp(26.5);
    setGasPpm(380);
    setFanSpeed(30);
    setSubtitleText(
      'Normal Operation: Temp (25.3°C), Humidity (52%), Airflow (1.4 m/s) & Gas (380 PPM) are safe in 30% Eco mode.'
    );
  };

  const handleHeatSpikeAI = () => {
    stopStoryDemo();
    setFanPowerOn(true);
    setAutoAiEnabled(true);
    setHeatSpikeActive(true);
    setGasPpm(540);
    setSubtitleText(
      'Thermal & Gas Hazard Simulated! IR + MQ-135 detect early rise—AI predicts danger 10 mins early and actuates Fan to 100%!'
    );
  };

  const handleFanOffFailure = () => {
    stopStoryDemo();
    setFanPowerOn(false);
    setHeatSpikeActive(false);
    setFanSpeed(0);
    setSubtitleText(
      'Fan is OFF (0%)! Without automated actuation, heat & toxic gas accumulate rapidly—causing worker fatigue and collapse!'
    );
  };

  const handleEmergencyRescue = () => {
    stopStoryDemo();
    setFanPowerOn(true);
    setAutoAiEnabled(true);
    setHeatSpikeActive(false);
    setFanSpeed(100);
    setSubtitleText(
      'Emergency Ventilation Restored! 100% airflow flushes toxic gas & heat, reviving all workers and logging compliance recovery.'
    );
  };

  const handleToggleStoryDemo = () => {
    if (storyPlaying) {
      handleNormalMode();
      return;
    }

    clearStoryTimers();
    setStoryPlaying(true);

    // Stage 1 (0 - 5s): Normal Multi-Parameter Monitoring
    setStoryStep(1);
    setFanPowerOn(true);
    setAutoAiEnabled(true);
    setHeatSpikeActive(false);
    setCurrentTemp(25.3);
    setRockTemp(26.5);
    setGasPpm(380);
    setSubtitleText(
      '1. Real-Time Monitoring: DHT22, MLX90614 IR & MQ-135 continuously track heat, humidity, airflow & gas at 30% Eco power.'
    );

    // Stage 2 (5 - 15s): Without Automated Actuation (Fan OFF)
    const t2 = setTimeout(() => {
      setStoryStep(2);
      setFanPowerOn(false);
      setCurrentTemp(31.2);
      setRockTemp(36.5);
      setGasPpm(790);
      setSubtitleText(
        '2. Without Predictive Actuation (Fan OFF): Heat & gas build up past 36°C / 1100 PPM—causing worker exhaustion & collapse!'
      );
    }, 5000);

    // Stage 3 (15 - 22s): Predictive AI Zero-Latency Actuation
    const t3 = setTimeout(() => {
      setStoryStep(3);
      setFanPowerOn(true);
      setAutoAiEnabled(true);
      setHeatSpikeActive(false);
      setSubtitleText(
        '3. Zero-Latency Predictive Actuation: Relay switches 12V Fan to 100% (<10ms), flushing heat & gas to revive workers!'
      );
    }, 15000);

    // Stage 4 (22 - 28s): Safe & Logged on Officer Dashboard
    const t4 = setTimeout(() => {
      setStoryStep(4);
      setCurrentTemp(25.4);
      setRockTemp(26.5);
      setGasPpm(385);
      setSubtitleText(
        '4. Safe & Logged: Tunnel returns to 30% Eco mode with all events archived on the Safety Officer Compliance Dashboard!'
      );
    }, 22000);

    const tEnd = setTimeout(() => {
      setStoryPlaying(false);
      setStoryStep(0);
    }, 28000);

    storyTimersRef.current = [t2, t3, t4, tEnd];
  };

  useEffect(() => {
    return () => clearStoryTimers();
  }, []);

  // ================= DERIVED WORKER HEALTH STAGE =================
  // Considers BOTH thermal heat AND hazardous gas buildup!
  const workerStage =
    currentTemp >= 42.0 || gasPpm >= 1350
      ? 4
      : currentTemp >= 36.0 || gasPpm >= 950
      ? 3
      : currentTemp >= 30.0 || gasPpm >= 680
      ? 2
      : 1;

  const heatOpacity = Math.max(0, Math.min(0.92, (currentTemp - 26.5) / 14));

  // Helper for SVG Line Chart coordinates (20°C to 46°C)
  const buildPolyline = (arr) => {
    const startX = 36;
    const width = 310;
    const stepX = width / (arr.length - 1);
    return arr
      .map((val, idx) => {
        const clamped = Math.max(20, Math.min(46, val));
        const y = 120 - ((clamped - 20) / 26) * 104;
        return `${(startX + idx * stepX).toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Helper to select a hardware node AND open the detailed explanation popup
  const openHardwareInspector = (hwKey) => {
    setSelectedHardware(hwKey);
    setModalHardware(hwKey);
  };

  const activeHw = HARDWARE_DETAILS[selectedHardware] || HARDWARE_DETAILS.esp;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes spinFan {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .fan-spin-fast {
          transform-origin: 185px 380px;
          animation: spinFan 0.28s linear infinite;
        }
        .fan-spin-eco {
          transform-origin: 185px 380px;
          animation: spinFan 2.2s linear infinite;
        }
        .tinker-fan-fast {
          transform-origin: 915px 415px;
          animation: spinFan 0.25s linear infinite;
        }
        .tinker-fan-eco {
          transform-origin: 915px 415px;
          animation: spinFan 1.8s linear infinite;
        }
        @keyframes sirenFlash {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.78; }
        }
        .siren-pulse {
          animation: sirenFlash 0.65s ease-in-out infinite;
        }
        @keyframes drillShake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2px, -1px) rotate(1.5deg); }
          50% { transform: translate(-1px, 1px) rotate(-1deg); }
          75% { transform: translate(2px, 1px) rotate(1deg); }
        }
        .miner-drilling {
          animation: drillShake 0.18s infinite;
        }
        @keyframes sparkPop {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(18px, -18px) scale(0.2); }
        }
        .spark-1 { animation: sparkPop 0.6s ease-out infinite; }
        .spark-2 { animation: sparkPop 0.6s ease-out 0.2s infinite; }
        .spark-3 { animation: sparkPop 0.6s ease-out 0.4s infinite; }
        @keyframes minerWalk {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2.5px); }
        }
        .miner-bob {
          animation: minerWalk 0.9s ease-in-out infinite;
        }
        @keyframes heatRise {
          0% { opacity: 0; transform: translateY(12px) scaleX(0.95); }
          50% { opacity: 0.85; }
          100% { opacity: 0; transform: translateY(-28px) scaleX(1.05); }
        }
        .heat-wave { animation: heatRise 2s ease-in-out infinite; }
        .heat-wave-delay { animation: heatRise 2s ease-in-out 0.9s infinite; }
        @keyframes windBlow {
          0% { stroke-dashoffset: 60; opacity: 0.25; }
          50% { opacity: 0.95; }
          100% { stroke-dashoffset: 0; opacity: 0.25; }
        }
        .cool-wind-fast {
          stroke-dasharray: 18 12;
          animation: windBlow 0.55s linear infinite;
        }
        .cool-wind-eco {
          stroke-dasharray: 18 12;
          animation: windBlow 1.9s linear infinite;
        }
        @keyframes radioPulse {
          0% { opacity: 0; transform: translateY(0px) scale(0.85); }
          40% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-35px) scale(1.15); }
        }
        .radio-wave-1 { animation: radioPulse 1.8s ease-out infinite; }
        .radio-wave-2 { animation: radioPulse 1.8s ease-out 0.6s infinite; }
        .radio-wave-3 { animation: radioPulse 1.8s ease-out 1.2s infinite; }
        @keyframes flowWire {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        .wire-flow {
          stroke-dasharray: 8 8;
          animation: flowWire 1.1s linear infinite;
        }
        .wire-flow-reverse {
          stroke-dasharray: 8 8;
          animation: flowWire 1.1s linear infinite reverse;
        }
        @keyframes ledBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        .led-blink { animation: ledBlink 1s infinite; }
        .clickable-node {
          cursor: pointer;
          transition: filter 0.2s ease;
        }
        .clickable-node:hover {
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.85));
        }
      `}</style>

      {/* ================= 1. TOP HEADER & DEMO CONTROLS ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  MineSafe Thermal AI
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Modular IoT Node ($18.50) • Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Predictive Thermal & Hazardous Gas Management System for Underground Mining
              </p>
            </div>
          </div>

          {/* 4 Interactive Demo Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleStoryDemo}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              {storyPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{storyPlaying ? 'Stop Auto Demo' : 'Play 6-Objective Demo'}</span>
            </button>

            <button
              onClick={handleNormalMode}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Normal Eco Mode</span>
            </button>

            <button
              onClick={handleHeatSpikeAI}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Simulate Heat & Gas Spike</span>
            </button>

            <button
              onClick={handleFanOffFailure}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Fan OFF / Failure Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="max-w-7xl w-full mx-auto px-4 py-4 flex-1 flex flex-col gap-5">
        {/* TOP GRID: 2D CAVE SIMULATION (8 COLS) + RIGHT AI PANEL (4 COLS) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {/* 2. ANIMATED 2D CAVE CUTAWAY SIMULATION */}
          <div className="xl:col-span-8 bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex flex-col relative">
            {/* Top-Left Hint Pill */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-200">
                👆 Click any IoT Sensor inside the cave to inspect it!
              </span>
            </div>

            {/* Top-Right Live Status Badge */}
            <div
              className={`absolute top-3 right-3 z-10 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md transition-all duration-300 ${
                !fanPowerOn
                  ? 'bg-rose-600 text-white animate-bounce'
                  : fanSpeed === 100
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {!fanPowerOn
                ? workerStage === 4
                  ? `🚨 CRITICAL HEATSTROKE (${currentTemp.toFixed(1)}°C)`
                  : `⚠️ FAN OFF — TEMP RISING (${currentTemp.toFixed(1)}°C)`
                : fanSpeed === 100
                ? `⚡ AI COOLING 100% ACTIVE (${currentTemp.toFixed(1)}°C)`
                : `✅ CAVE SAFE & COOL (${currentTemp.toFixed(1)}°C)`}
            </div>

            {/* Emergency Rescue Overlay Button when Workers Collapse */}
            {workerStage === 4 && (
              <div className="absolute inset-x-0 top-14 z-20 flex justify-center px-4">
                <button
                  onClick={handleEmergencyRescue}
                  className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 font-extrabold text-sm sm:text-base shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce cursor-pointer"
                >
                  <span>🚨🚑</span>
                  <span>Turn ON Emergency AI Cooling & Save Workers!</span>
                </button>
              </div>
            )}

            {/* SVG CAVE ARTWORK */}
            <div className="w-full relative select-none">
              <svg viewBox="0 0 920 530" className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                  </linearGradient>
                  <linearGradient id="earthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="35%" stopColor="#57534e" />
                    <stop offset="100%" stopColor="#292524" />
                  </linearGradient>
                  <linearGradient id="caveBgGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <radialGradient id="heatGlowGrad" cx="0.65" cy="0.6" r="0.65">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
                    <stop offset="55%" stopColor="#f97316" stopOpacity="0.58" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.18" />
                  </radialGradient>
                  <linearGradient id="coolAirGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* ABOVE GROUND SKY & HILLS */}
                <rect x="0" y="0" width="920" height="155" fill="url(#skyGrad)" />
                <g fill="#ffffff" opacity="0.9">
                  <circle cx="95" cy="42" r="18" />
                  <circle cx="115" cy="38" r="22" />
                  <circle cx="138" cy="44" r="16" />
                  <circle cx="520" cy="35" r="15" />
                  <circle cx="538" cy="32" r="19" />
                  <circle cx="556" cy="37" r="14" />
                  <circle cx="810" cy="48" r="16" />
                  <circle cx="830" cy="44" r="20" />
                  <circle cx="850" cy="49" r="15" />
                </g>
                <path d="M0,135 Q180,95 380,130 T750,122 T920,132 L920,160 L0,160 Z" fill="#4ade80" />
                <path d="M0,142 Q260,118 520,140 T920,138 L920,165 L0,165 Z" fill="#22c55e" />

                {/* Trees */}
                <g transform="translate(55, 102)">
                  <rect x="11" y="22" width="6" height="16" fill="#78350f" />
                  <circle cx="14" cy="16" r="14" fill="#15803d" />
                  <circle cx="7" cy="20" r="10" fill="#16a34a" />
                  <circle cx="21" cy="20" r="10" fill="#16a34a" />
                </g>
                <g transform="translate(845, 104)">
                  <rect x="11" y="22" width="6" height="16" fill="#78350f" />
                  <circle cx="14" cy="16" r="14" fill="#15803d" />
                </g>

                {/* Mine Shaft Surface Headframe */}
                <g transform="translate(155, 72)">
                  <polygon points="10,72 28,15 46,72" fill="none" stroke="#475569" strokeWidth="4" />
                  <line x1="17" y1="45" x2="39" y2="45" stroke="#475569" strokeWidth="3" />
                  <circle cx="28" cy="15" r="8" fill="#f59e0b" stroke="#1e293b" strokeWidth="2.5" />
                  <rect x="4" y="68" width="48" height="8" rx="2" fill="#334155" />
                  <text x="28" y="88" textAnchor="middle" fontSize="10" fontWeight="800" fill="#064e3b">
                    AIR SHAFT
                  </text>
                </g>

                {/* AI CLOUD CONTROL HUB (ABOVE GROUND) */}
                <g transform="translate(355, 38)" className="clickable-node" onClick={() => setModalHardware('cloud')}>
                  <rect x="0" y="34" width="130" height="72" rx="10" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
                  <rect x="0" y="34" width="130" height="20" rx="8" fill="#1e293b" />
                  <text x="65" y="48" textAnchor="middle" fontSize="10" fontWeight="800" fill="#38bdf8">
                    AI CLOUD HUB
                  </text>
                  <rect x="12" y="60" width="106" height="36" rx="6" fill="#0f172a" />
                  <text
                    x="65"
                    y="75"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill={!fanPowerOn ? '#f87171' : fanSpeed === 100 ? '#facc15' : '#4ade80'}
                  >
                    {!fanPowerOn
                      ? 'ALERT: FAN OFF!'
                      : fanSpeed === 100
                      ? 'HEAT PREDICTED!'
                      : 'PREDICTION: SAFE'}
                  </text>
                  <text x="65" y="89" textAnchor="middle" fontSize="9" fontWeight="600" fill="#cbd5e1">
                    {!fanPowerOn ? 'Cooling: 0% OFF' : fanSpeed === 100 ? 'Fans: 100% MAX' : 'Fans: 30% Eco'}
                  </text>
                  <line x1="65" y1="34" x2="65" y2="16" stroke="#334155" strokeWidth="3.5" />
                  <path d="M48,14 Q65,28 82,14" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="65" cy="14" r="4" fill="#38bdf8" className="led-blink" />
                </g>

                {/* UNDERGROUND EARTH & CAVE */}
                <rect x="0" y="152" width="920" height="378" fill="url(#earthGrad)" />
                <path d="M0,210 Q240,195 480,215 T920,205" fill="none" stroke="#44403c" strokeWidth="3" opacity="0.6" />
                <path d="M0,475 Q300,460 600,480 T920,470" fill="none" stroke="#1c1917" strokeWidth="4" opacity="0.7" />
                <rect x="162" y="148" width="46" height="145" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />

                {/* Cave Cavern */}
                <path
                  d="M90,260 Q140,235 230,245 Q360,230 500,248 Q660,225 815,245 Q865,260 865,345 Q865,435 810,448 L110,448 Q75,435 75,350 Q75,280 90,260 Z"
                  fill="url(#caveBgGrad)"
                  stroke="#0f172a"
                  strokeWidth="5"
                />

                {/* Heat Glow Overlay */}
                <path
                  d="M90,260 Q140,235 230,245 Q360,230 500,248 Q660,225 815,245 Q865,260 865,345 Q865,435 810,448 L110,448 Q75,435 75,350 Q75,280 90,260 Z"
                  fill="url(#heatGlowGrad)"
                  opacity={heatOpacity}
                />

                {/* Critical Red Siren Overlay at Stage 4 */}
                {workerStage === 4 && (
                  <path
                    d="M90,260 Q140,235 230,245 Q360,230 500,248 Q660,225 815,245 Q865,260 865,345 Q865,435 810,448 L110,448 Q75,435 75,350 Q75,280 90,260 Z"
                    fill="#ef4444"
                    className="siren-pulse"
                  />
                )}

                {/* Cool Air Overlay */}
                <rect
                  x="210"
                  y="265"
                  width="540"
                  height="170"
                  rx="40"
                  fill="url(#coolAirGrad)"
                  opacity={!fanPowerOn ? 0 : fanSpeed === 100 ? 0.72 : 0.32}
                />

                {/* Zone Labels */}
                <line x1="475" y1="248" x2="475" y2="446" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
                <rect x="235" y="254" width="165" height="22" rx="11" fill="#0f172a" opacity="0.78" />
                <text x="317" y="269" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#93c5fd">
                  ZONE A: TUNNEL & VENT
                </text>
                <rect x="575" y="254" width="195" height="22" rx="11" fill="#0f172a" opacity="0.78" />
                <text x="672" y="269" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fcd34d">
                  ZONE B: DEEP DIGGING AREA
                </text>

                {/* Wooden Support Beams */}
                <g fill="#92400e" stroke="#451a03" strokeWidth="2">
                  <rect x="245" y="246" width="14" height="200" />
                  <rect x="445" y="248" width="14" height="198" />
                  <rect x="240" y="244" width="224" height="13" rx="3" />
                  <rect x="515" y="248" width="14" height="198" />
                  <rect x="745" y="244" width="14" height="202" />
                  <rect x="510" y="244" width="254" height="13" rx="3" />
                </g>

                {/* Cave Lanterns */}
                <g transform="translate(263, 285)">
                  <circle cx="8" cy="12" r="14" fill="#fef08a" opacity="0.25" />
                  <rect x="4" y="6" width="8" height="12" rx="2" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
                </g>
                <g transform="translate(533, 285)">
                  <circle cx="8" cy="12" r="14" fill="#fef08a" opacity="0.25" />
                  <rect x="4" y="6" width="8" height="12" rx="2" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
                </g>

                {/* Cave Floor & Rail Track */}
                <rect x="92" y="438" width="755" height="10" rx="4" fill="#475569" />
                <line x1="115" y1="437" x2="730" y2="437" stroke="#94a3b8" strokeWidth="3" />

                {/* COOLING FAN & WIND STREAMS */}
                <g className="clickable-node" onClick={() => setModalHardware('fan')}>
                  <rect
                    x="145"
                    y="335"
                    width="80"
                    height="90"
                    rx="14"
                    fill="#1e293b"
                    stroke={fanPowerOn ? '#38bdf8' : '#ef4444'}
                    strokeWidth="3"
                  />
                  <circle cx="185" cy="380" r="32" fill="#0f172a" stroke="#64748b" strokeWidth="2.5" />
                  <g className={!fanPowerOn ? '' : fanSpeed === 100 ? 'fan-spin-fast' : 'fan-spin-eco'}>
                    <ellipse cx="185" cy="362" rx="6" ry="15" fill="#38bdf8" />
                    <ellipse cx="185" cy="398" rx="6" ry="15" fill="#38bdf8" />
                    <ellipse cx="167" cy="380" rx="15" ry="6" fill="#0284c7" />
                    <ellipse cx="203" cy="380" rx="15" ry="6" fill="#0284c7" />
                    <circle cx="185" cy="380" r="6" fill="#e2e8f0" />
                  </g>
                  <rect
                    x="126"
                    y="310"
                    width="118"
                    height="20"
                    rx="10"
                    fill={fanPowerOn ? '#0284c7' : '#dc2626'}
                  />
                  <text x="185" y="324" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff">
                    {!fanPowerOn
                      ? '⛔ FAN: OFF (0%)'
                      : fanSpeed === 100
                      ? '🌀 FAN: 100% BOOST'
                      : '🌀 FAN: 30% ECO'}
                  </text>
                </g>

                {/* Cool Wind Streams */}
                {fanPowerOn && (
                  <g
                    stroke="#38bdf8"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    opacity={fanSpeed === 100 ? 1 : 0.55}
                  >
                    <path
                      d="M235,355 Q310,342 385,355 T535,355 T685,355"
                      className={fanSpeed === 100 ? 'cool-wind-fast' : 'cool-wind-eco'}
                    />
                    <path
                      d="M245,382 Q325,395 405,382 T565,382 T715,382"
                      className={fanSpeed === 100 ? 'cool-wind-fast' : 'cool-wind-eco'}
                    />
                    <path
                      d="M235,408 Q305,398 375,408 T515,408 T655,408"
                      className={fanSpeed === 100 ? 'cool-wind-fast' : 'cool-wind-eco'}
                    />
                  </g>
                )}

                {/* Rising Heat Waves */}
                {currentTemp >= 29.5 && (
                  <g stroke="#fb923c" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M360,415 Q352,400 360,385 T360,355" className="heat-wave" />
                    <path d="M540,418 Q532,403 540,388 T540,358" className="heat-wave-delay" />
                    <path d="M680,415 Q672,400 680,385 T680,355" className="heat-wave" />
                    <path d="M815,410 Q807,395 815,380 T815,350" className="heat-wave-delay" />
                  </g>
                )}

                {/* ================= 3 ANIMATED MINERS (4 THERMAL HEALTH STAGES) ================= */}
                {/* MINER 1: Deep Digging Area */}
                <g transform="translate(755, 355)">
                  {(workerStage === 1 || workerStage === 2) && (
                    <g>
                      <g className={workerStage === 1 ? 'miner-drilling' : ''}>
                        <rect x="8" y="32" width="24" height="32" rx="7" fill="#f97316" />
                        <line x1="13" y1="32" x2="13" y2="64" stroke="#fef08a" strokeWidth="3" />
                        <line x1="27" y1="32" x2="27" y2="64" stroke="#fef08a" strokeWidth="3" />
                        <rect x="10" y="62" width="8" height="20" rx="3" fill="#1e3a8a" />
                        <rect x="22" y="62" width="8" height="20" rx="3" fill="#1e3a8a" />
                        <circle cx="20" cy="20" r="11" fill="#fed7aa" />
                        <circle cx="24" cy="18" r="1.5" fill="#1e293b" />
                        <path
                          d={workerStage === 2 ? 'M20,25 Q24,22 27,25' : 'M20,23 Q24,26 27,23'}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path d="M8,16 Q20,3 32,16 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                        <rect x="28" y="11" width="5" height="5" rx="1" fill="#ffffff" />
                        <polygon points="33,12 65,4 65,22 33,15" fill="#fef08a" opacity="0.35" />
                        <rect x="26" y="40" width="28" height="10" rx="3" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
                        <line x1="54" y1="45" x2="72" y2="45" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                      </g>
                      {workerStage === 1 && (
                        <g>
                          <circle cx="72" cy="45" r="3" fill="#facc15" className="spark-1" />
                          <circle cx="72" cy="45" r="2.5" fill="#fb923c" className="spark-2" />
                          <circle cx="72" cy="45" r="2" fill="#ffffff" className="spark-3" />
                        </g>
                      )}
                      {workerStage === 2 && (
                        <g>
                          <path d="M4,12 Q1,18 4,20 Q7,18 4,12 Z" fill="#38bdf8" />
                          <path d="M36,8 Q33,14 36,16 Q39,14 36,8 Z" fill="#38bdf8" />
                        </g>
                      )}
                    </g>
                  )}

                  {workerStage === 3 && (
                    <g transform="translate(0, 26)">
                      <rect x="42" y="48" width="26" height="8" rx="2" fill="#64748b" transform="rotate(12 42 48)" />
                      <rect x="8" y="24" width="24" height="24" rx="7" fill="#f97316" transform="rotate(15 20 35)" />
                      <rect x="6" y="44" width="22" height="10" rx="4" fill="#1e3a8a" />
                      <circle cx="25" cy="16" r="10" fill="#fca5a5" />
                      <path d="M22,19 Q25,16 28,19" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                      <path d="M14,12 Q25,1 36,12 Z" fill="#facc15" />
                      <text x="25" y="-2" textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#fef08a">
                        💫 EXHAUSTED
                      </text>
                    </g>
                  )}

                  {workerStage === 4 && (
                    <g transform="translate(-15, 58)">
                      <path d="M-12,18 Q-4,8 4,18 Z" fill="#facc15" transform="rotate(-35 -4 15)" />
                      <rect x="18" y="10" width="32" height="14" rx="6" fill="#f97316" />
                      <rect x="50" y="11" width="22" height="12" rx="4" fill="#1e3a8a" />
                      <circle cx="10" cy="17" r="9.5" fill="#fca5a5" />
                      <text x="10" y="19" textAnchor="middle" fontSize="8" fontWeight="900" fill="#7f1d1d">
                        × ×
                      </text>
                      <g transform="translate(26, -24)">
                        <rect x="-18" y="0" width="54" height="18" rx="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                        <text x="9" y="12.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#ffffff">
                          ✚ SOS HEAT
                        </text>
                      </g>
                    </g>
                  )}
                </g>

                {/* MINER 2: Middle Tunnel Pushing Minecart */}
                <g transform="translate(495, 362)">
                  {(workerStage === 1 || workerStage === 2) && (
                    <g className="miner-bob">
                      <rect x="6" y="28" width="22" height="30" rx="6" fill="#eab308" />
                      <line x1="11" y1="28" x2="11" y2="58" stroke="#ffffff" strokeWidth="2.5" />
                      <rect x="8" y="56" width="7" height="19" rx="3" fill="#1e3a8a" />
                      <rect x="19" y="56" width="7" height="19" rx="3" fill="#1e3a8a" />
                      <circle cx="17" cy="17" r="10" fill="#fed7aa" />
                      <circle cx="21" cy="15" r="1.5" fill="#1e293b" />
                      <path
                        d={workerStage === 2 ? 'M17,22 Q21,19 24,22' : 'M17,20 Q21,23 24,20'}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path d="M6,13 Q17,1 28,13 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                      <line x1="24" y1="36" x2="42" y2="42" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
                      {workerStage === 2 && (
                        <g>
                          <path d="M2,10 Q-1,16 2,18 Q5,16 2,10 Z" fill="#38bdf8" />
                          <path d="M30,8 Q27,14 30,16 Q33,14 30,8 Z" fill="#38bdf8" />
                        </g>
                      )}
                    </g>
                  )}

                  {workerStage === 3 && (
                    <g transform="translate(-4, 24)">
                      <rect x="6" y="22" width="22" height="22" rx="6" fill="#eab308" transform="rotate(-14 17 32)" />
                      <rect x="8" y="40" width="20" height="10" rx="4" fill="#1e3a8a" />
                      <circle cx="13" cy="14" r="9.5" fill="#fca5a5" />
                      <path d="M10,17 Q13,14 16,17" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                      <path d="M3,10 Q13,0 23,10 Z" fill="#facc15" />
                      <text x="14" y="-3" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fef08a">
                        💦 DIZZY
                      </text>
                    </g>
                  )}

                  {workerStage === 4 && (
                    <g transform="translate(-35, 52)">
                      <path d="M48,17 Q56,7 64,17 Z" fill="#facc15" transform="rotate(30 56 14)" />
                      <rect x="2" y="11" width="20" height="11" rx="4" fill="#1e3a8a" />
                      <rect x="20" y="9" width="28" height="13" rx="5" fill="#eab308" />
                      <circle cx="54" cy="16" r="9" fill="#fca5a5" />
                      <text x="54" y="18" textAnchor="middle" fontSize="8" fontWeight="900" fill="#7f1d1d">
                        × ×
                      </text>
                      <g transform="translate(18, -22)">
                        <rect x="-14" y="0" width="46" height="17" rx="8.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                        <text x="9" y="12" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">
                          ✚ HELP!
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Minecart */}
                  <g transform="translate(38, 34)">
                    <polygon points="4,8 54,8 48,32 10,32" fill="#475569" stroke="#0f172a" strokeWidth="2" />
                    <path d="M10,8 Q28,-4 48,8 Z" fill="#1e293b" />
                    <circle cx="22" cy="4" r="3" fill="#38bdf8" />
                    <circle cx="34" cy="5" r="2.5" fill="#facc15" />
                    <circle cx="16" cy="36" r="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
                    <circle cx="42" cy="36" r="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
                  </g>
                </g>

                {/* MINER 3: Zone A Safety Inspector */}
                <g transform="translate(320, 362)">
                  {(workerStage === 1 || workerStage === 2) && (
                    <g className="miner-bob">
                      <rect x="6" y="28" width="22" height="30" rx="6" fill="#f97316" />
                      <rect x="8" y="56" width="7" height="19" rx="3" fill="#1e3a8a" />
                      <rect x="19" y="56" width="7" height="19" rx="3" fill="#1e3a8a" />
                      <circle cx="17" cy="17" r="10" fill="#fed7aa" />
                      <circle cx="14" cy="15" r="1.5" fill="#1e293b" />
                      <circle cx="20" cy="15" r="1.5" fill="#1e293b" />
                      <path
                        d={workerStage === 2 ? 'M14,22 Q17,19 20,22' : 'M14,20 Q17,23 20,20'}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path d="M6,13 Q17,1 28,13 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                      <rect x="22" y="34" width="12" height="16" rx="2" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
                      {workerStage === 2 && (
                        <path d="M2,10 Q-1,16 2,18 Q5,16 2,10 Z" fill="#38bdf8" />
                      )}
                    </g>
                  )}

                  {workerStage === 3 && (
                    <g transform="translate(0, 24)">
                      <rect x="6" y="22" width="22" height="22" rx="6" fill="#f97316" transform="rotate(14 17 32)" />
                      <rect x="6" y="40" width="20" height="10" rx="4" fill="#1e3a8a" />
                      <circle cx="21" cy="14" r="9.5" fill="#fca5a5" />
                      <path d="M18,17 Q21,14 24,17" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                      <path d="M11,10 Q21,0 31,10 Z" fill="#facc15" />
                    </g>
                  )}

                  {workerStage === 4 && (
                    <g transform="translate(-10, 52)">
                      <rect x="16" y="9" width="28" height="13" rx="5" fill="#f97316" />
                      <rect x="44" y="11" width="20" height="11" rx="4" fill="#1e3a8a" />
                      <circle cx="9" cy="16" r="9" fill="#fca5a5" />
                      <text x="9" y="18" textAnchor="middle" fontSize="8" fontWeight="900" fill="#7f1d1d">
                        × ×
                      </text>
                    </g>
                  )}
                </g>

                {/* ================= VISIBLE IOT SENSORS & SIGNAL WIRES IN CAVE ================= */}
                <g fill="none" strokeWidth="2.5">
                  <path d="M635,292 L370,292 L295,292" stroke="#38bdf8" opacity="0.4" />
                  <path d="M635,292 L370,292 L295,292" stroke="#38bdf8" className="wire-flow" />
                  <path d="M785,296 L650,292" stroke="#fb7185" opacity="0.4" />
                  <path d="M785,296 L650,292" stroke="#fb7185" className="wire-flow" />
                  <path d="M445,318 L295,302" stroke="#a78bfa" opacity="0.4" />
                  <path d="M445,318 L295,302" stroke="#a78bfa" className="wire-flow" />
                </g>

                {/* Command Wire from AI Tower Down Shaft to Smart Fan Relay */}
                <path d="M415,110 L415,185 L185,185 L185,310" fill="none" stroke="#4ade80" strokeWidth="3" opacity="0.35" />
                <path
                  d="M415,110 L415,185 L185,185 L185,310"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="3"
                  opacity={fanPowerOn ? 1 : 0.15}
                  className="wire-flow"
                />

                {/* SENSOR 1: DHT22 */}
                <g className="clickable-node" onClick={() => setModalHardware('dht')}>
                  <rect x="615" y="278" width="44" height="28" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                  <rect x="621" y="283" width="14" height="16" rx="2" fill="#38bdf8" />
                  <circle cx="647" cy="291" r="4" fill="#22c55e" className="led-blink" />
                  <rect x="572" y="310" width="130" height="22" rx="11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="637" y="325" textAnchor="middle" fontSize="10" fontWeight="800" fill="#38bdf8">
                    🌡️ {currentTemp.toFixed(1)}°C | {humidity}%
                  </text>
                </g>

                {/* SENSOR 2: MLX90614 IR Thermal Rock Sensor */}
                <g className="clickable-node" onClick={() => setModalHardware('ir')}>
                  <rect x="772" y="280" width="38" height="24" rx="6" fill="#1e293b" stroke="#f43f5e" strokeWidth="2.5" />
                  <circle cx="798" cy="292" r="5" fill="#f43f5e" className="led-blink" />
                  <polygon points="803,292 848,345 832,360" fill="#f43f5e" opacity="0.22" />
                  <line x1="803" y1="292" x2="840" y2="352" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" />
                  <rect x="742" y="255" width="98" height="20" rx="10" fill="#be123c" />
                  <text x="791" y="269" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff">
                    🔥 IR ROCK: {Math.round(rockTemp)}°C
                  </text>
                </g>

                {/* SENSOR 3: MQ-135 Gas & Airflow Sensor */}
                <g className="clickable-node" onClick={() => setModalHardware('mq')}>
                  <rect x="434" y="304" width="34" height="28" rx="6" fill="#1e293b" stroke="#a855f7" strokeWidth="2.5" />
                  <circle cx="451" cy="318" r="7" fill="#c084fc" />
                  <rect x="384" y="336" width="134" height="19" rx="9.5" fill={gasPpm >= 700 ? '#991b1b' : '#581c87'} />
                  <text x="451" y="349" textAnchor="middle" fontSize="8.8" fontWeight="800" fill="#f3e8ff">
                    💨 {gasPpm} PPM | {airflowMps} m/s
                  </text>
                </g>

                {/* SENSOR 4: ESP32 LoRa Gateway */}
                <g className="clickable-node" onClick={() => setModalHardware('esp')}>
                  <rect x="252" y="276" width="52" height="34" rx="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="278" y1="276" x2="278" y2="256" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="278" cy="254" r="4" fill="#38bdf8" className="led-blink" />
                  <text x="278" y="296" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff">
                    ESP32
                  </text>
                  <text x="278" y="306" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#38bdf8">
                    GATEWAY
                  </text>
                  <g transform="translate(278, 245)" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M-12,-6 Q0,-18 12,-6" className="radio-wave-1" />
                    <path d="M-18,-18 Q0,-34 18,-18" className="radio-wave-2" />
                    <path d="M-24,-30 Q0,-50 24,-30" className="radio-wave-3" />
                  </g>
                </g>
              </svg>

              {/* GUIDED STORY DEMO SUBTITLE BAR */}
              <div className="bg-slate-900/95 text-white px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider shrink-0 ${
                      !fanPowerOn
                        ? 'bg-rose-600 text-white'
                        : fanSpeed === 100
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-indigo-500 text-white'
                    }`}
                  >
                    {storyPlaying
                      ? `STEP ${storyStep}/4`
                      : !fanPowerOn
                      ? 'FAN OFF DEMO'
                      : fanSpeed === 100
                      ? 'AI PROTECTION'
                      : 'LIVE VIEW'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-100">{subtitleText}</p>
                </div>

                {storyPlaying && (
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {[1, 2, 3, 4].map((dot) => (
                      <span
                        key={dot}
                        className={`rounded-full transition ${
                          storyStep === dot ? 'w-3 h-3 bg-indigo-400 scale-110' : 'w-2.5 h-2.5 bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. RIGHT PANEL: PREDICTIVE AI BRAIN, FAN POWER SWITCH & WORKER HEALTH (4 Cols on XL) */}
          <div className="xl:col-span-4 flex flex-col gap-3.5">
            {/* AI Predictor & Fan Power Card */}
            <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 sm:p-5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">AI Thermal Control</h2>
                    <p className="text-xs text-slate-500 font-medium">Predicts heat 10 mins early</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    !fanPowerOn
                      ? 'bg-rose-100 text-rose-800'
                      : fanSpeed === 100
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {!fanPowerOn ? 'FAN OFF' : fanSpeed === 100 ? '100% BOOST' : 'ECO SAVING'}
                </span>
              </div>

              {/* Prominent Cooling Fan Power Switch (ON / OFF) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 border border-slate-200">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 uppercase">Cooling Fan Power</div>
                  <div className="text-xs text-slate-600 font-medium">
                    {fanPowerOn ? 'Auto-AI Cooling is Active' : 'Cooling Disabled (Danger!)'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    stopStoryDemo();
                    setFanPowerOn((prev) => {
                      const next = !prev;
                      if (next) setHeatSpikeActive(false);
                      return next;
                    });
                  }}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold shadow-sm transition cursor-pointer ${
                    fanPowerOn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {fanPowerOn ? 'FAN: ON' : 'FAN: OFF'}
                </button>
              </div>

              {/* Big Clear Temperature & Gas Numbers Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Live Temp & Humidity</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                    {currentTemp.toFixed(1)}°C <span className="text-sm font-bold text-sky-600">/ {humidity}%</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    IR Rock: {Math.round(rockTemp)}°C
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    !fanPowerOn
                      ? 'bg-rose-50 border-rose-300'
                      : fanSpeed === 100
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-600 uppercase">AI +10 Min Forecast</span>
                  <div
                    className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                      !fanPowerOn ? 'text-rose-600' : fanSpeed === 100 ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {predictedTemp.toFixed(1)}°C
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      !fanPowerOn ? 'text-rose-600' : fanSpeed === 100 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    Pred Gas: {predictedGasPpm} PPM
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Hazardous Gas (MQ-135)</span>
                  <div className={`text-base font-extrabold ${gasPpm >= 700 ? 'text-rose-600' : 'text-purple-900'}`}>
                    {gasPpm} PPM {gasPpm >= 700 ? '⚠️ HIGH' : '✅ SAFE'}
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200">
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">Tunnel Airflow & Latency</span>
                  <div className="text-base font-extrabold text-sky-900">
                    {airflowMps} m/s <span className="text-xs font-bold text-emerald-700">(&lt;10ms)</span>
                  </div>
                </div>
              </div>

              {/* Worker Health Status Meter */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  workerStage === 4
                    ? 'bg-rose-100 border-2 border-rose-500 animate-pulse'
                    : workerStage === 3
                    ? 'bg-orange-100 border-orange-400'
                    : workerStage === 2
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {workerStage === 4 ? '🚑' : workerStage === 3 ? '🥵' : workerStage === 2 ? '😓' : '👷'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Worker Safety Status</div>
                    <div
                      className={`text-sm font-extrabold ${
                        workerStage === 4
                          ? 'text-rose-900'
                          : workerStage === 3
                          ? 'text-orange-900'
                          : workerStage === 2
                          ? 'text-amber-900'
                          : 'text-emerald-800'
                      }`}
                    >
                      {workerStage === 4
                        ? 'CRITICAL: Workers Collapsed!'
                        : workerStage === 3
                        ? 'Exhausted — Stopped Work'
                        : workerStage === 2
                        ? 'Heat Stress — Sweating'
                        : 'Healthy & Comfortable'}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    workerStage === 4
                      ? 'bg-rose-600 text-white'
                      : workerStage === 3
                      ? 'bg-orange-500 text-white'
                      : workerStage === 2
                      ? 'bg-amber-300 text-amber-950'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  STAGE {workerStage}/4
                </span>
              </div>

              {/* Fan Speed Progress Bar */}
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-sky-900">🌀 Ventilation Airflow</span>
                  <span className="text-sky-700 font-extrabold">
                    {fanSpeed === 100
                      ? '100% (MAX BOOST!)'
                      : fanSpeed === 30
                      ? '30% (Eco Mode)'
                      : '0% (FAN STOPPED!)'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-sky-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${fanSpeed}%` }}
                  />
                </div>
              </div>

              {/* Plain-English AI Decision Box */}
              <div
                className={`p-3.5 rounded-2xl shadow-sm transition-colors duration-300 ${
                  !fanPowerOn
                    ? 'bg-rose-600 text-white'
                    : fanSpeed === 100
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <div className="text-xs font-extrabold uppercase tracking-wider opacity-90 mb-0.5">
                  System Status:
                </div>
                <p className="text-xs sm:text-sm font-semibold leading-snug">
                  {!fanPowerOn
                    ? currentTemp >= 42
                      ? 'CRITICAL EMERGENCY! Without cooling fans, cave heat reached 42°C+ and workers collapsed from heatstroke!'
                      : 'FAN IS OFF! Underground heat is trapped and rising rapidly. Turn ON Cooling Fan to save workers!'
                    : fanSpeed === 100
                    ? 'Predictive AI detected rising heat early and boosted fans to 100%—keeping workers safe and conscious!'
                    : 'Cave is cool and safe. Running fans at 30% speed to save electricity.'}
                </p>
              </div>
            </div>

            {/* Live 2-Line SVG Chart Card */}
            <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Actual vs. AI Predicted Heat</h3>
                  <p className="text-xs text-slate-500">Shows rapid climb when Fan is OFF</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-sky-600">
                    <span className="w-3 h-1 bg-sky-600 inline-block rounded" /> Actual
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" /> AI Pred
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-2">
                <svg viewBox="0 0 360 135" className="w-full h-32 overflow-visible">
                  <line x1="32" y1="30" x2="350" y2="30" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="348" y="25" textAnchor="end" fontSize="8.5" fontWeight="800" fill="#dc2626">
                    42°C Critical Collapse
                  </text>

                  <line x1="32" y1="76" x2="350" y2="76" stroke="#f59e0b" strokeWidth="1.1" strokeDasharray="4 4" />
                  <text x="348" y="71" textAnchor="end" fontSize="8.5" fontWeight="700" fill="#d97706">
                    31°C Heat Stress
                  </text>

                  <text x="26" y="18" textAnchor="end" fontSize="9" fill="#64748b">
                    46°
                  </text>
                  <text x="26" y="72" textAnchor="end" fontSize="9" fill="#64748b">
                    33°
                  </text>
                  <text x="26" y="122" textAnchor="end" fontSize="9" fill="#64748b">
                    20°
                  </text>

                  <line x1="32" y1="16" x2="350" y2="16" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="32" y1="70" x2="350" y2="70" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="32" y1="120" x2="350" y2="120" stroke="#e2e8f0" strokeWidth="1" />

                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="5 4"
                    points={buildPolyline(predHistory)}
                  />
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={buildPolyline(actualHistory)}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. TINKERCAD / FRITZING VIRTUAL BREADBOARD & WIRING LAB BENCH ================= */}
        <section className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  TINKERCAD / FRITZING VIRTUAL LAB BENCH
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Live-Synced with Cave Simulation Above
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                Physical Breadboard, ESP32-S3 Pin Wiring & Power Supply Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Click any component on the virtual lab bench to highlight its jumper wires and view the exact pin-to-pin connection table.
              </p>
            </div>

            {/* Interactive Wire Layer Filters & Pin Labels Toggle */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Jumper Wires' },
                { id: 'power', label: '🔴⚫ Power Rails (12V/5V/3.3V)' },
                { id: 'sensors', label: '🟢🔵 Sensor Data Wires' },
                { id: 'relay', label: '🟣 Relay & 12V Fan' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setWiringFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    wiringFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={() => setShowPinLabels((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                  showPinLabels
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {showPinLabels ? '🏷️ Pin Labels: ON' : '🏷️ Pin Labels: OFF'}
              </button>
            </div>
          </div>

          {/* TINKERCAD-STYLE LAB BENCH CANVAS */}
          <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-300 bg-[#e8eef5] shadow-inner p-2 sm:p-3">
            <svg viewBox="0 0 1060 540" className="w-full min-w-[860px] h-auto block select-none">
              <defs>
                {/* Subtle Engineering Grid Background like Tinkercad Circuits */}
                <pattern id="tinkerGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#cbd5e1" strokeWidth="0.7" />
                </pattern>
                <filter id="boardShadow" x="-10%" y="-10%" width="125%" height="125%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.22" />
                </filter>
                <filter id="selectedGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#facc15" floodOpacity="0.95" />
                </filter>
              </defs>

              {/* Lab Bench Grid Surface */}
              <rect x="0" y="0" width="1060" height="540" rx="14" fill="#eef3f8" />
              <rect x="0" y="0" width="1060" height="540" rx="14" fill="url(#tinkerGrid)" />

              {/* Top Section Header Strip inside Canvas */}
              <g fontSize="10.5" fontWeight="800" fill="#475569">
                <rect x="16" y="12" width="225" height="24" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="128" y="28" textAnchor="middle">
                  1. 12V UPS & 5V BUCK POWER
                </text>

                <rect x="260" y="12" width="490" height="24" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="505" y="28" textAnchor="middle">
                  2. SOLDERLESS BREADBOARD, SENSORS & ESP32-S3 DEVKIT
                </text>

                <rect x="770" y="12" width="274" height="24" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="907" y="28" textAnchor="middle">
                  3. CLOUD DASHBOARD & 12V FAN
                </text>
              </g>

              {/* ================= COMPONENT 1: 12V 5A ADAPTER + LiFePO4 UPS BATTERY ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'ups' || selectedHardware === 'mains' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('ups')}
              >
                {/* AC Wall Plug + 12V Adapter Brick */}
                <rect x="24" y="54" width="90" height="44" rx="7" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                <rect x="14" y="65" width="10" height="7" rx="1" fill="#94a3b8" />
                <rect x="14" y="80" width="10" height="7" rx="1" fill="#94a3b8" />
                <text x="69" y="74" textAnchor="middle" fontSize="9" fontWeight="800" fill="#f8fafc">
                  230V AC → 12V
                </text>
                <text x="69" y="87" textAnchor="middle" fontSize="8" fontWeight="700" fill="#38bdf8">
                  5A DC ADAPTER
                </text>
                {/* Power cord to Battery */}
                <path d="M114,76 L132,76 L132,122" fill="none" stroke="#1e293b" strokeWidth="3.5" />

                {/* 12V LiFePO4 UPS Battery Pack */}
                <rect x="24" y="122" width="196" height="106" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
                <rect x="24" y="122" width="196" height="24" rx="10" fill="#f59e0b" />
                <text x="122" y="138" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0f172a">
                  🔋 12V LiFePO4 UPS BATTERY
                </text>
                <text x="122" y="164" textAnchor="middle" fontSize="10" fontWeight="800" fill="#f8fafc">
                  12.0V DC • 6000mAh Backup
                </text>
                <text x="122" y="180" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#4ade80">
                  ● UPS Charged (Zero-Downtime)
                </text>

                {/* Battery Output Terminals (+12V Red & GND Black) */}
                <rect x="52" y="196" width="54" height="22" rx="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                <text x="79" y="210" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">
                  +12V OUT
                </text>
                <rect x="136" y="196" width="54" height="22" rx="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="163" y="210" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">
                  GND (-)
                </text>
              </g>

              {/* ================= COMPONENT 2: LM2596 DC-DC BUCK CONVERTER ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'buck' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('buck')}
              >
                {/* Blue PCB */}
                <rect x="24" y="302" width="196" height="118" rx="10" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2.5" />
                {/* Mounting Holes */}
                <circle cx="34" cy="312" r="3.5" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="210" cy="312" r="3.5" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="34" cy="410" r="3.5" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="210" cy="410" r="3.5" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1.5" />

                <text x="122" y="322" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#ffffff">
                  LM2596 BUCK CONVERTER
                </text>
                <text x="122" y="335" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fde047">
                  Steps Down 12V IN → 5.0V OUT
                </text>

                {/* Realistic Electronic Parts on LM2596 PCB */}
                {/* Two Aluminum Electrolytic Capacitors */}
                <circle cx="62" cy="364" r="14" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
                <path d="M52,364 L72,364 M62,354 L62,374" stroke="#475569" strokeWidth="1.2" />
                <circle cx="182" cy="364" r="14" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
                <path d="M172,364 L192,364 M182,354 L182,374" stroke="#475569" strokeWidth="1.2" />
                {/* Toroid Inductor Coil */}
                <rect x="98" y="346" width="32" height="32" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <text x="114" y="365" textAnchor="middle" fontSize="8" fontWeight="800" fill="#cbd5e1">
                  330
                </text>
                {/* Brass Trim Potentiometer */}
                <rect x="138" y="348" width="16" height="22" rx="2" fill="#0284c7" />
                <circle cx="146" cy="353" r="4" fill="#facc15" />

                {/* Solder Pads: IN+ / IN- (Top) & OUT+ / OUT- (Right) */}
                <circle cx="79" cy="306" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.2" />
                <text x="79" y="321" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#fef08a">
                  IN+
                </text>
                <circle cx="163" cy="306" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.2" />
                <text x="163" y="321" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#fef08a">
                  IN-
                </text>

                <circle cx="214" cy="388" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.2" />
                <text x="195" y="391" textAnchor="end" fontSize="7.5" fontWeight="800" fill="#fef08a">
                  5V+
                </text>
                <circle cx="214" cy="404" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.2" />
                <text x="195" y="407" textAnchor="end" fontSize="7.5" fontWeight="800" fill="#fef08a">
                  OUT-
                </text>
              </g>

              {/* ================= COMPONENT 3: HALF-SIZE SOLDERLESS BREADBOARD ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'breadboard' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('breadboard')}
              >
                {/* White ABS Plastic Breadboard Body */}
                <rect x="260" y="218" width="490" height="206" rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2.5" />

                {/* Top Power Rail Lines (3.3V Red + & Blue -) */}
                <line x1="278" y1="230" x2="732" y2="230" stroke="#ef4444" strokeWidth="2" />
                <text x="271" y="233" fontSize="10" fontWeight="900" fill="#ef4444">
                  +
                </text>
                <line x1="278" y1="256" x2="732" y2="256" stroke="#2563eb" strokeWidth="2" />
                <text x="271" y="259" fontSize="11" fontWeight="900" fill="#2563eb">
                  -
                </text>
                <text x="732" y="226" textAnchor="end" fontSize="7.5" fontWeight="800" fill="#dc2626">
                  3.3V RAIL
                </text>

                {/* Center DIP Trench Channel */}
                <rect x="270" y="315" width="470" height="12" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

                {/* Bottom Power Rail Lines (5.0V Red + & Blue -) */}
                <line x1="278" y1="386" x2="732" y2="386" stroke="#ef4444" strokeWidth="2" />
                <text x="271" y="389" fontSize="10" fontWeight="900" fill="#ef4444">
                  +
                </text>
                <line x1="278" y1="412" x2="732" y2="412" stroke="#2563eb" strokeWidth="2" />
                <text x="271" y="415" fontSize="11" fontWeight="900" fill="#2563eb">
                  -
                </text>
                <text x="732" y="382" textAnchor="end" fontSize="7.5" fontWeight="800" fill="#dc2626">
                  5.0V RAIL
                </text>

                {/* Tie-Point Matrix Holes */}
                {Array.from({ length: 28 }).map((_, colIdx) => {
                  const cx = 285 + colIdx * 16;
                  return (
                    <g key={colIdx} fill="#475569">
                      {/* Top Power Rails */}
                      <rect x={cx - 1.5} y="236" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="247" width="3" height="3" rx="0.5" />
                      {/* Upper Terminal Strips (Rows A-E) */}
                      <rect x={cx - 1.5} y="269" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="280" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="291" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="302" width="3" height="3" rx="0.5" />
                      {/* Lower Terminal Strips (Rows F-J) */}
                      <rect x={cx - 1.5} y="336" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="347" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="358" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="369" width="3" height="3" rx="0.5" />
                      {/* Bottom Power Rails */}
                      <rect x={cx - 1.5} y="392" width="3" height="3" rx="0.5" />
                      <rect x={cx - 1.5} y="403" width="3" height="3" rx="0.5" />
                    </g>
                  );
                })}
              </g>

              {/* ================= COMPONENT 4: DHT22 SENSOR MODULE ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'dht' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('dht')}
              >
                {/* White Grid Housing */}
                <rect x="276" y="64" width="76" height="86" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                <rect x="284" y="72" width="60" height="54" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Waffle Grid Holes */}
                {[78, 89, 100, 111].map((yPos) =>
                  [291, 303, 315, 327].map((xPos) => (
                    <rect key={`${xPos}-${yPos}`} x={xPos} y={yPos} width="7" height="7" rx="1" fill="#64748b" />
                  ))
                )}
                <text x="314" y="141" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#0f172a">
                  DHT22
                </text>
                {/* 3 Metal Pins Plugging Down */}
                <rect x="294" y="150" width="4" height="18" fill="#cbd5e1" />
                <rect x="312" y="150" width="4" height="18" fill="#cbd5e1" />
                <rect x="330" y="150" width="4" height="18" fill="#cbd5e1" />
                {showPinLabels && (
                  <g fontSize="7.5" fontWeight="800" fill="#0f172a">
                    <text x="292" y="176" textAnchor="middle" fill="#dc2626">
                      VCC
                    </text>
                    <text x="314" y="176" textAnchor="middle" fill="#16a34a">
                      DAT
                    </text>
                    <text x="336" y="176" textAnchor="middle">
                      GND
                    </text>
                  </g>
                )}
              </g>

              {/* ================= COMPONENT 5: MLX90614 INFRARED THERMAL SENSOR ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'ir' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('ir')}
              >
                {/* Purple GY-906 Breakout Board */}
                <rect x="374" y="72" width="90" height="78" rx="8" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
                {/* Metallic TO-39 IR Lens Can */}
                <circle cx="419" cy="102" r="19" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
                <circle cx="419" cy="102" r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="416" cy="99" r="3" fill="#f43f5e" className="led-blink" />
                <text x="419" y="135" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#ffffff">
                  MLX90614 IR
                </text>
                {/* 4 Header Pins */}
                {[388, 408, 428, 448].map((px) => (
                  <rect key={px} x={px - 2} y="150" width="4" height="18" fill="#facc15" />
                ))}
                {showPinLabels && (
                  <g fontSize="7.2" fontWeight="800">
                    <text x="388" y="176" textAnchor="middle" fill="#dc2626">
                      VIN
                    </text>
                    <text x="408" y="176" textAnchor="middle" fill="#0f172a">
                      GND
                    </text>
                    <text x="428" y="176" textAnchor="middle" fill="#ca8a04">
                      SCL
                    </text>
                    <text x="448" y="176" textAnchor="middle" fill="#2563eb">
                      SDA
                    </text>
                  </g>
                )}
              </g>

              {/* ================= COMPONENT 6: MQ-135 GAS & AIRFLOW SENSOR ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'mq' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('mq')}
              >
                {/* Red Sensor Module PCB */}
                <rect x="484" y="68" width="84" height="82" rx="8" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                {/* Round Metallic Mesh Cylinder */}
                <circle cx="526" cy="102" r="21" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
                <circle cx="526" cy="102" r="15" fill="#475569" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                <text x="526" y="138" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">
                  MQ-135
                </text>
                {/* 4 Header Pins */}
                {[498, 516, 534, 552].map((px) => (
                  <rect key={px} x={px - 2} y="150" width="4" height="18" fill="#cbd5e1" />
                ))}
                {showPinLabels && (
                  <g fontSize="7.2" fontWeight="800">
                    <text x="498" y="176" textAnchor="middle" fill="#dc2626">
                      VCC
                    </text>
                    <text x="516" y="176" textAnchor="middle" fill="#0f172a">
                      GND
                    </text>
                    <text x="534" y="176" textAnchor="middle" fill="#64748b">
                      DO
                    </text>
                    <text x="552" y="176" textAnchor="middle" fill="#ea580c">
                      AO
                    </text>
                  </g>
                )}
              </g>

              {/* ================= COMPONENT 7: ESP32-S3 DEVKITC-1 BOARD ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'esp' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('esp')}
              >
                {/* Dark Matte Black ESP32 PCB */}
                <rect x="586" y="52" width="148" height="236" rx="10" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
                {/* Silver RF Shield Can (ESP32-S3 WROOM) */}
                <rect x="614" y="64" width="92" height="82" rx="5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.8" />
                <text x="660" y="96" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#1e293b">
                  ESP32-S3
                </text>
                <text x="660" y="110" textAnchor="middle" fontSize="8" fontWeight="800" fill="#334155">
                  WROOM-1
                </text>
                <text x="660" y="124" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0284c7">
                  Wi-Fi + LoRa
                </text>
                {/* Blinking Blue Status LED */}
                <circle cx="694" cy="134" r="3.5" fill="#38bdf8" className="led-blink" />

                {/* Micro-USB / USB-C Silver Port at Bottom */}
                <rect x="642" y="264" width="36" height="26" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                <text x="660" y="280" textAnchor="middle" fontSize="7" fontWeight="800" fill="#0f172a">
                  USB
                </text>

                {/* BOOT & EN Tactile Buttons */}
                <rect x="612" y="252" width="16" height="16" rx="3" fill="#cbd5e1" />
                <circle cx="620" cy="260" r="4" fill="#1e293b" />
                <rect x="692" y="252" width="16" height="16" rx="3" fill="#cbd5e1" />
                <circle cx="700" cy="260" r="4" fill="#1e293b" />

                {/* Left & Right Gold Pin Headers */}
                {[
                  { y: 162, left: '3V3', right: 'GND', lColor: '#f87171', rColor: '#94a3b8' },
                  { y: 182, left: 'GPIO4', right: 'GPIO21', lColor: '#4ade80', rColor: '#60a5fa' },
                  { y: 202, left: 'GPIO34', right: 'GPIO22', lColor: '#fb923c', rColor: '#facc15' },
                  { y: 222, left: 'VIN 5V', right: 'GPIO26', lColor: '#f87171', rColor: '#c084fc' }
                ].map((row) => (
                  <g key={row.y}>
                    {/* Left Gold Pin */}
                    <rect x="590" y={row.y - 3} width="8" height="6" rx="1" fill="#facc15" />
                    <text x="602" y={row.y + 3} fontSize="7.5" fontWeight="800" fill={row.lColor}>
                      {row.left}
                    </text>
                    {/* Right Gold Pin */}
                    <rect x="722" y={row.y - 3} width="8" height="6" rx="1" fill="#facc15" />
                    <text x="718" y={row.y + 3} textAnchor="end" fontSize="7.5" fontWeight="800" fill={row.rColor}>
                      {row.right}
                    </text>
                  </g>
                ))}
              </g>

              {/* ================= COMPONENT 8: CLOUD MQTT & LIVE WEB DASHBOARD MONITOR ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'cloud' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('cloud')}
              >
                {/* Monitor Bezel */}
                <rect x="795" y="48" width="225" height="122" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="3" />
                <rect x="805" y="58" width="205" height="92" rx="6" fill="#1e293b" />
                {/* Monitor Stand */}
                <rect x="892" y="170" width="30" height="16" fill="#475569" />
                <rect x="870" y="184" width="74" height="7" rx="3" fill="#334155" />

                {/* Mini Dashboard UI Inside Monitor */}
                <text x="907" y="75" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#38bdf8">
                  ☁️ CLOUD AI & LIVE DASHBOARD
                </text>
                <rect x="815" y="83" width="88" height="32" rx="5" fill="#0f172a" />
                <text x="859" y="97" textAnchor="middle" fontSize="8" fontWeight="700" fill="#94a3b8">
                  CAVE TEMP
                </text>
                <text x="859" y="110" textAnchor="middle" fontSize="10" fontWeight="900" fill="#4ade80">
                  {currentTemp.toFixed(1)}°C
                </text>

                <rect x="911" y="83" width="88" height="32" rx="5" fill="#0f172a" />
                <text x="955" y="97" textAnchor="middle" fontSize="8" fontWeight="700" fill="#94a3b8">
                  AI +10 MIN
                </text>
                <text x="955" y="110" textAnchor="middle" fontSize="10" fontWeight="900" fill="#facc15">
                  {predictedTemp.toFixed(1)}°C
                </text>

                <rect x="815" y="121" width="184" height="20" rx="4" fill="#0284c7" />
                <text x="907" y="134" textAnchor="middle" fontSize="8" fontWeight="800" fill="#ffffff">
                  MQTT: minesafe/zoneB/telemetry
                </text>
              </g>

              {/* ================= COMPONENT 9: 1-CHANNEL 5V OPTOCOUPLER RELAY MODULE ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'relay' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('relay')}
              >
                {/* Blue Relay PCB */}
                <rect x="785" y="216" width="242" height="106" rx="10" fill="#0369a1" stroke="#0c4a6e" strokeWidth="2.5" />
                <text x="906" y="233" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#ffffff">
                  5V OPTOCOUPLER RELAY MODULE
                </text>

                {/* Blue Songle Cube Relay Housing */}
                <rect x="856" y="242" width="76" height="66" rx="5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
                <text x="894" y="266" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#ffffff">
                  SRD-05VDC
                </text>
                <text x="894" y="280" textAnchor="middle" fontSize="8" fontWeight="700" fill="#bae6fd">
                  10A 30VDC
                </text>
                {/* Live Relay Active Indicator LED */}
                <circle
                  cx="894"
                  cy="296"
                  r="5"
                  fill={fanPowerOn ? '#4ade80' : '#475569'}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />

                {/* Left Control Header Pins (DC+, DC-, IN) */}
                <g fontSize="7.5" fontWeight="800" fill="#ffffff">
                  <rect x="789" y="248" width="8" height="6" fill="#facc15" />
                  <text x="801" y="254">DC+</text>
                  <rect x="789" y="268" width="8" height="6" fill="#facc15" />
                  <text x="801" y="274">DC-</text>
                  <rect x="789" y="288" width="8" height="6" fill="#facc15" />
                  <text x="801" y="294" fill="#fde047">IN (26)</text>
                </g>

                {/* Right Green Screw Terminal Block (NO, COM, NC) */}
                <rect x="944" y="242" width="74" height="68" rx="4" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
                {[
                  { y: 254, label: 'NO' },
                  { y: 276, label: 'COM' },
                  { y: 298, label: 'NC' }
                ].map((term) => (
                  <g key={term.label}>
                    <circle cx="998" cy={term.y} r="5.5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
                    <line x1="994" y1={term.y} x2="1002" y2={term.y} stroke="#334155" strokeWidth="1.5" />
                    <text x="986" y={term.y + 3} textAnchor="end" fontSize="8" fontWeight="900" fill="#ffffff">
                      {term.label}
                    </text>
                  </g>
                ))}
              </g>

              {/* ================= COMPONENT 10: 12V BRUSHLESS COOLING FAN ================= */}
              <g
                className="clickable-node"
                filter={selectedHardware === 'fan' ? 'url(#selectedGlow)' : 'url(#boardShadow)'}
                onClick={() => openHardwareInspector('fan')}
              >
                {/* Square Black Fan Casing */}
                <rect
                  x="855"
                  y="355"
                  width="120"
                  height="120"
                  rx="14"
                  fill="#1e293b"
                  stroke={fanPowerOn ? '#38bdf8' : '#ef4444'}
                  strokeWidth="3"
                />
                {/* Corner Screw Holes */}
                <circle cx="867" cy="367" r="4" fill="#64748b" />
                <circle cx="963" cy="367" r="4" fill="#64748b" />
                <circle cx="867" cy="463" r="4" fill="#64748b" />
                <circle cx="963" cy="463" r="4" fill="#64748b" />

                {/* Circular Shroud & Spinning Blades */}
                <circle cx="915" cy="415" r="44" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <g className={!fanPowerOn ? '' : fanSpeed === 100 ? 'tinker-fan-fast' : 'tinker-fan-eco'}>
                  <ellipse cx="915" cy="390" rx="8" ry="20" fill="#38bdf8" />
                  <ellipse cx="915" cy="440" rx="8" ry="20" fill="#38bdf8" />
                  <ellipse cx="890" cy="415" rx="20" ry="8" fill="#0284c7" />
                  <ellipse cx="940" cy="415" rx="20" ry="8" fill="#0284c7" />
                  <circle cx="915" cy="415" r="10" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
                </g>

                {/* Live Fan Status Badge */}
                <rect
                  x="842"
                  y="484"
                  width="146"
                  height="22"
                  rx="11"
                  fill={fanPowerOn ? '#0284c7' : '#dc2626'}
                />
                <text x="915" y="499" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff">
                  {fanPowerOn ? `12V FAN: ON (${fanSpeed}%)` : '12V FAN: OFF (0%)'}
                </text>
              </g>

              {/* ================= REALISTIC COLORED JUMPER WIRES (CURVED BEZIER ROUTES) ================= */}

              {/* LAYER A: RED & BLACK POWER WIRES (12V, 5V & 3.3V RAILS) */}
              <g opacity={wiringFilter === 'all' || wiringFilter === 'power' ? 1 : 0.12}>
                {/* 12V Battery (+) -> LM2596 IN+ (Red) */}
                <path
                  d="M79,218 C79,265 79,270 79,306"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* 12V Battery GND -> LM2596 IN- (Black) */}
                <path
                  d="M163,218 C163,265 163,270 163,306"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* LM2596 5V OUT+ -> Bottom Breadboard Red (+) Rail */}
                <path
                  d="M214,388 C242,388 245,386 278,386"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* LM2596 OUT- -> Bottom Breadboard Blue (-) Ground Rail */}
                <path
                  d="M214,404 C242,404 245,412 278,412"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* ESP32 3V3 Pin -> Top Breadboard Red (+) 3.3V Rail */}
                <path
                  d="M590,162 C565,162 565,230 540,230"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Bottom 5V Rail -> ESP32 VIN 5V Pin */}
                <path
                  d="M572,386 C572,300 572,222 590,222"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Top 3.3V Rail -> DHT22 VCC & MLX90614 VIN */}
                <path d="M296,168 L296,230" fill="none" stroke="#ef4444" strokeWidth="2.8" />
                <path d="M388,168 L388,230" fill="none" stroke="#ef4444" strokeWidth="2.8" />

                {/* Bottom 5V Rail -> MQ-135 VCC */}
                <path
                  d="M498,168 C498,270 498,350 498,386"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.8"
                />

                {/* Ground Wires (Black) from Sensors & ESP32 to Blue Rails */}
                <path d="M332,168 L332,256" fill="none" stroke="#1e293b" strokeWidth="2.8" />
                <path d="M408,168 L408,256" fill="none" stroke="#1e293b" strokeWidth="2.8" />
                <path d="M516,168 L516,412" fill="none" stroke="#1e293b" strokeWidth="2.8" />
                <path
                  d="M730,162 C748,162 748,256 715,256"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2.8"
                />

                {/* Bridge Top Blue GND Rail to Bottom Blue GND Rail */}
                <path d="M285,256 L285,412" fill="none" stroke="#1e293b" strokeWidth="3" />
              </g>

              {/* LAYER B: SENSOR DATA JUMPER WIRES (GREEN, BLUE, YELLOW, ORANGE) */}
              <g opacity={wiringFilter === 'all' || wiringFilter === 'sensors' ? 1 : 0.12}>
                {/* DHT22 DATA -> ESP32 GPIO 4 (Green Jumper Wire) */}
                <path
                  d="M314,168 C314,205 552,182 590,182"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M314,168 C314,205 552,182 590,182"
                  fill="none"
                  stroke="#bbf7d0"
                  strokeWidth="1.5"
                  className="wire-flow"
                />

                {/* MLX90614 SDA -> ESP32 GPIO 21 (Blue Jumper Wire) */}
                <path
                  d="M448,168 C448,195 758,182 730,182"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M448,168 C448,195 758,182 730,182"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="1.5"
                  className="wire-flow"
                />

                {/* MLX90614 SCL -> ESP32 GPIO 22 (Yellow Jumper Wire) */}
                <path
                  d="M428,168 C428,210 764,202 730,202"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* MQ-135 AO -> ESP32 GPIO 34 ADC (Orange Jumper Wire) */}
                <path
                  d="M552,168 C552,202 572,202 590,202"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M552,168 C552,202 572,202 590,202"
                  fill="none"
                  stroke="#fed7aa"
                  strokeWidth="1.5"
                  className="wire-flow"
                />
              </g>

              {/* LAYER C: RELAY CONTROL, 12V FAN LOAD & WI-FI CLOUD LINK */}
              <g opacity={wiringFilter === 'all' || wiringFilter === 'relay' ? 1 : 0.12}>
                {/* ESP32 GPIO 26 -> Relay IN Trigger Pin (Purple Jumper Wire) */}
                <path
                  d="M730,222 C760,222 760,291 789,291"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {fanPowerOn && (
                  <path
                    d="M730,222 C760,222 760,291 789,291"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                    className="wire-flow"
                  />
                )}

                {/* 5V Breadboard Rail -> Relay DC+ & DC- */}
                <path
                  d="M715,386 C762,386 762,251 789,251"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                />
                <path
                  d="M715,412 C770,412 770,271 789,271"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />

                {/* Direct 12V UPS (+) -> Relay COM Screw Terminal (Thick Red Load Wire) */}
                <path
                  d="M79,218 C79,465 1038,465 1038,276 L1004,276"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Relay NO Terminal -> 12V Fan Red (+12V) Wire */}
                <path
                  d="M1004,254 L1026,254 L1026,385 L975,385"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {fanPowerOn && (
                  <path
                    d="M1004,254 L1026,254 L1026,385 L975,385"
                    fill="none"
                    stroke="#fef08a"
                    strokeWidth="2"
                    className="wire-flow"
                  />
                )}

                {/* 12V Fan Black (GND) -> 12V UPS Battery GND */}
                <path
                  d="M855,442 L163,442 L163,218"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Wireless Wi-Fi Telemetry Link: ESP32 -> Cloud Dashboard */}
                <path
                  d="M734,105 L795,105"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  className="wire-flow"
                />
              </g>
            </svg>
          </div>

          {/* PIN-TO-PIN WIRING TABLE & INSPECTOR CARD FOR SELECTED COMPONENT */}
          <div className="mt-4 rounded-2xl bg-slate-50 border-2 border-indigo-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {activeHw.badge}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{activeHw.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1">{activeHw.summary}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0 text-xs">
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Supply Voltage</span>
                  <span className="font-extrabold text-amber-700">{activeHw.voltage}</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Interface / Pin</span>
                  <span className="font-extrabold text-sky-700">{activeHw.pin}</span>
                </div>
              </div>
            </div>

            {/* Pin-to-Pin Jumper Wire Table */}
            {activeHw.wires && activeHw.wires.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="py-1.5 px-2 font-extrabold uppercase">From Pin</th>
                      <th className="py-1.5 px-2 font-extrabold uppercase">To Destination Pin</th>
                      <th className="py-1.5 px-2 font-extrabold uppercase">Jumper Wire Color</th>
                      <th className="py-1.5 px-2 font-extrabold uppercase">Function in Circuit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {activeHw.wires.map((wire, idx) => (
                      <tr key={idx} className="hover:bg-white/80">
                        <td className="py-1.5 px-2 font-bold text-slate-800">{wire.from}</td>
                        <td className="py-1.5 px-2 font-bold text-indigo-700">{wire.to}</td>
                        <td className="py-1.5 px-2 font-semibold text-slate-600">{wire.color}</td>
                        <td className="py-1.5 px-2 text-slate-600">{wire.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ================= 6. LIVE ALIGNMENT WITH 6 PROJECT OBJECTIVES & COMPLIANCE LOG ================= */}
        <section className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Live Verification of All 6 Project Objectives & Safety Officer Compliance Log
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Every objective updates live with the simulation above—proving how MineSafe AI protects small &amp; medium mines
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 self-start sm:self-auto">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>All 6 Objectives Demonstrated Live</span>
            </div>
          </div>

          {/* 6 Live-Updated Objective Proof Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {[
              {
                num: '01',
                title: 'Continuous Multi-Parameter Monitoring',
                desc: 'Real-time tracking of Temperature, Humidity, Airflow & Hazardous Gas in underground mine sections.',
                liveProof: `LIVE: ${currentTemp.toFixed(1)}°C | ${humidity}% RH | ${gasPpm} PPM | ${airflowMps} m/s`,
                statusColor: 'bg-sky-100 text-sky-800 border-sky-200'
              },
              {
                num: '02',
                title: '10-Minute Advance Hazard Prediction',
                desc: 'Predicts thermal or gas hazards within a future time window—before dangerous conditions occur.',
                liveProof:
                  predictedTemp >= 29 || predictedGasPpm >= 650
                    ? `⚠️ FORECAST (+10m): ${predictedTemp.toFixed(1)}°C & ${predictedGasPpm} PPM Hazard!`
                    : `✅ FORECAST (+10m): Safe (${predictedTemp.toFixed(1)}°C / ${predictedGasPpm} PPM)`,
                statusColor:
                  predictedTemp >= 29 || predictedGasPpm >= 650
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              },
              {
                num: '03',
                title: 'Zero-Latency Automated Actuation',
                desc: 'Automatically triggers ventilation & cooling fans from predicted conditions, eliminating response delay.',
                liveProof: !fanPowerOn
                  ? '⛔ RELAY OVERRIDDEN OFF (0% Airflow)'
                  : fanSpeed === 100
                  ? '⚡ RELAY ACTUATED (<10ms): Fan at 100% Max'
                  : '🌀 AUTO-READY: Eco Mode 30% (<10ms Trigger)',
                statusColor: !fanPowerOn
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : fanSpeed === 100
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              },
              {
                num: '04',
                title: 'Heat-Stress, Fatigue & Gas Prevention',
                desc: 'Prevents heatstroke illness, fatigue-related errors, and gas incidents among underground miners.',
                liveProof:
                  workerStage === 1
                    ? '👷 WORKER RISK: ZERO (Stage 1/4 Protected)'
                    : `🚨 WORKER RISK: Stage ${workerStage}/4 (${workerStage === 4 ? 'Heat/Gas Collapse' : 'Heat Stress'})`,
                statusColor:
                  workerStage === 1
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
              },
              {
                num: '05',
                title: 'Modular, Low-Cost & Retrofittable',
                desc: 'Inexpensive plug-and-play ESP32 + breadboard sensor node ideal for small & medium-scale mines.',
                liveProof: '💰 NODE BOM COST: ~$18.50 USD • Plug & Play Retrofit',
                statusColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
              },
              {
                num: '06',
                title: 'Centralized Officer Dashboard & Logs',
                desc: 'Real-time visibility, historical trend graphs & automated regulatory-compliance record-keeping.',
                liveProof: `📋 COMPLIANCE ARCHIVE: ${complianceLogs.length} Verified Events Logged`,
                statusColor: 'bg-slate-200 text-slate-800 border-slate-300'
              }
            ].map((obj) => (
              <div
                key={obj.num}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black shrink-0">
                    {obj.num}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{obj.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{obj.desc}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold ${obj.statusColor}`}>
                  {obj.liveProof}
                </div>
              </div>
            ))}
          </div>

          {/* Live Regulatory Compliance & Incident Event Log Table (Objective 6) */}
          <div className="rounded-2xl bg-slate-900 text-slate-100 p-3.5 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400">
                📋 Safety Officer Regulatory Compliance &amp; Prediction Audit Log (Objective 06)
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Auto-Recorded Every State Change</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {complianceLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700/80"
                >
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">[{log.time}]</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase w-fit shrink-0 ${
                      log.type === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : log.type === 'WARNING'
                        ? 'bg-orange-500 text-white'
                        : log.type === 'PREDICTED'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-slate-200 font-medium">{log.event}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ================= DETAILED HARDWARE INSPECTOR MODAL ================= */}
      {modalHardware && HARDWARE_DETAILS[modalHardware] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setModalHardware(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalHardware(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {HARDWARE_DETAILS[modalHardware].badge}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1.5 mb-3 pr-8">
              {HARDWARE_DETAILS[modalHardware].title}
            </h3>

            {/* Live Reading + Electrical Specs Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 text-white mb-3.5 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Live Reading / State</span>
                <span className="font-extrabold text-emerald-400">
                  {modalHardware === 'dht'
                    ? `${currentTemp.toFixed(1)}°C | ${humidity}% RH`
                    : modalHardware === 'ir'
                    ? `Rock Surface: ${Math.round(rockTemp)}°C`
                    : modalHardware === 'mq'
                    ? currentTemp > 36
                      ? 'Stagnant Air Alert'
                      : 'Fresh Airflow (98%)'
                    : modalHardware === 'fan' || modalHardware === 'relay'
                    ? fanPowerOn
                      ? `ON (${fanSpeed}% Speed)`
                      : 'OFF (0% Stopped)'
                    : modalHardware === 'cloud' || modalHardware === 'dashboard'
                    ? `Pred +10m: ${predictedTemp.toFixed(1)}°C`
                    : HARDWARE_DETAILS[modalHardware].protocol}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Power Rail</span>
                <span className="font-extrabold text-amber-300">{HARDWARE_DETAILS[modalHardware].voltage}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Pinout / Bus</span>
                <span className="font-extrabold text-sky-300">{HARDWARE_DETAILS[modalHardware].pin}</span>
              </div>
            </div>

            {/* 3 Clear Structured Cards: What It Is, How It Measures, Work in Project */}
            <div className="space-y-2.5 mb-4">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800 mb-0.5">
                  1. What Exactly Is This Part?
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {HARDWARE_DETAILS[modalHardware].whatItIs}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-0.5">
                  2. How Does It Measure / Operate?
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {HARDWARE_DETAILS[modalHardware].howItMeasures}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 mb-0.5">
                  3. What Work Does It Do in MineSafe AI?
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {HARDWARE_DETAILS[modalHardware].workInProject}
                </p>
              </div>
            </div>

            {/* Pin-to-Pin Jumper Connections inside Popup */}
            {HARDWARE_DETAILS[modalHardware].wires && HARDWARE_DETAILS[modalHardware].wires.length > 0 && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">
                  Breadboard Jumper Connections
                </div>
                <div className="space-y-1 text-xs">
                  {HARDWARE_DETAILS[modalHardware].wires.map((w, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                      <span className="font-bold text-slate-800">
                        {w.from} → <span className="text-indigo-600">{w.to}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{w.color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setModalHardware(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer"
            >
              Close & Return to Lab Bench
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
