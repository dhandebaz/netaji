export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  retryable: boolean;
}

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  SSE_ERROR: 'SSE_ERROR',
  UNKNOWN: 'UNKNOWN'
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ERROR_CODES.UNAUTHORIZED]: 'Please log in to continue.',
  [ERROR_CODES.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ERROR_CODES.SSE_ERROR]: 'Real-time connection interrupted. Reconnecting...',
  [ERROR_CODES.UNKNOWN]: 'An unexpected error occurred.'
};

export function createAppError(
  code: string,
  message?: string,
  details?: any
): AppError {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN],
    details,
    timestamp: new Date().toISOString(),
    retryable: [ERROR_CODES.NETWORK_ERROR, ERROR_CODES.RATE_LIMITED, ERROR_CODES.SERVER_ERROR, ERROR_CODES.SSE_ERROR].includes(code as any)
  };
}

export function parseApiError(error: any): AppError {
  if (!error) {
    return createAppError(ERROR_CODES.UNKNOWN);
  }

  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return createAppError(ERROR_CODES.NETWORK_ERROR);
  }

  if (error.status) {
    switch (error.status) {
      case 401:
        return createAppError(ERROR_CODES.UNAUTHORIZED);
      case 403:
        return createAppError(ERROR_CODES.FORBIDDEN);
      case 404:
        return createAppError(ERROR_CODES.NOT_FOUND);
      case 422:
        return createAppError(ERROR_CODES.VALIDATION_ERROR, error.message, error.details);
      case 429:
        return createAppError(ERROR_CODES.RATE_LIMITED);
      case 500:
      case 502:
      case 503:
        return createAppError(ERROR_CODES.SERVER_ERROR);
      default:
        return createAppError(ERROR_CODES.UNKNOWN, error.message);
    }
  }

  return createAppError(ERROR_CODES.UNKNOWN, error.message || String(error));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
}

export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  options?: {
    retries?: number;
    onError?: (error: AppError) => void;
    fallback?: T;
  }
): Promise<{ data: T | null; error: AppError | null }> {
  const { retries = 0, onError, fallback } = options || {};
  
  try {
    const wrappedCall = retries > 0 
      ? () => withRetry(apiCall, retries)
      : apiCall;
      
    const data = await wrappedCall();
    return { data, error: null };
  } catch (error) {
    const appError = parseApiError(error);
    
    if (onError) {
      onError(appError);
    }
    
    console.error('[API Error]', appError);
    
    return { 
      data: fallback !== undefined ? fallback : null, 
      error: appError 
    };
  }
}
