'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, TrendingUp, TrendingDown, AlertOctagon } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { TelemetryResponse } from '@/lib/api';

interface AnomalyBannerProps {
  currentLang: Language;
  telemetry: TelemetryResponse | null;
}

export const AnomalyBanner: React.FC<AnomalyBannerProps> = ({
  currentLang,
  telemetry,
}) => {
  const t = translations[currentLang];
  const hasAnomaly = telemetry?.global_anomaly_detected ?? true;
  const metrics = telemetry?.metrics || {};

  // Find anomalous metrics
  const anomalousEntries = Object.entries(metrics).filter(([_, m]) => m.is_anomaly);

  if (hasAnomaly && anomalousEntries.length > 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/60 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/50 p-5 shadow-2xl shadow-red-500/10">
        {/* Glow ambient background */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-600/20 blur-3xl" />
        
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                  {t.anomaly.detectedTitle}
                </span>
                <span className="text-xs font-medium text-red-300/80">
                  Z-Score Threshold (±2σ) Exceeded
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                {t.anomaly.detectedSubtitle}
              </p>
            </div>
          </div>

          {/* Anomalous Sensor Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {anomalousEntries.map(([key, item]) => {
              const isSpike = item.current > item.baseline_mean;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/60 px-3.5 py-2 text-xs shadow-md"
                >
                  {isSpike ? (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-amber-400" />
                  )}
                  <div>
                    <div className="font-semibold text-white">
                      {item.name}: <span className="text-red-400 font-bold">{item.current} {item.unit}</span>
                    </div>
                    <div className="text-[11px] text-red-300/90">
                      {item.deviation_percent > 0 ? `+${item.deviation_percent}%` : `${item.deviation_percent}%`} vs 7d norm ({item.baseline_mean} {item.unit})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Normal State
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-teal-950/20 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400 text-sm tracking-wide">
                {t.anomaly.normalTitle}
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                Healthy Microclimate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.anomaly.normalSubtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-xs font-semibold text-slate-400">7-Day Moving Avg Quality</span>
          <div className="text-sm font-bold text-emerald-400">99.4% Stability Index</div>
        </div>
      </div>
    </div>
  );
};
