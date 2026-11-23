import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { TempHistoryPoint, MineZone } from './types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

interface AiPredictorCardProps {
  zone: MineZone;
  history: TempHistoryPoint[];
  autoAiCooling: boolean;
  isSimulatingHeat: boolean;
}

export const AiPredictorCard: React.FC<AiPredictorCardProps> = ({
  zone,
  history,
  autoAiCooling,
  isSimulatingHeat,
}) => {
  const currentTemp = zone.temp;
  
  // Calculate predicted temp 10 mins ahead:
  // If heat simulation is active and temp is climbing, predict higher spike
  // If cooling fan is 100%, predict drop
  const delta = history.length >= 2 
    ? history[history.length - 1].actual - history[Math.max(0, history.length - 4)].actual 
    : 0;

  let predictedTemp = currentTemp;
  let trendStatus: 'rising_fast' | 'rising' | 'cooling' | 'stable' = 'stable';

  if (!autoAiCooling && isSimulatingHeat) {
    // Heat spike without auto cooling
    predictedTemp = Math.min(41.0, currentTemp + 5.5);
    trendStatus = 'rising_fast';
  } else if (isSimulatingHeat && zone.fanSpeed < 100 && currentTemp < 32) {
    // Heat spike detected early by AI
    predictedTemp = Math.max(34.5, currentTemp + 4.2);
    trendStatus = 'rising_fast';
  } else if (zone.fanSpeed === 100 && currentTemp > 25.5) {
    // Fan is cooling the zone down
    predictedTemp = Math.max(24.5, currentTemp - 3.8);
    trendStatus = 'cooling';
  } else {
    // Normal operation
    predictedTemp = Number((currentTemp + (Math.sin(Date.now() / 3000) * 0.2)).toFixed(1));
    trendStatus = 'stable';
  }

  // Plain English status message
  let actionTitle = 'Normal Energy-Saving Mode';
  let actionMessage = 'Everything is cool. Fans running at 30% to save power.';
  let actionBg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
  let actionBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (!autoAiCooling) {
    actionTitle = 'Manual Override Active (AI Cooling OFF)';
    actionMessage = 'Warning: Auto-AI is switched OFF. Fans will NOT automatically adjust. Miners are at risk if heat rises!';
    actionBg = 'bg-rose-50 border-rose-300 text-rose-950';
    actionBadge = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (trendStatus === 'rising_fast' && zone.fanSpeed < 100) {
    actionTitle = 'Heat Spike Detected in Advance!';
    actionMessage = 'AI detected rapid heat buildup. Automatically boosting cooling fans to 100% before miners get too hot!';
    actionBg = 'bg-amber-50 border-amber-300 text-amber-950 animate-pulse';
    actionBadge = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (zone.fanSpeed === 100) {
    actionTitle = 'Predictive Turbo Cooling Active';
    actionMessage = 'High-velocity cool airflow deployed! Suppressing underground heat spike back down to safe levels.';
    actionBg = 'bg-cyan-50 border-cyan-300 text-cyan-950';
    actionBadge = 'bg-cyan-100 text-cyan-800 border-cyan-300';
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-5">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-1.5">
                AI Heat Predictor
                <Sparkles className="w-4 h-4 text-amber-500 inline" />
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Predictive Thermal Analysis for {zone.name}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            10 Mins Ahead
          </span>
        </div>
      </div>

      {/* Main 2 Metrics Side-by-Side: Current vs. Predicted */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Metric 1: Current Temp */}
        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            Current Temp
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {currentTemp.toFixed(1)}°C
          </div>
          <div className="mt-2">
            {currentTemp >= 33 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Hot
              </span>
            ) : currentTemp >= 28 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                <TrendingUp className="w-3 h-3 text-amber-600" />
                Warming
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Safe
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Predicted Temp in 10 mins */}
        <div className={`rounded-2xl p-3.5 sm:p-4 border transition-colors ${
          trendStatus === 'rising_fast' 
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' 
            : trendStatus === 'cooling' 
            ? 'bg-cyan-50 border-cyan-300' 
            : 'bg-indigo-50/60 border-indigo-200'
        }`}>
          <span className="text-[11px] font-extrabold text-indigo-900/70 uppercase tracking-wider block mb-1">
            Predicted (in 10 min)
          </span>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${
            trendStatus === 'rising_fast' 
              ? 'text-rose-700' 
              : trendStatus === 'cooling' 
              ? 'text-cyan-800' 
              : 'text-indigo-900'
          }`}>
            {predictedTemp.toFixed(1)}°C
          </div>
          <div className="mt-2">
            {trendStatus === 'rising_fast' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-200 text-rose-900 animate-pulse">
                <TrendingUp className="w-3 h-3 text-rose-700" />
                Rising Fast! ⚠️
              </span>
            ) : trendStatus === 'cooling' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-200 text-cyan-900">
                <TrendingDown className="w-3 h-3 text-cyan-700" />
                Cooling Back Down
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                <Minus className="w-3 h-3 text-indigo-600" />
                Stable & Normal
              </span>
            )}
          </div>
        </div>

      </div>

      {/* AI Action Taken Box (Plain English) */}
      <div className={`rounded-2xl p-4 border-2 transition-all shadow-xs ${actionBg}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-base">🤖</span>
            AI Action Taken:
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${actionBadge}`}>
            {actionTitle}
          </span>
        </div>
        <p className="text-sm font-semibold leading-relaxed">
          "{actionMessage}"
        </p>
      </div>

      {/* Real-Time 2-Line Chart */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">
            Live Temperature Trend & 10-Min Prediction
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            Real-Time IoT Feed
          </span>
        </div>

        {/* Chart */}
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                tickLine={false} 
              />
              <YAxis 
                domain={[20, 42]} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                tickLine={false} 
                unit="°" 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 600
                }} 
              />
              <ReferenceLine y={28} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Safe Limit (28°C)', fill: '#059669', fontSize: 9, position: 'insideTopLeft' }} />
              <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="2 2" label={{ value: 'Danger Limit (35°C)', fill: '#dc2626', fontSize: 9, position: 'insideTopRight' }} />
              
              {/* Actual Temp Line (Solid) */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Temp (Now)" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{ r: 2.5, fill: '#2563eb' }} 
                activeDot={{ r: 5 }} 
              />
              {/* AI Predicted Line (Dashed) */}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                name="AI Prediction (10m)" 
                stroke="#f97316" 
                strokeWidth={2.5} 
                strokeDasharray="5 5" 
                dot={{ r: 2, fill: '#f97316' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Child-Friendly Legend */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block"></span>
            <span className="text-slate-600 font-medium">
              <strong className="text-slate-800">Solid:</strong> What thermometer feels right now
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 border-t-2 border-dashed border-orange-500 inline-block"></span>
            <span className="text-slate-600 font-medium">
              <strong className="text-slate-800">Dashed:</strong> What AI predicts in 10 mins
            </span>
          </div>
        </div>
      </div>

      {/* Simple Kid-Friendly Takeaway */}
      <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-200/80 flex items-center gap-2.5">
        <span className="text-xl">💡</span>
        <p className="text-xs text-indigo-950 font-semibold leading-snug">
          <strong>Why this saves lives:</strong> Old systems only turn fans on <em>after</em> miners get dangerously hot. MineSafe AI predicts heat 10 minutes early so tunnels never overheat!
        </p>
      </div>
    </div>
  );
};
