
import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class CustomError extends Error {
  code?: string;
  status?: number;
  details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const handleApiError = (error: any, context?: string): ApiError => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  // Handle Supabase errors
  if (error?.code && error?.message) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    };
  }

  // Handle network errors
  if (error?.message === 'Failed to fetch' || error?.name === 'NetworkError') {
    return {
      message: 'Network error. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      status: 0
    };
  }

  // Handle timeout errors
  if (error?.name === 'TimeoutError') {
    return {
      message: 'Request timeout. Please try again.',
      code: 'TIMEOUT_ERROR',
      status: 408
    };
  }

  // Handle validation errors
  if (error?.status === 400) {
    return {
      message: error?.message || 'Invalid request. Please check your input and try again.',
      code: 'VALIDATION_ERROR',
      status: 400
    };
  }

  // Handle authentication errors
  if (error?.status === 401) {
    return {
      message: 'Authentication required. Please log in and try again.',
      code: 'AUTH_ERROR',
      status: 401
    };
  }

  // Handle authorization errors
  if (error?.status === 403) {
    return {
      message: 'You do not have permission to perform this action.',
      code: 'PERMISSION_ERROR',
      status: 403
    };
  }

  // Handle not found errors
  if (error?.status === 404) {
    return {
      message: 'The requested resource was not found.',
      code: 'NOT_FOUND_ERROR',
      status: 404
    };
  }

  // Handle server errors
  if (error?.status >= 500) {
    return {
      message: 'Server error. Please try again later or contact support.',
      code: 'SERVER_ERROR',
      status: error.status
    };
  }

  // Default error handling
  return {
    message: error?.message || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    status: error?.status || 500
  };
};

export const showErrorToast = (error: any, context?: string) => {
  const apiError = handleApiError(error, context);
  
  toast({
    title: 'Error',
    description: apiError.message,
    variant: 'destructive',
  });
};

export const showSuccessToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
  });
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleApiError(event.reason, 'Unhandled Promise');
  });
}
