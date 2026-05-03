import React from 'react';
import { ClockIcon, CheckIcon, XIcon, CogIcon } from './Icons';

export default function StatusBadge({ status = 'pendiente', className = '' }) {
  const statusConfig = {
    pendiente: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pendiente',
      icon: ClockIcon,
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pendiente',
      icon: ClockIcon,
    },
    firmado: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Firmado',
      icon: CheckIcon,
    },
    signed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Firmado',
      icon: CheckIcon,
    },
    rechazado: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Rechazado',
      icon: XIcon,
    },
    processing: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Procesando',
      icon: CogIcon,
    },
  };

  const config = statusConfig[status] || statusConfig.pendiente;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}