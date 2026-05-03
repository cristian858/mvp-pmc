import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../hooks/useToast';
import { biometryService, verifyService } from '../services/api';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/dateUtils';

const FingerprintIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const FaceIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

const CameraIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const DocumentTextIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
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
    amber: 'from-amber-50 to-orange-50 border-amber-200',
    red: 'from-red-50 to-rose-50 border-red-200',
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
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
          color === 'emerald' ? 'text-emerald-600' :
          color === 'amber' ? 'text-amber-600' :
          color === 'red' ? 'text-red-600' : 'text-blue-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const VerificationCard = ({ verification, onViewDetails }) => {
  const getStatusConfig = (estado, semaforo) => {
    if (estado === 'verificado') {
      return { color: 'emerald', icon: CheckCircleIcon, label: 'Verificado', bg: 'bg-emerald-50' };
    }
    if (estado === 'rechazado') {
      return { color: 'red', icon: XCircleIcon, label: 'Rechazado', bg: 'bg-red-50' };
    }
    return { color: 'amber', icon: ClockIcon, label: 'Pendiente', bg: 'bg-amber-50' };
  };

  const statusConfig = getStatusConfig(verification.estado, verification.semaforo);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="card p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <FaceIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Verificación #{verification.id}</h3>
            <p className="text-sm text-slate-500">
              {formatDateTime(verification.created_at)}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} text-${statusConfig.color}-700 flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">
          <p className="text-slate-500 text-xs">Semaforo</p>
          <p className={`font-semibold ${
            verification.semaforo === 'VERDE' ? 'text-emerald-600' :
            verification.semaforo === 'AMARILLO' ? 'text-amber-600' : 'text-red-600'
          }`}>
            {verification.semaforo || 'N/A'}
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <p className="text-slate-500 text-xs">Intentos</p>
          <p className="font-semibold text-slate-900">{verification.intentos || 0}</p>
        </div>
      </div>

      {verification.documento_nombre_match !== null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Nombre en ID:</span>
          <span className={`font-medium ${verification.documento_nombre_match ? 'text-emerald-600' : 'text-red-600'}`}>
            {verification.documento_nombre_match ? 'Coincide' : 'No coincide'}
          </span>
        </div>
      )}

      <button
        onClick={() => onViewDetails(verification)}
        className="w-full mt-4 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        Ver detalles <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const WebcamCapture = ({ onCapture, onCancel, step }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isCameraActive = useRef(false);
  const [error, setError] = useState(null);
  const [capturing, setCapturing] = useState(false);

  // Iniciar cámara solo una vez al montar
  useEffect(() => {
    if (!isCameraActive.current) {
      startCamera();
    }
    return () => {
      // Solo parar cuando el componente se desmonta completamente
      if (isCameraActive.current) {
        stopCamera();
      }
    };
  }, []);

  // Función para iniciar cámara
  const startCamera = async () => {
    try {
      // Si ya hay stream activo, no crear otro
      if (streamRef.current && streamRef.current.active) {
        return;
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      streamRef.current = mediaStream;
      isCameraActive.current = true;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    isCameraActive.current = false;
    // Limpiar el video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCancel = () => {
    stopCamera();
    // Reset video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onCancel();
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob, step);
      }
      setCapturing(false);
    }, 'image/jpeg', 0.9);
  };

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error de Cámara</p>
          <p className="text-slate-600 text-sm">{error}</p>
          <button onClick={handleCancel} className="btn-secondary mt-4">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        {step === 1 ? 'Captura tu Identificación' : 'Captura tu Selfie'}
      </h3>
      
      <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay guide - solo para captura de ID */}
        {step === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 border-2 border-white/50 rounded-xl" />
          </div>
        )}
        
        {capturing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCapture}
          disabled={capturing}
          className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <CameraIcon className="w-5 h-5" />
          {capturing ? 'Capturando...' : 'Capturar'}
        </button>
        <button
          onClick={handleCancel}
          className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

