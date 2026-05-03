import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Animar entrada
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Animar transición
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => navigate('/dashboard'),
      });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-4">
      <div
        ref={containerRef}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 shadow-lg">
            <span className="text-white font-bold text-2xl">SS</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SafeSign AI</h1>
          <p className="text-slate-600">Plataforma de firma digital inteligente</p>
        </div>

        {/* Formulario */}
        <form ref={formRef} onSubmit={handleSubmit} className="card p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Ingresar</h2>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {/* Link a registro */}
          <p className="text-center text-slate-600 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Regístrate aquí
            </Link>
          </p>
        </form>

        {/* Decoración */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      </div>
    </div>
  );
};
