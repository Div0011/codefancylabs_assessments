'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FolderOpen, CheckSquare, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200/80 bg-sav-surface hidden md:flex md:flex-col">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sav-gold to-sav-gold-bright text-white shadow-sm">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sav-text leading-tight">Project Tracker</h1>
            <p className="text-[10px] font-medium text-sav-bronze uppercase tracking-wider">Codefancy Lab</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ? 'bg-sav-card text-sav-gold-dark shadow-[0_2px_8px_rgba(31,31,31,0.06)]' : 'text-sav-text/70 hover:bg-sav-card hover:text-sav-text'
              )}
            >
              <Icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-sav-gold' : 'text-sav-bronze group-hover:text-sav-gold')} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-sav-gold" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-sav-text to-sav-text/90 p-4 text-white shadow-lg">
          <p className="text-xs font-medium text-sav-tan">Internal Tool</p>
          <p className="text-[10px] text-white/60 mt-0.5">For team use only</p>
        </div>
      </div>
    </aside>
  );
}
