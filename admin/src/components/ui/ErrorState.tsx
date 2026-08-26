import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 border border-rose-200 rounded-xl my-4">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          Retry Action
        </Button>
      )}
    </div>
  );
};
