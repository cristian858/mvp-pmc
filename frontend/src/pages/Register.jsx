import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, isAuthenticated } = useAuth();
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

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, passwordConfirm);

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
          <p className="text-slate-600">Crea tu cuenta de firma digital</p>
        </div>

        {/* Formulario */}
        <form ref={formRef} onSubmit={handleSubmit} className="card p-8 space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Crear cuenta</h2>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Juan Pérez"
              required
            />
          </div>

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

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-slate-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          {/* Link a login */}
          <p className="text-center text-slate-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Inicia sesión aquí
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
