import React from 'react';

/**
 * Timeline - Componente de timeline para mostrar fases
 * @param {array} phases - Array de fases con phase, status, items
 */
export default function Timeline({ phases }) {
  return (
    <div className="space-y-6">
      {phases.map((phase, index) => (
        <div key={index} className="relative pl-8">
          {/* Línea vertical */}
          {index < phases.length - 1 && (
            <div className="absolute left-3 top-8 w-0.5 h-16 bg-gradient-to-b from-emerald-400 to-emerald-100" />
          )}

          {/* Círculo indicador */}
          <div className="absolute -left-1 top-1 w-8 h-8 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>

          {/* Contenido */}
          <div className="card p-6 border-l-4 border-emerald-600">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">{phase.phase}</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {phase.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {phase.items.map((item, i) => (
                <span
                  key={i}
                  className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
