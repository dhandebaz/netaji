import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Lock, Ban, ServerCrash } from 'lucide-react';
import { AppError, ERROR_CODES } from '../../services/errorHandler';

interface ErrorDisplayProps {
  error: AppError | string;
  onRetry?: () => void;
  variant?: 'inline' | 'card' | 'fullPage';
  className?: string;
}

const getErrorIcon = (code: string) => {
  switch (code) {
    case ERROR_CODES.NETWORK_ERROR:
      return <WifiOff className="w-8 h-8 text-red-500" />;
    case ERROR_CODES.UNAUTHORIZED:
    case ERROR_CODES.FORBIDDEN:
      return <Lock className="w-8 h-8 text-amber-500" />;
    case ERROR_CODES.RATE_LIMITED:
      return <Ban className="w-8 h-8 text-orange-500" />;
    case ERROR_CODES.SERVER_ERROR:
      return <ServerCrash className="w-8 h-8 text-red-500" />;
    default:
      return <AlertTriangle className="w-8 h-8 text-red-500" />;
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  variant = 'card',
  className = ''
}) => {
  const errorObj: AppError = typeof error === 'string' 
    ? { code: ERROR_CODES.UNKNOWN, message: error, timestamp: new Date().toISOString(), retryable: false }
    : error;

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-red-600 text-sm ${className}`}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>{errorObj.message}</span>
        {onRetry && errorObj.retryable && (
          <button 
            onClick={onRetry}
            className="ml-2 text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === 'fullPage') {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            {getErrorIcon(errorObj.code)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {errorObj.code === ERROR_CODES.NETWORK_ERROR ? 'Connection Lost' :
             errorObj.code === ERROR_CODES.UNAUTHORIZED ? 'Sign In Required' :
             errorObj.code === ERROR_CODES.FORBIDDEN ? 'Access Denied' :
             errorObj.code === ERROR_CODES.SERVER_ERROR ? 'Server Error' :
             'Something Went Wrong'}
          </h2>
          <p className="text-gray-600 mb-6">{errorObj.message}</p>
          {onRetry && errorObj.retryable && (
            <button 
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-red-50 border border-red-100 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getErrorIcon(errorObj.code)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 mb-1">
            {errorObj.code === ERROR_CODES.NETWORK_ERROR ? 'Connection Error' :
             errorObj.code === ERROR_CODES.RATE_LIMITED ? 'Too Many Requests' :
             'Error'}
          </h3>
          <p className="text-red-600 text-sm">{errorObj.message}</p>
          {onRetry && errorObj.retryable && (
            <button 
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
