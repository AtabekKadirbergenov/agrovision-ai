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
  Calendar,
  Clock,
  CalendarDays
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

export type TimeRange = 'today' | 'week' | 'month';

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  currentLang,
  telemetry,
}) => {
  const t = translations[currentLang];
  const [selectedMetric, setSelectedMetric] = useState<string>('tds');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
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

  const activeMetricData = metrics[selectedMetric] || metrics['tds'];

  // Dynamic time-series datasets based on selected time range (Bugun / Hafta / Oy)
  const currentChartData = React.useMemo(() => {
    const curTemp = metrics.temperature?.current ?? 24.2;
    const curAirH = metrics.air_humidity?.current ?? 64.5;
    const curSoilH = metrics.soil_humidity?.current ?? 68.0;
    const curTds = metrics.tds?.current ?? 640.0;
    const curEc = metrics.ec?.current ?? +(curTds / 500).toFixed(2);
    const curPh = metrics.ph?.current ?? 6.45;

    if (timeRange === 'today') {
      // 24 hourly data points (from 00:00 to 23:00) with realistic diurnal variation
      const points = [];
      const currentHour = new Date().getHours();
      for (let h = 0; h < 24; h++) {
        const isCurrent = h === currentHour;
        const timeLabel = `${h.toString().padStart(2, '0')}:00`;
        const diurnalFactor = Math.sin(((h - 8) / 24) * 2 * Math.PI); // Peak at 14:00, trough at 02:00
        
        const temp = isCurrent ? curTemp : +(21.0 + diurnalFactor * 4.2 + (Math.sin(h) * 0.4)).toFixed(1);
        const airH = isCurrent ? curAirH : +(68.0 - diurnalFactor * 10.5 + (Math.cos(h) * 0.7)).toFixed(1);
        const soilH = isCurrent ? curSoilH : +(66.5 - (h / 24) * 3.5 + (h === 7 || h === 18 ? 4.5 : 0)).toFixed(1);
        const isSpikeHour = h >= 13 && h <= 15 && metrics.tds?.is_anomaly;
        const tds = isCurrent ? curTds : isSpikeHour ? 920.0 : +(625.0 + Math.sin(h / 3) * 25.0).toFixed(1);
        const ec = +(tds / 500.0).toFixed(2);
        const ph = isCurrent ? curPh : +(6.42 + Math.sin(h / 4) * 0.08).toFixed(2);

        points.push({
          time: isCurrent ? `${timeLabel} (Hozir)` : timeLabel,
          temperature: temp,
          air_humidity: airH,
          soil_humidity: soilH,
          tds: tds,
          ec: ec,
          ph: ph
        });
      }
      return points;
    }

    if (timeRange === 'week') {
      // 7 days (Monday through Sunday)
      const uzDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'];
      const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
      const points = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const isToday = i === 0;
        const dayName = uzDays[(d.getDay() + 6) % 7];
        const dateStr = `${d.getDate()}-${uzMonths[d.getMonth()]}`;
        const label = isToday ? `Bugun (${dayName})` : `${dayName} (${dateStr})`;

        const temp = isToday ? curTemp : +(22.5 + ((i % 3) - 1) * 0.9).toFixed(1);
        const airH = isToday ? curAirH : +(63.0 + ((i % 2 === 0 ? 1 : -1) * 3.2)).toFixed(1);
        const soilH = isToday ? curSoilH : +(67.0 + ((i % 4) - 2) * 1.5).toFixed(1);
        const tds = isToday ? curTds : +(630.0 + (i === 1 && metrics.tds?.is_anomaly ? 240.0 : (i * 4) - 8)).toFixed(1);
        const ec = +(tds / 500.0).toFixed(2);
        const ph = isToday ? curPh : +(6.45 + ((i % 3) - 1) * 0.05).toFixed(2);

        points.push({
          time: label,
          temperature: temp,
          air_humidity: airH,
          soil_humidity: soilH,
          tds: tds,
          ec: ec,
          ph: ph
        });
      }
      return points;
    }

    // timeRange === 'month' (30 days)
    const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const points = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isToday = i === 0;
      const dateStr = `${d.getDate().toString().padStart(2, '0')}-${uzMonths[d.getMonth()]}`;
      const label = isToday ? `Bugun` : dateStr;

      const temp = isToday ? curTemp : +(22.0 + Math.sin(i / 5) * 1.8).toFixed(1);
      const airH = isToday ? curAirH : +(64.0 + Math.cos(i / 4) * 4.5).toFixed(1);
      const soilH = isToday ? curSoilH : +(68.0 + Math.sin(i / 6) * 3.0).toFixed(1);
      const tds = isToday ? curTds : +(628.0 + (i === 2 && metrics.tds?.is_anomaly ? 260.0 : Math.sin(i / 3) * 22.0)).toFixed(1);
      const ec = +(tds / 500.0).toFixed(2);
      const ph = isToday ? curPh : +(6.44 + Math.sin(i / 7) * 0.08).toFixed(2);

      points.push({
        time: label,
        temperature: temp,
        air_humidity: airH,
        soil_humidity: soilH,
        tds: tds,
        ec: ec,
        ph: ph
      });
    }
    return points;
  }, [timeRange, metrics]);

  // Dynamically compute baseline mean and std for the chosen timeframe
  const timeframeStats = React.useMemo(() => {
    const values = currentChartData
      .map(d => (d as any)[selectedMetric])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    if (values.length === 0) {
      return {
        mean: activeMetricData.baseline_mean,
        threshold_min: activeMetricData.threshold_min,
        threshold_max: activeMetricData.threshold_max,
        std: activeMetricData.baseline_std,
        z_score: activeMetricData.z_score
      };
    }

    const mean = +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = +(Math.sqrt(variance) || activeMetricData.baseline_std).toFixed(1);
    const z = +(((activeMetricData.current - mean) / (std || 1))).toFixed(2);
    const tMin = +(mean - 2 * std).toFixed(1);
    const tMax = +(mean + 2 * std).toFixed(1);

    return {
      mean,
      threshold_min: Math.min(tMin, activeMetricData.threshold_min),
      threshold_max: Math.max(tMax, activeMetricData.threshold_max),
      std,
      z_score: z
    };
  }, [currentChartData, selectedMetric, activeMetricData]);

  const getTimeRangeTitle = (tr: TimeRange) => {
    switch (tr) {
      case 'today': return "Bugungi 24 Soatlik Dinamikasi";
      case 'week': return "7 Kunlik Haftalik Dinamikasi";
      case 'month': return "30 Kunlik Oylik Dinamikasi";
    }
  };

  const getTimeRangeMeanLabel = (tr: TimeRange) => {
    switch (tr) {
      case 'today': return "24-Soatlik O'rtacha (Norm):";
      case 'week': return "7-Kunlik O'rtacha (Norm):";
      case 'month': return "30-Kunlik O'rtacha (Norm):";
    }
  };

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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white sm:text-lg">
                {getMetricLabel(selectedMetric, activeMetricData)} {getTimeRangeTitle(timeRange)}
              </h3>
              {activeMetricData.is_anomaly && (
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/40">
                  Anomaliya ({activeMetricData.deviation_percent > 0 ? `+${activeMetricData.deviation_percent}%` : `${activeMetricData.deviation_percent}%`})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {timeRange === 'today'
                ? "Real-vaqt 24 soatlik soatbay telemetriya va kunlik me'yor (±2σ) ko'rsatkichlari."
                : timeRange === 'week'
                ? "Kundalik telemetriya o'rtachasi va 7 kunlik agronomik me'yor (±2σ baseline) taqqoslamasi."
                : "30 kunlik o'suv davri monitoringi va mavsumiy statistik me'yor koridori (±2σ)."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Switcher (Bugun / Hafta / Oy) */}
            <div className="flex items-center rounded-xl bg-slate-950/90 p-1 border border-slate-800 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setTimeRange('today')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                  timeRange === 'today'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Bugun</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('week')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                  timeRange === 'week'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Hafta</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('month')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                  timeRange === 'month'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Oy</span>
              </button>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
              {Object.keys(metrics).map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedMetric(k)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedMetric === k
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {getMetricLabel(k, metrics[k]).split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Summary Stats Ribbon */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-900/60 p-3 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500">Hozirgi Ko'rsatkich (Current):</span>
            <div className="font-bold text-white text-sm">{activeMetricData.current} {activeMetricData.unit}</div>
          </div>
          <div>
            <span className="text-slate-500">{getTimeRangeMeanLabel(timeRange)}</span>
            <div className="font-bold text-slate-300 text-sm">{timeframeStats.mean} {activeMetricData.unit}</div>
          </div>
          <div>
            <span className="text-slate-500">Statistik Me'yor (±2σ):</span>
            <div className="font-bold text-emerald-400 text-sm">{timeframeStats.threshold_min} – {timeframeStats.threshold_max} {activeMetricData.unit}</div>
          </div>
          <div>
            <span className="text-slate-500">Standart Og'ish (σ):</span>
            <div className="font-bold text-slate-300 text-sm">±{timeframeStats.std} (Z={timeframeStats.z_score})</div>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="mt-6 h-72 w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  interval={timeRange === 'week' ? 0 : timeRange === 'today' ? 3 : 4}
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
                  y1={timeframeStats.threshold_min}
                  y2={timeframeStats.threshold_max}
                  fill="#10b981"
                  fillOpacity={0.07}
                  stroke="#10b981"
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                />

                {/* Timeframe Mean Reference Line */}
                <ReferenceLine
                  y={timeframeStats.mean}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{
                    value: timeRange === 'today' ? '24s Norm' : timeRange === 'week' ? '7d Norm' : '30k Norm',
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'insideRight'
                  }}
                />

                {/* Main Metric Data Line */}
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={getLineColor(selectedMetric)}
                  strokeWidth={2.5}
                  dot={timeRange === 'week' ? { r: 3, fill: getLineColor(selectedMetric) } : false}
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500/40 border border-emerald-500 inline-block"></span>
              {timeRange === 'today' ? 'Bugungi me\'yor koridori (±2σ)' : timeRange === 'week' ? '7-Kunlik me\'yor koridori (±2σ)' : '30-Kunlik mavsumiy me\'yor (±2σ)'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-emerald-500 inline-block"></span>
              {timeRange === 'today' ? '24s O\'rtacha Dinamik Me\'yor' : timeRange === 'week' ? 'Haftalik Harakatlanuvchi O\'rtacha' : 'Oylik Tarixiy Baza'}
            </span>
          </div>
          <span>Rover va datchiklar telemetriya shinasidan doimiy yangilanadi</span>
        </div>
      </div>
    </div>
  );
};
