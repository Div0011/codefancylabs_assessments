'use client';

import { cn } from '@/lib/utils';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sav-gold/30 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary: 'bg-sav-gold text-white hover:bg-sav-gold-bright active:scale-[0.98] shadow-[4px_4px_12px_rgba(53,43,11,0.06)]',
  secondary: 'bg-white text-sav-text border border-gray-200 hover:bg-sav-surface active:scale-[0.98] shadow-[2px_2px_4px_rgba(31,31,31,0.04)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-[4px_4px_12px_rgba(53,43,11,0.06)]',
  ghost: 'text-sav-text/70 hover:bg-sav-surface hover:text-sav-text',
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
