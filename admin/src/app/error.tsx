'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Portal Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900">Page Failed to Load</h2>
          <p className="text-xs text-neutral-500">
            {error?.message || 'A network sync issue or stale assets prevented this page from loading properly.'}
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reload Page
          </Button>
          <Button
            variant="outline"
            onClick={() => reset()}
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
