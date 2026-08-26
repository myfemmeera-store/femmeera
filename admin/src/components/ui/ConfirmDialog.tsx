import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start space-x-3 mb-6">
        <div className={`p-2 rounded-full shrink-0 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm text-neutral-600 pt-0.5">{message}</p>
      </div>
      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading} size="sm">
          {cancelText}
        </Button>
        <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading} size="sm">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
