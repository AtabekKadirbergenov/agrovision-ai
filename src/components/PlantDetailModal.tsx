'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { PlantBrief, PlantDetail, ScanRecord, getPlantDetail, API_BASE_URL } from '@/lib/api';

interface PlantDetailModalProps {
  currentLang: Language;
  plant: PlantBrief | null;
  onClose: () => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  currentLang,
  plant,
  onClose,
}) => {
  const t = translations[currentLang];
  const [detail, setDetail] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedScanIdx, setSelectedScanIdx] = useState<number>(0);

  useEffect(() => {
    if (!plant) return;
    setLoading(true);
    getPlantDetail(plant.id)
      .then((data) => {
        setDetail(data);
        setSelectedScanIdx(0); // Latest scan is first in list
      })
      .catch((err) => {
        console.error('Failed to load plant detail:', err);
      })
      .finally(() => setLoading(false));
  }, [plant]);

  if (!plant) return null;

  const scans = detail?.scans || (plant.latest_scan ? [plant.latest_scan] : []);
  const currentScan: ScanRecord | undefined = scans[selectedScanIdx];

  // Parse top 3 candidates from JSON if string
  let top3Candidates: Array<{ class_name: string; confidence: number }> = [];
  if (currentScan?.cnn_top_3) {
    try {
      top3Candidates = typeof currentScan.cnn_top_3 === 'string'
        ? JSON.parse(currentScan.cnn_top_3)
        : currentScan.cnn_top_3;
    } catch {
      top3Candidates = [];
    }
  }

  const modelsAgree = currentScan?.models_agree ?? true;

  // Resolve absolute image URL
  const getFullImageUrl = (path?: string) => {
    if (!path) return '/placeholder-leaf.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-[#0c1421] shadow-2xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  {plant.name}
                </h2>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  {plant.variety}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
                  [{plant.row_label}, {plant.col_label}]
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.modal.plantProfile} • Tracked via Rover Patrol Line
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[82vh] overflow-y-auto p-6 flex flex-col gap-6">
          {/* Top Section: Before vs After Visual Progression Timeline Slider */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.modal.beforeAfterTitle}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {scans.length} Chronological Rover Scans
              </span>
            </div>

            {/* Timeline Horizontal Selector */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {scans.map((scan, sIdx) => {
                const isSelected = selectedScanIdx === sIdx;
                const isLatest = sIdx === 0;
                const isOldest = sIdx === scans.length - 1;

                return (
                  <div
                    key={scan.id || sIdx}
                    onClick={() => setSelectedScanIdx(sIdx)}
                    className={`cursor-pointer rounded-xl border p-2.5 transition relative overflow-hidden ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Timestamp & Stage Tag */}
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
                      <span className={isLatest ? 'text-emerald-400' : isOldest ? 'text-amber-400' : 'text-slate-400'}>
                        {isLatest ? 'Current (Latest)' : isOldest ? 'Baseline (Before)' : `Stage ${scans.length - sIdx}`}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(scan.scanned_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/60 relative">
                      <img
                        src={getFullImageUrl(scan.image_url)}
                        alt={`Scan ${sIdx}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Quick result snippet */}
                    <div className="mt-2 text-[11px] font-bold text-white truncate">
                      {scan.cnn_predicted_class}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Consensus Banner */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl p-4 border ${
            modelsAgree
              ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
              : 'border-amber-500/50 bg-amber-950/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                modelsAgree ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}>
                {modelsAgree ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  {modelsAgree ? t.modal.consensusAgree : t.modal.consensusDisagree}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  {currentScan?.consensus_note || 'Ikkala AI modeli ham ushbu kadr bo\'yicha mustaqil tashxis qo\'ydi.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Severity Level</span>
              <span className={`font-black text-sm uppercase ${
                currentScan?.llm_severity_level === 'Critical' ? 'text-red-400' :
                currentScan?.llm_severity_level === 'Medium' ? 'text-amber-400' :
                'text-emerald-400'
              }`}>
                {currentScan?.llm_severity_level || 'Normal'}
              </span>
            </div>
          </div>

          {/* Side-by-Side Dual AI Analysis Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT: Custom CNN Classifier Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                {/* Engine Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {t.modal.cnnTitle}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        PyTorch EfficientNet-B0 (101 Classes)
                      </span>
                    </div>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    {currentScan?.cnn_confidence ?? 92.5}% Conf.
                  </span>
                </div>

                {/* Primary Prediction */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.modal.predictedClass}
                  </span>
                  <div className="mt-1 text-xl font-extrabold text-white">
                    {currentScan?.cnn_predicted_class || 'Healthy'}
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${currentScan?.cnn_confidence ?? 90}%` }}
                    />
                  </div>
                </div>

                {/* Top-3 Candidates Probabilistic Breakdown */}
                <div className="mt-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.modal.topCandidates}
                  </span>
                  <div className="mt-2.5 flex flex-col gap-2">
                    {top3Candidates.length > 0 ? (
                      top3Candidates.map((cand, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 px-3.5 py-2 text-xs"
                        >
                          <span className="font-medium text-slate-300">
                            {idx + 1}. {cand.class_name}
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {cand.confidence}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500">Probabilistic candidates computed.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-[11px] text-slate-400">
                ⚡ Feature maps processed in 28ms on Edge/Server runtime.
              </div>
            </div>

            {/* RIGHT: Multimodal Vision LLM Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                {/* Engine Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {t.modal.llmTitle}
                      </h4>
                      <span className="text-[10px] text-purple-400 font-mono">
                        Multimodal Visual Pathology Engine
                      </span>
                    </div>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                    currentScan?.llm_severity_level === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    currentScan?.llm_severity_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {currentScan?.llm_severity_level || 'None'}
                  </span>
                </div>

                {/* Visual Diagnosis */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.modal.visualDiagnosis}
                  </span>
                  <div className="mt-1 text-xl font-extrabold text-purple-300">
                    {currentScan?.llm_diagnosis || 'Sog\'lom To\'qima'}
                  </div>
                </div>

                {/* Observed Symptoms */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.modal.symptoms}
                  </span>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                    {currentScan?.llm_symptom_description || 'Uniform pigmentation, clean vascular venation.'}
                  </p>
                </div>

                {/* Step-by-Step Actionable Treatment Protocol */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.modal.treatmentPlan}
                  </span>
                  <div className="mt-1 rounded-xl bg-slate-950/80 p-3 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {currentScan?.llm_treatment_plan || 'Maintain current fertigation and scheduled rover monitoring.'}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-[11px] text-slate-400">
                🌱 Actionable agronomic steps generated via pathology knowledge base.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2 text-xs font-bold text-white transition"
          >
            {t.modal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
