'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Eye,
  CheckCircle2,
  Settings2,
  Check,
  RefreshCw,
  Sliders,
  ChevronDown,
  Info,
  Key,
  ExternalLink,
  X
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { extractCanvasFeatures } from '@/lib/imageAnalysis';
import {
  API_BASE_URL,
  CameraAnalysisResult,
  analyzeCameraSnapshot,
  getGeminiKeyStatus,
  saveGeminiKey
} from '@/lib/api';

interface DualLiveCameraProps {
  currentLang: Language;
}

interface CameraConfig {
  id: string;
  name: string;
  defaultStreamUrl: string;
  demoImageUrl: string;
  description: string;
}

const CAMERAS: CameraConfig[] = [
  {
    id: 'camera_1',
    name: '1-Kamera: Old Panoramik Ko\'rinish',
    defaultStreamUrl: 'http://192.168.137.181:81/stream',
    demoImageUrl: `${API_BASE_URL}/static/leaf_healthy.jpg`,
    description: 'Rover yo\'nalishi va umumiy ekin qatorlarini panoramik nazorat qilish'
  },
  {
    id: 'camera_2',
    name: '2-Kamera: Makro Barg Patologiyasi',
    defaultStreamUrl: 'http://192.168.137.181:81/stream',
    demoImageUrl: `${API_BASE_URL}/static/leaf_blight_early.jpg`,
    description: 'Bargdagi mikro-kasalliklar, zamburug\' va zararkunandalarni yaqindan aniqlash'
  }
];

