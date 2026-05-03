import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CogIcon } from './Icons';

export const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  // No mostrar navbar en páginas de login/register/home
  const hideNavbar = ['/', '/login', '/register'].includes(location.pathname);
  const isHome = location.pathname === '/';

  if (isHome) {
    return children;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-lg">
              SA
            </div>
            <span className="font-bold text-xl text-slate-900 hidden sm:inline">SafeSign AI</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-4 border-r border-slate-200 pr-6">
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'text-emerald-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/documents"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/documents'
                        ? 'text-emerald-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Documentos
                  </Link>
                  <Link
                    to="/biometry"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/biometry'
                        ? 'text-emerald-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Biometría
                  </Link>
                </div>
                <span className="text-sm text-slate-600">
                  Hola, <span className="font-semibold text-slate-900">{user?.name?.split(' ')[0]}</span>
                </span>
                <Link
                  to="/settings"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Configuración"
                >
                  <CogIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">
                  Ingresar
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {!hideNavbar && (
        <footer className="border-t border-slate-200 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600 text-sm">
            <p>&copy; 2026 SafeSign AI. Todos los derechos reservados.</p>
          </div>
        </footer>
      )}
    </>
  );
};
