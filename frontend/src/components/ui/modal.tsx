'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sav-text/10 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={cn('relative w-full rounded-[52px] bg-sav-card p-[2px] shadow-[2px_2px_4px_rgba(31,31,31,0.04)]')}>
        <div className={cn('rounded-[50px] bg-white', size === 'lg' ? 'p-8' : 'p-6')}>
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-lg font-semibold text-sav-text">{title}</h3>
              {description && <p className="mt-1 text-sm text-sav-bronze">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-sav-bronze hover:bg-sav-surface hover:text-sav-text transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          {size === 'lg' && <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
