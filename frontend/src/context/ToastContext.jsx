import React, { createContext, useState, useCallback, useRef } from 'react';

/**
 * Context para el sistema de notificaciones
 * Proporciona métodos para mostrar toasts en la aplicación
 */
export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const addToast = useCallback(
    (message, type = 'success', duration = 3000) => {
      idCounter.current += 1;
      const id = `${Date.now()}-${idCounter.current}`;
      const toast = { id, message, type };

      setToasts((prev) => [...prev, toast]);

      // Auto-remover después del duration
      if (duration) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}
