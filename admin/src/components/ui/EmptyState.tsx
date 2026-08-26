import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl my-4">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
