'use client';

import React, { useState } from 'react';
import { Sprout, AlertTriangle, ShieldCheck, Bug, Eye, Sparkles } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { PlantBrief } from '@/lib/api';

interface FieldGridMapProps {
  currentLang: Language;
  plants: PlantBrief[];
  onSelectPlant: (plant: PlantBrief) => void;
}

export const FieldGridMap: React.FC<FieldGridMapProps> = ({
  currentLang,
  plants,
  onSelectPlant,
}) => {
  const t = translations[currentLang];
  const [hoveredPlant, setHoveredPlant] = useState<PlantBrief | null>(null);

  // Group plants into 5x5 matrix
  const matrix: (PlantBrief | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  plants.forEach(p => {
    if (p.grid_y >= 0 && p.grid_y < 5 && p.grid_x >= 0 && p.grid_x < 5) {
      matrix[p.grid_y][p.grid_x] = p;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-500/50 hover:border-emerald-400',
          dot: 'bg-emerald-400',
          glow: 'shadow-emerald-500/10',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/60',
          border: 'border-amber-500/70 hover:border-amber-400',
          dot: 'bg-amber-400 animate-pulse',
          glow: 'shadow-amber-500/20',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'diseased':
        return {
          bg: 'bg-rose-950/70',
          border: 'border-rose-500/80 hover:border-rose-400',
          dot: 'bg-rose-500 animate-ping',
          glow: 'shadow-rose-500/25',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-700',
          dot: 'bg-slate-500',
          glow: '',
          badge: 'bg-slate-800 text-slate-400 border-slate-700'
        };
    }
  };

  return (
    <div className="glass-panel relative rounded-2xl p-6 shadow-xl">
      {/* Title & Legend Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t.grid.title}
            </h2>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              5x5 Grid Layout
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t.grid.subtitle}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-300 font-medium">{t.grid.legendHealthy}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50"></span>
            <span className="text-slate-300 font-medium">{t.grid.legendWarning}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span className="text-slate-300 font-medium">{t.grid.legendDiseased}</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="mt-6 flex flex-col items-center">
        {/* Column Labels */}
        <div className="grid grid-cols-5 gap-3 w-full max-w-2xl text-center mb-1 text-xs font-bold text-slate-500">
          <span>Col 1</span>
          <span>Col 2</span>
          <span>Col 3</span>
          <span>Col 4</span>
          <span>Col 5</span>
        </div>

        {/* 5x5 Matrix */}
        <div className="grid grid-cols-5 gap-3 w-full max-w-2xl">
          {matrix.map((row, rIdx) =>
            row.map((plant, cIdx) => {
              if (!plant) {
                return (
                  <div
                    key={`empty-${rIdx}-${cIdx}`}
                    className="aspect-square rounded-xl border border-dashed border-slate-800 bg-slate-900/40"
                  />
                );
              }

              const colors = getStatusColor(plant.health_status);
              const isHovered = hoveredPlant?.id === plant.id;

              return (
                <div
                  key={plant.id}
                  onClick={() => onSelectPlant(plant)}
                  onMouseEnter={() => setHoveredPlant(plant)}
                  onMouseLeave={() => setHoveredPlant(null)}
                  className={`group relative aspect-square cursor-pointer rounded-xl border p-2.5 shadow-md transition-all duration-200 ${colors.bg} ${colors.border} ${colors.glow} hover:scale-105 hover:z-20`}
                >
                  {/* Top Coordinate & Pulse dot */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white">
                      [{rIdx + 1},{cIdx + 1}]
                    </span>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.dot}`} />
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                    </span>
                  </div>

                  {/* Node icon & short name */}
                  <div className="mt-2 flex flex-col items-center justify-center text-center">
                    <Sprout className={`h-6 w-6 transition ${
                      plant.health_status === 'healthy' ? 'text-emerald-400 group-hover:scale-110' :
                      plant.health_status === 'warning' ? 'text-amber-400 group-hover:scale-110' :
                      'text-rose-400 group-hover:scale-110'
                    }`} />
                    <span className="mt-1 truncate w-full text-[11px] font-medium text-slate-300">
                      {(plant.variety || plant.name || 'Plant').split(' ')[0]}
                    </span>
                  </div>

                  {/* Status Tag */}
                  <div className="mt-1 text-center">
                    <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border ${colors.badge}`}>
                      {plant.health_status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected / Hovered Plant Quick Inspector Bar */}
      {hoveredPlant && (
        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${getStatusColor(hoveredPlant.health_status).badge}`}>
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{hoveredPlant.name}</span>
                <span className="text-xs text-slate-400">({hoveredPlant.variety})</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${getStatusColor(hoveredPlant.health_status).badge}`}>
                  {hoveredPlant.health_status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {hoveredPlant.latest_scan
                  ? `Latest: ${hoveredPlant.latest_scan.cnn_predicted_class} (Confidence: ${hoveredPlant.latest_scan.cnn_confidence}%)`
                  : 'Awaiting scheduled rover scan'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectPlant(hoveredPlant)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition"
          >
            <Eye className="h-4 w-4" />
            <span>{t.grid.viewDetails}</span>
          </button>
        </div>
      )}
    </div>
  );
};
