import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../hooks/useToast';
import { documentService, signatureService, biometryService } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

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

const WarningIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const FingerprintIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.75V8.75a2.25 2.25 0 012.25-2.25h13.5" />
  </svg>
);

const FaceIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const StepIndicator = ({ steps, currentStep }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep >= s.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {currentStep > s.id ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              s.id
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 transition-all ${
                currentStep > s.id ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
    <div className="flex justify-between text-sm text-slate-500">
      {steps.map(s => (
        <span key={s.id} className={currentStep === s.id ? 'text-emerald-600 font-medium' : ''}>
          {s.label}
        </span>
      ))}
    </div>
  </div>
);

export function SignaturePage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const canvasRef = useRef(null);
  const [document, setDocument] = useState(null);
  const [biometries, setBiometries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [step, setStep] = useState(1);
  const [lastVerifiedBio, setLastVerifiedBio] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docRes, bioRes] = await Promise.all([
          documentService.get(documentId),
          biometryService.list(1, 1),
        ]);
        setDocument(docRes.data);
        
        const bios = bioRes.data?.data || bioRes.data || [];
        setBiometries(bios);
        
        const verifiedBio = bios.find(b => b.estado === 'verificado');
        if (verifiedBio) {
          setLastVerifiedBio(verifiedBio);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        addToast('Error al cargar documento', 'error');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId]);

  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#16a34a';

      gsap.from(canvas, { opacity: 0, duration: 0.5 });
    }
  }, [step]);

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleTouchStart = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const handleTouchEnd = () => setIsDrawing(false);

  const clearSignature = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  const saveSignature = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const isEmpty = !canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
        .data.some(channel => channel !== 0);

      if (isEmpty) {
        addToast('Por favor, dibuja tu firma', 'warning');
        return;
      }

      setSignatureData(canvas.toDataURL('image/png'));
      setStep(4);
    }
  };

  const handleConfirmSignature = async () => {
    try {
      setSigning(true);
      
      const resultadoVerificacion = lastVerifiedBio?.semaforo || 'VERDE';
      
      // Crear la firma
      await signatureService.create(documentId, resultadoVerificacion, 'Firma digital completada con éxito');
      
      // Actualizar el estado del documento a 'firmado'
      const statusResponse = await documentService.updateStatus(documentId, 'firmado');
      console.log('Status update response:', statusResponse.data);
      console.log('New status:', statusResponse.data?.data?.status);

      addToast('Documento firmado correctamente', 'success');
      setTimeout(() => {
        navigate(`/documents/${documentId}`, { replace: true });
      }, 500);
    } catch (error) {
      console.error('Error firmando documento:', error);
      addToast('Error al firmar documento', 'error');
    } finally {
      setSigning(false);
    }
  };

  const steps = [
    { id: 1, label: 'Documento' },
    { id: 2, label: 'Verificar identidad' },
    { id: 3, label: 'Firma' },
    { id: 4, label: 'Confirmar' },
  ];

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" message="Cargando documento..." />
      </div>
    );
  }

  return (
    <div className="py-8 px-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/documents/${documentId}`)}
          className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver al documento
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Firmar documento</h1>
        <p className="text-slate-500">{document?.filename}</p>
      </div>

      <StepIndicator steps={steps} currentStep={step} />

      {/* Step 1: Info */}
      {step === 1 && (
        <div className="card p-6 space-y-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-900">Resumen del documento</h2>

          {/* Document Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center">
              <DocumentIcon className="w-8 h-8 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{document?.filename}</p>
              <p className="text-sm text-slate-500">
                Subido el {formatDate(document?.created_at)}
              </p>
              {document?.riesgos && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    document.riesgos.toLowerCase().includes('alto') ? 'bg-red-100 text-red-700' :
                    document.riesgos.toLowerCase().includes('medio') ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    Riesgo: {
                      document.riesgos.toLowerCase().includes('alto') ? 'Alto' :
                      document.riesgos.toLowerCase().includes('medio') ? 'Medio' : 'Bajo'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Summary */}
          {document?.resumen_ia && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Análisis de IA</h3>
              <p className="text-sm text-blue-800 line-clamp-4">{document.resumen_ia}</p>
              <button 
                onClick={() => navigate(`/documents/${documentId}`)}
                className="text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                Ver análisis completo →
              </button>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-slate-900">Términos y condiciones</h3>
                <ul className="text-sm text-slate-600 mt-2 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>He leído y entendido el contenido del documento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Acepto los términos y condiciones del servicio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Mi firma digital tendrá validez legal según la legislación vigente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Autorizo el procesamiento de mi información para este proceso</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="btn-primary px-6 py-3 rounded-lg w-full"
          >
            Aceptar y continuar →
          </button>
        </div>
      )}

      {/* Step 2: Biometric Verification */}
      {step === 2 && (
        <div className="card p-6 space-y-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-900">Verificación de identidad</h2>

          {lastVerifiedBio ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-emerald-900">Identidad verificada</p>
                  <p className="text-sm text-emerald-700">
                    Verificación #{lastVerifiedBio.id} • {lastVerifiedBio.semaforo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="btn-primary px-6 py-3 rounded-lg w-full"
              >
                Continuar con la firma →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <WarningIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">Verificación requerida</p>
                  <p className="text-sm text-amber-700">
                    Necesitas verificar tu identidad antes de firmar
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/biometry')}
                className="btn-primary px-6 py-3 rounded-lg w-full flex items-center justify-center gap-2"
              >
                <FingerprintIcon className="w-5 h-5" />
                Verificar mi identidad
              </button>

              <button
                onClick={() => setStep(3)}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
              >
                Omitir verificación (no recomendado)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Draw Signature */}
      {step === 3 && (
        <div className="card p-6 space-y-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-900">Dibuja tu firma</h2>
          <p className="text-slate-500 text-sm">
            Usa el ratón o tu dedo en dispositivos táctiles
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-48 cursor-crosshair block"
              style={{ touchAction: 'none' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearSignature}
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={saveSignature}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && signatureData && (
        <div className="card p-6 space-y-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-900">Confirmar firma</h2>

          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-2">Tu firma:</p>
            <img src={signatureData} alt="Firma" className="w-full h-32 object-contain bg-white rounded-lg" />
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-start gap-3">
              <BellIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                Una vez confirmes, tu firma será registrada con evidencia criptográfica y el documento cambiará a estado firmado.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ← Editar
            </button>
            <button
              onClick={handleConfirmSignature}
              disabled={signing}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {signing ? (
                <>
                  <LoadingSpinner size="sm" message="" />
                  Firmando...
                </>
              ) : (
                <>
                  <PencilIcon className="w-5 h-5" />
                  Confirmar y firmar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}