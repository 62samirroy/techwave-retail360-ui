import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  maxWidth,
  size = 'md',
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actualSize = maxWidth || size;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          'relative w-full rounded-lg bg-white border border-brand-200 shadow-xl overflow-hidden transition-all',
          maxWidths[actualSize]
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-200/80 px-4 py-3 bg-brand-50/50">
          <div>
            {title && <h3 className="text-sm font-semibold text-brand-900">{title}</h3>}
            {description && <p className="text-xs text-brand-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
