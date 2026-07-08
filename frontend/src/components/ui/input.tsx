'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-sav-text">{label}</label>}
      <input className={cn('w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-sav-bronze/60 focus:border-sav-gold focus:outline-none focus:ring-2 focus:ring-sav-gold/20 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
    </div>
  );
}
