'use client';

import React from 'react';
import { Sprout, CheckCircle2, AlertTriangle, Activity, Clock } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { OverviewKPI } from '@/lib/api';

interface KpiCardsProps {
  currentLang: Language;
  kpis: OverviewKPI | null;
  onSelectSickTab: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  currentLang,
  kpis,
  onSelectSickTab,
}) => {
  const t = translations[currentLang];

  const total = kpis?.total_plants || 25;
  const healthy = kpis?.healthy_count || 19;
  const warning = kpis?.warning_count || 3;
  const diseased = kpis?.diseased_count || 3;
  const anomalies = kpis?.active_anomalies_count || 0;
  const healthyRate = Math.round((healthy / Math.max(1, total)) * 100);

  const formattedTime = kpis?.last_scan_timestamp
    ? new Date(kpis.last_scan_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Plants */}
      <div className="glass-panel relative overflow-hidden rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.kpi.totalPlants}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sprout className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white">{total}</span>
          <span className="text-xs text-slate-400">nodes in 5x5 grid</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
          <Clock className="h-3.5 w-3.5" />
          <span suppressHydrationWarning>{t.kpi.lastScan}: {formattedTime}</span>
        </div>
      </div>

      {/* 2. Healthy Plants */}
      <div className="glass-panel relative overflow-hidden rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.kpi.healthy}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400">{healthy}</span>
          <span className="text-xs font-semibold text-emerald-500/90">({healthyRate}%)</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${healthyRate}%` }}
          />
        </div>
      </div>

      {/* 3. Sick / Warning Plants */}
      <div
        onClick={onSelectSickTab}
        className="glass-panel glass-panel-hover relative cursor-pointer overflow-hidden rounded-2xl p-5 shadow-lg transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.kpi.diseased} & {t.kpi.warning}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-400">{diseased}</span>
          <span className="text-xs text-slate-400">critical +</span>
          <span className="text-xl font-bold text-amber-400">{warning}</span>
          <span className="text-xs text-slate-400">warning</span>
        </div>
        <p className="mt-3 text-xs text-rose-400/90 underline decoration-rose-500/40 underline-offset-2">
          Click to review sick registry →
        </p>
      </div>

      {/* 4. Sensor Anomalies Status */}
      <div className={`glass-panel relative overflow-hidden rounded-2xl p-5 shadow-lg ${
        anomalies > 0 ? 'border-red-500/40 bg-red-950/20' : ''
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.kpi.activeAnomalies}
          </span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
            anomalies > 0
              ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold ${anomalies > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {anomalies > 0 ? `${anomalies} Active` : '0 Alerts'}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {anomalies > 0 ? 'Z-score threshold exceeded (±2σ)' : 'All telemetry within 7-day bounds'}
        </p>
      </div>
    </div>
  );
};
