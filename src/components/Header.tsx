'use client';

import React from 'react';
import { Sprout, Car, BatteryCharging, Globe, ShieldAlert, Cpu, LogOut, User } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasAnomaly: boolean;
  sickCount: number;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  hasAnomaly,
  sickCount,
  currentUser,
  onLogout,
}) => {
  const t = translations[currentLang];

  const tabs = [
    { id: 'overview', label: t.tabs.overview },
    { id: 'sick', label: `${t.tabs.sickPlants} (${sickCount})` },
    { id: 'telemetry', label: t.tabs.telemetry },
    { id: 'sandbox', label: t.tabs.sandbox },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090e17]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6">
        {/* Top Brand & Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {t.appName}
                </h1>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Dual-AI Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Status Badges & Language Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Rover Status Badge */}
            <div className="hidden items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <Car className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t.roverActive}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <BatteryCharging className="h-3.5 w-3.5 text-teal-400" />
                {t.roverBattery}
              </span>
            </div>

            {/* Anomaly Quick Badge */}
            {hasAnomaly && (
              <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 animate-pulse">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                <span>ANOMALY</span>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-1">
              <Globe className="mx-1.5 h-3.5 w-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`rounded px-2 py-1 text-xs font-semibold transition ${
                  currentLang === 'en'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('uz')}
                className={`rounded px-2 py-1 text-xs font-semibold transition ${
                  currentLang === 'uz'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="O'zbekcha (Lotin)"
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('kaa')}
                className={`rounded px-2 py-1 text-xs font-semibold transition ${
                  currentLang === 'kaa'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Qaraqalpaqsha (Lotin)"
              >
                KAA
              </button>
            </div>

            {/* User Profile & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">{currentUser.username}</span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                    title="Tizimdan chiqish"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Chiqish</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Row */}
        <nav className="flex space-x-1 overflow-x-auto border-t border-slate-800/80 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
