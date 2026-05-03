import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';
import gsap from 'gsap';

const DocumentIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Animar entrada
  React.useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    gsap.to(dropZoneRef.current, { scale: 1.02, duration: 0.2 });
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    gsap.to(dropZoneRef.current, { scale: 1, duration: 0.2 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    gsap.to(dropZoneRef.current, { scale: 1, duration: 0.2 });

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Por favor, sube un archivo PDF');
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Por favor, sube un archivo PDF');
        setFile(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecciona un archivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 30;
        });
      }, 500);

      const response = await documentService.upload(file);

      clearInterval(progressInterval);
      setProgress(100);

      // Animar transición
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          navigate(`/documents/${response.data.data.id}`);
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al subir el documento. Intenta de nuevo.'
      );
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 py-12 px-6"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Subir documento</h1>
          <p className="text-slate-600">
            Carga un archivo PDF para análisis y firma digital
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleUpload} className="space-y-8">
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="card p-12 border-2 border-dashed border-emerald-300 cursor-pointer hover:border-emerald-500 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="text-center">
              {file ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <DocumentIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 mb-2">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold mt-3"
                  >
                    Cambiar archivo
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <UploadIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 mb-1">
                    Arrastra tu PDF aquí
                  </p>
                  <p className="text-sm text-slate-600">o haz clic para seleccionar</p>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Progreso */}
          {loading && progress > 0 && (
            <div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full gradient-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-slate-600 text-sm mt-2">
                Subiendo y analizando... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!file || loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Subiendo...' : 'Subir y analizar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Información */}
        <div className="mt-12 card p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <InfoIcon className="w-5 h-5" />
            Información
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-blue-600" />
              Solo archivos PDF son permitidos
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-blue-600" />
              Tamaño máximo: 50 MB
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-blue-600" />
              Se analizará automáticamente con IA
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-blue-600" />
              Tus documentos son completamente seguros
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
