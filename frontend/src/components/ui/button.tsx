'use client';

import { cn } from '@/lib/utils';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sav-gold/30 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary: 'sav-btn-primary shadow-[0_4px_14px_rgba(189,162,55,0.2)]',
  secondary: 'sav-btn-secondary',
  danger: 'inline-flex items-center justify-center gap-2 rounded-full font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-[0_4px_14px_rgba(220,38,38,0.2)] border border-red-500/20',
  ghost: 'text-sav-text/70 hover:bg-sav-surface hover:text-sav-text rounded-full px-4 py-2',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Button({ children, variant = 'primary', size = 'md', className, icon, ...props }: ButtonProps) {
  return (
    <button className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {icon}
      {children}
    </button>
  );
}
