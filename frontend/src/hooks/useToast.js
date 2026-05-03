import React, { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Hook personalizado para usar el sistema de toasts
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
