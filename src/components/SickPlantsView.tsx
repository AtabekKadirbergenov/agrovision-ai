'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Cpu,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { PlantBrief } from '@/lib/api';

interface SickPlantsViewProps {
  currentLang: Language;
  plants: PlantBrief[];
  onSelectPlant: (plant: PlantBrief) => void;
}

export const SickPlantsView: React.FC<SickPlantsViewProps> = ({
  currentLang,
  plants,
  onSelectPlant,
}) => {
  const t = translations[currentLang];
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Filter only sick or warning plants
  const sickList = plants.filter(
    (p) => p.health_status === 'diseased' || p.health_status === 'warning'
  );

  // Apply severity filter
  const filteredList = sickList.filter((p) => {
    if (severityFilter === 'all') return true;
    const sev = p.latest_scan?.llm_severity_level?.toLowerCase() || 'medium';
    return sev === severityFilter.toLowerCase();
  });

  // Sort by severity (Critical first)
  filteredList.sort((a, b) => {
    const sevOrder: Record<string, number> = { critical: 3, medium: 2, low: 1, none: 0 };
    const aSev = sevOrder[a.latest_scan?.llm_severity_level?.toLowerCase() || 'medium'] || 0;
    const bSev = sevOrder[b.latest_scan?.llm_severity_level?.toLowerCase() || 'medium'] || 0;
    return bSev - aSev;
  });

  const getSeverityBadge = (severity?: string) => {
    const s = severity?.toLowerCase() || 'medium';
    switch (s) {
      case 'critical':
        return (
          <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/40">
            CRITICAL SEVERITY
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/40">
            MEDIUM SEVERITY
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/40">
            LOW / ABIOTIC
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Filter Ribbon */}
      <div className="glass-panel flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t.sick.title}
            </h2>
            <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {sickList.length} Plants
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t.sick.subtitle}
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
          <Filter className="ml-2 mr-1 h-3.5 w-3.5 text-slate-400" />
          <button
            onClick={() => setSeverityFilter('all')}
            className={`rounded-lg px-2.5 py-1 transition ${
              severityFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.sick.severityAll}
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`rounded-lg px-2.5 py-1 transition ${
              severityFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.sick.severityCritical}
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            className={`rounded-lg px-2.5 py-1 transition ${
              severityFilter === 'medium'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.sick.severityMedium}
          </button>
          <button
            onClick={() => setSeverityFilter('low')}
            className={`rounded-lg px-2.5 py-1 transition ${
              severityFilter === 'low'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.sick.severityLow}
          </button>
        </div>
      </div>

      {/* Sick Plants Cards List */}
      {filteredList.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center shadow-lg">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
          <h3 className="text-base font-bold text-white">{t.sick.emptyText}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            No plants match the selected severity filter. All rover scan criteria conform to normal vegetation standards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredList.map((plant) => {
            const scan = plant.latest_scan;
            const modelsAgree = scan?.models_agree ?? true;

            return (
              <div
                key={plant.id}
                className="glass-panel rounded-2xl p-5 shadow-xl border-l-4 transition hover:border-l-emerald-500 hover:bg-slate-900/80"
                style={{
                  borderLeftColor:
                    scan?.llm_severity_level?.toLowerCase() === 'critical'
                      ? '#ef4444'
                      : '#f59e0b',
                }}
              >
                {/* Card Header: Node ID & Severity */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{plant.name}</span>
                    <span className="text-xs text-slate-400">({plant.variety})</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                      [{plant.row_label}, {plant.col_label}]
                    </span>
                  </div>
                  {getSeverityBadge(scan?.llm_severity_level)}
                </div>

                {/* Main Diagnosis Content */}
                <div className="mt-4 flex flex-col gap-3">
                  {/* Dual AI Predictions Grid */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                    {/* CNN Model Output */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                          CNN Classifier
                        </span>
                        <span className="font-bold text-emerald-400">
                          {scan?.cnn_confidence ?? 90}%
                        </span>
                      </div>
                      <div className="font-bold text-white truncate text-sm">
                        {scan?.cnn_predicted_class || 'Pathology Detected'}
                      </div>
                    </div>

                    {/* Vision LLM Output */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                          Vision LLM
                        </span>
                        <span className="font-medium text-slate-400">Multimodal</span>
                      </div>
                      <div className="font-bold text-purple-300 truncate text-sm">
                        {scan?.llm_diagnosis || 'Vizual Tashxis'}
                      </div>
                    </div>
                  </div>

                  {/* Consensus Badge */}
                  <div className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-between ${
                    modelsAgree
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                  }`}>
                    <span>
                      {modelsAgree
                        ? '✓ Modellar kelishdi (To\'liq Konsensus)'
                        : '⚠ Modellar ixtilofi / Ogohlantirish'}
                    </span>
                    <span className="text-[11px] opacity-80 font-normal">
                      Skanerlangan: {scan?.scanned_at ? new Date(scan.scanned_at).toLocaleDateString() : 'Bugun'}
                    </span>
                  </div>

                  {/* Quick Action Plan snippet */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      {t.sick.quickTreatment}
                    </span>
                    <p className="line-clamp-2 leading-relaxed">
                      {scan?.llm_treatment_plan || 'O\'simlikni izolyatsiya qiling va keng qamrovli organik mis fungitsidini qo\'llang.'}
                    </p>
                  </div>

                  {/* Inspect Button */}
                  <button
                    onClick={() => onSelectPlant(plant)}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition group"
                  >
                    <span>{t.sick.inspectButton} & Xronologik Vaqt Chizig'i</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
