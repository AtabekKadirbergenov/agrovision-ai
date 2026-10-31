'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { KpiCards } from '@/components/KpiCards';
import { AnomalyBanner } from '@/components/AnomalyBanner';
import { FieldGridMap } from '@/components/FieldGridMap';
import { SickPlantsView } from '@/components/SickPlantsView';
import { PlantDetailModal } from '@/components/PlantDetailModal';
import { LiveDiagnosticSandbox } from '@/components/LiveDiagnosticSandbox';
import { DualLiveCamera } from '@/components/DualLiveCamera';
import { LoginPage } from '@/components/LoginPage';

const TelemetryPanel = dynamic(
  () => import('@/components/TelemetryPanel').then((mod) => mod.TelemetryPanel),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        Telemetriya paneli yuklanmoqda...
      </div>
    )
  }
);
import { Language, translations } from '@/lib/i18n';
import {
  OverviewKPI,
  PlantBrief,
  TelemetryResponse,
  getKPIs,
  getPlants,
  getTelemetry
} from '@/lib/api';
import { RefreshCw, Car, Wifi } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentLang, setCurrentLang] = useState<Language>('uz'); // Default to Uzbek / multi-lang
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [kpis, setKpis] = useState<OverviewKPI | null>(null);
  const [plants, setPlants] = useState<PlantBrief[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantBrief | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const t = translations[currentLang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('agro_user');
      const token = localStorage.getItem('agro_auth_token');
      if (saved && token) {
        setUser(JSON.parse(saved));
      }
    } catch {}
    setAuthChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agro_user');
    localStorage.removeItem('agro_auth_token');
    setUser(null);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const loadAllData = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const [kpiData, plantsData, telData] = await Promise.all([
        getKPIs().catch(() => null),
        getPlants().catch(() => []),
        getTelemetry().catch(() => null)
      ]);

      if (kpiData) setKpis(kpiData);
      if (plantsData && plantsData.length > 0) setPlants(plantsData);
      if (telData) setTelemetry(telData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAllData();
    // Poll telemetry every 4 seconds for real-time dynamic updates & live ESP32 sensors
    const interval = setInterval(loadAllData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-semibold tracking-wide text-slate-300">AgroVision AI tizimi yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  const sickPlantsCount = plants.filter(
    (p) => p.health_status === 'diseased' || p.health_status === 'warning'
  ).length;

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasAnomaly={telemetry?.global_anomaly_detected ?? false}
        sickCount={sickPlantsCount}
        currentUser={user}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 flex flex-col gap-6">
        {/* Top Control Ribbon: Refresh + Rover Telemetry link */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">FastAPI ML Backend:</span>
            <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 font-mono text-emerald-400">
              http://localhost:8000
            </span>
          </div>

          <button
            onClick={loadAllData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{t.common.refresh}</span>
          </button>
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* Anomaly Banner */}
            <AnomalyBanner
              currentLang={currentLang}
              telemetry={telemetry}
            />

            {/* Top KPIs Row */}
            <KpiCards
              currentLang={currentLang}
              kpis={kpis}
              onSelectSickTab={() => setActiveTab('sick')}
            />

            {/* Dual Live Rover Cameras (ESP32-CAM #1 & #2) */}
            <DualLiveCamera
              currentLang={currentLang}
            />

            {/* 2D Field Grid Map */}
            <FieldGridMap
              currentLang={currentLang}
              plants={plants}
              onSelectPlant={(p) => setSelectedPlant(p)}
            />

            {/* Telemetry & Anomaly Graphs */}
            <TelemetryPanel
              currentLang={currentLang}
              telemetry={telemetry}
            />
          </div>
        )}

        {/* Tab 2: Sick Plants Registry */}
        {activeTab === 'sick' && (
          <SickPlantsView
            currentLang={currentLang}
            plants={plants}
            onSelectPlant={(p) => setSelectedPlant(p)}
          />
        )}

        {/* Tab 3: Full Environmental Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="flex flex-col gap-6">
            <AnomalyBanner
              currentLang={currentLang}
              telemetry={telemetry}
            />
            <TelemetryPanel
              currentLang={currentLang}
              telemetry={telemetry}
            />
          </div>
        )}

        {/* Tab 4: Live AI Diagnostic Sandbox */}
        {activeTab === 'sandbox' && (
          <LiveDiagnosticSandbox
            currentLang={currentLang}
            onScanCompleted={loadAllData}
          />
        )}
      </main>

      {/* Plant Detail Modal with Before vs After Timeline */}
      {selectedPlant && (
        <PlantDetailModal
          currentLang={currentLang}
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}

      {/* Bottom Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-emerald-400" />
            <span>Autonomous Rover Plant Pathology & Telemetry Monitoring System</span>
          </div>
          <div>
            Built with Next.js 16, Tailwind CSS, PyTorch EfficientNet, and Multimodal Vision LLM.
          </div>
        </div>
      </footer>
    </div>
  );
}
