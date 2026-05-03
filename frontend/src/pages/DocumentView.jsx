import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { documentService } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import {
  ChevronLeftIcon,
  DownloadIcon,
  PencilIcon,
  DocumentIcon,
  ClockIcon,
  LightbulbIcon,
  EyeIcon,
  BrainIcon,
  ShieldIcon,
  ExclamationIcon,
  CheckCircleIcon,
} from '../components/Icons';

// Aliases for icons with different names
const ArrowLeftIcon = ChevronLeftIcon;
const PenIcon = PencilIcon;
const AlertTriangleIcon = ExclamationIcon;
const ShieldCheckIcon = ShieldIcon;
const FileTextIcon = DocumentIcon;
const CalendarIcon = ClockIcon;
const InformationCircleIcon = ExclamationIcon;

// Custom icons not in the centralized Icons library
const CurrencyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RiskIndicator = ({ level, recommendations = [] }) => {
  const config = {
    bajo: {
      color: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: CheckCircleIcon,
      label: 'Riesgo Bajo',
      desc: 'El documento parece ser de bajo riesgo. Puedes proceder con confianza.',
    },
    medio: {
      color: 'amber',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangleIcon,
      label: 'Riesgo Medio',
      desc: 'Se han detectado algunos puntos que requieren atención. Revisa los detalles.',
    },
    alto: {
      color: 'red',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangleIcon,
      label: 'Riesgo Alto',
      desc: 'El documento contiene cláusulas de alto riesgo. Se recomienda revisión cuidadosa.',
    },
  };

  const conf = config[level] || config.bajo;
  const Icon = conf.icon;

  return (
    <div className={`card p-6 ${conf.bg} border ${conf.border}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white`}>
          <Icon className={`w-6 h-6 text-${conf.color}-600`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold text-${conf.color}-900`}>{conf.label}</h3>
          <p className="text-slate-600 text-sm mt-1">{conf.desc}</p>
        </div>
      </div>
    </div>
  );
};

const AnalysisCard = ({ title, icon: Icon, children, color = 'emerald' }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
);

export function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await documentService.get(id);
        console.log('Document response:', response.data);
        const docData = response.data?.data || response.data;
        console.log('Document status:', docData?.status);
        setDocument(docData);
      } catch (error) {
        console.error('Error cargando documento:', error);
        addToast('Error al cargar documento', 'error');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (document && !loading) {
      gsap.killTweensOf('.doc-view-animate');
      gsap.fromTo('.doc-view-animate', 
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.08, 
          ease: 'power2.out',
          onComplete: () => {
            gsap.set('.doc-view-animate', { opacity: 1 });
          }
        }
      );
    }
  }, [document, loading]);

  const determineRiskLevel = () => {
    if (!document?.riesgos) return 'bajo';
    const riesgos = document.riesgos.toLowerCase();
    if (riesgos.includes('alto') || riesgos.includes('penalidad') || riesgos.includes('responsabilidad')) {
      return 'alto';
    }
    if (riesgos.includes('medio') || riesgos.includes('plazo') || riesgos.includes('renovación')) {
      return 'medio';
    }
    return 'bajo';
  };

  const parseList = (text) => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim());
  };

  const extractKeyPoints = (content) => {
    const points = [];
    if (!content) return points;

    const amountsRegex = /\$\s*[\d,]+(?:\.\d{2})?|USD\s*[\d,]+|EUR\s*[\d,]+|€\s*[\d,]+/gi;
    const amounts = content.match(amountsRegex);
    if (amounts && amounts.length > 0) {
      points.push({ type: 'amount', label: 'Montos encontrados', value: amounts.slice(0, 5).join(', ') });
    }

    const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+de\s+\w+(?:\s+de\s+\d{4})?/gi;
    const dates = content.match(dateRegex);
    if (dates && dates.length > 0) {
      points.push({ type: 'date', label: 'Fechas mencionadas', value: dates.slice(0, 3).join(', ') });
    }

    const durationMatch = content.match(/(\d+)\s*(año|mes|día|dias|meses|años)/i);
    if (durationMatch) {
      points.push({ type: 'duration', label: 'Duración', value: durationMatch[0] });
    }

    return points;
  };

  const getRecommendations = (level) => {
    const recommendations = {
      bajo: [
        'El documento parece ser de bajo riesgo.',
        'Puedes proceder con la firma si estás de acuerdo con los términos.',
        'Recuerda guardar una copia del documento firmado.',
      ],
      medio: [
        'Revisa cuidadosamente las cláusulas identificadas.',
        'Considera consultar con un profesional si tienes dudas.',
        'Verifica las fechas y plazos de renovación.',
      ],
      alto: [
        'Se recomienda altamente consultar con un profesional legal.',
        'Revisa cada cláusula de riesgo antes de firmar.',
        'Considera negociar los términos antes de proceder.',
        'Asegúrate de entender todas las obligaciones y penalidades.',
      ],
    };
    return recommendations[level] || recommendations.bajo;
  };

  const handleSign = () => {
    navigate(`/signature/${document.id}`);
  };

  const handleDownload = () => {
    addToast('Descargando documento...', 'info');
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" message="Cargando documento..." />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <DocumentIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">Documento no encontrado</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Información' },
    { id: 'analysis', label: 'Análisis IA' },
    { id: 'preview', label: 'Vista Previa' },
    { id: 'content', label: 'Contenido' },
  ];

  const keyPoints = extractKeyPoints(document.contenido_texto);

  const riskLevel = determineRiskLevel();
  const riesgosList = parseList(document.riesgos);
  const obligacionesList = parseList(document.obligaciones);

  return (
    <div className="py-10 px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="doc-view-animate">
        <button
          onClick={() => navigate('/documents')}
          className="text-emerald-600 hover:text-emerald-700 font-medium mb-6 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a documentos
        </button>

        <div className="flex items-start justify-between bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <DocumentIcon className="w-7 h-7 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {document.filename || `Documento #${document.id}`}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Subido el {formatDate(document.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <StatusBadge status={document.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="doc-view-animate flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <DownloadIcon className="w-5 h-5" />
          Descargar
        </button>

        {document.status === 'pendiente' && (
          <button
            onClick={handleSign}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <PenIcon className="w-5 h-5" />
            Firmar documento
          </button>
        )}
      </div>

      {/* Risk Indicator */}
      {document.resumen_ia && (
        <div className="doc-view-animate">
          <RiskIndicator level={riskLevel} recommendations={getRecommendations(riskLevel)} />
        </div>
      )}

      {/* Tabs */}
      <div className="doc-view-animate card">
        <div className="flex border-b border-slate-200 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-5 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Tab: Información General */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nombre</p>
                <p className="text-slate-900 font-medium">{document.filename || 'Sin nombre'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Estado</p>
                <StatusBadge status={document.status} />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Fecha de creación</p>
                <p className="text-slate-900 font-medium">
                  {formatDate(document.created_at)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Última actualización</p>
                <p className="text-slate-900 font-medium">
                  {formatDate(document.updated_at || document.created_at)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">ID Documento</p>
                <p className="text-slate-600 font-mono text-sm">{document.id}</p>
              </div>
            </div>
          )}

          {/* Tab: Análisis IA */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {document.resumen_ia ? (
                <>
                  {/* Resumen */}
                  <AnalysisCard title="Resumen Ejecutivo" icon={BrainIcon} color="blue">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-slate-700 leading-relaxed">{document.resumen_ia}</p>
                    </div>
                  </AnalysisCard>

                  {/* Riesgos */}
                  <AnalysisCard title="Riesgos Detectados" icon={AlertTriangleIcon} color="red">
                    {riesgosList.length > 0 && riesgosList[0] !== '' ? (
                      <div className="space-y-3">
                        {riesgosList.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                            <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-slate-700 text-sm">{risk.replace(/^[•\-\s]+/, '')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                        <p className="text-slate-700">No se detectaron riesgos evidentes</p>
                      </div>
                    )}
                  </AnalysisCard>

                  {/* Obligaciones */}
                  <AnalysisCard title="Obligaciones del Usuario" icon={ShieldCheckIcon} color="emerald">
                    {obligacionesList.length > 0 && obligacionesList[0] !== '' ? (
                      <div className="space-y-3">
                        {obligacionesList.map((obl, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-slate-700 text-sm">{obl.replace(/^[•\-\s]+/, '')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No se identificaron obligaciones específicas</p>
                    )}
                  </AnalysisCard>

                  {/* Recomendaciones */}
                  <AnalysisCard title="Recomendaciones" icon={LightbulbIcon} color="blue">
                    <div className="space-y-3">
                      {getRecommendations(riskLevel).map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <LightbulbIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-700 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </AnalysisCard>
                </>
              ) : (
                <div className="text-center py-12">
                  <BrainIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">El análisis de IA aún no está disponible</p>
                  <p className="text-slate-400 text-sm mt-1">Este documento será analizado automáticamente</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Preview PDF */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Vista Previa del Documento</h3>
                <button
                  onClick={handleDownload}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Descargar PDF
                </button>
              </div>
              
              <div className="bg-slate-100 rounded-xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                  <FileTextIcon className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-2">Vista previa del documento</p>
                <p className="text-slate-500 text-sm mb-4">
                  Nombre: {document.filename}
                </p>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <EyeIcon className="w-4 h-4" />
                  <span>El visor de PDF se mostrará aquí</span>
                </div>
              </div>

              {keyPoints.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Puntos Clave Detectados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {keyPoints.map((point, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          {point.type === 'amount' && <CurrencyIcon className="w-4 h-4 text-emerald-600" />}
                          {point.type === 'date' && <CalendarIcon className="w-4 h-4 text-blue-600" />}
                          {point.type === 'duration' && <ClockIcon className="w-4 h-4 text-purple-600" />}
                          <span className="text-xs font-medium text-slate-500 uppercase">{point.label}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900">{point.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Contenido */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Texto Extraído</h3>
                <span className="text-sm text-slate-500">
                  {document.contenido_texto?.length || 0} caracteres
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 max-h-[500px] overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {document.contenido_texto || 'No hay contenido disponible'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}