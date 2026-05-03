import React from 'react';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/dateUtils';

const DocumentIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m16.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.82 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const BrainIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

export default function DocumentCard({ document, onView, onDelete }) {
  return (
    <div className="card group hover:shadow-xl transition-all duration-300 overflow-hidden p-5">
      {/* Header del documento */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <DocumentIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate text-base">
              {document.filename || document.fileName || `Documento #${document.id}`}
            </h3>
            <p className="text-sm text-slate-500">
              ID: {document.id}
            </p>
          </div>
        </div>

        {/* Botón eliminar - siempre visible */}
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={() => onDelete?.(document.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status y metadata */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <StatusBadge status={document.status || 'pendiente'} />
          <span className="text-sm text-slate-500">
            {formatRelativeTime(document.created_at || document.createdAt)}
          </span>
        </div>

        {/* Análisis IA si existe - más discreto */}
        {document.resumen_ia && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <BrainIcon className="w-3.5 h-3.5" />
            <span>Análisis IA disponible</span>
          </div>
        )}

        {/* Botón de acción */}
        <button
          onClick={() => onView?.(document.id)}
          className="w-full btn-primary py-2.5 text-sm rounded-lg mt-2"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}