export const DualLiveCamera: React.FC<DualLiveCameraProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  // States per camera - Default to LIVE stream for active ESP32 camera
  const [streamModes, setStreamModes] = useState<Record<string, 'live' | 'demo' | 'webcam'>>({
    camera_1: 'live',
    camera_2: 'demo'
  });
  const [streamUrls, setStreamUrls] = useState<Record<string, string>>({
    camera_1: 'http://192.168.137.187:81/stream',
    camera_2: 'http://192.168.137.187:81/stream'
  });
  const [isConfigOpen, setIsConfigOpen] = useState<Record<string, boolean>>({
    camera_1: false,
    camera_2: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({
    camera_1: false,
    camera_2: false
  });
  const [analysisResults, setAnalysisResults] = useState<Record<string, CameraAnalysisResult | null>>({
    camera_1: null,
    camera_2: null
  });
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({
    camera_1: '',
    camera_2: ''
  });

  // Gemini API Key management
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<{ has_key: boolean; masked_key: string; engine: string }>({
    has_key: false,
    masked_key: '',
    engine: ''
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [keySaving, setKeySaving] = useState(false);

  useEffect(() => {
    getGeminiKeyStatus().then(setGeminiKeyStatus).catch(() => {});
  }, []);

  const handleSaveGeminiKey = async () => {
    if (!inputKey.trim()) return;
    setKeySaving(true);
    try {
      const res = await saveGeminiKey(inputKey.trim());
      setGeminiKeyStatus({
        has_key: res.has_key,
        masked_key: `${inputKey.slice(0, 6)}...${inputKey.slice(-4)}`,
        engine: res.engine
      });
      setIsKeyModalOpen(false);
      setInputKey('');
    } catch (e) {
      alert("Kalitni saqlashda xatolik yuz berdi");
    } finally {
      setKeySaving(false);
    }
  };

  const webcamRefs = {
    camera_1: useRef<HTMLVideoElement | null>(null),
    camera_2: useRef<HTMLVideoElement | null>(null)
  };

  const espImgRefs = {
    camera_1: useRef<HTMLImageElement | null>(null),
    camera_2: useRef<HTMLImageElement | null>(null)
  };

  const [capturedThumbnails, setCapturedThumbnails] = useState<Record<string, string>>({
    camera_1: '',
    camera_2: ''
  });

  // Setup webcam if selected
  const startWebcam = async (camId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      const videoEl = webcamRefs[camId as keyof typeof webcamRefs]?.current;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play();
      }
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setErrorMessages(prev => ({
        ...prev,
        [camId]: "Veb-kameraga ulanib bo'lmadi. Demo rejimiga o'tildi."
      }));
      setStreamModes(prev => ({ ...prev, [camId]: 'demo' }));
    }
  };

  const handleModeChange = (camId: string, mode: 'live' | 'demo' | 'webcam') => {
    setStreamModes(prev => ({ ...prev, [camId]: mode }));
    setErrorMessages(prev => ({ ...prev, [camId]: '' }));
    if (mode === 'webcam') {
      startWebcam(camId);
    } else {
      const videoEl = webcamRefs[camId as keyof typeof webcamRefs]?.current;
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
      }
    }
  };

  // Capture photo from video feed and send to FastAPI
  const handleCaptureAndAnalyze = async (cam: CameraConfig) => {
    const camId = cam.id;
    setIsAnalyzing(prev => ({ ...prev, [camId]: true }));
    setErrorMessages(prev => ({ ...prev, [camId]: '' }));

    try {
      let imageBlob: Blob | null = null;
      let features: any = null;
      const currentMode = streamModes[camId];

      if (currentMode === 'webcam') {
        const videoEl = webcamRefs[camId as keyof typeof webcamRefs]?.current;
        if (videoEl && videoEl.videoWidth) {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            features = extractCanvasFeatures(ctx, canvas.width, canvas.height);
            imageBlob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.92));
          }
        }
      } else if (currentMode === 'live') {
        // 1. First, attempt instant client canvas capture from live streaming <img>
        const imgEl = espImgRefs[camId as keyof typeof espImgRefs]?.current;
        if (imgEl && (imgEl.naturalWidth > 0 || imgEl.clientWidth > 0)) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = imgEl.naturalWidth || imgEl.clientWidth || 640;
            canvas.height = imgEl.naturalHeight || imgEl.clientHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
              features = extractCanvasFeatures(ctx, canvas.width, canvas.height);
              imageBlob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.92));
            }
          } catch (canvasErr) {
            console.warn("Direct canvas snapshot of stream failed (CORS/taint):", canvasErr);
          }
        }

        // 2. Direct ESP32 /capture endpoint from user's local network browser session
        if (!imageBlob) {
          try {
            const baseUrl = streamUrls[camId].replace('/stream', '').replace(':81', '');
            const captureUrl = `${baseUrl}/capture`;
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 3000);
            const resp = await fetch(captureUrl, { signal: controller.signal });
            clearTimeout(tid);
            if (resp.ok) {
              imageBlob = await resp.blob();
            }
          } catch (e) {
            console.warn("Direct ESP32 capture failed:", e);
          }
        }

        // 3. Fallback to serverless backend proxy
        if (!imageBlob) {
          try {
            const proxyUrl = `${API_BASE_URL}/api/camera/proxy-capture?stream_url=${encodeURIComponent(streamUrls[camId])}`;
            const resp = await fetch(proxyUrl);
            if (resp.ok) {
              imageBlob = await resp.blob();
            }
          } catch (e) {
            console.warn("Proxy capture failed:", e);
          }
        }

        if (!imageBlob) {
          throw new Error("ESP32 kameradan jonli kadr olib bo'lmadi. Qurilma yoqilganligini, Wi-Fi («karsu») aloqasini va IP manzilini tekshiring.");
        }
      } else {
        // Demo mode: load botanical sample
        const resp = await fetch(cam.demoImageUrl);
        imageBlob = await resp.blob();
      }

      if (!imageBlob) {
        throw new Error("Kamera kadrini olib bo'lmadi.");
      }

      // Immediately store the actual captured frame so the result thumbnail shows this exact photo
      const localSnapUrl = URL.createObjectURL(imageBlob);
      setCapturedThumbnails(prev => ({ ...prev, [camId]: localSnapUrl }));

      // If features were not extracted directly from webcam, analyze via offscreen canvas
      if (!features) {
        try {
          const img = new Image();
          const objUrl = URL.createObjectURL(imageBlob);
          img.src = objUrl;
          await new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          });
          const c = document.createElement('canvas');
          c.width = img.naturalWidth || 300;
          c.height = img.naturalHeight || 300;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, c.width, c.height);
            features = extractCanvasFeatures(ctx, c.width, c.height);
          }
          URL.revokeObjectURL(objUrl);
        } catch (e) {
          console.warn("Canvas feature extraction error:", e);
        }
      }

      // Send to dual AI endpoint
      const result = await analyzeCameraSnapshot(imageBlob, camId, cam.name, features);
      setAnalysisResults(prev => ({ ...prev, [camId]: result }));
    } catch (err: any) {
      console.error("Camera analysis error:", err);
      setErrorMessages(prev => ({
        ...prev,
        [camId]: err.message || "Tahlil jarayonida xatolik yuz berdi"
      }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [camId]: false }));
    }
  };

  const getSeverityBadge = (level: string) => {
    const l = level?.toLowerCase() || '';
    if (l.includes('xavfli') || l.includes('critical')) {
      return 'bg-red-500/20 text-red-300 border-red-500/40';
    }
    if (l.includes('o\'rta') || l.includes('medium')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (l.includes('yengil') || l.includes('low')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-md">
      {/* Section Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                {t.cameras.title}
              </h2>
              <p className="text-xs text-slate-400">
                {t.cameras.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gemini AI Key button */}
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              geminiKeyStatus.has_key
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
            }`}
            title="Google Gemini 1.5 Multimodal Vision API kaliti"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>{geminiKeyStatus.has_key ? `Gemini Vision: Faol (${geminiKeyStatus.masked_key})` : '🔑 Real Gemini AI Kaliti'}</span>
          </button>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>2 Ta Kamera Ulandi</span>
          </span>
        </div>
      </div>

      {/* Two Live Camera Feed Columns */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {CAMERAS.map((cam, idx) => {
          const camId = cam.id;
          const currentMode = streamModes[camId];
          const analyzing = isAnalyzing[camId];
          const result = analysisResults[camId];
          const errorMsg = errorMessages[camId];
          const configOpen = isConfigOpen[camId];

          return (
            <div
              key={camId}
              className="flex flex-col rounded-2xl border border-slate-800 bg-[#0d1424]/90 p-4 shadow-lg transition"
            >
              {/* Camera Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {idx === 0 ? t.cameras.cam1Title : t.cameras.cam2Title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {idx === 0 ? t.cameras.cam1Desc : t.cameras.cam2Desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Selector Dropdown Pill */}
                  <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleModeChange(camId, 'demo')}
                      className={`rounded px-2 py-0.5 font-medium transition ${
                        currentMode === 'demo'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.cameras.modeSim}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange(camId, 'live')}
                      className={`rounded px-2 py-0.5 font-medium transition ${
                        currentMode === 'live'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.cameras.modeLive}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange(camId, 'webcam')}
                      className={`rounded px-2 py-0.5 font-medium transition ${
                        currentMode === 'webcam'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.cameras.modeWebcam}
                    </button>
                  </div>

                  {/* Settings toggle */}
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(prev => ({ ...prev, [camId]: !prev[camId] }))}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                    title="Kamera sozlamalari"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* IP / Settings Bar (Collapsible) */}
              {configOpen && (
                <div className="mt-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 p-3 text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">ESP32-CAM IP Manzili:</span>
                    <span className="text-[10px] text-slate-500">Standart: port 81/stream</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={streamUrls[camId]}
                      onChange={(e) => setStreamUrls(prev => ({ ...prev, [camId]: e.target.value }))}
                      placeholder="http://192.168.1.150:81/stream"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsConfigOpen(prev => ({ ...prev, [camId]: false }))}
                      className="rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-500 transition"
                    >
                      Saqlash
                    </button>
                  </div>
                </div>
              )}

              {/* Video Display Window */}
              <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center">
                {/* 1. ESP32 Stream Mode */}
                {currentMode === 'live' && (
                  <img
                    ref={espImgRefs[camId as keyof typeof espImgRefs]}
                    src={streamUrls[camId]}
                    alt={`ESP32 Live Stream ${camId}`}
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                    onError={() => {
                      setErrorMessages(prev => ({
                        ...prev,
                        [camId]: `ESP32 (${streamUrls[camId]}) topilmadi. Qurilma yoqilganligini tekshiring yoki Test Video rejimiga o'ting.`
                      }));
                    }}
                  />
                )}

                {/* 2. Webcam Mode */}
                <video
                  ref={webcamRefs[camId as keyof typeof webcamRefs]}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${currentMode === 'webcam' ? 'block' : 'hidden'}`}
                />

                {/* 3. Demo / Simulation Mode */}
                {currentMode === 'demo' && (
                  <div className="relative h-full w-full">
                    <img
                      src={cam.demoImageUrl}
                      alt="Rover demo feed"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                  </div>
                )}

                {/* Live Stream Overlay HUD */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider shadow">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {t.cameras.liveBadge}
                  </span>
                  <span className="rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/10">
                    {currentMode.toUpperCase()} • 720p @ 30 FPS
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                    ESP32-CAM #{idx + 1}
                  </span>
                </div>

                {/* Scanning Beam Animation when analyzing */}
                {analyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-30">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-lg shadow-emerald-500/50" />
                    <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{t.cameras.analyzing}</span>
                    </div>
                    <span className="mt-1 text-xs text-slate-400">
                      CNN va Vision LLM parallel ishlamoqda...
                    </span>
                  </div>
                )}
              </div>

              {/* Error Notice if stream unreachable */}
              {errorMsg && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span className="flex-1">{errorMsg}</span>
                  <button
                    type="button"
                    onClick={() => handleModeChange(camId, 'demo')}
                    className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30"
                  >
                    Demo rejim
                  </button>
                </div>
              )}

              {/* Capture Button */}
              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={() => handleCaptureAndAnalyze(cam)}
                  disabled={analyzing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-2.5 font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] transition disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                  <span>{analyzing ? t.cameras.analyzing : t.cameras.captureBtn}</span>
                </button>
              </div>

              {/* AI Analysis Conclusion Below Camera */}
              <div className="mt-4 flex-1">
                {result ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 flex flex-col gap-3">
                    {/* Header: Snapshot thumbnail + Consensus */}
                    <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-black">
                        <img
                          src={capturedThumbnails[camId] || (result.image_url?.startsWith('data:') ? result.image_url : `${API_BASE_URL}${result.image_url}`)}
                          alt="Snapshot"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 py-0.5 text-center text-[9px] font-bold text-white">
                          Saqlandi
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          {result.models_agree ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          )}
                          <span className={`text-xs font-bold ${result.models_agree ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {result.models_agree ? 'To\'liq Konsensus (Modellar kelishdi)' : 'Modellar ixtilofi'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 font-semibold">
                          {result.consensus_note}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">Xavf darajasi:</span>
                          <span className={`rounded px-1.5 py-0.2 font-bold border ${getSeverityBadge(result.llm.severity)}`}>
                            {result.llm.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dual AI Side-by-Side Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* CNN Column */}
                      <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1 font-bold text-slate-300">
                            <Cpu className="h-3 w-3 text-emerald-400" />
                            <span>CNN Modeli</span>
                          </span>
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/20">
                            {result.cnn.confidence}%
                          </span>
                        </div>
                        <div className="font-bold text-white text-xs">
                          {result.cnn.predicted_class}
                        </div>
                      </div>

                      {/* Vision LLM Column */}
                      <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1 font-bold text-slate-300">
                            <Eye className="h-3 w-3 text-teal-400" />
                            <span>Vision LLM</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Gemini 1.5
                          </span>
                        </div>
                        <div className="font-bold text-white text-xs truncate" title={result.llm.diagnosis}>
                          {result.llm.diagnosis}
                        </div>
                      </div>
                    </div>

                    {/* Leaf Symptoms Description */}
                    {result.llm.symptoms && (
                      <div className="rounded-lg bg-slate-950/40 p-2 text-xs border border-slate-800/60 text-slate-300">
                        <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Bargdagi patologik belgilar:</span>
                        {result.llm.symptoms}
                      </div>
                    )}

                    {/* Actionable Treatment Plan in Pure Uzbek */}
                    {result.llm.treatment_plan && (
                      <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-3 text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs mb-1.5">
                          <ShieldCheck className="h-4 w-4" />
                          <span>4 Bosqichli Agronomik Davolash Rejasi:</span>
                        </span>
                        <div className="whitespace-pre-line text-slate-200 leading-relaxed font-sans text-xs">
                          {result.llm.treatment_plan}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/30 p-4 text-center text-xs text-slate-500">
                    <Camera className="h-6 w-6 text-slate-600 mb-2" />
                    <p className="max-w-xs">{t.cameras.noCaptureYet}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gemini Vision API Key Configuration Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Key className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Google Gemini 1.5 Vision LLM Sozlamasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs text-slate-300">
              <p>
                Kameradan olingan har qanday suratni (xona, noutbuk, tirik o&apos;simlik yoki boshqa narsalar) real vaqtda 
                <strong> Google Gemini 1.5 Multimodal Vision</strong> modeli orqali tahlil qilish uchun API kalitingizni kiriting:
              </p>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Gemini API Kaliti (AIzaSy...):
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={geminiKeyStatus.has_key ? `Amaldagi kalit: ${geminiKeyStatus.masked_key}` : "AIzaSy..."}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  <span>Bepul Gemini API kaliti olish (Google AI Studio)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span>Bepul, karta talab etilmaydi</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveGeminiKey}
                disabled={keySaving || !inputKey.trim()}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {keySaving ? "Saqlanmoqda..." : "Saqlash va Faollashtirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
