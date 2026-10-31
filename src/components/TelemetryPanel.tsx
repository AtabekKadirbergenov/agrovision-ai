'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Sprout,
  Activity,
  Zap,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { Language, translations } from '@/lib/i18n';
import { TelemetryResponse, SensorMetric } from '@/lib/api';

interface TelemetryPanelProps {
  currentLang: Language;
  telemetry: TelemetryResponse | null;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  currentLang,
  telemetry,
}) => {
  const t = translations[currentLang];
  const [selectedMetric, setSelectedMetric] = useState<string>('tds');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const metrics = telemetry?.metrics || {
    temperature: { name: 'Air Temperature', current: 24.2, unit: '°C', baseline_mean: 23.5, baseline_std: 1.2, z_score: 0.58, deviation_percent: 3.0, is_anomaly: false, status_label: 'Normal', threshold_min: 21.1, threshold_max: 25.9, min_normal: 18, max_normal: 28 },
    air_humidity: { name: 'Air Humidity', current: 64.5, unit: '%', baseline_mean: 67.0, baseline_std: 3.5, z_score: -0.71, deviation_percent: -3.7, is_anomaly: false, status_label: 'Normal', threshold_min: 60.0, threshold_max: 74.0, min_normal: 50, max_normal: 80 },
    soil_humidity: { name: 'Soil Moisture', current: 41.5, unit: '%', baseline_mean: 72.0, baseline_std: 3.2, z_score: -9.53, deviation_percent: -42.4, is_anomaly: true, status_label: 'Drop', threshold_min: 65.6, threshold_max: 78.4, min_normal: 55, max_normal: 85 },
    tds: { name: 'Mineralization (TDS)', current: 975.0, unit: 'ppm', baseline_mean: 640.0, baseline_std: 22.0, z_score: 15.2, deviation_percent: 52.3, is_anomaly: true, status_label: 'Spike', threshold_min: 596.0, threshold_max: 684.0, min_normal: 500, max_normal: 850 },
    ec: { name: 'Conductivity (EC)', current: 1.95, unit: 'mS/cm', baseline_mean: 1.28, baseline_std: 0.05, z_score: 13.4, deviation_percent: 52.3, is_anomaly: true, status_label: 'Spike', threshold_min: 1.18, threshold_max: 1.38, min_normal: 1.0, max_normal: 1.7 },
    ph: { name: 'Soil pH Level', current: 6.45, unit: 'pH', baseline_mean: 6.48, baseline_std: 0.12, z_score: -0.25, deviation_percent: -0.5, is_anomaly: false, status_label: 'Normal', threshold_min: 6.24, threshold_max: 6.72, min_normal: 6.0, max_normal: 7.0 }
  };

  const history = telemetry?.history || [];

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'temperature': return <Thermometer className="h-5 w-5 text-amber-400" />;
      case 'air_humidity': return <Droplets className="h-5 w-5 text-cyan-400" />;
      case 'soil_humidity': return <Sprout className="h-5 w-5 text-emerald-400" />;
      case 'tds': return <Activity className="h-5 w-5 text-purple-400" />;
      case 'ec': return <Zap className="h-5 w-5 text-yellow-400" />;
      case 'ph': return <FlaskConical className="h-5 w-5 text-rose-400" />;
      default: return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const activeMetricData = metrics[selectedMetric] || metrics['tds'];

  const getMetricLabel = (key: string, item?: any): string => {
    if (item?.name) return item.name;
    switch (key) {
      case 'temperature': return t.sensors?.temperature || 'Air Temperature';
      case 'air_humidity': return t.sensors?.airHumidity || 'Air Humidity';
      case 'soil_humidity': return t.sensors?.soilHumidity || 'Soil Moisture';
      case 'tds': return t.sensors?.tds || 'Mineralization (TDS)';
      case 'ec': return t.sensors?.ec || 'Conductivity (EC)';
      case 'ph': return t.sensors?.ph || 'Soil pH Level';
      default: return key.toUpperCase();
    }
  };

  // Metric color for chart line
  const getLineColor = (key: string) => {
    if (metrics[key]?.is_anomaly) return '#ef4444'; // Red for anomaly
    switch (key) {
      case 'temperature': return '#fbbf24';
      case 'air_humidity': return '#38bdf8';
      case 'soil_humidity': return '#34d399';
      case 'tds': return '#a855f7';
      case 'ec': return '#eab308';
      case 'ph': return '#f43f5e';
      default: return '#10b981';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Telemetry Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            {t.tabs?.telemetry || "Atrof-muhit Telemetriyasi"}
          </h2>
          <p className="text-xs text-slate-400">
            Real-vaqt mikroklimat va tuproq ko'rsatkichlari dinamikasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          {telemetry?.is_simulated ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-sm shadow-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Dinamik jonli oqim (Real-vaqt)
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 shadow-sm shadow-blue-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              3-ESP32 Datchiklari Ulangan
            </span>
          )}
        </div>
      </div>

      {/* 5-Metric Sensor KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(metrics).map(([key, item]) => {
          const isSelected = selectedMetric === key;
          const isAnomaly = item.is_anomaly;

          return (
            <div
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
                isAnomaly
                  ? 'border-2 border-red-500/80 bg-red-950/30 shadow-lg shadow-red-500/10'
                  : 'glass-panel glass-panel-hover'
              } ${isSelected ? 'ring-2 ring-emerald-500/80 bg-slate-800/80' : ''}`}
            >
              {/* Header with Icon and Anomaly Badge */}
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-700">
                  {getMetricIcon(key)}
                </div>
                {isAnomaly ? (
                  <span className="flex items-center gap-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    {item.status_label}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Norm
                  </span>
                )}
              </div>

              {/* Sensor Name */}
              <div className="mt-3 truncate text-xs font-medium text-slate-400">
                {getMetricLabel(key, item)}
              </div>

              {/* Current Reading */}
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-xl font-extrabold ${isAnomaly ? 'text-red-400' : 'text-white'}`}>
                  {item.current}
                </span>
                <span className="text-xs text-slate-400">{item.unit}</span>
              </div>

              {/* Deviation vs 7d Baseline */}
              <div className="mt-2 flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-2">
                <span className="text-slate-500">7d: {item.baseline_mean}</span>
                <span className={`flex items-center font-bold ${
                  item.deviation_percent > 0 ? (isAnomaly ? 'text-red-400' : 'text-emerald-400') : (isAnomaly ? 'text-amber-400' : 'text-slate-400')
                }`}>
                  {item.deviation_percent > 0 ? `+${item.deviation_percent}%` : `${item.deviation_percent}%`}
                </span>
              </div>

              {/* Z-Score Subtitle */}
              <div className="mt-1 text-[10px] text-slate-500">
                Z: <span className={isAnomaly ? 'text-red-400 font-bold' : 'text-slate-400'}>{item.z_score}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Time-Series Timeline Chart with Threshold Zone */}
      <div className="glass-panel relative rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white sm:text-lg">
                {getMetricLabel(selectedMetric, activeMetricData)} {t.sensors.chartTitle}
              </h3>
              {activeMetricData.is_anomaly && (
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/40">
                  Anomaly Detected ({activeMetricData.deviation_percent > 0 ? `+${activeMetricData.deviation_percent}%` : `${activeMetricData.deviation_percent}%`})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Comparing live sensor telemetry against the 7-day historical moving average (±2σ baseline threshold zone).
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            {Object.keys(metrics).map((k) => (
              <button
                key={k}
                onClick={() => setSelectedMetric(k)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  selectedMetric === k
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {getMetricLabel(k, metrics[k]).split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Summary Stats Ribbon */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-900/60 p-3 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500">Current Reading:</span>
            <div className="font-bold text-white text-sm">{activeMetricData.current} {activeMetricData.unit}</div>
          </div>
          <div>
            <span className="text-slate-500">7-Day Mean (Norm):</span>
            <div className="font-bold text-slate-300 text-sm">{activeMetricData.baseline_mean} {activeMetricData.unit}</div>
          </div>
          <div>
            <span className="text-slate-500">Statistical Threshold (±2σ):</span>
            <div className="font-bold text-emerald-400 text-sm">{activeMetricData.threshold_min} – {activeMetricData.threshold_max} {activeMetricData.unit}</div>
          </div>
          <div>
            <span className="text-slate-500">Standard Deviation (σ):</span>
            <div className="font-bold text-slate-300 text-sm">±{activeMetricData.baseline_std} (Z={activeMetricData.z_score})</div>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="mt-6 h-72 w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  interval={Math.max(1, Math.floor(history.length / 8))}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(val: any) => [`${val} ${activeMetricData.unit}`, getMetricLabel(selectedMetric, activeMetricData)]}
                />

                {/* Normal Baseline Range Shading (Mean ± 2*Std) */}
                <ReferenceArea
                  y1={activeMetricData.threshold_min}
                  y2={activeMetricData.threshold_max}
                  fill="#10b981"
                  fillOpacity={0.07}
                  stroke="#10b981"
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                />

                {/* 7-day Historical Mean Line */}
                <ReferenceLine
                  y={activeMetricData.baseline_mean}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{ value: '7d Norm', fill: '#10b981', fontSize: 10, position: 'insideRight' }}
                />

                {/* Main Metric Data Line */}
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={getLineColor(selectedMetric)}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: getLineColor(selectedMetric) }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
              Loading telemetry visualization...
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500/40 border border-emerald-500 inline-block"></span>
              7-Day Normal Operating Zone (±2σ)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-emerald-500 inline-block"></span>
              Historical Baseline Moving Average
            </span>
          </div>
          <span>Updated continuously from rover telemetry bus</span>
        </div>
      </div>
    </div>
  );
};
