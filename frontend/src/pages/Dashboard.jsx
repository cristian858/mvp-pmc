import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { documentService, biometryService, signatureService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import {
  DocumentIcon,
  UploadIcon,
  FingerprintIcon,
  ShieldIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ArrowRightIcon,
  TrendUpIcon,
  BarChartIcon,
} from '../components/Icons';

// Alias for icon variations
const ShieldCheckIcon = ShieldIcon;

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
    amber: 'from-amber-50 to-orange-50 border-amber-200',
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    red: 'from-red-50 to-rose-50 border-red-200',
  };

  const iconColors = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
  };

  return (
    <div ref={cardRef} className={`card p-6 bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const DocumentChart = ({ stats }) => {
  const total = stats.total || 1;
  const pendingPct = (stats.pending / total) * 100;
  const signedPct = (stats.signed / total) * 100;
  const rejectedPct = (stats.rejected / total) * 100;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Documentos por estado</h3>
        <BarChartIcon className="w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Pendientes</span>
            <span className="font-semibold text-slate-900">{stats.pending} ({Math.round(pendingPct)}%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Firmados</span>
            <span className="font-semibold text-slate-900">{stats.signed} ({Math.round(signedPct)}%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${signedPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Rechazados</span>
            <span className="font-semibold text-slate-900">{stats.rejected} ({Math.round(rejectedPct)}%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${rejectedPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const BiometryStats = ({ stats }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-slate-900">Verificaciones biométricas</h3>
      <FingerprintIcon className="w-5 h-5 text-slate-400" />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-emerald-50 rounded-xl text-center">
        <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
        <p className="text-xs text-slate-600 mt-1">Verificadas</p>
      </div>
      <div className="p-4 bg-amber-50 rounded-xl text-center">
        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        <p className="text-xs text-slate-600 mt-1">Pendientes</p>
      </div>
      <div className="p-4 bg-red-50 rounded-xl text-center">
        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        <p className="text-xs text-slate-600 mt-1">Rechazadas</p>
      </div>
      <div className="p-4 bg-blue-50 rounded-xl text-center">
        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        <p className="text-xs text-slate-600 mt-1">Total</p>
      </div>
    </div>

    <Link to="/biometry" className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
      Ver todas las verificaciones <ArrowRightIcon className="w-4 h-4" />
    </Link>
  </div>
);

const RecentActivity = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Actividad reciente</h3>
        <p className="text-slate-500 text-center py-8">No hay actividad reciente</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'document_upload': return DocumentIcon;
      case 'signature_created': return CheckCircleIcon;
      case 'biometry_verified': return ShieldCheckIcon;
      default: return ClockIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'document_upload': return 'text-blue-600 bg-blue-50';
      case 'signature_created': return 'text-emerald-600 bg-emerald-50';
      case 'biometry_verified': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const formatActivity = (type) => {
    switch (type) {
      case 'document_upload': return 'Documento subido';
      case 'signature_created': return 'Firma creada';
      case 'biometry_verified': return 'Verificación completada';
      default: return 'Actividad';
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Actividad reciente</h3>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity, idx) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          return (
            <div key={idx} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{formatActivity(activity.type)}</p>
                <p className="text-xs text-slate-500 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {formatRelativeTime(activity.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuickActions = () => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-slate-900 mb-6">Acciones rápidas</h3>
    <div className="space-y-3">
      <Link to="/upload" className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <UploadIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-900">Subir documento</span>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      <Link to="/biometry" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FingerprintIcon className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-medium text-slate-900">Verificación biométrica</span>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      <Link to="/documents" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <DocumentIcon className="w-5 h-5 text-slate-600" />
          </div>
          <span className="font-medium text-slate-900">Ver documentos</span>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      <Link to="/signatures" className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-900">Mis firmas</span>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [biometries, setBiometries] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    signed: 0,
    rejected: 0,
  });

  const [biometryStats, setBiometryStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.dashboard-section', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', overwrite: 'auto' }
      );
    }
  }, [loading]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [docsRes, bioRes, sigRes] = await Promise.all([
        documentService.list(1, 50),
        biometryService.list(1, 50),
        signatureService.list(1, 50),
      ]);

      const docs = docsRes.data?.data || docsRes.data || [];
      const bios = bioRes.data?.data || bioRes.data || [];
      const sigs = sigRes.data?.data || sigRes.data || [];

      setDocuments(Array.isArray(docs) ? docs : []);
      setBiometries(Array.isArray(bios) ? bios : []);
      setSignatures(Array.isArray(sigs) ? sigs : []);

      // Stats de documentos
      setStats({
        total: docs.length,
        pending: docs.filter(d => d.status === 'pendiente').length,
        signed: docs.filter(d => d.status === 'firmado').length,
        rejected: docs.filter(d => d.status === 'rechazado').length,
      });

      // Stats de biometría
      setBiometryStats({
        total: bios.length,
        verified: bios.filter(b => b.estado === 'verificado').length,
        pending: bios.filter(b => b.estado === 'pendiente').length,
        rejected: bios.filter(b => b.estado === 'rechazado').length,
      });

      // Generar actividades
      const activityList = [];
      docs.slice(0, 3).forEach(doc => {
        activityList.push({
          type: 'document_upload',
          description: doc.filename || 'Documento sin nombre',
          date: doc.created_at || doc.createdAt,
        });
      });
      sigs.slice(0, 2).forEach(sig => {
        activityList.push({
          type: 'signature_created',
          description: `Firma en documento #${sig.document_id}`,
          date: sig.fecha_firma,
        });
      });
      bios.slice(0, 2).forEach(bio => {
        activityList.push({
          type: 'biometry_verified',
          description: `Verificación ${bio.estado}`,
          date: bio.created_at,
        });
      });

      activityList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(activityList);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (docId) => {
    navigate(`/documents/${docId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="dashboard-section">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Resumen de tu actividad en SafeSign</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documentos"
          value={stats.total}
          subtitle="documentos cargados"
          icon={DocumentIcon}
          color="emerald"
          delay={0}
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          subtitle="esperando acción"
          icon={ClockIcon}
          color="amber"
          delay={0.1}
        />
        <StatCard
          title="Firmados"
          value={stats.signed}
          subtitle="completados"
          icon={CheckCircleIcon}
          color="blue"
          delay={0.2}
        />
        <StatCard
          title="Rechazados"
          value={stats.rejected}
          subtitle="rechazados"
          icon={ExclamationIcon}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Charts and Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-section">
          <DocumentChart stats={stats} />
        </div>
        <div className="dashboard-section">
          <BiometryStats stats={biometryStats} />
        </div>
      </div>

      {/* Quick Actions and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="dashboard-section lg:col-span-1">
          <QuickActions />
        </div>
        <div className="dashboard-section lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="dashboard-section card">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Documentos recientes</h2>
          <Link to="/documents" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
            Ver todos <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <DocumentIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-4">No tienes documentos aún</p>
            <Link to="/upload" className="btn-primary inline-flex items-center gap-2 rounded-lg">
              <UploadIcon className="w-5 h-5" />
              Subir tu primer documento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Archivo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Análisis IA</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <DocumentIcon className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-900 max-w-[200px] truncate">
                          {doc.filename || 'Sin nombre'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status || 'pendiente'} />
                    </td>
                    <td className="px-6 py-4">
                      {doc.resumen_ia ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <TrendUpIcon className="w-3 h-3" />
                          Analizado
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin análisis</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(doc.created_at || doc.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDocument(doc.id)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                      >
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};