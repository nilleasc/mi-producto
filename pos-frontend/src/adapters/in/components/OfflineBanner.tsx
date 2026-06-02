'use client';

interface OfflineBannerProps {
  visible: boolean;
  mode: 'offline' | 'degraded' | 'limited';
  message?: string;
}

/**
 * Banner para indicar estado offline o degradado
 * 
 * Muestra un banner persistente en la parte superior cuando
 * hay problemas de conectividad o el servicio está degradado.
 */
export function OfflineBanner({ visible, mode, message }: OfflineBannerProps) {
  if (!visible) return null;

  const getConfig = () => {
    switch (mode) {
      case 'offline':
        return {
          bgColor: 'bg-red-600',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          ),
          defaultMessage: 'Sin conexión a internet. Algunas funciones no están disponibles.',
        };
      case 'degraded':
        return {
          bgColor: 'bg-yellow-600',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          defaultMessage: 'Servicio degradado. Algunas funciones pueden no estar disponibles.',
        };
      case 'limited':
        return {
          bgColor: 'bg-orange-600',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
          defaultMessage: 'Modo limitado. Funcionalidad reducida temporalmente.',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      role="alert"
      className={`${config.bgColor} text-white py-3 px-4 shadow-lg animate-slide-down`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {config.icon}
        <p className="text-sm font-medium">{message || config.defaultMessage}</p>
      </div>
    </div>
  );
}