const VerificationFlow = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [capturing, setCapturing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const steps = [
    { id: 1, title: 'Identificación', desc: 'Toma foto de tu documento de identidad' },
    { id: 2, title: 'Selfie', desc: 'Toma una selfie para verificación facial' },
    { id: 3, title: 'Verificación', desc: 'Procesando y comparando datos' },
  ];

  const handleCapture = async (blob, currentStep) => {
    try {
      setCapturing(true);
      setLoading(true);
      setError(null);

      if (currentStep === 1) {
        const response = await verifyService.captureId(blob);
        const data = response.data;
        
        if (data.success) {
          setVerificationId(data.verification_id);
          setPhotoPreview(true);
          addToast('Identificación capturada exitosamente', 'success');
          // Cambiar step después de un pequeño delay
          setTimeout(() => setStep(2), 100);
        } else {
          setError(data.error || 'Error al procesar identificación');
          addToast(data.error || 'Error al procesar identificación', 'error');
        }
      } else if (currentStep === 2 && verificationId) {
        const response = await verifyService.captureSelfie(blob, verificationId);
        const data = response.data;
        
        if (data.success) {
          addToast('Selfie capturada. Verificando...', 'info');
          setTimeout(() => setStep(3), 100);
          
          const verifyResponse = await verifyService.verify(verificationId);
          const verifyData = verifyResponse.data;
          
          if (verifyData.success) {
            addToast('Verificación completada exitosamente', 'success');
            onComplete(verifyData);
          } else {
            setError(verifyData.error || 'Error en verificación');
          }
        } else {
          setError(data.error || 'Error al procesar selfie');
          addToast(data.error || 'Error al procesar selfie', 'error');
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      let errorMsg = 'Error de conexión';
      const responseData = err.response?.data;
      
      if (err.response?.status === 422) {
        // Error de validación - puede ser OCR o nombre
        if (responseData?.hint) {
          errorMsg = `${responseData.error}\n\n${responseData.hint}`;
        } else if (responseData?.error?.includes('nombre')) {
          errorMsg = responseData.error;
          if (responseData.registered_name) {
            errorMsg += `\n\nTu nombre: ${responseData.registered_name}`;
          }
          if (responseData.detected_name) {
            errorMsg += `\nDetectado: ${responseData.detected_name}`;
          }
        } else if (responseData?.error?.includes('documento') || responseData?.details) {
          errorMsg = responseData.error;
          if (responseData.details) {
            errorMsg += '\n\n' + responseData.details.join('\n');
          }
        } else {
          errorMsg = responseData?.error || 'Error al procesar documento';
        }
      } else if (err.response?.status === 400) {
        errorMsg = responseData?.error || 'Solicitud inválida';
      } else if (err.response?.status === 503) {
        errorMsg = 'Servicio no disponible. Verifica las dependencias del backend.';
      }
      
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setCapturing(false);
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Nuevo Proceso de Verificación</h3>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= s.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > s.id ? <CheckCircleIcon className="w-5 h-5" /> : s.id}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Webcam Component - siempre visible */}
      <div className="relative">
        <WebcamCapture 
          onCapture={handleCapture} 
          onCancel={onCancel} 
          step={step} 
        />
        
        {/* Overlay de procesamiento */}
        {(loading || capturing) && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CameraIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-medium">
                {loading ? 'Procesando...' : 'Capturando...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function BiometryPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [biometries, setBiometries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationFlow, setShowVerificationFlow] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

  useEffect(() => {
    fetchBiometries();
  }, []);

  useEffect(() => {
    if (!loading && biometries.length > 0) {
      gsap.fromTo('.biometry-card', 
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.1,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set('.biometry-card', { opacity: 1 });
          }
        }
      );
    }
  }, [loading, biometries]);

  const fetchBiometries = async () => {
    try {
      setLoading(true);
      const response = await biometryService.list(1, 50);
      const bios = response.data?.data || response.data || [];
      setBiometries(bios);
    } catch (error) {
      console.error('Error cargando biometrías:', error);
      addToast('Error al cargar verificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = async () => {
    setShowVerificationFlow(false);
    addToast('Verificación biométrica completada', 'success');
    await fetchBiometries();
  };

  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
  };

  const stats = {
    total: biometries.length,
    verified: biometries.filter(b => b.estado === 'verificado').length,
    pending: biometries.filter(b => b.estado === 'pendiente').length,
    rejected: biometries.filter(b => b.estado === 'rechazado').length,
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" message="Cargando verificaciones..." />
      </div>
    );
  }

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Verificación Biométrica</h1>
          <p className="text-slate-600 mt-1">Gestiona tu identidad y verifica tu biometricamente</p>
        </div>
        <button
          onClick={() => setShowVerificationFlow(true)}
          className="btn-primary flex items-center gap-2 rounded-lg"
        >
          <FingerprintIcon className="w-5 h-5" />
          Nueva verificación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Verificaciones"
          value={stats.total}
          subtitle="realizadas"
          icon={ShieldCheckIcon}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Verificadas"
          value={stats.verified}
          subtitle="exitosas"
          icon={CheckCircleIcon}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          subtitle="en proceso"
          icon={ClockIcon}
          color="amber"
          delay={0.2}
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejected}
          subtitle="fallidas"
          icon={XCircleIcon}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Verification Flow Modal */}
      {showVerificationFlow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <VerificationFlow
              onComplete={handleVerificationComplete}
              onCancel={() => setShowVerificationFlow(false)}
            />
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Detalles de Verificación</h3>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">ID de verificación</p>
                <p className="font-mono text-slate-900">#{selectedVerification.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Estado</p>
                  <StatusBadge status={selectedVerification.estado} />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Semaforo</p>
                  <p className={`font-semibold ${
                    selectedVerification.semaforo === 'VERDE' ? 'text-emerald-600' :
                    selectedVerification.semaforo === 'AMARILLO' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {selectedVerification.semaforo || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Fecha</p>
                <p className="text-slate-900">
                  {formatDateTime(selectedVerification.created_at)}
                </p>
              </div>

              {selectedVerification.documento_nombre_match !== null && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Comparación de nombre</p>
                  <p className={`font-semibold ${selectedVerification.documento_nombre_match ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedVerification.documento_nombre_match ? 'El nombre en el documento coincide' : 'El nombre no coincide'}
                  </p>
                </div>
              )}

              {selectedVerification.distancia_facial !== null && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Score facial</p>
                  <p className="text-slate-900">{(selectedVerification.distancia_facial * 100).toFixed(1)}% de coincidencia</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedVerification(null)}
              className="w-full mt-6 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Verifications List */}
      <div className="card">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Historial de verificaciones</h2>
        </div>

        {biometries.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {biometries.map((bio) => (
                <div key={bio.id} className="biometry-card">
                  <VerificationCard verification={bio} onViewDetails={handleViewDetails} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FingerprintIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No hay verificaciones</p>
            <p className="text-slate-500 text-sm mb-6">Inicia tu primera verificación biométrica para asegurar tus firmas</p>
            <button
              onClick={() => setShowVerificationFlow(true)}
              className="btn-primary inline-flex items-center gap-2 rounded-lg"
            >
              <FingerprintIcon className="w-5 h-5" />
              Iniciar verificación
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">¿Por qué verificar tu identidad?</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Mayor seguridad en la verificación de identidad
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Proceso de firma más rápido y sencillo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Protección contra acceso no autorizado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Cumplimiento de normativas de seguridad
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}