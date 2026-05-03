export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Sin fecha';
  
  const defaultOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString('es-ES', { ...defaultOptions, ...options });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Sin fecha';
  
  return new Date(dateString).toLocaleString('es-ES', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Hace un momento' : `Hace ${diffMins} minutos`;
    }
    return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return formatDate(dateString, { month: 'short', day: 'numeric' });
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleTimeString('es-ES', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: '2-digit',
    minute: '2-digit',
  });
};