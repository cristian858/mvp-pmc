import React from 'react';
import { useToast } from '../hooks/useToast';
import { CheckCircleIcon, XCircleIcon, ExclamationIcon, InformationIcon, CloseIcon } from './Icons';
import gsap from 'gsap';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const toastConfig = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircleIcon,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircleIcon,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: ExclamationIcon,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: InformationIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  React.useEffect(() => {
    toasts.forEach((toast) => {
      gsap.from(`#toast-${toast.id}`, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.out',
      });
    });
  }, [toasts]);

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type] || toastConfig.info;
        const Icon = config.icon;

        return (
          <div
            id={`toast-${toast.id}`}
            key={toast.id}
            className={`${config.bg} border ${config.border} ${config.text} px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-sm`}
            style={{ 
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div className={`${config.iconBg} ${config.iconColor} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`${config.text} opacity-50 hover:opacity-100 transition-opacity p-1`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}