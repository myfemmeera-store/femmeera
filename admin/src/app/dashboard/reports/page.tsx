'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Analytics & Business Reports</h1>
        <p className="text-xs text-neutral-500">Sales summary, product velocity, and customer metrics</p>
      </div>

      <Card title="Business Intelligence">
        <div className="flex flex-col items-center justify-center p-8 text-center bg-neutral-50 rounded-xl border border-neutral-200">
          <BarChart3 className="w-10 h-10 text-neutral-400 mb-3" />
          <h3 className="text-sm font-bold text-neutral-900">Analytics Reports Engine</h3>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            Comprehensive revenue and sales breakdown reporting.
          </p>
        </div>
      </Card>
    </div>
  );
}
