'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { uploadScan, LiveScanResult, API_BASE_URL } from '@/lib/api';

interface LiveDiagnosticSandboxProps {
  currentLang: Language;
  onScanCompleted?: () => void;
}

export const LiveDiagnosticSandbox: React.FC<LiveDiagnosticSandboxProps> = ({
  currentLang,
  onScanCompleted,
}) => {
  const t = translations[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<LiveScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setErrorMsg(null);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setErrorMsg(null);
  };

  // Trigger Live Dual-AI Scan
  const handleExecuteAnalysis = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const result = await uploadScan(selectedFile);
      setScanResult(result);
      if (onScanCompleted) onScanCompleted();
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Analysis failed. Please verify server status.');
    } finally {
      setIsUploading(false);
    }
  };

  // Presets: Fetch static sample leaf from backend and analyze directly
  const handleLoadPreset = async (filename: string, label: string) => {
    setIsUploading(true);
    setErrorMsg(null);
    setScanResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/static/${filename}`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(`${API_BASE_URL}/static/${filename}`);

      // Run live scan
      const result = await uploadScan(file);
      setScanResult(result);
      if (onScanCompleted) onScanCompleted();
    } catch (err: any) {
      console.error('Preset error:', err);
      setErrorMsg(`Failed to load preset ${label}: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t.sandbox.title}
            </h2>
            <p className="text-xs text-slate-400">
              {t.sandbox.subtitle}
            </p>
          </div>
        </div>

        {/* 1-Click Clinical Leaf Presets */}
        <div className="mt-5 border-t border-slate-800 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            {t.sandbox.presetsTitle}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleLoadPreset('leaf_healthy.jpg', 'Healthy')}
              disabled={isUploading}
              className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition"
            >
              🌱 Healthy Leaf Sample
            </button>
            <button
              onClick={() => handleLoadPreset('leaf_blight_early.jpg', 'Early Blight')}
              disabled={isUploading}
              className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition"
            >
              🍂 Alternaria Early Blight
            </button>
            <button
              onClick={() => handleLoadPreset('leaf_mold.jpg', 'Leaf Mold')}
              disabled={isUploading}
              className="rounded-xl border border-amber-500/40 bg-amber-950/40 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 transition"
            >
              🍃 Passalora Leaf Mold
            </button>
            <button
              onClick={() => handleLoadPreset('leaf_mite.jpg', 'Spider Mite')}
              disabled={isUploading}
              className="rounded-xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/60 transition"
            >
              🕷️ Spider Mites Stippling
            </button>
            <button
              onClick={() => handleLoadPreset('leaf_deficiency.jpg', 'Deficiency')}
              disabled={isUploading}
              className="rounded-xl border border-blue-500/40 bg-blue-950/40 px-3.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-900/60 transition"
            >
              ⚡ Magnesium Deficiency (Chlorosis)
            </button>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Zone + Execution Trigger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Upload Box (5 cols) */}
        <div className="lg:col-span-5">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group glass-panel relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition hover:border-emerald-500/60 hover:bg-slate-900/80 ${
              previewUrl ? 'border-emerald-500/60 bg-slate-900/60' : 'border-slate-700 bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-700 bg-black shadow-lg">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="h-full w-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-xs font-bold text-white">
                  Click to replace photo
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 group-hover:scale-110 transition">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-white text-sm">
                  {t.sandbox.dragDropText}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  {t.sandbox.orBrowse}
                </p>
              </div>
            )}
          </div>

          {/* Execute Button */}
          {previewUrl && !scanResult && (
            <button
              onClick={handleExecuteAnalysis}
              disabled={isUploading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{t.sandbox.analyzing}</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>{t.sandbox.runAnalysis}</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Live Parallel AI Diagnostic Output (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {isUploading ? (
            <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center shadow-xl">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Cpu className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="mt-4 font-bold text-white text-base">
                {t.sandbox.dualAiExecuting}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Evaluating image across PyTorch EfficientNet convolution layers and Multimodal Vision LLM prompt pipeline...
              </p>
            </div>
          ) : scanResult ? (
            <div className="flex flex-col gap-4">
              {/* Consensus Pill */}
              <div className={`rounded-xl p-3 border flex items-center justify-between text-xs font-bold ${
                scanResult.models_agree
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}>
                <span className="flex items-center gap-1.5">
                  {scanResult.models_agree ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {scanResult.models_agree ? '✓ Both AI Models Agree on Pathology' : '⚠ Model Divergence Warning'}
                </span>
                <span className="uppercase text-[11px] opacity-80">
                  Target: {scanResult.plant_id}
                </span>
              </div>

              {/* Side-by-Side Dual AI Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* CNN Card */}
                <div className="glass-panel rounded-2xl p-4 shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Cpu className="h-4 w-4 text-emerald-400" />
                      CNN Classifier
                    </span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                      {scanResult.cnn_analysis.confidence_score}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-base font-extrabold text-white">
                      {scanResult.cnn_analysis.predicted_class}
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5">
                      {scanResult.cnn_analysis.top_3_probabilities?.map((top, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-slate-400 bg-slate-900/60 rounded px-2 py-1">
                          <span>{idx + 1}. {top.class_name}</span>
                          <span className="font-bold text-emerald-400">{top.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vision LLM Card */}
                <div className="glass-panel rounded-2xl p-4 shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Vision LLM
                    </span>
                    <span className="rounded bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/20 uppercase">
                      {scanResult.llm_analysis.severity_level}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-base font-extrabold text-purple-300">
                      {scanResult.llm_analysis.visual_diagnosis}
                    </div>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {scanResult.llm_analysis.symptom_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actionable Treatment Plan */}
              <div className="glass-panel rounded-2xl p-4 shadow-lg border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  💡 4 Bosqichli Amaliy Agronomik Davolash Rejasi:
                </span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {scanResult.llm_analysis.actionable_treatment_plan}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center text-slate-500 border border-dashed border-slate-800">
              <FileImage className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-400">
                Barg suratini yuklang yoki yuqoridagi namunalardan birini tanlang...
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Dual-AI (CNN + Vision LLM) tahlilini boshlash uchun surat yuklang yoki namunani bosing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
