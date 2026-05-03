import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../hooks/useToast';
import { signatureService, documentService } from '../services/api';
import { formatDateTime } from '../utils/dateUtils';

const DocumentIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const FileSignatureIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.75V8.75a2.25 2.25 0 012.25-2.25h13.5" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', delay = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power3.out' }
    );
  }, [delay]);

  const colorClasses = {
    emerald: 'from-emerald-50 to-teal-50 border-emerald-200',
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    amber: 'from-amber-50 to-orange-50 border-amber-200',
  };

  return (
    <div ref={cardRef} className={`card p-5 bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center ${
          color === 'emerald' ? 'text-emerald-600' : color === 'blue' ? 'text-blue-600' : 'text-amber-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const SignatureCard = ({ signature, documentName, onViewDocument }) => {
  const getResultColor = (result) => {
    if (result === 'VERDE') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (result === 'AMARILLO') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  };

  const resultStyle = getResultColor(signature.resultado_verificacion);

  return (
    <div className="card p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileSignatureIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Firma en {documentName}</h3>
            <p className="text-sm text-slate-500">
              {formatDateTime(signature.fecha_firma)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className={`p-3 rounded-lg ${resultStyle.bg} border ${resultStyle.border}`}>
          <p className="text-xs text-slate-500 mb-1">Resultado</p>
          <p className={`font-semibold ${resultStyle.text}`}>{signature.resultado_verificacion}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">ID Firma</p>
          <p className="font-semibold text-slate-900">#{signature.id}</p>
        </div>
      </div>

      {signature.notas && (
        <div className="p-3 bg-slate-50 rounded-lg mb-4">
          <p className="text-xs text-slate-500 mb-1">Notas</p>
          <p className="text-sm text-slate-700">{signature.notas}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDocument(signature.document_id)}
          className="flex-1 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          Ver documento <ArrowRightIcon className="w-4 h-4" />
        </button>
        <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1">
          <DownloadIcon className="w-4 h-4" />
          Certificado
        </button>
      </div>
    </div>
  );
};

export function SignaturesPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [signatures, setSignatures] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  useEffect(() => {
    loadSignatures();
  }, [currentPage]);

  useEffect(() => {
    if (!loading && signatures.length > 0) {
      gsap.from('.signature-card', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
      });
    }
  }, [loading, signatures]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      const response = await signatureService.list(currentPage, itemsPerPage);
      
      const pagination = response.data?.pagination || response.pagination;
      setTotalItems(pagination?.total || 0);
      
      const sigs = response.data?.data || response.data || [];
      setSignatures(sigs);

      const docIds = [...new Set(sigs.map(s => s.document_id))];
      const docsObj = {};
      await Promise.all(
        docIds.map(async (docId) => {
          try {
            const docRes = await documentService.get(docId);
            docsObj[docId] = docRes.data?.filename || `Documento #${docId}`;
          } catch {
            docsObj[docId] = `Documento #${docId}`;
          }
        })
      );
      setDocuments(docsObj);
    } catch (error) {
      console.error('Error cargando firmas:', error);
      addToast('Error al cargar firmas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const stats = {
    total: totalItems,
    successful: signatures.filter(s => s.resultado_verificacion === 'VERDE').length,
    pending: signatures.filter(s => s.resultado_verificacion === 'AMARILLO').length,
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && signatures.length === 0) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" message="Cargando firmas..." />
      </div>
    );
  }

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Historial de Firmas</h1>
        <p className="text-slate-600 mt-1">Todas tus firmas digitales y certificados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Firmas"
          value={stats.total}
          subtitle="documentos firmados"
          icon={FileSignatureIcon}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Exitosas"
          value={stats.successful}
          subtitle="verificación passed"
          icon={CheckCircleIcon}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Este mes"
          value={stats.total}
          subtitle="firmas realizadas"
          icon={CalendarIcon}
          color="amber"
          delay={0.2}
        />
      </div>

      {/* Signatures List */}
      <div className="card">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Todas las firmas</h2>
        </div>

        {signatures.length > 0 ? (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {signatures.map((sig) => (
                  <div key={sig.id} className="signature-card">
                    <SignatureCard 
                      signature={sig} 
                      documentName={documents[sig.document_id] || 'Documento'}
                      onViewDocument={handleViewDocument}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-slate-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileSignatureIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No hay firmas registradas</p>
            <p className="text-slate-500 text-sm mb-6">Firma tu primer documento para ver el historial aquí</p>
            <button
              onClick={() => navigate('/documents')}
              className="btn-primary inline-flex items-center gap-2 rounded-lg"
            >
              Ver mis documentos
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sobre los certificados de firma</h3>
            <p className="text-slate-600 text-sm">
              Cada firma digital genera un certificado de validación que incluye: 
              timestamp de la firma, hash criptográfico del documento, 
              resultado de verificación biométrica y datos del firmante.
              Puedes descargar el certificado desde cada firma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}