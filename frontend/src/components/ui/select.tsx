'use client';

import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-sav-text">{label}</label>}
      <select className={cn('w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:border-sav-gold focus:outline-none focus:ring-2 focus:ring-sav-gold/20 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
