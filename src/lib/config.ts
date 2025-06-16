
// Production configuration and constants
export const config = {
  // App configuration
  app: {
    name: 'TrainerConnect',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    isProd: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
  },

  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Query configuration
  query: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retryAttempts: 3,
  },

  // UI configuration
  ui: {
    toastDuration: 5000, // 5 seconds
    loadingDebounce: 300, // 300ms
    animationDuration: 200, // 200ms
  },

  // Business rules
  business: {
    maxBookingHours: 8,
    minBookingAmount: 500,
    platformCommissionRate: 0.10, // 10%
    gstRate: 0.18, // 18%
    cancellationFeeRate: 0.05, // 5%
  },

  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },

  // Security
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
};

export default config;
