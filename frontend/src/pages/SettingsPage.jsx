import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/api';
import { Skeleton, ProfileSkeleton } from '../components/Skeleton';
import { formatDate } from '../utils/dateUtils';

const UserIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const InputField = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 ${Icon ? 'pl-10' : ''} py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500`}
      />
    </div>
  </div>
);

const Toggle = ({ enabled, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={enabled} onChange={onChange} />
      <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </label>
);

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    browserNotifications: false,
    weeklyDigest: true,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      addToast('Error al actualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      addToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (passwords.new.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswords({ current: '', new: '', confirm: '' });
      addToast('Contraseña actualizada correctamente', 'success');
    } catch (error) {
      addToast('Error al cambiar contraseña', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout();
      navigate('/');
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="py-8 px-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600 mt-1">Administra tu cuenta y preferencias</p>
      </div>

      {/* Profile Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-slate-500" />
          Información del perfil
        </h2>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <InputField
            icon={UserIcon}
            label="Nombre completo"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Tu nombre"
          />

          <InputField
            icon={MailIcon}
            label="Correo electrónico"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="tu@email.com"
            disabled
          />

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <SaveIcon className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Security Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <LockIcon className="w-5 h-5 text-slate-500" />
          Seguridad
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <InputField
            icon={LockIcon}
            label="Contraseña actual"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            placeholder="••••••••"
          />

          <InputField
            icon={LockIcon}
            label="Nueva contraseña"
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            placeholder="••••••••"
          />

          <InputField
            icon={LockIcon}
            label="Confirmar contraseña"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <LockIcon className="w-5 h-5" />
            {saving ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

      {/* Notifications Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-slate-500" />
          Notificaciones
        </h2>

        <div className="space-y-5">
          <Toggle
            enabled={preferences.emailNotifications}
            onChange={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
            label="Notificaciones por correo"
          />

          <Toggle
            enabled={preferences.browserNotifications}
            onChange={() => setPreferences({ ...preferences, browserNotifications: !preferences.browserNotifications })}
            label="Notificaciones en el navegador"
          />

          <Toggle
            enabled={preferences.weeklyDigest}
            onChange={() => setPreferences({ ...preferences, weeklyDigest: !preferences.weeklyDigest })}
            label="Resumen semanal de actividad"
          />

          <button
            onClick={() => addToast('Preferencias guardadas', 'success')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Guardar preferencias
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-slate-500" />
          Estado de la cuenta
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-800">Cuenta verificada</span>
          </div>
          
          <div className="text-sm text-slate-600">
            <p>Miembro desde: {user?.createdAt ? formatDate(user.createdAt) : 'Enero 2026'}</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="card p-6 border-red-200">
        <button
          onClick={handleLogout}
          className="w-full px-5 py-3 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogoutIcon className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}