import React from 'react';

/**
 * PremiumCard - Tarjeta premium para mostrar características
 * @param {string} title - Título de la tarjeta
 * @param {string} description - Descripción
 * @param {ReactNode} icon - Icono SVG
 * @param {string} variant - 'default' | 'highlight' | 'dark'
 */
export default function PremiumCard({
  title,
  description,
  icon,
  variant = 'default',
  children,
}) {
  const baseStyles = 'rounded-xl p-6 transition-all duration-300';
  
  const variants = {
    default: 'card hover:shadow-lg',
    highlight: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-300',
    dark: 'bg-gray-900 text-white border border-gray-800',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]}`}>
      {icon && (
        <div className={`mb-4 ${variant === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
          {icon}
        </div>
      )}
      {title && (
        <h3 className={`font-bold mb-2 text-lg ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      )}
      {description && (
        <p className={`text-sm leading-relaxed ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
